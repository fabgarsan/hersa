import { ComingSoonState, ModuleLayout } from "@shared/components";
import styles from "./AdminPage.module.scss";

export default function AdminPage() {
  return (
    <div className={styles.root}>
      <ModuleLayout title="Panel de administración">
        <ComingSoonState
          title="Panel en desarrollo"
          description="El dashboard con datos reales estará disponible próximamente."
        />
      </ModuleLayout>
    </div>
  );
}
