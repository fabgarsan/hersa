export const UI = {
  page: {
    TITLE: "Administración",
    SUBTITLE: "Panel de control del sistema y configuración global",
    FOOTER: "4 usuarios activos · 12 colegios registrados · Última sincronización: hace 5 minutos",
  },
  actions: {
    EXPORT_REPORT: "Exportar reporte",
    NEW_USER: "Nuevo usuario",
  },
  stats: {
    ACTIVE_USERS_LABEL: "Usuarios activos",
    ACTIVE_USERS_VALUE: "4",
    ACTIVE_USERS_TREND: "+1 este mes",
    REGISTERED_SCHOOLS_LABEL: "Colegios registrados",
    REGISTERED_SCHOOLS_VALUE: "12",
    REGISTERED_SCHOOLS_TREND: "+3 este año",
    CEREMONIES_LABEL: "Ceremonias este mes",
    CEREMONIES_VALUE: "3",
    CEREMONIES_TREND: "−1 vs mes anterior",
    REVENUE_LABEL: "Ingresos estimados",
    REVENUE_VALUE: "$48.200",
    REVENUE_TREND: "+12% este mes",
  },
  activity: {
    SECTION_TITLE: "Actividad reciente",
    ITEMS: [
      { user: "Carlos Méndez", action: "Actualizó paquete fotográfico", time: "Hace 10 min" },
      { user: "Ana Torres", action: "Registró nuevo colegio: IED La Salle", time: "Hace 1 hora" },
      { user: "Pedro Ruiz", action: "Generó reporte de grados 2025", time: "Hace 3 horas" },
      { user: "Lucía Vargas", action: "Modificó configuración de toga talla M", time: "Ayer, 16:42" },
      { user: "Carlos Méndez", action: "Cerró ceremonia Colegio San Jorge", time: "Ayer, 11:15" },
    ],
  },
} as const;
