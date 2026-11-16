import { faNum } from './digits';
import type { SensorLevel } from './SensorTile';
import { arcPath, autoLevel, levelTone, polar } from './v3';
import { cx, toFaDigits } from './yv';

export type GaugeProps = {
  /** Current reading; null shows «—» and no dot. */
  value: number | null;
  /** Scale ends (the 270° track runs from min to max). */
  min: number;
  max: number;
  /** The person's usual range, drawn as a green band on the track. Both needed. */
  bandLow?: number;
  bandHigh?: number;
  /** Small text under the number (large size mostly), e.g. «در دقیقه». */
  unit?: string;
  /** Text for the centre when the plain number is not what you want, e.g. «۹۷٪» or «۶:۵۲». Latin digits become Persian. */
  text?: string;
  /** sm (home, about 92px) or lg (sensor page, up to 250px). */
  size?: 'sm' | 'lg';
  /** great / good colour the dot calm, fair neutral, check attn. Left out: inside the band is good, else fair. */
  level?: SensorLevel;
  /** The reading is old: dot attn, number and band softened. */
  late?: boolean;
  /** Accessible name, e.g. «ضربان». */
  label?: string;
  className?: string;
};

const SHAPE = { sm: { r: 42, w: 7 }, lg: { r: 44, w: 5 } } as const;
const START = -135;
const SPAN = 270;
const BOARD_H = 86; // the lower part of the 270° ring is empty, so the board is cropped there

/**
 * 270° gauge in the «instrument» style: a quiet grey track, a green band for the person's usual range and one dot at the current
 * value (no progress arc). Number in the middle, optional unit under it. Colour only for meaning. Styles: src/styles/v3-gauge.css.
 */
export function Gauge({ value, min, max, bandLow, bandHigh, unit, text, size = 'sm', level, late = false, label, className }: GaugeProps) {
  const { r, w } = SHAPE[size];
  const frac = (v: number) => Math.min(1, Math.max(0, (v - min) / (max - min || 1)));
  const deg = (v: number) => START + SPAN * frac(v);
  const hasBand = bandLow != null && bandHigh != null && bandHigh > bandLow;
  const lv = level ?? autoLevel(value, bandLow, bandHigh);
  const tone = value == null ? 'neutral' : levelTone(lv, late);
  const shown = value == null ? '—' : toFaDigits(text ?? String(faNum(Math.round(value * 10) / 10)));
  const dot = value == null ? null : polar(deg(value), r);
  return (
    <div
      className={cx('v3', 'v3-gauge', className)}
      data-size={size} data-tone={tone} data-late={late || undefined} data-empty={value == null || undefined}
      role="img" aria-label={[label, value == null ? 'بدون مقدار' : shown, value == null ? '' : unit].filter(Boolean).join(' ')}
    >
      <svg className="v3-gauge-svg" viewBox={`0 0 100 ${BOARD_H}`} aria-hidden="true" focusable="false">
        <path className="v3-gauge-track" d={arcPath(START, START + SPAN, r)} strokeWidth={w} />
        {hasBand ? <path className="v3-gauge-band" d={arcPath(deg(bandLow!), deg(bandHigh!), r)} strokeWidth={w} /> : null}
        {dot ? <circle className="v3-gauge-dot" cx={dot[0].toFixed(2)} cy={dot[1].toFixed(2)} r={w * 0.95} strokeWidth={w * 0.45} /> : null}
      </svg>
      <div className="v3-gauge-c" aria-hidden="true">
        <b>{shown}</b>
        {unit && value != null ? <i>{unit}</i> : null}
      </div>
    </div>
  );
}
