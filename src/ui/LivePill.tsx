import { cx, toFaDigits } from './yv';

export type LivePillState = 'idle' | 'measuring' | 'done' | 'failed';

const DEFAULT_TEXT: Record<LivePillState, string> = {
  idle: 'اندازه بگیر',
  measuring: 'در حال اندازه‌گیری…',
  done: '',
  failed: 'نشد، دوباره امتحان کن',
};

/**
 * Small pill for a live measurement of one sensor. idle: «اندازه بگیر» (a button); measuring: a calm moving dot (not clickable);
 * done: the result (`value` + `unit`, green dot); failed: an amber dot and a plain «نشد» line (a button again).
 * `onClick` runs on idle, done and failed. Announced politely to screen readers. Latin digits become Persian.
 * Styles: src/styles/v3-livepill.css.
 */
export function LivePill({ state, name, value, unit, text, onClick, className }: {
  state: LivePillState;
  /** What is measured, shown first, e.g. «ضربان». */
  name?: string;
  /** Result for state done, e.g. «۷۶». */
  value?: string;
  unit?: string;
  /** Replaces the default wording of the current state. */
  text?: string;
  onClick?: () => void;
  className?: string;
}) {
  const label = text ?? (state === 'done' ? '' : DEFAULT_TEXT[state]);
  const busy = state === 'measuring';
  return (
    <button
      type="button" className={cx('v3', 'v3-pill', className)} data-state={state}
      data-tone={state === 'done' ? 'calm' : state === 'failed' ? 'attn' : 'neutral'}
      onClick={onClick} disabled={busy || !onClick} aria-live="polite" aria-busy={busy || undefined}
    >
      <span className="v3-pill-dot" aria-hidden="true" />
      {name ? <span className="v3-pill-name">{name}</span> : null}
      {state === 'done' && value != null ? (
        <span className="v3-pill-val"><b>{toFaDigits(value)}</b>{unit ? <i>{unit}</i> : null}</span>
      ) : <span className="v3-pill-txt">{label}</span>}
    </button>
  );
}
