import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

export function Label({ className, children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("label", className)} {...rest}>
      {children}
    </label>
  );
}

export interface FormFieldProps {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, hint, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  invalid?: boolean;
}

export function Input({ className, leftAdornment, rightAdornment, invalid, ...rest }: InputProps) {
  if (!leftAdornment && !rightAdornment) {
    return <input className={cn("field", invalid && "border-danger", className)} aria-invalid={invalid || undefined} {...rest} />;
  }
  return (
    <div className="relative">
      {leftAdornment && (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted">{leftAdornment}</span>
      )}
      <input
        className={cn("field", !!leftAdornment && "pl-10", !!rightAdornment && "pr-10", invalid && "border-danger", className)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {rightAdornment && <span className="absolute inset-y-0 right-2 flex items-center">{rightAdornment}</span>}
    </div>
  );
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("field", className)} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("field min-h-[88px] resize-y", className)} {...rest} />;
}

/** Currency input with a leading symbol and numeric keyboard. */
export function MoneyInput({ className, currency = "USD", ...rest }: InputProps & { currency?: string }) {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency;
  return (
    <Input
      type="number"
      inputMode="decimal"
      step="0.01"
      min="0"
      leftAdornment={<span className="text-sm font-semibold">{symbol}</span>}
      className={cn("tabular", className)}
      {...rest}
    />
  );
}
