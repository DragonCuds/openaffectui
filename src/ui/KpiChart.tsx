import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { RollingNumber } from './RollingNumber';
import { faNum } from './digits';

export type KpiPoint = { label: string; value: number };

const W = 600;
const H = 220;
const PAD_X = 18;
const PAD_T = 20;
const PAD_B = 16;

/** A small hand-drawn chart for one number over time. Reads right to left (first point on the right); pointer or arrow keys show each value. */
export function KpiChart({ title, points, unit, kind = 'area' }: {
  title: string;
  points: KpiPoint[];
  unit?: string;
  kind?: 'line' | 'area';
}) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const n = points.length;
  const suffix = unit ? ` ${unit}` : '';

  if (n === 0) {
    return (
      <div className="kpi">
        <p className="kpi-title">{title}</p>
        <p className="kpi-empty">هنوز داده‌ای برای نمایش نیست.</p>
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo;
  const yMin = span === 0 ? lo - 1 : lo - span * 0.12;
  const yMax = span === 0 ? hi + 1 : hi + span * 0.12;
  const x = (i: number) => (n === 1 ? W / 2 : W - PAD_X - (i / (n - 1)) * (W - 2 * PAD_X));
  const y = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);

  const first = points[0];
  const last = points[n - 1];
  const delta = Math.round((last.value - first.value) * 10000) / 10000;
  const dir: 'up' | 'down' | 'flat' = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const Icon = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : Minus;
  const sign = dir === 'up' ? '+' : dir === 'down' ? '−' : '';
  const pct = first.value !== 0 ? Math.round((Math.abs(delta) / Math.abs(first.value)) * 100) : null;
  const word = dir === 'up' ? 'بیشتر شده' : dir === 'down' ? 'کمتر شده' : 'بدون تغییر';

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(n - 1).toFixed(1)} ${H - PAD_B} L${x(0).toFixed(1)} ${H - PAD_B} Z`;

  const shown = active !== null && active < n ? active : null;
  const ap = shown !== null ? points[shown] : null;
  const tipPos = shown !== null ? Math.min(86, Math.max(14, ((W - x(shown)) / W) * 100)) : 0;

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const el = plotRef.current;
    if (!el || n < 2) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0) return;
    const fromRight = ((r.right - e.clientX) / r.width) * W; // viewBox units from the right edge
    const t = (fromRight - PAD_X) / (W - 2 * PAD_X);
    setActive(Math.min(n - 1, Math.max(0, Math.round(t * (n - 1)))));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const cur = shown ?? (n - 1);
    let next: number | null = null;
    // RTL: the first point sits on the right, so ArrowLeft goes forward in time
    if (e.key === 'ArrowLeft') next = Math.min(n - 1, cur + 1);
    else if (e.key === 'ArrowRight') next = Math.max(0, cur - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else if (e.key === 'Escape') { setActive(null); return; }
    if (next === null) return;
    e.preventDefault();
    setActive(next);
  };

  return (
    <div className="kpi" dir="rtl">
      <div className="kpi-head">
        <p className="kpi-title">{title}</p>
      </div>
      <div className="kpi-headline">
        <span className="kpi-big"><RollingNumber value={last.value} /></span>
        {unit ? <span className="kpi-unit">{unit}</span> : null}
      </div>
      {n > 1 ? (
        <p className={`kpi-change kpi-change-${dir}`}>
          <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
          {dir !== 'flat' ? <bdi className="kpi-amount">{sign}{faNum(Math.abs(delta))}</bdi> : null}
          {dir !== 'flat' && unit ? <span>{unit}</span> : null}
          {pct !== null && dir !== 'flat' ? <span>({faNum(pct)}٪)</span> : null}
          <span>{word} نسبت به «{first.label}»</span>
        </p>
      ) : (
        <p className="kpi-change kpi-change-flat">فقط یک نقطه داده داریم؛ با داده‌ی بیشتر روند دیده می‌شود.</p>
      )}

      <div
        className="kpi-plot"
        ref={plotRef}
        tabIndex={0}
        role="group"
        aria-roledescription="نمودار"
        aria-label={`${title}. با کلیدهای چپ و راست میان نقطه‌ها حرکت کنید.`}
        onPointerMove={fromPointer}
        onPointerDown={fromPointer}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKey}
        onFocus={(e) => { if (e.currentTarget === e.target && shown === null) setActive(n - 1); }}
        onBlur={() => setActive(null)}
      >
        <svg className={`kpi-svg kpi-${kind}`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          {[0, 1, 2, 3].map((b) => {
            const bh = (H - PAD_T - PAD_B) / 4;
            return b % 2 === 0 ? <rect key={b} className="kpi-band" x={0} y={PAD_T + b * bh} width={W} height={bh} /> : null;
          })}
          {shown !== null && n > 1 ? <rect className="kpi-hit" x={x(shown) - 14} y={0} width={28} height={H} rx={10} /> : null}
          {n > 1 && kind === 'area' ? <path className="kpi-area" d={area} /> : null}
          {n > 1 ? <path className="kpi-line" d={line} pathLength={1} /> : null}
          {shown !== null ? (
            <>
              <circle className="kpi-halo" cx={x(shown)} cy={y(points[shown].value)} r={9} />
              <circle className="kpi-dot" cx={x(shown)} cy={y(points[shown].value)} r={4.5} />
            </>
          ) : (
            <circle className="kpi-dot" cx={x(n - 1)} cy={y(last.value)} r={4.5} />
          )}
        </svg>
        {ap ? (
          <div className="kpi-tip" style={{ insetInlineStart: `${tipPos}%` }} aria-hidden="true">
            <span className="kpi-tip-label">{ap.label}</span>
            <span className="kpi-tip-value">{faNum(ap.value)}{suffix}</span>
          </div>
        ) : null}
      </div>

      {n > 1 ? (
        <div className="kpi-axis" aria-hidden="true">
          <span>{first.label}</span>
          <span>{last.label}</span>
        </div>
      ) : (
        <p className="kpi-axis kpi-axis-one" aria-hidden="true">{first.label}</p>
      )}
      {n > 1 ? (
        <p className="kpi-range">کمترین {faNum(lo)}{suffix} · بیشترین {faNum(hi)}{suffix}</p>
      ) : null}

      <p className="kpi-sr" role="status" aria-live="polite">{ap ? `${ap.label}: ${faNum(ap.value)}${suffix}` : ''}</p>
      <table className="kpi-sr">
        <caption>{title}</caption>
        <thead><tr><th scope="col">بازه</th><th scope="col">مقدار{unit ? ` (${unit})` : ''}</th></tr></thead>
        <tbody>
          {points.map((p, i) => (
            <tr key={i}><th scope="row">{p.label}</th><td>{faNum(p.value)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
