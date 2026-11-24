import type { HTMLInputTypeAttribute } from "react";

export interface FormInputProps {
  name: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  error?: string;
  hint?: string;
  placeholder?: string;
  defaultValue?: string;
  autoComplete?: string;
  maxLength?: number;
  inputMode?: "text" | "tel" | "email" | "numeric";
  list?: string;
  required?: boolean;
}

/** Labelled text input with inline error messaging and accessible descriptions. */
export function FormInput({
  name,
  label,
  type = "text",
  error,
  hint,
  placeholder,
  defaultValue,
  autoComplete,
  maxLength,
  inputMode,
  list,
  required = false,
}: FormInputProps) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        maxLength={maxLength}
        inputMode={inputMode}
        list={list}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`input ${error ? "border-danger focus:border-danger focus:ring-danger/20" : ""}`}
      />
      {hint && !error && (
        <p id={`${name}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
