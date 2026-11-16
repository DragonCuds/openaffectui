import { useId, type ReactNode } from 'react';

/** Several-line text box. Same look and props as TextField (see Fields.tsx). Styles in src/styles/choice.css. */
export function TextArea({ label, value, onChange, placeholder, maxLength, rows = 3, hint, error, disabled, id, className, grow = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  hint?: ReactNode;
  error?: string | null;
  disabled?: boolean;
  id?: string;
  className?: string;
  /** The box grows with the text (up to 40% of the screen height), then scrolls. */
  grow?: boolean;
}) {
  const uid = useId();
  const fid = id ?? uid;
  const note = error || hint;
  return (
    <div className={className ? `fld ${className}` : 'fld'}>
      <label className="fld-label" htmlFor={fid}>{label}</label>
      <textarea
        id={fid} className="fld-input fld-area" data-grow={grow ? '' : undefined} rows={rows} value={value} placeholder={placeholder} maxLength={maxLength} disabled={disabled}
        aria-invalid={error ? true : undefined} aria-describedby={note ? `${fid}-note` : undefined} onChange={(e) => onChange(e.target.value)}
      />
      {note ? <span id={`${fid}-note`} className="fld-hint" data-error={error ? '' : undefined}>{note}</span> : null}
    </div>
  );
}
