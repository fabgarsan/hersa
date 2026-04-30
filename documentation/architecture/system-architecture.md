# Arquitectura técnica — Hersa

Hersa es un monorepo desacoplado: React 19 + Vite (frontend) y Django 5.2 + DRF (backend) viven en el mismo repo pero se despliegan de forma independiente sobre AWS.

```mermaid
graph TB
    subgraph Cliente["Cliente / Navegador"]
        Browser["Browser<br/>Chrome / Safari / Firefox"]
        LS["localStorage<br/>accessToken · refreshToken<br/>hersa-rq-cache (RQ persist)"]
        Browser -.-> LS
    end

    subgraph CDN["AWS CloudFront (opcional)"]
        CF["CloudFront Distribution<br/>cache assets/* immutable<br/>no-cache index.html"]
    end

    subgraph S3FE["AWS S3 — Static Hosting"]
        S3HTML["index.html<br/>(no-cache)"]
        S3ASSETS["dist/assets/*<br/>JS · CSS · fonts<br/>(immutable, 1y)"]
    end

    subgraph FrontendApp["Frontend SPA (React 19 + TypeScript + Vite)"]
        Router["React Router v7<br/>/login · /admin · /tienda · /programador"]
        AuthCtx["AuthContext<br/>(sesión, isAuthenticated)"]
        RQ["React Query<br/>+ Persist Client<br/>(offline cache 24h)"]
        Axios["axiosInstance<br/>· baseURL: VITE_API_BASE_URL<br/>· interceptor request: snakeCase + JWT<br/>· interceptor response: camelCase<br/>· 401 → refresh silencioso"]
        Modules["modules/<br/>auth · profile · admin · ..."]
        MUI["MUI v6<br/>+ SCSS Modules<br/>+ Emotion (prepend)"]
        Router --> Modules
        Modules --> RQ
        Modules --> AuthCtx
        RQ --> Axios
        AuthCtx --> Axios
        Modules --> MUI
    end

    subgraph ALB["AWS Application Load Balancer"]
        ALBNode["ALB<br/>HTTPS termination<br/>HTTP→HTTPS redirect<br/>X-Forwarded-Proto"]
    end

    subgraph EB["AWS Elastic Beanstalk — Docker platform"]
        Nginx[".platform/nginx<br/>reverse proxy"]
        subgraph BackendApp["Django app (Gunicorn workers)"]
            URLs["hersa/urls.py<br/>/admin/<br/>/api/token/ · /api/token/refresh/<br/>/api/users/* · /api/modules/*<br/>/api/schema · /api/docs · /api/redoc"]

            subgraph Apps["apps/"]
                UsersApp["apps.users<br/>UserProfile (UUID)<br/>MeView · MyPermissionsView<br/>ChangePassword · ForgotPassword<br/>ResetPassword · Throttles"]
                ModulesApp["apps.modules<br/>AppModule (proxy de permisos)<br/>access_tienda · access_programador<br/>access_admin"]
            end

            DRF["DRF<br/>· DEFAULT_AUTH: SimpleJWT<br/>· DEFAULT_PERM: IsAuthenticated<br/>· Pagination 20/page<br/>· Throttle anon 60/min · user 300/min<br/>· auth 10/min · password_reset 5/h"]

            JWT["SimpleJWT<br/>access 15 min · refresh 4h<br/>ROTATE + BLACKLIST"]

            Spectacular["drf-spectacular<br/>OpenAPI schema<br/>(IsAdminUser only)"]

            URLs --> DRF
            DRF --> Apps
            DRF --> JWT
            URLs --> Spectacular
        end
        EBExt[".ebextensions/<br/>db-migrate hook<br/>createcachetable"]
        Nginx --> BackendApp
        EBExt -.applies.-> BackendApp
    end

    subgraph S3Media["AWS S3 — Media + Static"]
        S3MediaB["bucket: AWS_MEDIA_BUCKET_NAME<br/>media/ · static/<br/>(django-storages s3boto3)"]
    end

    subgraph RDS["AWS RDS — PostgreSQL 16"]
        PG[("PostgreSQL<br/>· auth_user (Django)<br/>· users_userprofile (UUID PK)<br/>· token_blacklist_*<br/>· django_cache (throttling)<br/>· auth_permission (access_*)")]
    end

    subgraph Email["SMTP / Email backend"]
        SMTP["Email provider<br/>(forgot-password, reset)"]
    end

    subgraph DevLocal["Entorno local — docker-compose"]
        DC["docker-compose.yml<br/>db (postgres:16-alpine) :5432<br/>backend (Dockerfile.dev) :8000<br/>frontend (vite dev) :5173"]
    end

    subgraph CI["Calidad / Git hooks"]
        Husky["Husky + lint-staged<br/>FE: ESLint + Prettier + tsc<br/>BE: ruff + mypy"]
        Tests["pytest + pytest-cov<br/>vitest + @testing-library"]
    end

    Browser -->|HTTPS| CF
    CF --> S3HTML
    CF --> S3ASSETS
    Browser -.->|sin CDN| S3HTML
    Browser -.->|sin CDN| S3ASSETS

    Browser -->|XHR HTTPS<br/>Bearer JWT<br/>CORS allow-list| ALBNode
    ALBNode --> Nginx

    BackendApp -->|psycopg2| PG
    BackendApp -->|boto3 / django-storages| S3MediaB
    BackendApp -->|send_mail| SMTP

    FrontendApp --- Browser
    Axios -.->|baseURL| ALBNode

    classDef aws fill:#FF9900,stroke:#232F3E,color:#fff
    classDef app fill:#0B1F3A,stroke:#0B1F3A,color:#fff
    classDef store fill:#3B6D11,stroke:#1f3a09,color:#fff
    classDef ext fill:#666,stroke:#333,color:#fff

    class CF,S3HTML,S3ASSETS,ALBNode,Nginx,EBExt,S3MediaB aws
    class FrontendApp,BackendApp,Apps,UsersApp,ModulesApp,DRF,JWT,Spectacular,Router,AuthCtx,RQ,Axios,Modules,MUI app
    class PG,LS store
    class SMTP,DevLocal,CI ext
```

## Capas

| Capa | Tecnología | Notas |
|---|---|---|
| Cliente | React 19 + TypeScript + Vite + MUI v6 | SPA, SCSS Modules, React Query persist 24h |
| CDN | CloudFront (opcional) | assets immutable 1y, index.html no-cache |
| Static hosting | S3 | deploy via `scripts/cf-deploy.sh` |
| Red | ALB | HTTPS termination, CORS allow-list |
| Backend | Django 5.2 + DRF + Gunicorn | Elastic Beanstalk Docker |
| Auth | SimpleJWT | access 15min, refresh 4h, rotate + blacklist |
| Persistencia | PostgreSQL 16 (RDS) | UUID PKs, throttling en `django_cache` |
| Archivos | S3 (django-storages s3boto3) | media/ + static/ en producción |
| Email | SMTP configurable | console en dev, proveedor externo en prod |

## Flujos críticos

### Login
1. `POST /api/token/` con credenciales → SimpleJWT devuelve `{ access, refresh }`
2. Frontend guarda ambos en `localStorage`, hidrata perfil + permisos (`access_tienda`, `access_programador`, `access_admin`)

### Request autenticada
1. `axiosInstance` añade `Authorization: Bearer <accessToken>`
2. Si 401 → refresh silencioso con `POST /api/token/refresh/`
3. Si refresh falla → logout + redirect a login
4. Response snake_case → interceptor convierte a camelCase → React Query cachea

### Deploy frontend
`npm run build` → `aws s3 sync` assets immutable + index.html no-cache → invalidación CloudFront opcional

### Deploy backend
`eb deploy` → Docker rebuild → `.ebextensions` ejecuta `migrate` + `createcachetable` → Gunicorn arranca

## Riesgos identificados

1. **Sin CI/CD automatizado** — deploys manuales por scripts; cualquier persona con credenciales puede romper producción
2. **Sin Celery/Redis** — tareas pesadas (emails masivos, PDFs de diplomas, procesamiento de fotos) bloquearán el request HTTP
3. **Throttling en RDS** — funciona hoy, pero bajo carga hay que migrar a ElastiCache
4. **`apps.modules` casi vacío** — solo declara permisos; la lógica de dominio (toga, auditorio, fotos, diplomas) aún no existe como código
5. **Sin observabilidad** — no hay Sentry, CloudWatch dashboards ni structured logging configurado
6. **Refresh token en localStorage** — riesgo XSS; decisión consciente para colegios con dispositivos compartidos
