import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  value: string;
  error?: string;
  isTouched?: boolean;
  onBlur: () => void;
  onChange: (value: string) => void;
  children?: ReactNode;
}

export function FormField({
  label,
  id,
  name,
  type = "text",
  placeholder,
  autoComplete,
  autoFocus,
  disabled,
  value,
  error,
  isTouched,
  onBlur,
  onChange,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="block text-sm" htmlFor={id}>
        {label}
      </Label>
      {children ? (
        children
      ) : (
        <Input
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          id={id}
          name={name}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      )}
      {isTouched && error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
