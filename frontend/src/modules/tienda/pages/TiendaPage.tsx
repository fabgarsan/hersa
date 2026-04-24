import StorefrontIcon from "@mui/icons-material/Storefront";

import { ComingSoonGrid, ModuleLayout } from "@shared/components";
import type { ComingSoonGridItem } from "@shared/components";
import styles from "./TiendaPage.module.scss";

const ITEMS: ComingSoonGridItem[] = [
  { label: "Togas y accesorios", icon: <StorefrontIcon /> },
  { label: "Diplomas", icon: <StorefrontIcon /> },
  { label: "Paquetes fotográficos", icon: <StorefrontIcon /> },
  { label: "Recuerdos", icon: <StorefrontIcon /> },
];

export default function TiendaPage() {
  return (
    <div className={styles.root}>
      <ModuleLayout title="Tienda">
        <ComingSoonGrid items={ITEMS} />
      </ModuleLayout>
    </div>
  );
}
