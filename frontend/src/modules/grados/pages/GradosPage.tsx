import SchoolIcon from "@mui/icons-material/School";

import { ComingSoonGrid, ModuleLayout } from "@shared/components";
import type { ComingSoonGridItem } from "@shared/components";
import styles from "./GradosPage.module.scss";

const ITEMS: ComingSoonGridItem[] = [
  { label: "Gestión de ceremonias", icon: <SchoolIcon /> },
  { label: "Logística del día", icon: <SchoolIcon /> },
  { label: "Reserva de auditorios", icon: <SchoolIcon /> },
  { label: "Maestros de ceremonia", icon: <SchoolIcon /> },
];

export default function GradosPage() {
  return (
    <div className={styles.root}>
      <ModuleLayout title="Grados">
        <ComingSoonGrid items={ITEMS} />
      </ModuleLayout>
    </div>
  );
}
