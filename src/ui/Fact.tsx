import type { ReactNode } from 'react';

/** Big scannable fact: icon, small label, bold value, optional note. Put several inside FactGrid. Styles in src/styles/fact.css. */
export function Fact({ icon, label, value, note, wide, tone, children }: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  note?: ReactNode;
  /** Takes the full row in the grid. */
  wide?: boolean;
  /** Accent-tinted icon chip. */
  tone?: 'accent';
  children?: ReactNode;
}) {
  return (
    <div className="fact" data-wide={wide || undefined} data-tone={tone}>
      <span className="fact-ic" aria-hidden="true">{icon}</span>
      <div className="fact-body">
        <span className="fact-label">{label}</span>
        <strong className="fact-value">{value}</strong>
        {note ? <span className="fact-note">{note}</span> : null}
        {children}
      </div>
    </div>
  );
}

export function FactGrid({ children, className, cols }: { children?: ReactNode; className?: string; /** 3 = three across on wide screens. */ cols?: 2 | 3 }) {
  return <div className={className ? `fact-grid ${className}` : 'fact-grid'} data-cols={cols === 3 ? 3 : undefined}>{children}</div>;
}
