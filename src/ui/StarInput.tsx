import { useRef, type KeyboardEvent } from 'react';
import { Star } from 'lucide-react';
import { faNum } from './digits';

/**
 * Pick 1 to 5 stars (a radio group; arrow keys move). `value` 0 = nothing picked yet.
 * Same star look as ReviewCard. Styles in src/styles/stars.css.
 */
export function StarInput({ label, value, onChange, disabled, error, className }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  /** Marks the group invalid (the message itself goes next to it, like a field hint). */
  error?: boolean;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const cur = value >= 1 ? value : 1;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const more = rtl ? 'ArrowLeft' : 'ArrowRight';
    const less = rtl ? 'ArrowRight' : 'ArrowLeft';
    let n = cur;
    if (e.key === more || e.key === 'ArrowUp') n = Math.min(5, cur + 1);
    else if (e.key === less || e.key === 'ArrowDown') n = Math.max(1, cur - 1);
    else if (e.key === 'Home') n = 1;
    else if (e.key === 'End') n = 5;
    else return;
    e.preventDefault();
    onChange(n);
    refs.current[n - 1]?.focus();
  };

  return (
    <div className={className ? `stin ${className}` : 'stin'} role="radiogroup" aria-label={label} aria-invalid={error || undefined} data-invalid={error || undefined} onKeyDown={onKey}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i} ref={(el) => { refs.current[i - 1] = el; }} type="button" role="radio" className="stin-star" disabled={disabled}
          aria-checked={value === i} aria-label={`${faNum(i)} از ۵`} tabIndex={i === cur ? 0 : -1} data-on={i <= value || undefined}
          onClick={() => onChange(i)}
        >
          <Star size={28} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
