---
paths:
  - "frontend/src/**/*.scss"
  - "frontend/src/**/*.module.scss"
  - "frontend/src/**/*.tsx"
---

# Styling rules — SCSS Modules

**Rule: every component file must have a co-located CSS Module.**

| Component file | Style file |
|----------------|------------|
| `NavSidebar.tsx` | `NavSidebar.module.scss` |
| `ProfilePage.tsx` | `ProfilePage.module.scss` |

- Never use MUI's `sx` prop. Use `className={styles.xxx}` from the co-located SCSS module.
- Never use inline `style={{ ... }}` objects.
- Import shared brand tokens: `@use '@/shared/styles/variables' as v;` (or via relative path).
- All brand colors and layout constants live in `src/shared/styles/_variables.scss`.
- Use `:global(.MuiComponent-class)` inside a module class to target MUI internals.
- `@emotion/cache` is configured with `prepend: true` in `main.tsx` so compiled SCSS always wins the specificity battle against MUI's Emotion styles.

```scss
// NavSidebar.module.scss
@use '../styles/variables' as v;

.root { background-color: v.$primary-dark; }
.navItemActive { color: v.$secondary-main; border-left: 3px solid v.$secondary-main; }
```

```tsx
// NavSidebar.tsx
import styles from './NavSidebar.module.scss';
<Box className={styles.root}>
  <ListItemButton className={active ? styles.navItemActive : styles.navItem}>
```
