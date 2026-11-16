import { useId, type ReactNode } from 'react';

const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC = '٠١٢٣٤٥٦٧٨٩';
/** «۱٬۲۰۰٬۰۰۰» / «1,200,000» / «١٢٠٠» → 1200000 (digits of any script; everything else ignored). null when no digit. */
export function parseDigits(raw: string): number | null {
  const ascii = raw.replace(/[۰-۹]/g, (c) => String(PERSIAN.indexOf(c))).replace(/[٠-٩]/g, (c) => String(ARABIC.indexOf(c))).replace(/\D/g, '');
  return ascii ? Number(ascii) : null;
}

/**
 * A whole-number field that shows the value with Persian digits and thousand separators («۱٬۲۰۰٬۰۰۰») while you type.
 * `value` is the number (or null when empty); `unit` is a small word at the end («تومان»). Reuses the TextField look.
 */
export function NumberField({ label, value, onChange, unit, hint, error, disabled, id, className }: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  unit?: string;
  hint?: ReactNode;
  error?: string | null;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const uid = useId();
  const fid = id ?? uid;
  const note = error || hint;
  return (
    <div className={className ? `fld ${className}` : 'fld'}>
      <label className="fld-label" htmlFor={fid}>{label}</label>
      <div className="nf-row">
        <input
          id={fid} className="fld-input" type="text" inputMode="numeric" dir="ltr" data-ltr="" disabled={disabled}
          value={value == null ? '' : value.toLocaleString('fa-IR')} aria-invalid={error ? true : undefined}
          aria-describedby={note ? `${fid}-note` : undefined} onChange={(e) => onChange(parseDigits(e.target.value))}
        />
        {unit ? <span className="nf-unit">{unit}</span> : null}
      </div>
      {note ? <span id={`${fid}-note`} className="fld-hint" data-error={error ? '' : undefined}>{note}</span> : null}
    </div>
  );
}
