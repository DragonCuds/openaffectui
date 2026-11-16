import type { ReactNode } from 'react';
import { faNum } from './digits';

export type EscalationPart =
  | { kind: 'word'; text: string; tone?: 'accent' | 'muted' }
  | { kind: 'list'; items: { text: string; icon?: ReactNode }[]; numbered?: boolean }
  | { kind: 'end'; text: string; icon?: ReactNode };

/** Quiet "if -> these -> then" sentence for marketing pages: words, stacked lists and one end mark joined by thin arrows.
 *  One row on wide screens (reads in the page direction), one column on phones. No borders, no boxes. */
export function EscalationFlow({ parts, label }: { parts: EscalationPart[]; label?: string }) {
  return (
    <div className="lp-esc" role="group" aria-label={label}>
      {parts.map((p, i) => (
        <div key={i} className="lp-esc-part" data-kind={p.kind}>
          {i > 0 ? <span className="lp-esc-arrow" aria-hidden="true" /> : null}
          {p.kind === 'word' ? <span className="lp-esc-word" data-tone={p.tone ?? 'accent'}>{p.text}</span> : null}
          {p.kind === 'list' ? (
            p.numbered ? (
              <ol className="lp-esc-list" data-numbered="">
                {p.items.map((t, n) => (
                  <li key={t.text}><span className="lp-esc-num" aria-hidden="true">{faNum(n + 1)}</span>{t.icon ? <span className="lp-esc-ic" aria-hidden="true">{t.icon}</span> : null}<span>{t.text}</span></li>
                ))}
              </ol>
            ) : (
              <ul className="lp-esc-list">
                {p.items.map((t) => (
                  <li key={t.text}>{t.icon ? <span className="lp-esc-ic" aria-hidden="true">{t.icon}</span> : null}<span>{t.text}</span></li>
                ))}
              </ul>
            )
          ) : null}
          {p.kind === 'end' ? <span className="lp-esc-end">{p.icon ? <span className="lp-esc-end-ic" aria-hidden="true">{p.icon}</span> : null}{p.text}</span> : null}
        </div>
      ))}
    </div>
  );
}
