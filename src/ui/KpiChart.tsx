/*
 * KPI Chart. Written from scratch to match the look and motion of the public affectUI "KPI Chart" demo
 * (https://www.affectui.com/components/kpi-chart). No vendor code was used: sizes, colours and timings
 * were read from the public demo like a user would (screenshots / frame captures) and the API follows its public docs.
 * Reads in the page direction: in RTL the first point sits on the right and the lines draw in from the right.
 */
import {
  useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent,
} from 'react';

/** `null` in `values` = an unknown point: the line breaks there, no dot, the tooltip says `unknownText`. */
export type KpiSeries = { label: string; color: string; values: (number | null)[] };
/** A quiet marker on the axis at a point (for example a day something changed); `label` shows in the tooltip. */
export type KpiMark = { index: number; label: string };

export type KpiChartProps = {
  /** Label above the number. */
  title?: string;
  /** Headline value, already formatted. */
  value?: string;
  /** Change against the previous period: green when positive, red when negative. */
  delta?: number;
  /** One label per point; first, middle and last are shown on the axis. */
  labels: string[];
  /** Longer labels for the tooltip header; falls back to `labels`. */
  tooltipLabels?: string[];
  /** Lines: a label, a color and one value per label. */
  series: KpiSeries[];
  /** Formats axis, tooltip and delta values (default: compact, Persian digits). */
  format?: (n: number) => string;
  /** Line under the chart. */
  footer?: string;
  /** Point that stays highlighted while nobody hovers. */
  defaultIndex?: number;
  /** Quiet text in the plot when there are no values, or only zeros. */
  emptyText?: string;
  /** Points from this index on are drawn dashed and faded (data not complete yet). */
  freshFrom?: number;
  /** Tooltip line for a point at or after `freshFrom`. */
  freshText?: string;
  /** Tooltip value for a `null` point. */
  unknownText?: string;
  /** Small markers on the axis, with a label in the tooltip. */
  marks?: KpiMark[];
  className?: string;
};

/* ---------- geometry (css px, taken from the demo) ---------- */

const PLOT_TOP = 8;      // room above the top grid line
const PLOT_H = 124;      // top grid line to the zero line
const SVG_H = PLOT_TOP + PLOT_H + 4;
const AXIS_H = 20;
const BLOCK_H = SVG_H + AXIS_H;
const GAP = 14;          // guide to tooltip
const FALLBACK = ['#2f6bff', '#ec4899', '#8b5cf6', '#14b8a6', '#a3a3a3'];

const defaultFormat = (n: number): string =>
  new Intl.NumberFormat('fa-IR', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const STEPS = [1, 1.2, 1.5, 2, 2.4, 3, 4, 5, 6, 8, 10];
function niceMax(v: number): number {
  if (!(v > 0)) return 1;
  const mag = 10 ** Math.floor(Math.log10(v));
  for (const s of STEPS) if (s * mag >= v * 0.9999) return s * mag;
  return 10 * mag;
}

const safeId = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '');

/* ---------- component ---------- */

export function KpiChart({
  title, value, delta, labels, tooltipLabels, series, format = defaultFormat,
  footer, defaultIndex, emptyText = 'هنوز داده‌ای نیست', freshFrom, freshText = 'هنوز کامل نیست', unknownText = 'نامعلوم', marks, className,
}: KpiChartProps) {
  const uid = safeId(useId());
  const plotRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(388);
  const [rtl, setRtl] = useState(true);
  const [tipW, setTipW] = useState(160);
  const [hover, setHover] = useState<number | null>(null);
  const [kb, setKb] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [shown, setShown] = useState(0); // where the guide, dots and tooltip are parked (they glide from here)
  const touchRef = useRef(false);

  const n = labels.length;
  const lines = useMemo(() => series.map((s, i) => ({
    ...s, color: s.color || FALLBACK[i % FALLBACK.length],
    values: Array.from({ length: n }, (_, k): number | null => (s.values[k] === null ? null : Number.isFinite(s.values[k]) ? (s.values[k] as number) : 0)),
  })), [series, n]);

  const all = lines.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const percent = /[%٪]/.test(format(0));
  const empty = n === 0 || lines.length === 0 || all.length === 0 || (!percent && all.every((v) => v === 0));

  /* scale */
  const { min, max } = useMemo(() => {
    if (empty) return { min: 0, max: 1 };
    const hi = Math.max(0, ...all);
    const lo = Math.min(0, ...all);
    return { min: lo < 0 ? -niceMax(-lo) : 0, max: hi > 0 ? niceMax(hi) : lo < 0 ? 0 : 1 };
  }, [all, empty]);
  const ticks = [max, (max + min) / 2, min];

  /* size + direction */
  useLayoutEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const measure = () => {
      setW(el.clientWidth || 388);
      setRtl(getComputedStyle(el).direction === 'rtl');
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tickTexts = ticks.map((t) => format(t));
  // whole-number series (counts) with a small top: «۰٫۵» in the middle reads wrong, so the middle label is left out
  const halfTick = !Number.isInteger(ticks[1]) && all.every((v) => Number.isInteger(v));
  const gutter = empty ? 30 : Math.min(84, Math.max(30, Math.max(...tickTexts.map((t) => t.length)) * 6.6 + 12));
  const plotL = rtl ? 0 : gutter;
  const plotR = rtl ? W - gutter : W;
  const plotW = Math.max(1, plotR - plotL);
  const xAt = useCallback((i: number) => {
    if (n <= 1) return (plotL + plotR) / 2;
    const f = i / (n - 1);
    return rtl ? plotR - f * plotW : plotL + f * plotW;
  }, [n, plotL, plotR, plotW, rtl]);
  const yAt = (v: number) => PLOT_TOP + PLOT_H * (1 - (v - min) / (max - min || 1));

  /* active point: pointer, else keyboard, else the default one (Esc hides all of them) */
  const dflt = defaultIndex != null && n > 0 ? Math.min(n - 1, Math.max(0, Math.round(defaultIndex))) : null;
  const active = hover ?? kb ?? (dismissed ? null : dflt);
  const act = active != null && active < n && !empty ? active : null;
  useEffect(() => { if (act != null) setShown(act); }, [act]);
  const at = Math.min(shown, Math.max(0, n - 1));

  /* tooltip width (content changes with the point) */
  useLayoutEffect(() => {
    const w = tipRef.current?.offsetWidth;
    if (w && Math.abs(w - tipW) > 0.5) setTipW(w);
  });

  /* touch: a tap outside lets the tooltip go */
  useEffect(() => {
    if (hover == null || !touchRef.current) return;
    const off = (e: PointerEvent) => {
      if (!plotRef.current?.contains(e.target as Node)) { setHover(null); touchRef.current = false; }
    };
    document.addEventListener('pointerdown', off);
    return () => document.removeEventListener('pointerdown', off);
  }, [hover]);

  const indexAt = (clientX: number): number => {
    const r = plotRef.current!.getBoundingClientRect();
    const x = clientX - r.left;
    if (n <= 1) return 0;
    const f = (rtl ? plotR - x : x - plotL) / plotW;
    return Math.min(n - 1, Math.max(0, Math.round(f * (n - 1))));
  };

  const onPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (empty) return;
    touchRef.current = e.pointerType === 'touch';
    setDismissed(false);
    setHover(indexAt(e.clientX));
  };
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    onPointer(e);
    if (e.pointerType === 'touch') { try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ } }
  };
  const onLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch') setHover(null);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (empty) return;
    const cur = kb ?? (act ?? dflt ?? n - 1);
    let next: number | null = null;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const phys = e.key === 'ArrowRight' ? 1 : -1; // visual direction
      next = cur + (rtl ? -phys : phys);
    } else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else if (e.key === 'Escape') {
      setKb(null); setHover(null); setDismissed(true);
      return;
    } else return;
    e.preventDefault();
    setDismissed(false);
    setHover(null);
    setKb(Math.min(n - 1, Math.max(0, next)));
  };
  const onFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (empty || hover != null) return;
    let vis = true;
    try { vis = e.currentTarget.matches(':focus-visible'); } catch { /* old engines */ }
    if (vis) { setDismissed(false); setKb(dflt ?? n - 1); }
  };

  /* tooltip position (physical px from the plot's left edge) */
  const gx = xAt(at);
  const prefer: 'start' | 'end' = rtl ? 'start' : 'end'; // start = toward the left in rtl
  let tx = prefer === 'end' ? gx + GAP : gx - GAP - tipW;
  if (prefer === 'end' && tx + tipW > W + 8) tx = gx - GAP - tipW;
  else if (prefer === 'start' && tx < -8) tx = gx + GAP;
  tx = Math.max(-8, Math.min(W + 8 - tipW, tx));

  const head = (tooltipLabels?.[at] ?? labels[at] ?? '');
  const sorted = lines
    .map((s, i) => ({ s, i, v: s.values[at] ?? null }))
    .sort((a, b) => (b.v ?? -Infinity) - (a.v ?? -Infinity) || a.i - b.i);

  /* axis labels: first, middle, last */
  const axis: { i: number; mode: 'first' | 'mid' | 'last' }[] = [];
  if (n >= 1) axis.push({ i: 0, mode: n === 1 ? 'mid' : 'first' });
  if (n >= 3) axis.push({ i: Math.floor((n - 1) / 2), mode: 'mid' });
  if (n >= 2) axis.push({ i: n - 1, mode: 'last' });

  const axisStyle = (i: number, mode: 'first' | 'mid' | 'last'): CSSProperties => {
    const x = xAt(i);
    const atRight = (mode === 'first') === rtl; // does the label hang from its point toward the left?
    if (mode === 'mid') return { left: x, transform: 'translateX(-50%)', maxInlineSize: plotW / 3 };
    return atRight
      ? { right: W - x, maxInlineSize: plotW / 2.4 }
      : { left: x, maxInlineSize: plotW / 2.4 };
  };

  /* a null breaks the line; a point with no neighbours is drawn as a dot; the part from `freshFrom` on is a second, dashed path */
  const fAt = freshFrom != null && freshFrom >= 0 && freshFrom < n ? Math.floor(freshFrom) : null;
  const freshAt = (i: number) => fAt != null && i >= fAt;
  const paths = lines.map((s) => {
    const seg = (from: number, to: number) => {
      let d = ''; let prev = false;
      for (let i = from; i < to; i++) {
        const v = s.values[i];
        if (v === null) { prev = false; continue; }
        d += `${prev ? 'L' : 'M'}${xAt(i).toFixed(2)} ${yAt(v).toFixed(2)}`;
        prev = true;
      }
      return d;
    };
    const solid = seg(0, fAt ?? n);
    // the dashed part starts one point earlier so it joins the solid line
    const fresh = fAt == null ? '' : seg(Math.max(0, fAt - (s.values[fAt - 1] === null ? 0 : 1)), n);
    const lone: number[] = [];
    for (let i = 0; i < n; i++) {
      if (s.values[i] === null) continue;
      if ((i === 0 || s.values[i - 1] === null) && (i === n - 1 || s.values[i + 1] === null)) lone.push(i);
    }
    return { solid: solid.includes('L') ? solid : '', fresh: fresh.includes('L') ? fresh : '', lone };
  });
  const markIdx = Array.from(new Set((marks ?? []).map((m) => m.index).filter((i) => Number.isInteger(i) && i >= 0 && i < n)));
  const markLabels = (marks ?? []).filter((m) => m.index === at).map((m) => m.label);
  const sig = `${n}|${fAt ?? ''}|${lines.map((s) => s.values.join(',')).join(';')}`;

  const tone = delta == null ? null : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const sign = delta == null || delta === 0 ? '' : delta > 0 ? '+' : '−';
  const summary = [title, value].filter(Boolean).join(': ');
  const open = act != null;

  return (
    <div className={`kpi${className ? ` ${className}` : ''}`}>
      <div className="kpi-body">
        {title != null && <p className="kpi-title">{title}</p>}
        {(value != null || tone) && (
          <div className="kpi-head">
            {value != null && <span className="kpi-value">{value}</span>}
            {tone && delta != null && (
              <span className="kpi-delta" data-tone={tone}>
                {sign && <span className="kpi-sign" aria-hidden="true">{sign}</span>}
                <span className="kpi-delta-n">{format(Math.abs(delta))}</span>
                <span className="kpi-sr">{delta > 0 ? 'افزایش' : delta < 0 ? 'کاهش' : 'بدون تغییر'}</span>
              </span>
            )}
          </div>
        )}

        <div
          ref={plotRef}
          className="kpi-plot"
          data-empty={empty || undefined}
          style={{ blockSize: BLOCK_H }}
          tabIndex={empty ? -1 : 0}
          role="group"
          aria-roledescription="نمودار"
          aria-label={`${summary || 'نمودار شاخص'}. با کلیدهای چپ و راست بین نقطه‌ها بروید.`}
          onPointerEnter={onPointer}
          onPointerMove={onPointer}
          onPointerDown={onDown}
          onPointerLeave={onLeave}
          onKeyDown={onKey}
          onFocus={onFocus}
          onBlur={() => setKb(null)}
        >
          <svg className="kpi-svg" width={W} height={SVG_H} viewBox={`0 0 ${W} ${SVG_H}`} aria-hidden="true">
            <defs>
              <clipPath id={`kc${uid}`}>
                <rect
                  key={sig}
                  className="kpi-reveal"
                  x={plotL - 4} y={0} width={plotW + 8} height={SVG_H}
                  style={{ transformOrigin: rtl ? 'right' : 'left' } as CSSProperties}
                />
              </clipPath>
            </defs>
            {ticks.map((t, k) => (
              <line key={k} className="kpi-grid" x1={plotL} x2={plotR} y1={yAt(t)} y2={yAt(t)} />
            ))}
            {!empty && (
              <g clipPath={`url(#kc${uid})`}>
                {lines.map((s, k) => (
                  n === 1
                    ? (s.values[0] === null ? null : <circle key={k} cx={xAt(0)} cy={yAt(s.values[0])} r={3} fill={s.color} />)
                    : (
                      <g key={k}>
                        {paths[k].solid && <path className="kpi-line" d={paths[k].solid} stroke={s.color} />}
                        {paths[k].fresh && <path className="kpi-line kpi-line-fresh" d={paths[k].fresh} stroke={s.color} />}
                        {paths[k].lone.map((i) => (
                          <circle key={i} cx={xAt(i)} cy={yAt(s.values[i] as number)} r={2.5} fill={s.color} opacity={freshAt(i) ? 0.5 : 1} />
                        ))}
                      </g>
                    )
                ))}
              </g>
            )}
            {!empty && markIdx.map((i) => (
              <path
                key={`m${i}`} className="kpi-mark" aria-hidden="true"
                d={`M${xAt(i).toFixed(2)} ${(yAt(min) - 3.5).toFixed(2)} l3.5 3.5 l-3.5 3.5 l-3.5 -3.5 z`}
              />
            ))}
            {!empty && (
              <g className="kpi-cursor" data-open={open || undefined} style={{ transform: `translateX(${gx}px)` }}>
                <rect className="kpi-guide" x={-0.5} y={PLOT_TOP - 4} width={1} height={PLOT_H + 4} />
                {lines.map((s, k) => (
                  <circle
                    key={k} className="kpi-dot" r={4.5} fill={s.color}
                    style={{ transform: `translateY(${yAt(s.values[at] ?? 0)}px)`, opacity: s.values[at] === null ? 0 : undefined }}
                  />
                ))}
              </g>
            )}
          </svg>

          {ticks.map((t, k) => (
            <span key={k} className="kpi-ytick" style={{ top: yAt(t) - 8, inlineSize: gutter - 6 }} aria-hidden="true">
              {(empty || halfTick) && k === 1 ? '' : tickTexts[k]}
            </span>
          ))}
          {axis.map(({ i, mode }) => (
            <span key={`${mode}${i}`} className="kpi-xtick" style={{ top: SVG_H, ...axisStyle(i, mode) }} aria-hidden="true">
              {labels[i]}
            </span>
          ))}

          {empty && <p className="kpi-empty">{emptyText}</p>}

          {!empty && (
            <div
              ref={tipRef}
              className="kpi-tip"
              data-open={open || undefined}
              style={{ transform: `translateX(${tx}px)`, maxInlineSize: Math.min(W + 16, 300) }}
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="kpi-tip-head">{head}</p>
              <ul className="kpi-tip-rows">
                {sorted.map(({ s, i, v }) => (
                  <li key={i} className="kpi-tip-row">
                    <i className="kpi-sw" style={{ background: s.color }} aria-hidden="true" />
                    <span className="kpi-tip-k">{s.label}</span>
                    <span className="kpi-tip-v">{v === null ? unknownText : format(v)}</span>
                  </li>
                ))}
              </ul>
              {freshAt(at) && <p className="kpi-tip-note">{freshText}</p>}
              {markLabels.map((l, i) => <p key={i} className="kpi-tip-note kpi-tip-mark"><i aria-hidden="true" />{l}</p>)}
            </div>
          )}
        </div>
      </div>
      {footer != null && <p className="kpi-foot">{footer}</p>}
    </div>
  );
}
