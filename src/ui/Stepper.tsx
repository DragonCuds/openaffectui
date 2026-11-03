import { Check } from 'lucide-react';
import { faNum } from './digits';

/**
 * Where you are in a short flow. "dots": numbered circles joined by a line (sign-up: phone, code, done).
 * "bar": one small segment per step with the current label (questions: 2 of 5).
 * Written from scratch (look only at the free affectUI Progress Tracker).
 */
export function Stepper({
  steps, current, variant = 'dots', label = 'مرحله‌ها', className,
}: {
  /** Step names. For the bar variant they may be empty strings. */
  steps: string[];
  /** Zero-based index of the step you are on. steps.length means all done. */
  current: number;
  variant?: 'dots' | 'bar';
  label?: string;
  className?: string;
}) {
  const total = steps.length;
  const at = Math.min(Math.max(current, 0), total);
  const cls = ['stp', `stp-${variant}`, className ?? ''].filter(Boolean).join(' ');
  const text = at >= total ? 'همه‌ی مرحله‌ها انجام شد' : `مرحله‌ی ${faNum(at + 1)} از ${faNum(total)}${steps[at] ? `: ${steps[at]}` : ''}`;

  if (variant === 'bar') {
    return (
      <div className={cls} role="group" aria-label={label}>
        <div className="stp-segs" aria-hidden="true">
          {steps.map((_, i) => <i key={i} className="stp-seg" data-state={i < at ? 'done' : i === at ? 'now' : 'todo'} />)}
        </div>
        <span className="stp-sr">{text}</span>
      </div>
    );
  }
  return (
    <ol className={cls} aria-label={label}>
      {steps.map((s, i) => {
        const state = i < at ? 'done' : i === at ? 'now' : 'todo';
        return (
          <li key={i} className="stp-item" data-state={state} aria-current={state === 'now' ? 'step' : undefined}>
            <span className="stp-dot" aria-hidden="true">{state === 'done' ? <Check size={14} strokeWidth={2.4} /> : faNum(i + 1)}</span>
            <span className="stp-name">{s}</span>
            <span className="stp-sr">{state === 'done' ? ' (انجام شد)' : state === 'now' ? ' (مرحله‌ی فعلی)' : ''}</span>
          </li>
        );
      })}
    </ol>
  );
}
