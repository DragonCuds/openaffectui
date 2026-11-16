import type { ReactNode } from 'react';
import { faNum } from './digits';

/** Static numbered flow for marketing pages (not progress). Soft tone connector, no borders. */
export function StepFlow({ steps, note }: {
  steps: { icon?: ReactNode; title: string; text: string }[];
  note?: ReactNode;
}) {
  return (
    <div className="lp-flow">
      <ol className="lp-steps">
        {steps.map((s, i) => (
          <li key={s.title} className="lp-step">
            <span className="lp-step-num" aria-hidden="true">{faNum(i + 1)}</span>
            {s.icon ? <span className="lp-step-icon" aria-hidden="true">{s.icon}</span> : null}
            <h3 className="lp-step-title">{s.title}</h3>
            <p className="lp-step-text">{s.text}</p>
          </li>
        ))}
      </ol>
      {note ? <div className="lp-flow-note">{note}</div> : null}
    </div>
  );
}
