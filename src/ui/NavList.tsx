import type { ReactNode } from 'react';

/**
 * A vertical list of sections for a side column: a label, an optional icon and a count. The open one is on a tinted row.
 * Styles in src/styles/chat.css.
 */
export function NavList<T extends string>({ label, value, items, onChange, className }: {
  label: string;
  value: T;
  items: { value: T; label: ReactNode; icon?: ReactNode; count?: ReactNode }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <nav className={className ? `nvl ${className}` : 'nvl'} aria-label={label}>
      {items.map((it) => (
        <button key={it.value} type="button" className="nvl-item" aria-current={it.value === value ? 'true' : undefined} onClick={() => onChange(it.value)}>
          {it.icon ? <span className="nvl-ic" aria-hidden="true">{it.icon}</span> : null}
          <span className="nvl-label">{it.label}</span>
          {it.count != null ? <span className="nvl-count">{it.count}</span> : null}
        </button>
      ))}
    </nav>
  );
}
