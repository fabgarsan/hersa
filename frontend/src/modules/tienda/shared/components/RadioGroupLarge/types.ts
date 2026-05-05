export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupLargeProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}
