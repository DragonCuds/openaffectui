"use client";
import { useId, type ReactNode } from 'react';

/**
 * One folded block you open with a tap, controlled by the page (so a form can open it to show an error).
 * Looks like one Accordion row (uses accordion.css). Closed content cannot be tabbed into.
 */
export function Disclosure({ title, hint, open, onOpenChange, children, className }: {
  title: ReactNode;
  /** One plain line under the title while closed. */
  hint?: ReactNode;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children?: ReactNode;
  className?: string;
}) {
  const uid = useId();
  return (
    <div className={className ? `acc ${className}` : 'acc'}>
      <div className="acc-item" data-open={open || undefined}>
        <h3 className="acc-h">
          <button type="button" className="acc-btn" id={`${uid}-b`} aria-expanded={open} aria-controls={`${uid}-p`} onClick={() => onOpenChange(!open)}>
            <span>{title}{hint ? <span className="disc-hint">{hint}</span> : null}</span>
            <svg className="acc-chev" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
              <path d="M4 6.2 8 10l4-3.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </h3>
        <div className="acc-panel" id={`${uid}-p`} role="region" aria-labelledby={`${uid}-b`} inert={!open}>
          <div className="acc-clip"><div className="acc-body">{children}</div></div>
        </div>
      </div>
    </div>
  );
}
