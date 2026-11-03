import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { faNum } from './digits';

export type DialLevel = { label: string; hint: string };

export const DEFAULT_DIAL_LEVELS: DialLevel[] = [
  { label: 'فقط ببین', hint: 'فقط نگاه می‌کند و گزارش می‌دهد. هیچ پیشنهادی نمی‌دهد و هیچ کاری انجام نمی‌دهد.' },
  { label: 'پیشنهاد بده', hint: 'تغییرها را پیشنهاد می‌دهد، اما خودش هیچ‌چیز را عوض نمی‌کند.' },
  { label: 'با تأیید انجام بده', hint: 'هر کار را آماده می‌کند و فقط بعد از تأیید تو انجام می‌دهد.' },
  { label: 'خودکار', hint: 'کارها را خودش انجام می‌دهد و بعدش گزارش می‌دهد. هر زمان می‌توانی برش گردانی.' },
];

/** Discrete "how much freedom" control: radio stops on a track, hint box below. */
export function AutonomyDial({ label, value, onChange, levels = DEFAULT_DIAL_LEVELS, disabled = false }: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  levels?: DialLevel[];
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = levels.length;
  const idx = Math.min(n - 1, Math.max(0, Math.round(value)));
  const p = n > 1 ? idx / (n - 1) : 0;

  const go = (i: number) => {
    if (i === idx || i < 0 || i >= n) return;
    onChange(i);
    refs.current[i]?.focus();
  };

  // RTL: the track starts at the right, so ArrowLeft moves toward the higher level.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const more = rtl ? 'ArrowLeft' : 'ArrowRight';
    const less = rtl ? 'ArrowRight' : 'ArrowLeft';
    let t = idx;
    if (e.key === more || e.key === 'ArrowDown') t = Math.min(n - 1, idx + 1);
    else if (e.key === less || e.key === 'ArrowUp') t = Math.max(0, idx - 1);
    else if (e.key === 'Home') t = 0;
    else if (e.key === 'End') t = n - 1;
    else return;
    e.preventDefault();
    go(t);
  };

  return (
    <div className="dial" data-disabled={disabled || undefined} style={{ '--n': n, '--p': p } as CSSProperties}>
      <div className="dial-stops" role="radiogroup" aria-label={label} aria-disabled={disabled} onKeyDown={onKey}>
        <div className="dial-rail" aria-hidden="true">
          <span className="dial-fill" />
          <span className="dial-lane"><span className="dial-thumb" /></span>
        </div>
        {levels.map((l, i) => (
          <button
            key={l.label}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            className="dial-stop"
            aria-checked={i === idx}
            aria-label={`${l.label}، ${faNum(i + 1)} از ${faNum(n)}`}
            tabIndex={i === idx ? 0 : -1}
            disabled={disabled}
            data-on={i <= idx || undefined}
            onClick={() => go(i)}
          >
            <span className="dial-dot" aria-hidden="true" />
            <span className="dial-label" aria-hidden="true">{l.label}</span>
          </button>
        ))}
      </div>
      <p className="dial-hint" aria-live="polite">{levels[idx].hint}</p>
    </div>
  );
}
