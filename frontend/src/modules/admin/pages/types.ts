import type { ReactNode } from "react";

export interface StatCardData {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: ReactNode;
}
