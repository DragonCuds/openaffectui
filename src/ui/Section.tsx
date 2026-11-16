import type { ReactNode } from 'react';

/**
 * Block with a heading. `hint` is one plain line under the heading: what this block is.
 * `art` is an optional drawing in a round frame. Narrow screens: between the title and `aside`
 * in the heading row. Wide screens: at the inline-end side beside title and hint, with `aside`
 * sitting on the bottom edge of the frame.
 */
export function Section({ title, aside, hint, art, id, children }: { title: string; aside?: ReactNode; hint?: ReactNode; art?: ReactNode; id?: string; children?: ReactNode }) {
  return (
    <section id={id} className={art ? 'section has-art' : 'section'}>
      <div className="section-head">
        <h2>{title}</h2>
        {art ? <div className="section-art" aria-hidden="true">{art}</div> : null}
        {aside ? <div className="section-aside">{aside}</div> : null}
        {art && hint ? <p className="section-hint">{hint}</p> : null}
      </div>
      {hint && !art ? <p className="section-hint">{hint}</p> : null}
      {children}
    </section>
  );
}
