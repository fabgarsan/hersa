import type { Control, FieldValues, Path } from "react-hook-form";

export interface MonetaryInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
}
