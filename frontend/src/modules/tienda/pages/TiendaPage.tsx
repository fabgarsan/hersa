import { ComingSoonState, ModuleLayout } from "@shared/components";
import styles from "./TiendaPage.module.scss";

export default function TiendaPage() {
  return (
    <div className={styles.root}>
      <ModuleLayout title="Tienda">
        <ComingSoonState />
      </ModuleLayout>
    </div>
  );
}
