/*
 * Usage Meter. Written from scratch to match the look and motion of the public affectUI "Usage Meter" demo
 * (https://www.affectui.com/components/usage-meter). No vendor code was used: sizes, colours and timings
 * were read from the public demo like a user would (screenshots / frames) and the API follows its public docs.
 */
import {
  useEffect, useId, useLayoutEffect, useRef, useState,
  type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent,
} from 'react';

export type UsagePart = { label: string; value: number; color?: string };
export type UsageLimit = { label: string; used: number; total?: number | null; unit?: string; decimals?: number };
export type UsageDay = { label: string; value: number | null };
export type UsagePeriod = { id: string; label: string };
export type UsageState = 'ok' | 'warn' | 'limit';

export type UsageMeterProps = {
  /** Credits included in the plan: the full width of the bar. */
  total?: number;
  /** What the credits went into in the shown period. */
  used?: UsagePart[];
  /** Thin meters below (seats, storage...). No total (or null) = unlimited. */
  limits?: UsageLimit[];
  /** Options of the period switch; no switch when left out. */
  periods?: UsagePeriod[];
  period?: string;
  defaultPeriod?: string;
  onPeriodChange?: (id: string) => void;
  /** When the credits reset; shown as "N days left", the date as a tooltip. */
  resetAt?: Date | string | number;
  /** Usage per day; null = a day still to come (flat stub). */
  daily?: UsageDay[];
  onUpgrade?: (state: UsageState) => void;
  title?: string;
  plan?: string;
  unit?: string;
  /** Share (0-1) from which the meter and the limits warn. */
  warnAt?: number;
  upgradeLabel?: string;
  topUpLabel?: string;
  className?: string;
  /** Clock override (tests/demos): used to count the days to `resetAt`. */
  now?: number;
};

/* ---------- small helpers ---------- */

const fmt = (n: number, d = 0, min = d): string =>
  n.toLocaleString('fa-IR', { minimumFractionDigits: min, maximumFractionDigits: d });

const DURATION = 720; // numbers and widths share this one loop (estimated from frames)
const FOLD_MS = 420;
const DAY_MS = 86_400_000;

function useReducedMotion(): boolean {
  const [r, setR] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setR(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return r;
}

/** One frame loop for every number and width: values glide from where they are to the new targets. */
function useTween(target: Record<string, number>, ms: number, reduce: boolean): Record<string, number> {
  const sig = Object.entries(target).map(([k, v]) => `${k}:${v}`).join('|');
  const [cur, setCur] = useState<Record<string, number>>(() => (reduce ? target : {}));
  const curRef = useRef(cur);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    const to = targetRef.current;
    const from = curRef.current;
    if (reduce) { curRef.current = to; setCur(to); return; }
    const keys = new Set([...Object.keys(from), ...Object.keys(to)]);
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = 1 - (1 - k) ** 3;
      const next: Record<string, number> = {};
      keys.forEach((key) => {
        const a = from[key] ?? 0;
        const b = to[key] ?? 0;
        next[key] = k >= 1 ? b : a + (b - a) * e;
      });
      curRef.current = next;
      setCur(next);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [sig, ms, reduce]);

  return cur;
}

type Row = { label: string; color?: string; open: boolean; fresh?: boolean };

/** Keeps rows that dropped out (they fold away) and inserts new ones next to their neighbour. */
function mergeRows(prev: Row[], parts: UsagePart[]): Row[] {
  const names = parts.map((p) => p.label);
  const next: Row[] = prev.map((r) => {
    const p = parts.find((x) => x.label === r.label);
    return { ...r, color: p ? p.color : r.color, open: !!p, fresh: p ? r.fresh : false };
  });
  let at = -1;
  names.forEach((l, k) => {
    const i = next.findIndex((r) => r.label === l);
    if (i >= 0) { at = i; return; }
    next.splice(at + 1, 0, { label: l, color: parts[k].color, open: false, fresh: true });
    at += 1;
  });
  return next;
}

/* ---------- period switch ---------- */

function PeriodSwitch({ periods, value, onChange, label }: {
  periods: UsagePeriod[]; value: string; onChange: (id: string) => void; label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  const idx = Math.max(0, periods.findIndex((p) => p.id === value));

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const place = () => {
      const b = refs.current[idx];
      if (!b) return;
      track.style.setProperty('--um-x', `${b.offsetLeft}px`);
      track.style.setProperty('--um-w', `${b.offsetWidth}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(track);
    return () => ro.disconnect();
  }, [idx, periods]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    let n = idx;
    if (e.key === fwd || e.key === 'ArrowDown') n = (idx + 1) % periods.length;
    else if (e.key === back || e.key === 'ArrowUp') n = (idx - 1 + periods.length) % periods.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = periods.length - 1;
    else return;
    e.preventDefault();
    e.stopPropagation();
    onChange(periods[n].id);
    refs.current[n]?.focus();
  };

  return (
    <div className="um-switch" role="radiogroup" aria-label={label} onKeyDown={onKey} ref={trackRef} data-ready={ready || undefined}>
      <span className="um-pill" aria-hidden="true" />
      {periods.map((p, i) => (
        <button
          key={p.id}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="radio"
          className="um-opt"
          aria-checked={p.id === value}
          tabIndex={i === idx ? 0 : -1}
          onClick={() => onChange(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- the button that speaks up ---------- */

function StateButton({ solid, label, onClick, reduce }: { solid: boolean; label: string; onClick: () => void; reduce: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const lastW = useRef<number | null>(null);
  const wasSolid = useRef(solid);

  // the width glides to the new label; the new label fades in once the width has mostly arrived
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.width = '';
    const w = el.getBoundingClientRect().width;
    const prev = lastW.current;
    lastW.current = w;
    if (prev === null || Math.abs(prev - w) < 0.5 || reduce) return;
    el.style.width = `${prev}px`;
    void el.offsetWidth;
    el.style.width = `${w}px`;
  }, [label, reduce]);

  // a gentle nudge when the button turns solid
  useEffect(() => {
    const el = ref.current;
    if (solid && !wasSolid.current && el && !reduce && typeof el.animate === 'function') {
      el.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.07)', offset: 0.45 }, { transform: 'scale(0.98)', offset: 0.75 }, { transform: 'scale(1)' }],
        { duration: 460, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 120 },
      );
    }
    wasSolid.current = solid;
  }, [solid, reduce]);

  return (
    <button
      ref={ref}
      type="button"
      className="um-btn"
      data-solid={solid || undefined}
      onClick={onClick}
      onTransitionEnd={(e) => { if (e.propertyName === 'width') e.currentTarget.style.width = ''; }}
    >
      <span key={label} className="um-btn-l">{label}</span>
    </button>
  );
}

/* ---------- main component ---------- */

export function UsageMeter({
  total: totalProp, used: usedProp, limits = [], periods, period, defaultPeriod, onPeriodChange, resetAt, daily, onUpgrade,
  title = 'مصرف', plan, unit = 'اعتبار', warnAt = 0.8, upgradeLabel = 'ارتقا', topUpLabel = 'افزودن اعتبار', className, now,
}: UsageMeterProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const rootRef = useRef<HTMLElement>(null);
  /* no credit total = only the thin meters (counters with their own limits) */
  const bare = totalProp === undefined;
  const total = totalProp ?? 0;
  const used = usedProp ?? [];

  /* period (controlled or not) */
  const [inner, setInner] = useState(defaultPeriod ?? periods?.[0]?.id ?? '');
  const activePeriod = period ?? inner;
  const pick = (id: string) => { if (period === undefined) setInner(id); onPeriodChange?.(id); };

  /* shades: each label keeps its own for good */
  const shades = useRef(new Map<string, number>());
  used.forEach((u) => { if (!shades.current.has(u.label)) shades.current.set(u.label, shades.current.size); });
  const colorOf = (label: string, color?: string) => color ?? `var(--um-c${(shades.current.get(label) ?? 0) % 7})`;

  /* rows (legend + segments): leaving rows stay until they have folded away */
  const [rows, setRows] = useState<Row[]>(() => used.map((u) => ({ label: u.label, color: u.color, open: true })));
  const usedKey = used.map((u) => u.label).join('\u0001');
  const firstRows = useRef(true);
  useEffect(() => {
    if (firstRows.current) { firstRows.current = false; return; }
    setRows((prev) => mergeRows(prev, used));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usedKey]);
  useEffect(() => {
    if (!rows.some((r) => r.fresh)) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => {
      setRows((prev) => prev.map((r) => (r.fresh ? { ...r, fresh: false, open: true } : r)));
    }));
    return () => cancelAnimationFrame(id);
  }, [rows]);
  useEffect(() => {
    if (!rows.some((r) => !r.open && !r.fresh)) return;
    const id = window.setTimeout(() => setRows((prev) => prev.filter((r) => r.open || r.fresh)), FOLD_MS + 160);
    return () => window.clearTimeout(id);
  }, [rows]);

  /* every animated number in one loop */
  const sumT = used.reduce((s, u) => s + Math.max(0, u.value), 0);
  const dayVals = (daily ?? []).filter((d) => d.value !== null).map((d) => d.value as number);
  const avgT = dayVals.length ? dayVals.reduce((a, b) => a + b, 0) / dayVals.length : 0;
  const targets: Record<string, number> = { avg: avgT };
  used.forEach((u) => { targets[`s:${u.label}`] = Math.max(0, u.value); });
  limits.forEach((l) => {
    targets[`l:${l.label}:u`] = l.used;
    if (l.total != null) targets[`l:${l.label}:t`] = l.total;
  });
  const cur = useTween(targets, DURATION, reduce);

  const segVal = (label: string) => cur[`s:${label}`] ?? 0;
  const sumC = rows.reduce((s, r) => s + segVal(r.label), 0);
  const scale = sumC > total && sumC > 0 ? total / sumC : 1;
  const safeTotal = total > 0 ? total : 1;

  /* states follow the target values, not the counting ones */
  const ratio = sumT / safeTotal;
  const state: UsageState = ratio >= 0.995 ? 'limit' : ratio >= warnAt ? 'warn' : 'ok';
  const remaining = Math.max(0, total - sumC);
  const pctC = Math.round(Math.min(1, sumC / safeTotal) * 100);

  /* hover / focus readouts */
  const [seg, setSeg] = useState<string | null>(null);
  const [dayIdx, setDayIdx] = useState<number | null>(null);
  const lastSeg = useRef<string | null>(null);
  if (seg) lastSeg.current = seg;
  const tipLabel = seg ?? lastSeg.current;
  const segEls = useRef(new Map<string, HTMLDivElement>());
  const barWrapRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [tipLeft, setTipLeft] = useState(0);

  useLayoutEffect(() => {
    if (!seg) return;
    const el = segEls.current.get(seg);
    const wrap = barWrapRef.current;
    const tip = tipRef.current;
    if (!el || !wrap || !tip) return;
    const a = el.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    const centre = a.left - w.left + a.width / 2;
    const tw = tip.offsetWidth;
    setTipLeft(Math.max(0, Math.min(w.width - tw, centre - tw / 2)));
  }, [seg, rows, cur]);

  useEffect(() => {
    if (seg === null && dayIdx === null) return;
    const away = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) { setSeg(null); setDayIdx(null); }
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [seg, dayIdx]);

  const enter = (label: string) => (e: ReactPointerEvent) => { if (e.pointerType === 'mouse') setSeg(label); };
  const leave = (e: ReactPointerEvent) => { if (e.pointerType === 'mouse') setSeg(null); };
  const tap = (label: string) => (e: ReactPointerEvent) => { if (e.pointerType !== 'mouse') setSeg((s) => (s === label ? null : label)); };

  const openRows = rows.filter((r) => r.open);
  const onBarKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { setSeg(null); return; }
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (e.key !== fwd && e.key !== back) return;
    e.preventDefault();
    if (!openRows.length) return;
    const i = openRows.findIndex((r) => r.label === seg);
    const n = i < 0 ? (e.key === fwd ? 0 : openRows.length - 1) : (i + (e.key === fwd ? 1 : -1) + openRows.length) % openRows.length;
    setSeg(openRows[n].label);
  };

  /* sparkline */
  const sparkRef = useRef<HTMLDivElement>(null);
  const dailyMax = Math.max(1, ...dayVals);
  const days = daily ?? [];
  const onSparkMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = sparkRef.current;
    if (!el || !days.length) return;
    const r = el.getBoundingClientRect();
    const rtl = getComputedStyle(el).direction === 'rtl';
    const x = rtl ? r.right - e.clientX : e.clientX - r.left;
    const i = Math.min(days.length - 1, Math.max(0, Math.floor((x / r.width) * days.length)));
    if (days[i].value === null) { setDayIdx(null); return; }
    setDayIdx(i);
  };
  const onSparkKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { setDayIdx(null); return; }
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (e.key !== fwd && e.key !== back) return;
    e.preventDefault();
    const filled = days.map((d, i) => (d.value === null ? -1 : i)).filter((i) => i >= 0);
    if (!filled.length) return;
    const at = dayIdx === null ? -1 : filled.indexOf(dayIdx);
    const n = at < 0 ? (e.key === fwd ? 0 : filled.length - 1) : (at + (e.key === fwd ? 1 : -1) + filled.length) % filled.length;
    setDayIdx(filled[n]);
  };
  const shownDay = dayIdx !== null && days[dayIdx] && days[dayIdx].value !== null ? days[dayIdx] : null;

  /* reset text */
  let resetText = '';
  let resetTitle: string | undefined;
  if (resetAt !== undefined) {
    const at = new Date(resetAt).getTime();
    if (!Number.isNaN(at)) {
      const left = Math.ceil((at - (now ?? Date.now())) / DAY_MS);
      resetText = left <= 0 ? 'امروز بازنشانی می‌شود' : left === 1 ? 'فردا بازنشانی می‌شود' : `${fmt(left)} روز تا بازنشانی`;
      resetTitle = new Date(at).toLocaleDateString('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }

  /* footer */
  const statusText = state === 'limit'
    ? 'اعتبار تمام شد'
    : state === 'warn' ? `رو به اتمام · ${fmt(Math.round(remaining))} ${unit} مانده` : `${fmt(Math.round(remaining))} ${unit} مانده`;
  const solid = state !== 'ok';
  const tipRow = tipLabel ? rows.find((r) => r.label === tipLabel) : undefined;
  const tipVal = tipRow ? segVal(tipRow.label) : 0;
  const tipPct = sumC > 0 ? Math.round((tipVal / sumC) * 100) : 0;
  const titleId = `${uid}-t`;

  return (
    <section
      ref={rootRef}
      className={`um${className ? ` ${className}` : ''}`}
      data-state={state}
      data-bare={bare || undefined}
      aria-labelledby={titleId}
      onKeyDown={(e) => { if (e.key === 'Escape') { setSeg(null); setDayIdx(null); } }}
    >
      <div className="um-head">
        <div className="um-id">
          <h3 className="um-title" id={titleId}>{title}</h3>
          {plan || resetText ? (
            <p className="um-sub">
              {plan ? <span>{plan}</span> : null}
              {plan && resetText ? <span className="um-sep" aria-hidden="true">·</span> : null}
              {resetText ? <span title={resetTitle}>{resetText}</span> : null}
            </p>
          ) : null}
        </div>
        {periods && periods.length > 0 ? (
          <PeriodSwitch periods={periods} value={activePeriod} onChange={pick} label="بازه‌ی زمانی" />
        ) : null}
      </div>

      {bare ? null : <div className="um-main">
        <div className="um-total">
          <span className="um-num">{fmt(Math.round(sumC))}</span>
          <span className="um-of">از {fmt(total)} {unit}</span>
          <span className="um-chip" data-state={state}>
            <i className="um-dot" aria-hidden="true" />
            {fmt(pctC)}٪
          </span>
        </div>

        <div className="um-barwrap" ref={barWrapRef}>
          <div
            className="um-bar"
            role="meter"
            tabIndex={0}
            aria-label={`مصرف ${title}`}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={Math.min(sumT, total)}
            aria-valuetext={`${fmt(sumT)} از ${fmt(total)} ${unit}`}
            data-dim={seg !== null || undefined}
            onKeyDown={onBarKey}
            onBlur={() => setSeg(null)}
          >
            {rows.map((r) => (
              <div
                key={r.label}
                className="um-seg"
                data-on={seg === r.label || undefined}
                ref={(el) => { if (el) segEls.current.set(r.label, el); else segEls.current.delete(r.label); }}
                style={{ width: `${(segVal(r.label) * scale / safeTotal) * 100}%`, '--c': colorOf(r.label, r.color) } as CSSProperties}
                onPointerEnter={enter(r.label)}
                onPointerLeave={leave}
                onPointerDown={tap(r.label)}
              >
                <i />
              </div>
            ))}
          </div>
          <div
            className="um-tip"
            ref={tipRef}
            data-open={(seg !== null && !!tipRow) || undefined}
            style={{ left: tipLeft }}
            aria-live="polite"
          >
            {tipRow ? (
              <>
                <span className="um-tip-k"><i className="um-sw" style={{ '--c': colorOf(tipRow.label, tipRow.color) } as CSSProperties} />{tipRow.label}</span>
                <span className="um-tip-v"><b>{fmt(Math.round(tipVal))} {unit}</b><span> · {fmt(tipPct)}٪</span></span>
              </>
            ) : null}
          </div>
        </div>

        <ul className="um-legend" data-dim={seg !== null || undefined}>
          {rows.map((r) => {
            const v = segVal(r.label);
            return (
              <li
                key={r.label}
                className="um-row"
                data-open={r.open || undefined}
                data-on={seg === r.label || undefined}
                onPointerEnter={enter(r.label)}
                onPointerLeave={leave}
                onPointerDown={tap(r.label)}
              >
                <div className="um-row-in">
                  <div className="um-row-c">
                    <i className="um-sw" style={{ '--c': colorOf(r.label, r.color) } as CSSProperties} />
                    <span className="um-row-l">{r.label}</span>
                    <span className="um-row-v">{fmt(Math.round(v))}</span>
                    <span className="um-row-p">{fmt(sumC > 0 ? Math.round((v / sumC) * 100) : 0)}٪</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {days.length > 0 ? (
          <div className="um-daily">
            <div className="um-dhead">
              <span className="um-dlabel">مصرف روزانه</span>
              <span className="um-davg" aria-live="polite">
                {shownDay ? (
                  <><span>{shownDay.label} · </span><b>{fmt(shownDay.value as number)} {unit}</b></>
                ) : (
                  <>میانگین <b>{fmt(Math.round(cur.avg ?? 0))}</b> در روز</>
                )}
              </span>
            </div>
            <div
              className="um-spark"
              ref={sparkRef}
              role="group"
              tabIndex={0}
              aria-label="مصرف هر روز"
              data-dim={shownDay ? true : undefined}
              data-sparse={days.length <= 14 || undefined}
              onPointerMove={onSparkMove}
              onPointerDown={onSparkMove}
              onPointerLeave={(e) => { if (e.pointerType === 'mouse') setDayIdx(null); }}
              onKeyDown={onSparkKey}
              onBlur={() => setDayIdx(null)}
            >
              {days.map((d, i) => {
                const stub = d.value === null;
                const h = stub ? 2 : Math.max(3, ((d.value as number) / dailyMax) * 32);
                return (
                  <i
                    key={i}
                    className="um-day"
                    data-stub={stub || undefined}
                    data-on={dayIdx === i || undefined}
                    style={{ height: `${h}px` }}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </div>}

      {limits.length > 0 ? (
        <div className="um-limits">
          {limits.map((l) => {
            const unlimited = l.total == null;
            const d = l.decimals ?? 0;
            const u = cur[`l:${l.label}:u`] ?? 0;
            const t = cur[`l:${l.label}:t`] ?? 0;
            const r = unlimited || !l.total ? 0 : l.used / l.total;
            const ls: UsageState = unlimited ? 'ok' : r >= 0.995 ? 'limit' : r >= warnAt ? 'warn' : 'ok';
            const pct = unlimited || t <= 0 ? 0 : Math.min(100, (u / t) * 100);
            const text = unlimited
              ? `${fmt(l.used, d)} از نامحدود${l.unit ? ` ${l.unit}` : ''}`
              : `${fmt(l.used, d)} از ${fmt(l.total as number, d, 0)}${l.unit ? ` ${l.unit}` : ''}`;
            return (
              <div className="um-limit" key={l.label} data-state={ls}>
                <span className="um-ll">
                  <span className="um-ll-t">{l.label}</span>
                  <i className="um-dot" aria-hidden="true" />
                </span>
                <span className="um-lv">
                  <b>{fmt(u, d)}</b>
                  <span> از {unlimited ? '∞' : fmt(t, d, 0)}{l.unit ? ` ${l.unit}` : ''}</span>
                </span>
                <div
                  className="um-lt"
                  data-inf={unlimited || undefined}
                  role="meter"
                  aria-label={l.label}
                  aria-valuemin={0}
                  aria-valuemax={unlimited ? undefined : l.total ?? undefined}
                  aria-valuenow={l.used}
                  aria-valuetext={text}
                >
                  {unlimited ? null : <i style={{ width: `${pct}%` }} />}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {bare ? null : <div className="um-foot">
        <p className="um-status" role="status" aria-live="polite">
          <span key={state} className="um-status-in" data-state={state}>
            {state !== 'ok' ? <i className="um-dot um-dot-on" aria-hidden="true" /> : null}
            {statusText}
          </span>
        </p>
        <StateButton
          solid={solid}
          label={solid ? topUpLabel : upgradeLabel}
          reduce={reduce}
          onClick={() => onUpgrade?.(state)}
        />
      </div>}
    </section>
  );
}
