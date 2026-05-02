import { ComingSoonState, ModuleLayout } from "@shared/components";
import styles from "./GradosPage.module.scss";

export default function GradosPage() {
  return (
    <div className={styles.root}>
      <ModuleLayout title="Grados">
        <ComingSoonState />
      </ModuleLayout>
    </div>
  );
}
