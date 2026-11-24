import type { ReactNode } from "react";

export interface FormCheckboxProps {
  name: string;
  label: ReactNode;
  defaultChecked?: boolean;
  error?: string;
  hint?: string;
}

export function FormCheckbox({ name, label, defaultChecked = false, error, hint }: FormCheckboxProps) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={name}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-primary accent-primary"
        />
        <label htmlFor={name} className="text-sm leading-relaxed text-body">
          {label}
        </label>
      </div>
      {hint && !error && (
        <p id={`${name}-hint`} className="field-hint ml-7">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="field-error ml-7">
          {error}
        </p>
      )}
    </div>
  );
}
