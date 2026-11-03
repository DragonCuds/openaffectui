import { useState } from 'react';
import { faNum } from './digits';

export type BreakdownPart = { id: string; label: string; value: number };

/** Five looks, each a colour plus a different shape; more than five parts reuse them in order. */
const LOOKS = 5;

function Marker({ k }: { k: number }) {
  return (
    <svg className="bkd-mark" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" focusable="false">
      {k === 0 ? <circle cx="5" cy="5" r="4.5" /> : null}
      {k === 1 ? <rect x="0.5" y="0.5" width="9" height="9" rx="1.5" /> : null}
      {k === 2 ? <path d="M5 0.5 L9.5 9.5 H0.5 Z" /> : null}
      {k === 3 ? <path d="M5 0 L10 5 L5 10 L0 5 Z" /> : null}
      {k === 4 ? <path d="M3.5 0.5h3v3h3v3h-3v3h-3v-3h-3v-3h3z" /> : null}
    </svg>
  );
}

/** One total split into a few parts: a segmented bar plus a legend; hover or focus on either side lights up the other. */
export function CompactBreakdown({ title, parts, unit }: { title: string; parts: BreakdownPart[]; unit?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const clean = parts.map((p) => ({ ...p, value: Number.isFinite(p.value) ? Math.max(0, p.value) : 0 }));
  const total = clean.reduce((s, p) => s + p.value, 0);
  const suffix = unit ? ` ${unit}` : '';

  if (!(total > 0)) {
    return (
      <div className="bkd">
        <p className="bkd-title">{title}</p>
        <p className="bkd-empty">هنوز چیزی برای نمایش نیست.</p>
      </div>
    );
  }

  const pctOf = (v: number) => (v / total) * 100;
  const pctText = (v: number) => {
    const r = Math.round(pctOf(v));
    return v > 0 && r === 0 ? 'کمتر از ۱٪' : `${faNum(r)}٪`;
  };

  return (
    <div className={`bkd${active ? ' bkd-has-active' : ''}`}>
      <div className="bkd-head">
        <p className="bkd-title">{title}</p>
        <p className="bkd-total"><span className="bkd-total-label">جمع</span> <span className="bkd-total-value">{faNum(total)}</span>{unit ? <span className="bkd-total-unit"> {unit}</span> : null}</p>
      </div>

      <div className="bkd-bar" aria-hidden="true">
        {clean.map((p, i) => p.value > 0 ? (
          <span
            key={p.id}
            className={`bkd-seg bkd-look-${i % LOOKS}${active === p.id ? ' is-active' : ''}`}
            style={{ flexGrow: p.value }}
            onMouseEnter={() => setActive(p.id)}
            onMouseLeave={() => setActive(null)}
          />
        ) : null)}
      </div>

      <ul className="bkd-legend">
        {clean.map((p, i) => (
          <li
            key={p.id}
            className={`bkd-row bkd-look-${i % LOOKS}${active === p.id ? ' is-active' : ''}`}
            tabIndex={0}
            onMouseEnter={() => setActive(p.id)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(p.id)}
            onBlur={() => setActive(null)}
          >
            <span className="bkd-key"><Marker k={i % LOOKS} /></span>
            <span className="bkd-label">{p.label}</span>
            <span className="bkd-value">{faNum(p.value)}{suffix}</span>
            <span className="bkd-pct">{pctText(p.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
