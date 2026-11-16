import { Minus, Plus } from 'lucide-react';
import { faNum } from './digits';

/** A small − number + control for counts (people needed, days). Values are clamped to min..max. Styles in src/styles/choice.css. */
export function QtyStepper({ label, value, onChange, min = 1, max = 99, unit, hint, id, className }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  /** Word after the number, e.g. «نفر». */
  unit?: string;
  hint?: string;
  id?: string;
  className?: string;
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  return (
    <div className={['qty', className ?? ''].filter(Boolean).join(' ')}>
      <span className="fld-label" id={id ? `${id}-l` : undefined}>{label}</span>
      <div className="qty-row" id={id} tabIndex={id ? -1 : undefined} role="group" aria-label={label}>
        <button type="button" className="qty-btn" aria-label="کمتر" disabled={value <= min} onClick={() => set(value - 1)}><Minus size={16} aria-hidden="true" /></button>
        <output className="qty-val" aria-live="polite">{faNum(value)}{unit ? <small>{unit}</small> : null}</output>
        <button type="button" className="qty-btn" aria-label="بیشتر" disabled={value >= max} onClick={() => set(value + 1)}><Plus size={16} aria-hidden="true" /></button>
      </div>
      {hint ? <span className="fld-hint">{hint}</span> : null}
    </div>
  );
}
