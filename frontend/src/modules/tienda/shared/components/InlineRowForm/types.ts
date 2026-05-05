import type { ArrayPath, Control, FieldArrayWithId, FieldValues } from "react-hook-form";
import type { ReactNode } from "react";

export interface InlineRowFormColumn {
  key: string;
  label: string;
  width?: number;
}

export interface InlineRowFormProps<T extends FieldValues> {
  control: Control<T>;
  name: ArrayPath<T>;
  columns: InlineRowFormColumn[];
  renderRow: (field: FieldArrayWithId, index: number) => ReactNode;
  onAppend?: () => void;
  appendLabel?: string;
  isLoading?: boolean;
}
