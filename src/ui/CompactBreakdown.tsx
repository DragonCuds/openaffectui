/*
 * Compact Breakdown. Written from scratch to match the look and motion of the public affectUI demo
 * (https://www.affectui.com/components/compact-breakdown). No vendor code was used: sizes, colours and timings
 * were read from the public demo like a user would (screenshots / frames) and the API follows its public docs.
 */
import {
  useCallback, useEffect, useId, useLayoutEffect, useReducer, useRef, useState,
  type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode,
} from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { faNum } from './digits';

export type BreakdownItem = { id?: string; label: string; value: number; color?: string };
export type BreakdownPeriod = { id: string; label: string };
/** Kept under the old name too, so earlier imports keep compiling. */
export type BreakdownPart = BreakdownItem;

export type CompactBreakdownProps = {
  /** The parts of the shown period; the list ranks them by value, the bar keeps their places. Give an id when labels can change. */
  items: BreakdownItem[];
  title?: string;
  /** Options of the period switch; no switch when left out. */
  periods?: BreakdownPeriod[];
  period?: string;
  defaultPeriod?: string;
  onPeriodChange?: (id: string) => void;
  /** Change against the previous period in percent (12.4 or -3). */
  delta?: number;
  /** Formats every value (total, rows, hovered part). Receives raw, possibly fractional numbers while they roll: round inside. */
  format?: (value: number) => string;
  /** Line under the big number while nothing is hovered. */
  totalLabel?: string;
  /** Replaces the line on the tray; null hides it. */
  footer?: ReactNode | null;
  className?: string;
};

/* ---------- helpers ---------- */

const DURATION = 520; // every number and the bar share this one tween (estimated from frames)
const FLIP_MS = 520; // rows trading places
const FOLD_MS = 460;
const defaultFormat = (n: number) => faNum(Math.round(n));

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

/** cubic-bezier(x1,y1,x2,y2) as a function of progress. */
function makeBezier(x1: number, y1: number, x2: number, y2: number): (k: number) => number {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  return (k) => {
    if (k <= 0) return 0;
    if (k >= 1) return 1;
    let lo = 0, hi = 1, t = k;
    for (let i = 0; i < 24; i += 1) {
      const x = sx(t);
      if (Math.abs(x - k) < 1e-4) break;
      if (x < k) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}
const ROLL = makeBezier(0.2, 0.5, 0.3, 1); // fitted to the demo's number roll

type Tween = { from: number; to: number; t0: number };

/**
 * One frame loop for every number and every bar width. Each key glides from where it is to its new target;
 * keys that change in the same moment start together, so total, rows and bar move in step.
 */
function useTweens(targets: Record<string, number>, reduce: boolean) {
  const cur = useRef<Record<string, number>>({});
  const tw = useRef<Record<string, Tween>>({});
  const raf = useRef(0);
  const [, tick] = useReducer((n: number) => n + 1, 0);
  const sig = Object.entries(targets).map(([k, v]) => `${k}\u0002${v}`).join('\u0001');
  const targetsRef = useRef(targets);
  targetsRef.current = targets;

  const loop = useCallback(() => {
    if (raf.current) return;
    const step = (now: number) => {
      let live = false;
      for (const k of Object.keys(tw.current)) {
        const t = tw.current[k];
        const p = Math.min(1, (now - t.t0) / DURATION);
        cur.current[k] = p >= 1 ? t.to : t.from + (t.to - t.from) * ROLL(p);
        if (p >= 1) delete tw.current[k]; else live = true;
      }
      tick();
      raf.current = live ? requestAnimationFrame(step) : 0;
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  useLayoutEffect(() => {
    const to = targetsRef.current;
    const now = performance.now();
    let started = false;
    for (const k of Object.keys(to)) {
      const from = cur.current[k] ?? 0;
      if (reduce) { cur.current[k] = to[k]; delete tw.current[k]; continue; }
      const live = tw.current[k];
      if (live ? live.to === to[k] : from === to[k]) continue;
      tw.current[k] = { from, to: to[k], t0: now };
      started = true;
    }
    for (const k of Object.keys(cur.current)) {
      if (!(k in to)) { delete cur.current[k]; delete tw.current[k]; }
    }
    if (reduce) tick();
    if (started) loop();
  }, [sig, reduce, loop]);

  useEffect(() => () => { cancelAnimationFrame(raf.current); raf.current = 0; }, []);

  return (k: string): number => cur.current[k] ?? (reduce ? targets[k] ?? 0 : 0);
}

/** Stops running slides only: the fold and fade of a row are CSS transitions and must keep going. */
function cancelSlides(el: HTMLElement) {
  el.getAnimations().forEach((a) => { if (!('transitionProperty' in a)) a.cancel(); });
}

/* ---------- rows (they stay until they have folded away) ---------- */

type Part = { key: string; label: string; value: number; color?: string };
type Row = { key: string; label: string; color?: string; open: boolean; fresh?: boolean };

function normalise(items: BreakdownItem[]): Part[] {
  const seen = new Set<string>();
  return items.map((it, i) => {
    let key = it.id ?? it.label;
    if (seen.has(key)) key = `${key}#${i}`;
    seen.add(key);
    return { key, label: it.label, value: Number.isFinite(it.value) ? Math.max(0, it.value) : 0, color: it.color };
  });
}

/** Keeps rows that dropped out (they fold away) and inserts new ones next to their neighbour. */
function mergeRows(prev: Row[], parts: Part[]): Row[] {
  const next: Row[] = prev.map((r) => {
    const p = parts.find((x) => x.key === r.key);
    return { ...r, label: p ? p.label : r.label, color: p ? p.color : r.color, open: !!p, fresh: p ? r.fresh : false };
  });
  let at = -1;
  parts.forEach((p) => {
    const i = next.findIndex((r) => r.key === p.key);
    if (i >= 0) { at = i; return; }
    next.splice(at + 1, 0, { key: p.key, label: p.label, color: p.color, open: false, fresh: true });
    at += 1;
  });
  return next;
}

/* ---------- period switch ---------- */

function PeriodSwitch({ periods, value, onChange, label }: {
  periods: BreakdownPeriod[]; value: string; onChange: (id: string) => void; label: string;
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
      track.style.setProperty('--bkd-x', `${b.offsetLeft}px`);
      track.style.setProperty('--bkd-w', `${b.offsetWidth}px`);
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
    <div className="bkd-switch" role="radiogroup" aria-label={label} onKeyDown={onKey} ref={trackRef} data-ready={ready || undefined}>
      <span className="bkd-pill" aria-hidden="true" />
      {periods.map((p, i) => (
        <button
          key={p.id}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="radio"
          className="bkd-opt"
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

/* ---------- main component ---------- */

const pctText = (share: number, any: boolean): string => {
  const r = Math.round(share * 100);
  return `${faNum(any && r === 0 ? 1 : r)}٪`;
};

export function CompactBreakdown({
  items, title = 'تفکیک', periods, period, defaultPeriod, onPeriodChange, delta,
  format = defaultFormat, totalLabel = 'جمع', footer, className,
}: CompactBreakdownProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const rootRef = useRef<HTMLElement>(null);
  const parts = normalise(items);
  const partOf = new Map(parts.map((p) => [p.key, p]));

  /* period (controlled or not) */
  const [inner, setInner] = useState(defaultPeriod ?? periods?.[0]?.id ?? '');
  const activePeriod = period ?? inner;
  const pick = (id: string) => { if (period === undefined) setInner(id); onPeriodChange?.(id); };

  /* looks: each part keeps its own for good */
  const looks = useRef(new Map<string, number>());
  parts.forEach((p) => { if (!looks.current.has(p.key)) looks.current.set(p.key, looks.current.size); });
  const colorOf = (key: string, color?: string): string => color ?? `var(--bkd-c${(looks.current.get(key) ?? 0) % 7})`;

  /* rows: derived from the parts during render, so nothing renders a step late */
  const [rows, setRows] = useState<Row[]>(() => parts.map((p) => ({ key: p.key, label: p.label, color: p.color, open: true })));
  const partSig = parts.map((p) => p.key).join('\u0001');
  const [lastSig, setLastSig] = useState(partSig);
  if (partSig !== lastSig) {
    setLastSig(partSig);
    setRows((prev) => mergeRows(prev, parts));
  }
  useEffect(() => {
    if (!rows.some((r) => r.fresh)) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => {
      setRows((prev) => prev.map((r) => (r.fresh ? { ...r, fresh: false, open: true } : r)));
    }));
    return () => cancelAnimationFrame(id);
  }, [rows]);
  useEffect(() => {
    if (!rows.some((r) => !r.open && !r.fresh)) return;
    const id = window.setTimeout(() => setRows((prev) => prev.filter((r) => r.open || r.fresh)), FOLD_MS + 120);
    return () => window.clearTimeout(id);
  }, [rows]);

  /* hover / focus: one part lights up */
  const [hov, setHov] = useState<string | null>(null);
  const hovRow = hov !== null ? rows.find((r) => r.key === hov && partOf.has(r.key)) : undefined;
  const hovKey = hovRow ? hovRow.key : null;
  const lastHov = useRef<Row | null>(null);
  if (hovRow) lastHov.current = hovRow;

  useEffect(() => {
    if (hov === null) return;
    const away = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setHov(null);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [hov]);

  const enter = (key: string) => (e: ReactPointerEvent) => { if (e.pointerType === 'mouse') setHov(key); };
  const leave = (e: ReactPointerEvent) => { if (e.pointerType === 'mouse') setHov(null); };
  const tap = (key: string) => (e: ReactPointerEvent) => { if (e.pointerType !== 'mouse') setHov((h) => (h === key ? null : key)); };

  /* every animated number and width in one loop */
  const totalT = parts.reduce((s, p) => s + p.value, 0);
  const targets: Record<string, number> = { big: hovKey !== null ? partOf.get(hovKey)!.value : totalT };
  rows.forEach((r) => { targets[`v:${r.key}`] = partOf.get(r.key)?.value ?? 0; });
  const val = useTweens(targets, reduce);

  const sumC = rows.reduce((s, r) => s + val(`v:${r.key}`), 0);
  const empty = !(totalT > 0);
  const share = (key: string) => (sumC > 0 ? val(`v:${key}`) / sumC : 0);

  /* ranking: by value, high to low; leaving rows keep their old place while they fold away */
  const prevOrder = useRef<string[]>([]);
  const ranked = rows
    .map((r, slot) => ({ r, slot }))
    .filter(({ r }) => partOf.has(r.key))
    .sort((a, b) => (partOf.get(b.r.key)!.value - partOf.get(a.r.key)!.value) || a.slot - b.slot)
    .map(({ r }) => r);
  const order: Row[] = [...ranked];
  rows.filter((r) => !partOf.has(r.key)).forEach((g) => {
    const at = prevOrder.current.indexOf(g.key);
    order.splice(at < 0 ? order.length : Math.min(at, order.length), 0, g);
  });
  const orderSig = order.map((r) => r.key).join('\u0001');

  /* rows slide to their new rank (FLIP): measure where they were before this render, play from there */
  const listRef = useRef<HTMLUListElement>(null);
  const liEls = useRef(new Map<string, HTMLLIElement>());
  const committedSig = useRef(orderSig);
  const before = useRef<Map<string, number>>(new Map());
  if (orderSig !== committedSig.current) {
    const m = new Map<string, number>();
    liEls.current.forEach((el, k) => m.set(k, el.getBoundingClientRect().top));
    before.current = m;
  }
  useLayoutEffect(() => {
    if (orderSig === committedSig.current) return;
    committedSig.current = orderSig;
    prevOrder.current = order.map((r) => r.key);
    const from = before.current;
    if (reduce) { liEls.current.forEach((el) => cancelSlides(el)); return; }
    liEls.current.forEach((el) => cancelSlides(el));
    liEls.current.forEach((el, k) => {
      const t0 = from.get(k);
      if (t0 === undefined || typeof el.animate !== 'function') return;
      const d = t0 - el.getBoundingClientRect().top;
      if (Math.abs(d) < 0.5) return;
      el.animate([{ transform: `translateY(${d}px)` }, { transform: 'translateY(0)' }], { duration: FLIP_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderSig, reduce]);
  useEffect(() => { prevOrder.current = order.map((r) => r.key); });

  /* text for the line under the number and for screen readers */
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  const deltaDir = !hasDelta ? 0 : delta! > 0 ? 1 : delta! < 0 ? -1 : 0;
  const deltaText = hasDelta
    ? `${Math.abs(delta!).toLocaleString('fa-IR', { maximumFractionDigits: 1, minimumFractionDigits: Number.isInteger(delta) ? 0 : 1 })}٪`
    : '';
  const srTotal = `${totalLabel}: ${format(totalT)}${hasDelta
    ? deltaDir === 0 ? '، بدون تغییر نسبت به دوره‌ی قبل' : `، ${deltaText} ${deltaDir > 0 ? 'افزایش' : 'کاهش'} نسبت به دوره‌ی قبل`
    : ''}`;

  const largest = parts.reduce<Part | null>((m, p) => (!m || p.value > m.value ? p : m), null);
  let footNode: ReactNode = null;
  if (footer === undefined) {
    if (!empty && largest) footNode = <><span>بیشترین:</span> <b>{largest.label}</b></>;
  } else footNode = footer;

  const tipRow = hovRow ?? lastHov.current;
  const titleId = `${uid}-t`;

  return (
    <section
      ref={rootRef}
      className={`bkd${className ? ` ${className}` : ''}`}
      aria-labelledby={titleId}
      data-empty={empty || undefined}
      data-hov={hovKey !== null || undefined}
      onKeyDown={(e) => { if (e.key === 'Escape') setHov(null); }}
    >
      <div className="bkd-head">
        <h3 className="bkd-title" id={titleId}>{title}</h3>
        {periods && periods.length > 0 ? (
          <PeriodSwitch periods={periods} value={activePeriod} onChange={pick} label="بازه‌ی زمانی" />
        ) : null}
      </div>

      <div className="bkd-hero">
        <div className="bkd-total" aria-hidden="true">
          <span className="bkd-num">{format(val('big'))}</span>
          {hasDelta ? (
            <span key={String(delta)} className="bkd-delta" data-dir={deltaDir} data-hide={hovKey !== null || undefined}>
              {deltaDir > 0 ? <ArrowUp size={12} strokeWidth={2.4} /> : deltaDir < 0 ? <ArrowDown size={12} strokeWidth={2.4} /> : <Minus size={12} strokeWidth={2.4} />}
              {deltaText}
            </span>
          ) : null}
        </div>
        {hovRow && tipRow ? (
          <p className="bkd-sub bkd-sub-part" key={`part:${tipRow.key}`} aria-hidden="true">
            <i className="bkd-sw" style={{ '--c': colorOf(tipRow.key, tipRow.color) } as CSSProperties} />
            <span className="bkd-sub-l">{partOf.get(tipRow.key)?.label ?? tipRow.label}</span>
            <span className="bkd-sub-p">· {pctText(share(tipRow.key), (partOf.get(tipRow.key)?.value ?? 0) > 0)}</span>
          </p>
        ) : (
          <p className="bkd-sub" key="total" aria-hidden="true">{totalLabel}</p>
        )}
        <p className="bkd-sr" aria-live="polite">{srTotal}</p>
      </div>

      <div className="bkd-bar" aria-hidden="true">
        {rows.map((r) => {
          const w = share(r.key);
          return (
            <div
              key={r.key}
              className="bkd-seg"
              data-on={hovKey === r.key || undefined}
              style={{ width: `${w * 100}%`, '--c': colorOf(r.key, r.color) } as CSSProperties}
              onPointerEnter={enter(r.key)}
              onPointerLeave={leave}
              onPointerDown={tap(r.key)}
            >
              <i />
            </div>
          );
        })}
      </div>

      {empty ? (
        <p className="bkd-empty">برای این بازه داده‌ای نیست.</p>
      ) : (
        <ul className="bkd-list" ref={listRef}>
          {order.map((r) => {
            const part = partOf.get(r.key);
            const v = val(`v:${r.key}`);
            return (
              <li
                key={r.key}
                ref={(el) => { if (el) liEls.current.set(r.key, el); else liEls.current.delete(r.key); }}
                className="bkd-row"
                tabIndex={part ? 0 : -1}
                data-open={r.open || undefined}
                data-on={hovKey === r.key || undefined}
                aria-label={part ? `${part.label}: ${format(part.value)}، ${pctText(totalT > 0 ? part.value / totalT : 0, part.value > 0)}` : undefined}
                aria-hidden={part ? undefined : true}
                onPointerEnter={enter(r.key)}
                onPointerLeave={leave}
                onPointerDown={tap(r.key)}
                onFocus={() => { if (part) setHov(r.key); }}
                onBlur={() => setHov((h) => (h === r.key ? null : h))}
              >
                <div className="bkd-row-clip">
                  <div className="bkd-row-in" aria-hidden="true">
                    <i className="bkd-sw" style={{ '--c': colorOf(r.key, r.color) } as CSSProperties} />
                    <span className="bkd-row-l">{part?.label ?? r.label}</span>
                    <span className="bkd-row-v">{format(v)}</span>
                    <span className="bkd-row-p">{pctText(share(r.key), (part?.value ?? 0) > 0)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {footNode !== null && footNode !== false ? <div className="bkd-foot">{footNode}</div> : null}
    </section>
  );
}
