export interface FormRadioGroupProps {
  name: string;
  legend: string;
  options: { value: string; label: string; description?: string }[];
  defaultValue?: string;
  error?: string;
  hint?: string;
}

/** Card-style radio group — easier to tap than tiny circles, with plain-English help. */
export function FormRadioGroup({
  name,
  legend,
  options,
  defaultValue,
  error,
  hint,
}: FormRadioGroupProps) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  return (
    <fieldset aria-describedby={describedBy}>
      <legend className="field-label">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-3.5 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/20"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              className="mt-1 h-4 w-4 shrink-0 accent-primary"
            />
            <span>
              <span className="block text-sm font-semibold text-ink">{option.label}</span>
              {option.description && (
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">{option.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
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
    </fieldset>
  );
}
