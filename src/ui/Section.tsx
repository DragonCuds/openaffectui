import type { ReactNode } from 'react';

/** Block with a heading. `hint` is one plain line under the heading: what this block is. */
export function Section({ title, aside, hint, children }: { title: string; aside?: ReactNode; hint?: ReactNode; children?: ReactNode }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>{title}</h2>
        {aside ? <div className="section-aside">{aside}</div> : null}
      </div>
      {hint ? <p className="section-hint">{hint}</p> : null}
      {children}
    </section>
  );
}
