export interface FormAlertProps {
  message: string;
}

/** Whole-form error banner (rate limit, network or server failure). */
export function FormAlert({ message }: FormAlertProps) {
  return (
    <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}
