import { useMemo } from 'react';
import { cx, toFaDigits } from './yv';

export type BandChartPoint = {
  /** Hour of the day, 0 to 24 (fractions allowed: 9.5 = 9:30). */
  hour: number;
  /** null = no reading; the line breaks there. */
  value: number | null;
};

const W = 340;
const H = 120;
const PAD = 12;
const LABEL_Y = H + 16;

/**
 * Day line with the person's usual range as a soft green band. Quiet by design: no grid, no value axis; hours along the bottom
 * (Persian digits, the axis text itself runs left to right). Missing readings leave gaps, a lone reading shows as a small dot,
 * and the newest reading is marked with a dot (amber when it is outside the band). Time starts at the right edge like the
 * kit's HrDayChart (`rtl`, default); pass rtl={false} to run left to right. Styles: src/styles/v3-bandchart.css.
 */
export function BandChart({ points, bandLow, bandHigh, min, max, from = 0, to = 24, ticks = [0, 6, 12, 18], nowLabel, rtl = true, gapHours, current = true, label, className }: {
  points: BandChartPoint[];
  bandLow?: number;
  bandHigh?: number;
  /** Value range of the plot; left out, it is taken from the data and band with some air. */
  min?: number;
  max?: number;
  /** Window in hours (default 0 to 24). */
  from?: number;
  to?: number;
  /** Hours that get a label (default 0, 6, 12, 18). */
  ticks?: number[];
  /** Label under the newest reading, e.g. «الان». Ticks too close to it are dropped. */
  nowLabel?: string;
  rtl?: boolean;
  /** A hole longer than this many hours between two readings also breaks the line. */
  gapHours?: number;
  /** Mark the newest reading (default true). */
  current?: boolean;
  /** Accessible description, e.g. «ضربان امروز». */
  label?: string;
  className?: string;
}) {
  const g = useMemo(() => {
    const pts = points.filter((p) => p.hour >= from && p.hour <= to).sort((a, b) => a.hour - b.hour);
    const vals = pts.flatMap((p) => (p.value == null ? [] : [p.value]));
    const hasBand = bandLow != null && bandHigh != null && bandHigh > bandLow;
    const all = [...vals, ...(hasBand ? [bandLow!, bandHigh!] : [])];
    const lo = min ?? (all.length ? Math.min(...all) : 0);
    const hi = max ?? (all.length ? Math.max(...all) : 1);
    const span = hi - lo || 1;
    const y0 = min ?? lo - span * 0.12;
    const y1 = max ?? hi + span * 0.12;
    const xs = (h: number) => {
      const f = (h - from) / (to - from || 1);
      return PAD + (rtl ? 1 - f : f) * (W - 2 * PAD);
    };
    const ys = (v: number) => H - Math.min(1, Math.max(0, (v - y0) / (y1 - y0 || 1))) * H;
    const segs: BandChartPoint[][] = [];
    let cur: BandChartPoint[] = [];
    let prev: BandChartPoint | null = null;
    for (const p of pts) {
      if (p.value == null) { if (cur.length) segs.push(cur); cur = []; prev = null; continue; }
      if (prev && gapHours != null && p.hour - prev.hour > gapHours && cur.length) { segs.push(cur); cur = []; }
      cur.push(p); prev = p;
    }
    if (cur.length) segs.push(cur);
    const last = [...pts].reverse().find((p) => p.value != null) ?? null;
    return { segs, last, xs, ys, hasBand };
  }, [points, bandLow, bandHigh, min, max, from, to, rtl, gapHours]);

  const nowX = g.last ? g.xs(g.last.hour) : null;
  const anchorAt = (x: number) => (x < 26 ? 'start' : x > W - 26 ? 'end' : 'middle');
  const tickList = ticks.filter((t) => t >= from && t <= to && !(nowLabel && g.last && Math.abs(t - g.last.hour) < 2.5));
  const out = g.last && bandLow != null && bandHigh != null && (g.last.value! < bandLow || g.last.value! > bandHigh);
  const hourText = (h: number) => toFaDigits(String(Math.round(h) % 24).padStart(2, '0'));

  return (
    <div className={cx('v3', 'v3-bc', className)}>
      <svg className="v3-bc-svg" viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label={label ?? 'نمودار روز'}>
        {g.hasBand ? <rect className="v3-bc-band" x={0} y={g.ys(bandHigh!)} width={W} height={Math.max(0, g.ys(bandLow!) - g.ys(bandHigh!))} rx={4} /> : null}
        {g.segs.map((s, i) => s.length > 1 ? (
          <path key={i} className="v3-bc-line" d={s.map((p, k) => `${k ? 'L' : 'M'}${g.xs(p.hour).toFixed(1)} ${g.ys(p.value!).toFixed(1)}`).join('')} />
        ) : (
          <circle key={i} className="v3-bc-lone" cx={g.xs(s[0].hour)} cy={g.ys(s[0].value!)} r={2.4} />
        ))}
        {current && g.last ? <circle className="v3-bc-now" data-tone={out ? 'attn' : 'calm'} cx={g.xs(g.last.hour)} cy={g.ys(g.last.value!)} r={5} /> : null}
        <g className="v3-bc-axis">
          {tickList.map((t) => <text key={t} x={g.xs(t)} y={LABEL_Y} textAnchor={anchorAt(g.xs(t))}>{hourText(t)}</text>)}
          {nowLabel && nowX != null ? <text x={nowX} y={LABEL_Y} textAnchor={anchorAt(nowX)}>{nowLabel}</text> : null}
        </g>
      </svg>
    </div>
  );
}
