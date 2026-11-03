import { useRef, useState, type KeyboardEvent } from 'react';
import { Check } from 'lucide-react';
import { Button } from './Button';
import { Meter } from './Meter';
import { faNum } from './digits';

export type Decision = { id: string; question: string; hint?: string; options: { value: string; label: string }[] };

/** Open questions for the owner. Answered ones fold to one line; «تغییر» reopens them. */
export function DecisionInbox({ decisions, answers, onAnswer }: {
  decisions: Decision[];
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
}) {
  // Reopened questions: kept locally so the answer stays chosen until a new one is picked.
  const [reopened, setReopened] = useState<ReadonlySet<string>>(new Set());
  const optRefs = useRef<Record<string, (HTMLButtonElement | null)[]>>({});

  const total = decisions.length;
  const done = decisions.filter((d) => answers[d.id] && !reopened.has(d.id)).length;

  const pick = (id: string, v: string) => {
    setReopened((s) => { const n = new Set(s); n.delete(id); return n; });
    onAnswer(id, v);
  };
  const reopen = (id: string) => setReopened((s) => new Set(s).add(id));

  const onKey = (e: KeyboardEvent<HTMLDivElement>, d: Decision) => {
    const n = d.options.length;
    // Arrows only move focus: choosing an option folds the question away, so that is left to Enter/click.
    const at = optRefs.current[d.id]?.findIndex((b) => b === document.activeElement) ?? 0;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const next = rtl ? 'ArrowLeft' : 'ArrowRight';
    const prev = rtl ? 'ArrowRight' : 'ArrowLeft';
    let i = Math.max(0, at);
    if (e.key === next || e.key === 'ArrowDown') i = (i + 1) % n;
    else if (e.key === prev || e.key === 'ArrowUp') i = (i - 1 + n) % n;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = n - 1;
    else return;
    e.preventDefault();
    optRefs.current[d.id]?.[i]?.focus();
  };

  return (
    <div className="dec">
      <div className="dec-top">
        <p className="dec-count" aria-live="polite">{faNum(done)} از {faNum(total)} جواب داده شد</p>
        <Meter value={done} max={total} label="پیشرفت تصمیم‌ها" />
      </div>

      {decisions.map((d) => {
        const chosen = d.options.find((o) => o.value === answers[d.id]);
        if (chosen && !reopened.has(d.id)) {
          return (
            <div className="dec-done" key={d.id}>
              <Check size={16} aria-hidden="true" />
              <span className="dec-done-text"><span className="muted">{d.question}</span> <b>{chosen.label}</b></span>
              <Button className="dec-change" onClick={() => reopen(d.id)} aria-label={`تغییر پاسخ: ${d.question}`}>تغییر</Button>
            </div>
          );
        }
        const qid = `dec-q-${d.id}`;
        const tab = Math.max(0, d.options.findIndex((o) => o.value === answers[d.id]));
        return (
          <div className="dec-card" key={d.id}>
            <p className="dec-q" id={qid}>{d.question}</p>
            {d.hint ? <p className="dec-hint">{d.hint}</p> : null}
            <div className="dec-opts" role="radiogroup" aria-labelledby={qid} onKeyDown={(e) => onKey(e, d)}>
              {d.options.map((o, i) => (
                <button
                  key={o.value}
                  ref={(el) => { (optRefs.current[d.id] ??= [])[i] = el; }}
                  type="button"
                  role="radio"
                  className="dec-opt"
                  aria-checked={o.value === answers[d.id]}
                  tabIndex={i === tab ? 0 : -1}
                  onClick={() => pick(d.id, o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {total > 0 && done === total ? <p className="dec-all">همه‌ی تصمیم‌ها گرفته شد</p> : null}
    </div>
  );
}
