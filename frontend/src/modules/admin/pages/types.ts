import type { ReactNode } from "react";

export interface StatCard {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: ReactNode;
}
