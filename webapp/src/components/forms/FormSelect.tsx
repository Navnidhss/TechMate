export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  name: string;
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

export function FormSelect({
  name,
  label,
  options,
  error,
  hint,
  defaultValue = "",
  placeholder = "Please choose…",
  required = false,
}: FormSelectProps) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`select ${error ? "border-danger focus:border-danger focus:ring-danger/20" : ""}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
