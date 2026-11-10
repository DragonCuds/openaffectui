"use client";
import { useId, useState, type ReactNode } from 'react';

/**
 * Questions and answers: a quiet list, one row open at a time (or several with `multiple`).
 * The answer glides open (grid rows 0fr -> 1fr). Styles in src/styles/accordion.css.
 */
export function Accordion({ items, defaultOpen, multiple = false, className }: {
  items: { id: string; title: ReactNode; body: ReactNode }[];
  /** Id of the row open at the start. */
  defaultOpen?: string;
  multiple?: boolean;
  className?: string;
}) {
  const uid = useId();
  const [open, setOpen] = useState<string[]>(defaultOpen ? [defaultOpen] : []);
  const toggle = (id: string) =>
    setOpen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : multiple ? [...cur, id] : [id]));

  return (
    <div className={className ? `acc ${className}` : 'acc'}>
      {items.map((it) => {
        const on = open.includes(it.id);
        return (
          <div key={it.id} className="acc-item" data-open={on || undefined}>
            <h3 className="acc-h">
              <button
                type="button" className="acc-btn" id={`${uid}-b-${it.id}`} aria-expanded={on} aria-controls={`${uid}-p-${it.id}`}
                onClick={() => toggle(it.id)}
              >
                <span>{it.title}</span>
                <svg className="acc-chev" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                  <path d="M4 6.2 8 10l4-3.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </h3>
            <div className="acc-panel" id={`${uid}-p-${it.id}`} role="region" aria-labelledby={`${uid}-b-${it.id}`}>
              <div className="acc-clip"><div className="acc-body">{it.body}</div></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
