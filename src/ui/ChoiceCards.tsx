import { useRef, type KeyboardEvent, type ReactNode } from 'react';

/**
 * Pick one of a few cards (a radio group): each has a `title`, an optional small `note`, and a `price` block at
 * the inline end (with an optional struck-through `was`). The chosen card is tinted and carries a dot. No borders.
 * Styles in src/styles/choicecards.css.
 */
export function ChoiceCards<T extends string>({ label, value, options, onChange, disabled }: {
  label: string;
  value: T;
  options: { value: T; title: ReactNode; note?: ReactNode; price: ReactNode; was?: ReactNode; badge?: ReactNode }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const next = rtl ? 'ArrowLeft' : 'ArrowRight';
    const prev = rtl ? 'ArrowRight' : 'ArrowLeft';
    let n = idx;
    if (e.key === next || e.key === 'ArrowDown') n = (idx + 1) % options.length;
    else if (e.key === prev || e.key === 'ArrowUp') n = (idx - 1 + options.length) % options.length;
    else return;
    e.preventDefault();
    onChange(options[n].value);
    refs.current[n]?.focus();
  };

  return (
    <div className="chc" role="radiogroup" aria-label={label} onKeyDown={onKey}>
      {options.map((o, i) => (
        <button
          key={o.value} ref={(el) => { refs.current[i] = el; }} type="button" role="radio" className="chc-card"
          aria-checked={o.value === value} tabIndex={i === idx ? 0 : -1} disabled={disabled} onClick={() => onChange(o.value)}
        >
          <span className="chc-dot" aria-hidden="true" />
          <span className="chc-tx">
            <span className="chc-title">{o.title}{o.badge ? <span className="chc-badge">{o.badge}</span> : null}</span>
            {o.note ? <span className="chc-note">{o.note}</span> : null}
          </span>
          <span className="chc-price">
            {o.was ? <s className="chc-was">{o.was}</s> : null}
            <b>{o.price}</b>
          </span>
        </button>
      ))}
    </div>
  );
}
