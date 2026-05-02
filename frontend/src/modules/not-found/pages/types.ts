export interface NotFoundPageProps {
  /**
   * When true: renders as a full-page centered layout with navy background.
   * No AppBar or NavSidebar are present in this variant (unauthenticated context).
   * When false (default): renders inside the protected layout's main content area.
   */
  fullPage?: boolean;
}
