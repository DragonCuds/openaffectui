import { useRef, type CSSProperties, type KeyboardEvent } from 'react';

/**
 * Two to five options side by side, one chosen, a soft thumb slides under it. `size` sm/md/lg, `block` fills the row
 * (options share the width). An option's `tone` tints the thumb while it is chosen (e.g. two modes, two colours).
 * Styles in src/styles/ui.css.
 */
export function Segmented<T extends string>({ label, value, options, onChange, size = 'md', block, className }: {
  label: string;
  value: T;
  options: { value: T; label: string; tone?: 'ok' | 'busy' | 'bad' }[];
  onChange: (v: T) => void;
  size?: 'sm' | 'md' | 'lg';
  /** Full width of the row. */
  block?: boolean;
  className?: string;
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
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = options.length - 1;
    else return;
    e.preventDefault();
    onChange(options[n].value);
    refs.current[n]?.focus();
  };

  return (
    <div
      className={className ? `seg ${className}` : 'seg'} role="radiogroup" aria-label={label} onKeyDown={onKey}
      data-size={size === 'md' ? undefined : size} data-block={block ? '' : undefined}
    >
      <div className="seg-track" style={{ '--n': options.length, '--i': idx } as CSSProperties}>
        <span className="seg-thumb" aria-hidden="true" data-tone={options[idx]?.tone} />
        {options.map((o, i) => (
          <button
            key={o.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            className="seg-opt"
            aria-checked={o.value === value}
            tabIndex={i === idx ? 0 : -1}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
