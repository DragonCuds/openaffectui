import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

/**
 * Page tabs: a quiet row of labels, the active one on a tinted pill. Arrow keys move (reading direction aware).
 * Pass `children` to render the active panel under the row (role=tabpanel); or leave it out and render yourself.
 * Styles in src/styles/tabs.css.
 */
export function Tabs<T extends string>({ label, value, items, onChange, children, className }: {
  label: string;
  value: T;
  items: { value: T; label: ReactNode; badge?: ReactNode }[];
  onChange: (v: T) => void;
  children?: ReactNode;
  className?: string;
}) {
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = Math.max(0, items.findIndex((i) => i.value === value));

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const next = rtl ? 'ArrowLeft' : 'ArrowRight';
    const prev = rtl ? 'ArrowRight' : 'ArrowLeft';
    let n = idx;
    if (e.key === next) n = (idx + 1) % items.length;
    else if (e.key === prev) n = (idx - 1 + items.length) % items.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = items.length - 1;
    else return;
    e.preventDefault();
    onChange(items[n].value);
    refs.current[n]?.focus();
  };

  return (
    <div className={className ? `tabs-kit ${className}` : 'tabs-kit'}>
      <div className="tabs-list" role="tablist" aria-label={label} onKeyDown={onKey}>
        {items.map((it, i) => (
          <button
            key={it.value} ref={(el) => { refs.current[i] = el; }} type="button" role="tab" className="tabs-tab"
            id={`${uid}-t-${it.value}`} aria-selected={it.value === value} aria-controls={children ? `${uid}-p` : undefined}
            tabIndex={i === idx ? 0 : -1} onClick={() => onChange(it.value)}
          >
            {it.label}{it.badge != null ? <span className="tabs-badge">{it.badge}</span> : null}
          </button>
        ))}
      </div>
      {children ? <div className="tabs-panel" role="tabpanel" id={`${uid}-p`} aria-labelledby={`${uid}-t-${value}`}>{children}</div> : null}
    </div>
  );
}
