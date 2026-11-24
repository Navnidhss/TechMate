export interface FormTextareaProps {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  maxLength?: number;
  required?: boolean;
}

export function FormTextarea({
  name,
  label,
  error,
  hint,
  placeholder,
  defaultValue,
  rows = 5,
  maxLength,
  required = false,
}: FormTextareaProps) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue}
        maxLength={maxLength}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`textarea ${error ? "border-danger focus:border-danger focus:ring-danger/20" : ""}`}
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
