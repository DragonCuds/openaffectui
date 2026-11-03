/*
 * Decision Inbox – ported from affectui.com (MIT licence)
 * https://www.affectui.com/components/decision-inbox
 *
 * Copyright (c) affectui. Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files, to deal in the software without restriction, including the rights
 * to use, copy, modify, merge, publish, distribute, sublicense and/or sell copies, subject to this notice being
 * kept in all copies or substantial portions of the software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY
 * OF ANY KIND.
 *
 * Changes from the original: Persian copy and digits, RTL (logical properties), panel colour tokens with light and
 * dark, no 1px borders, styles in styles/decision.css instead of an injected <style>, and keyboard focus is kept
 * after an answer (it moves to the confirmation, then to the next open decision).
 */
import { useEffect, useRef, useState } from 'react';
import { faNum } from './digits';

export type Decision = {
  id: string;
  title: string;
  /** Short context under the title */
  detail?: string;
  /** Main answer, shown as the dark button */
  primary: string;
  /** Other answer, shown as the light button */
  secondary: string;
  /** Starts folded to one muted line – click to open */
  collapsed?: boolean;
};

export type DecisionInboxProps = {
  decisions: Decision[];
  /** Called with the decision and the chosen answer */
  onDecide?: (decision: Decision, answer: 'primary' | 'secondary') => void;
  className?: string;
};

type State = { open: boolean; answered?: string; gone?: boolean };

export function DecisionInbox({ decisions, onDecide, className }: DecisionInboxProps) {
  const [state, setState] = useState<Record<string, State>>(() =>
    Object.fromEntries(decisions.map((d) => [d.id, { open: !d.collapsed }])),
  );
  const patch = (id: string, next: Partial<State>) => setState((s) => ({ ...s, [id]: { ...s[id], ...next } }));

  const rootRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const doneRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const focusAfter = useRef<'done' | 'next' | null>(null);
  const focusId = useRef<string>('');
  const [tick, setTick] = useState(0);

  const open = decisions.filter((d) => !state[d.id]?.answered).length;
  // 1284 → «۱٬۲۸۴»
  const count = faNum(open);

  const decide = (d: Decision, answer: 'primary' | 'secondary') => {
    patch(d.id, { answered: answer === 'primary' ? d.primary : d.secondary });
    // The pressed button is replaced by the confirmation: keep keyboard focus on it
    focusAfter.current = 'done';
    focusId.current = d.id;
    onDecide?.(d, answer);
    // Show the confirmation for a moment, then fold the row away and open the next folded one
    window.setTimeout(() => {
      const hadFocus = !!rowRefs.current[d.id]?.contains(document.activeElement);
      setState((s) => {
        const next = { ...s, [d.id]: { ...s[d.id], gone: true } };
        const folded = decisions.find((x) => x.id !== d.id && !next[x.id]?.open && !next[x.id]?.answered);
        if (folded) next[folded.id] = { ...next[folded.id], open: true };
        return next;
      });
      if (hadFocus) {
        focusAfter.current = 'next';
        focusId.current = d.id;
        setTick((t) => t + 1);
      }
    }, 1100);
  };

  // Focus hand-over after an answer: confirmation first, then the next open decision (or the heading)
  useEffect(() => {
    const mode = focusAfter.current;
    if (!mode) return;
    focusAfter.current = null;
    if (mode === 'done') {
      doneRefs.current[focusId.current]?.focus({ preventScroll: true });
      return;
    }
    const nextOpen = decisions.find((x) => {
      const s = state[x.id];
      return s?.open && !s.answered && !s.gone;
    });
    const btn = nextOpen && rowRefs.current[nextOpen.id]?.querySelector<HTMLButtonElement>('.ui-di__btn');
    (btn ?? headRef.current)?.focus({ preventScroll: true });
  }, [state, tick, decisions]);

  return (
    <section ref={rootRef} className={['ui-di', className].filter(Boolean).join(' ')} data-clear={open === 0 || undefined}>
      <header ref={headRef} className="ui-di__head" aria-live="polite" tabIndex={-1}>
        {open > 0 ? (
          <>
            <AlertIcon />
            <span>{count} مورد منتظر نظر شماست</span>
          </>
        ) : (
          <>
            <DoneIcon />
            <span>همه چیز بررسی شد</span>
          </>
        )}
      </header>

      <div className="ui-di__card">
        {decisions.map((d) => {
          const s = state[d.id] ?? { open: true };
          return (
            <div key={d.id} ref={(el) => { rowRefs.current[d.id] = el; }} className="ui-di__row" data-gone={s.gone || undefined} inert={s.gone}>
              <div className="ui-di__row-inner">
                <div className="ui-di__item" data-open={s.open || undefined} data-answered={s.answered ? true : undefined}>
                  {s.open ? (
                    <p className="ui-di__title" dir="auto">
                      {d.title}
                    </p>
                  ) : (
                    <button type="button" className="ui-di__title ui-di__title--folded" dir="auto" title={d.title} onClick={() => patch(d.id, { open: true })}>
                      {d.title}
                    </button>
                  )}
                  <div className="ui-di__body" data-open={s.open || undefined}>
                    <div className="ui-di__body-inner">
                      {d.detail && (
                        <p className="ui-di__detail" dir="auto">
                          {d.detail}
                        </p>
                      )}
                      <div className="ui-di__actions">
                        {s.answered ? (
                          <span className="ui-di__done" role="status" tabIndex={-1} ref={(el) => { doneRefs.current[d.id] = el; }}>
                            <DoneIcon />
                            <span dir="auto">{s.answered}</span>
                          </span>
                        ) : (
                          <>
                            <button type="button" className="ui-di__btn ui-di__btn--primary" dir="auto" onClick={() => decide(d, 'primary')}>
                              {d.primary}
                            </button>
                            <button type="button" className="ui-di__btn" dir="auto" onClick={() => decide(d, 'secondary')}>
                              {d.secondary}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <p className="ui-di__empty">چیزی منتظر شما نیست – تصمیم‌های جدید اینجا نمایش داده می‌شوند.</p>
      </div>
    </section>
  );
}

/* ---------- Icons ---------- */

const AlertIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M6.7 2.3a1.5 1.5 0 0 1 2.6 0l5.4 9.4A1.5 1.5 0 0 1 13.4 14H2.6a1.5 1.5 0 0 1-1.3-2.3Z" fill="currentColor" />
    <path d="M8 5.6v3.6" stroke="var(--ui-di-glyph)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="11.4" r="0.85" fill="var(--ui-di-glyph)" />
  </svg>
);

const DoneIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <circle cx="8" cy="8" r="7" fill="currentColor" />
    <path d="m5 8.2 2 2 4-4.2" fill="none" stroke="var(--ui-di-glyph)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
