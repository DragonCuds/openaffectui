import { faNum } from './digits';
import { cx } from './yv';

/** Weekday letters by JS getDay() (0 = Sunday): ی د س چ پ ج ش. */
export const WEEKDAY_LETTERS = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'] as const;

const AREA = 96; // px of the tallest bar

/**
 * Seven bars for the last seven days, oldest first (so the oldest sits at the right edge in RTL), with the Persian weekday
 * letter under each and the value above. Today is the green bar; the others are quiet grey. An optional usual-range band
 * is drawn behind the bars. A null value shows «—» and a short stub. Styles: src/styles/v3-weekbars.css.
 */
export function WeekBars({ values, endWeekday, labels, today, bandLow, bandHigh, min, max, format, label, className }: {
  /** Exactly seven values, oldest first; the last one is today. Missing days are null. */
  values: (number | null)[];
  /** JS getDay() of the last bar (0 = Sunday ... 6 = Saturday); left out, today's weekday in the browser. */
  endWeekday?: number;
  /** Seven letters to use instead of the computed weekday letters. */
  labels?: string[];
  /** Index of the emphasised bar (default: the last). */
  today?: number;
  bandLow?: number;
  bandHigh?: number;
  /** Value range of the bars; left out, it is taken from the data with some air so small differences stay visible. */
  min?: number;
  max?: number;
  /** Text of a value above a bar (default: Persian digits). */
  format?: (v: number) => string;
  /** Accessible name of the whole chart. */
  label?: string;
  className?: string;
}) {
  const days = values.slice(0, 7);
  const end = endWeekday ?? new Date().getDay();
  const nowIdx = today ?? days.length - 1;
  const hasBand = bandLow != null && bandHigh != null && bandHigh > bandLow;
  const nums = [...days.flatMap((v) => (v == null ? [] : [v])), ...(hasBand ? [bandLow!, bandHigh!] : [])];
  const lo = nums.length ? Math.min(...nums) : 0;
  const hi = nums.length ? Math.max(...nums) : 1;
  const span = hi - lo || 1;
  const y0 = min ?? lo - span * 0.6;
  const y1 = max ?? hi + span * 0.15;
  const f = (v: number) => Math.min(1, Math.max(0, (v - y0) / (y1 - y0 || 1)));
  const txt = format ?? ((v: number) => String(faNum(Math.round(v * 10) / 10)));
  const letter = (i: number) => labels?.[i] ?? WEEKDAY_LETTERS[(((end - (days.length - 1 - i)) % 7) + 7) % 7];
  return (
    <div className={cx('v3', 'v3-wk', className)} role="list" aria-label={label}>
      {days.map((v, i) => (
        <div key={i} className="v3-wk-col" role="listitem" data-today={i === nowIdx || undefined} aria-label={`${letter(i)} ${v == null ? '—' : txt(v)}`}>
          <div className="v3-wk-plot">
            {hasBand ? <span className="v3-wk-band" style={{ insetBlockEnd: `${f(bandLow!) * AREA}px`, blockSize: `${(f(bandHigh!) - f(bandLow!)) * AREA}px` }} /> : null}
            <i className="v3-wk-bar" data-empty={v == null || undefined} style={{ blockSize: v == null ? '4px' : `${Math.max(4, f(v) * AREA)}px` }} />
            <span className="v3-wk-v" style={{ insetBlockEnd: `${(v == null ? 4 : Math.max(4, f(v) * AREA)) + 4}px` }}>{v == null ? '—' : txt(v)}</span>
          </div>
          <span className="v3-wk-d">{letter(i)}</span>
        </div>
      ))}
    </div>
  );
}
