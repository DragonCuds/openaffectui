import { useId } from 'react';
import { cx } from './yv';

/**
 * Tiny trend drawing without axes: a smooth line with a soft fade under it, or rounded bars. The first value sits at the start side
 * (right when `rtl`, the default), the newest at the other end, like the day chart. `endDot` marks the newest point.
 * Colour is the current text colour unless `color` is given (a tile or card with data-area sets it for you).
 */
export function Sparkline({ values, style = 'line', color, strokeWidth = 2, endDot = false, fill = true, rtl = true, label, className }: {
  values: number[];
  style?: 'line' | 'bars';
  color?: string;
  strokeWidth?: number;
  endDot?: boolean;
  fill?: boolean;
  rtl?: boolean;
  /** Accessible description; the drawing is hidden from screen readers without it. */
  label?: string;
  className?: string;
}) {
  const gid = `yvsp${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const W = 88;
  const H = 28;
  const n = values.length;
  if (n === 0) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const norm = (v: number) => (hi - lo < 1e-6 ? 0.5 : (v - lo) / (hi - lo));
  const svgProps = {
    className: cx('yv-spark', className), viewBox: `0 0 ${W} ${H}`, style: color ? { color } : undefined,
    ...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const }),
  };

  if (style === 'bars') {
    const bw = W / (n * 1.6 - 0.6);
    const gap = bw * 0.6;
    return (
      <svg {...svgProps}>
        {values.map((v, i) => {
          const nv = norm(v);
          const bh = H * (0.35 + 0.65 * nv);
          const x0 = i * (bw + gap);
          const x = rtl ? W - x0 - bw : x0;
          return <rect key={i} x={x} y={H - bh} width={bw} height={bh} rx={bw / 2} fill="currentColor" opacity={0.4 + 0.6 * nv} />;
        })}
      </svg>
    );
  }
  if (n < 2) return null;

  const pad = 4;
  const px = (i: number) => {
    const x = pad + (i / (n - 1)) * (W - 2 * pad);
    return rtl ? W - x : x;
  };
  const py = (v: number) => pad + (1 - norm(v)) * (H - 2 * pad);
  let d = `M${px(0).toFixed(2)},${py(values[0]).toFixed(2)}`;
  for (let i = 1; i < n; i++) {
    const x0 = px(i - 1);
    const x1 = px(i);
    const mid = (x0 + x1) / 2;
    d += ` C${mid.toFixed(2)},${py(values[i - 1]).toFixed(2)} ${mid.toFixed(2)},${py(values[i]).toFixed(2)} ${x1.toFixed(2)},${py(values[i]).toFixed(2)}`;
  }
  const area = `${d} L${px(n - 1).toFixed(2)},${H} L${px(0).toFixed(2)},${H} Z`;
  const ex = px(n - 1);
  const ey = py(values[n - 1]);
  return (
    <svg {...svgProps}>
      {fill ? (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gid})`} />
        </>
      ) : null}
      <path d={d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {endDot ? (
        <>
          <circle cx={ex} cy={ey} r={5} fill="currentColor" opacity={0.18} />
          <circle cx={ex} cy={ey} r={2.6} fill="currentColor" />
        </>
      ) : null}
    </svg>
  );
}
