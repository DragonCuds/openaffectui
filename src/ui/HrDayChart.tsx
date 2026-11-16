import { useMemo, useState, type PointerEvent as RPointerEvent } from 'react';

/*
 * Heart rate over a day. Time axis in Asia/Tehran (the labels always show Tehran clock, whatever the browser zone).
 * Night 22:00-07:00 is a soft grey band; sleep (light / deep / rem spans) is a blue band behind the line.
 * The line breaks where data is missing for longer than `gapMinutes`. Written for the ring user web; plain SVG, no chart library.
 * The line is a soft average of nearby readings (±`smoothMinutes`) drawn as a curve that never overshoots; every real
 * reading stays as a faint dot and the hover readout always shows the real value. The person's own usual range
 * (`normalLow`..`normalHigh`) is an optional soft band; `note` is a muted line under the chart.
 * Styles in src/styles/hrday.css.
 */

export type HrDayPoint = { ts: string; value: number };
export type HrDaySleep = { start: string; end: string; stage: 'awake' | 'light' | 'deep' | 'rem' | string };
export type HrDayChartProps = {
  /** Heart-rate points (ISO times with offset). */
  points: HrDayPoint[];
  /** Window start and end (ISO). Usually one Tehran day, 00:00 to 24:00. */
  from: string;
  to: string;
  /** Sleep spans (the day object's sleep.stages). Awake spans draw nothing. */
  sleep?: HrDaySleep[];
  title?: string;
  emptyText?: string;
  /** A hole in the data longer than this breaks the line (default 45). */
  gapMinutes?: number;
  /** Time runs from the right edge (reading direction of Persian). Default true. */
  rtl?: boolean;
  /** Half-width of the averaging window in minutes; 0 draws the raw readings (default 20). */
  smoothMinutes?: number;
  /** The person's usual range. Both set = soft band behind the line; either missing = no band. */
  normalLow?: number | null;
  normalHigh?: number | null;
  /** Legend text for the band (default «محدوده‌ی همیشگی»). */
  bandLabel?: string;
  /** Muted line under the chart, e.g. why there is no band yet. */
  note?: string;
  className?: string;
};

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const W = 640;
const H = 226;
const TOP = 14;
const PLOT_H = 168;
const GUTTER = 38;
const TZ = 'Asia/Tehran';

const tehranParts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
/** Tehran offset from UTC in ms at that instant (+3.5 h today; read from the zone so it stays right if the rule changes). */
export function tehranOffsetMs(ms: number): number {
  const p: Record<string, number> = {};
  for (const x of tehranParts.formatToParts(new Date(ms))) if (x.type !== 'literal') p[x.type] = Number(x.value);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
}
const clockFmt = new Intl.DateTimeFormat('fa-IR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const fa = (n: number) => Math.round(n).toLocaleString('fa-IR');

/** Night bands (22:00 to 07:00 Tehran) clipped to [a, b]. Exported for tests. */
export function nightBands(a: number, b: number): [number, number][] {
  const off = tehranOffsetMs(a);
  const m0 = Math.floor((a + off) / DAY) * DAY - off; // Tehran midnight of the day holding `a`
  const out: [number, number][] = [];
  for (let k = -1; m0 + k * DAY <= b; k++) {
    const s = m0 + k * DAY + 22 * HOUR;
    const e = s + 9 * HOUR;
    const cs = Math.max(s, a); const ce = Math.min(e, b);
    if (ce > cs) out.push([cs, ce]);
  }
  return out;
}

type TV = { t: number; v: number };

/** Triangular-weighted average of the readings within ±half ms of each one. Exported for tests. */
export function smoothRun(run: TV[], half: number): TV[] {
  if (half <= 0 || run.length < 3) return run;
  return run.map((p, i) => {
    let sw = 0; let sv = 0;
    for (let j = i; j >= 0 && p.t - run[j].t < half; j--) { const w = 1 - (p.t - run[j].t) / half; sw += w; sv += w * run[j].v; }
    for (let j = i + 1; j < run.length && run[j].t - p.t < half; j++) { const w = 1 - (run[j].t - p.t) / half; sw += w; sv += w * run[j].v; }
    return { t: p.t, v: sv / sw };
  });
}

/** SVG path through the points with monotone cubic curves (Fritsch-Carlson): smooth, never above/below its neighbours. Exported for tests. */
export function monotonePath(xy: [number, number][]): string {
  const n = xy.length;
  if (n < 2) return '';
  const f = (v: number) => v.toFixed(1);
  if (n === 2) return `M${f(xy[0][0])},${f(xy[0][1])}L${f(xy[1][0])},${f(xy[1][1])}`;
  const d: number[] = []; const m: number[] = new Array(n);
  for (let i = 0; i < n - 1; i++) { const dx = xy[i + 1][0] - xy[i][0]; d.push(dx === 0 ? 0 : (xy[i + 1][1] - xy[i][1]) / dx); }
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i]; const b = m[i + 1] / d[i]; const s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  let out = `M${f(xy[0][0])},${f(xy[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = xy[i]; const [x1, y1] = xy[i + 1]; const h = (x1 - x0) / 3;
    out += `C${f(x0 + h)},${f(y0 + m[i] * h)} ${f(x1 - h)},${f(y1 - m[i + 1] * h)} ${f(x1)},${f(y1)}`;
  }
  return out;
}

export function HrDayChart({ points, from, to, sleep = [], title = 'ضربان', emptyText = 'در این بازه ضربانی ثبت نشده', gapMinutes = 45, rtl = true,
  smoothMinutes = 20, normalLow = null, normalHigh = null, bandLabel = 'محدوده‌ی همیشگی', note, className }: HrDayChartProps) {
  const band = normalLow != null && normalHigh != null && normalHigh > normalLow ? { low: normalLow, high: normalHigh } : null;
  const a = Date.parse(from); const b = Date.parse(to);
  const span = Math.max(1, b - a);
  const [hover, setHover] = useState<number | null>(null);

  const pts = useMemo(() => points
    .map((p) => ({ t: Date.parse(p.ts), v: p.value }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v) && p.t >= a && p.t <= b)
    .sort((x, y) => x.t - y.t), [points, a, b]);

  const plotL = rtl ? 0 : GUTTER;
  const plotR = rtl ? W - GUTTER : W;
  const xAt = (t: number) => { const f = (t - a) / span; return rtl ? plotR - f * (plotR - plotL) : plotL + f * (plotR - plotL); };

  const { lo, hi } = useMemo(() => {
    if (!pts.length && !band) return { lo: 40, hi: 120 };
    let mn = band ? band.low : Infinity; let mx = band ? band.high : -Infinity;
    for (const p of pts) { if (p.v < mn) mn = p.v; if (p.v > mx) mx = p.v; }
    let l = Math.floor((mn - 5) / 10) * 10; let h = Math.ceil((mx + 5) / 10) * 10;
    if (h - l < 40) { const c = (h + l) / 2; l = Math.floor((c - 20) / 10) * 10; h = l + 40; }
    return { lo: Math.max(0, l), hi: h };
  }, [pts, band?.low, band?.high]);
  const yAt = (v: number) => TOP + PLOT_H * (1 - (v - lo) / (hi - lo || 1));

  const segments = useMemo(() => {
    const segs: { t: number; v: number }[][] = [];
    for (const p of pts) {
      const cur = segs[segs.length - 1];
      if (cur && p.t - cur[cur.length - 1].t <= gapMinutes * 60_000) cur.push(p); else segs.push([p]);
    }
    return segs.map((seg) => smoothRun(seg, smoothMinutes * 60_000));
  }, [pts, gapMinutes, smoothMinutes]);

  const nights = useMemo(() => nightBands(a, b), [a, b]);
  const sleepBands = useMemo(() => sleep
    .filter((s) => s.stage === 'light' || s.stage === 'deep' || s.stage === 'rem')
    .map((s) => ({ s: Math.max(Date.parse(s.start), a), e: Math.min(Date.parse(s.end), b), stage: s.stage }))
    .filter((s) => s.e > s.s), [sleep, a, b]);

  // axis: every 3 Tehran hours
  const ticks = useMemo(() => {
    const off = tehranOffsetMs(a);
    const out: number[] = [];
    const step = 3 * HOUR;
    for (let t = Math.ceil((a + off) / step) * step - off; t <= b; t += step) out.push(t);
    return out;
  }, [a, b]);

  const yTicks = [lo, (lo + hi) / 2, hi];
  const sel = hover !== null ? pts[hover] : null;
  const onMove = (e: RPointerEvent<SVGSVGElement>) => {
    if (!pts.length) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const f = rtl ? (plotR - x) / (plotR - plotL) : (x - plotL) / (plotR - plotL);
    const t = a + Math.min(1, Math.max(0, f)) * span;
    let best = 0; let bd = Infinity;
    for (let i = 0; i < pts.length; i++) { const d = Math.abs(pts[i].t - t); if (d < bd) { bd = d; best = i; } }
    setHover(best);
  };

  const avg = pts.length ? pts.reduce((s, p) => s + p.v, 0) / pts.length : null;
  const readout = sel
    ? `${fa(sel.v)} در دقیقه، ساعت ${clockFmt.format(sel.t)}`
    : avg !== null ? `میانگین ${fa(avg)} در دقیقه` : '';
  const hasNight = nights.length > 0; const hasSleep = sleepBands.length > 0; const hasBand = band !== null;
  const label = pts.length
    ? `${title}: کمترین ${fa(Math.min(...pts.map((p) => p.v)))}، بیشترین ${fa(Math.max(...pts.map((p) => p.v)))}، میانگین ${fa(avg!)} در دقیقه`
    : `${title}: ${emptyText}`;

  return (
    <figure className={className ? `hrday ${className}` : 'hrday'}>
      <figcaption className="hrday-head">
        <span className="hrday-title">{title}</span>
        <span className="hrday-read" aria-live="polite">{readout}</span>
      </figcaption>
      <svg className="hrday-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {nights.map(([s, e], i) => <rect key={`n${i}`} className="hrday-night" x={Math.min(xAt(s), xAt(e))} y={TOP} width={Math.abs(xAt(e) - xAt(s))} height={PLOT_H} />)}
        {sleepBands.map((x, i) => <rect key={`s${i}`} className={`hrday-sleep hrday-${x.stage}`} x={Math.min(xAt(x.s), xAt(x.e))} y={TOP} width={Math.abs(xAt(x.e) - xAt(x.s))} height={PLOT_H} />)}
        {band ? <rect className="hrday-band" x={plotL} y={yAt(band.high)} width={plotR - plotL} height={yAt(band.low) - yAt(band.high)} rx="8" /> : null}
        {yTicks.map((v) => (
          <g key={v}>
            <line className="hrday-grid" x1={plotL} x2={plotR} y1={yAt(v)} y2={yAt(v)} />
            <text className="hrday-tick" x={rtl ? plotR + 6 : plotL - 6} y={yAt(v) + 4} textAnchor={rtl ? 'start' : 'end'}>{fa(v)}</text>
          </g>
        ))}
        {ticks.map((t) => (
          <text key={t} className="hrday-tick" x={xAt(t)} y={TOP + PLOT_H + 18}
            textAnchor={xAt(t) < plotL + 22 ? 'start' : xAt(t) > plotR - 22 ? 'end' : 'middle'}>{clockFmt.format(t)}</text>
        ))}
        {smoothMinutes > 0 ? pts.map((p, i) => <circle key={`r${i}`} className="hrday-raw" cx={xAt(p.t)} cy={yAt(p.v)} r="1.6" />) : null}
        {segments.map((seg, i) => seg.length === 1
          ? <circle key={i} className="hrday-dot" cx={xAt(seg[0].t)} cy={yAt(seg[0].v)} r="2.5" />
          : <path key={i} className="hrday-line" d={monotonePath(seg.map((p) => [xAt(p.t), yAt(p.v)]))} />)}
        {sel ? (
          <g>
            <line className="hrday-guide" x1={xAt(sel.t)} x2={xAt(sel.t)} y1={TOP} y2={TOP + PLOT_H} />
            <circle className="hrday-mark" cx={xAt(sel.t)} cy={yAt(sel.v)} r="4.5" />
          </g>
        ) : null}
        {!pts.length ? <text className="hrday-empty" x={W / 2} y={TOP + PLOT_H / 2} textAnchor="middle">{emptyText}</text> : null}
      </svg>
      {hasNight || hasSleep || hasBand ? (
        <ul className="hrday-legend">
          {hasBand ? <li><i className="hrday-sw hrday-band" />{bandLabel} ({fa(band!.low)} تا {fa(band!.high)})</li> : null}
          {hasNight ? <li><i className="hrday-sw hrday-night" />شب (۲۲ تا ۷)</li> : null}
          {hasSleep ? <li><i className="hrday-sw hrday-sleep hrday-deep" />خواب</li> : null}
        </ul>
      ) : null}
      {note ? <p className="hrday-note">{note}</p> : null}
    </figure>
  );
}
