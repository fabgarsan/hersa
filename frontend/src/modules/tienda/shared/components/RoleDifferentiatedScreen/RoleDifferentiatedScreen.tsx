import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import type { RoleDifferentiatedScreenProps } from "./types";
import styles from "./RoleDifferentiatedScreen.module.scss";

export function RoleDifferentiatedScreen({ admin, vendedor }: RoleDifferentiatedScreenProps) {
  const { isAdmin } = useTiendaRole();

  return <div className={styles.root}>{isAdmin ? admin : vendedor}</div>;
}
