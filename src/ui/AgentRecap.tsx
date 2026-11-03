"use client";

import {
  useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode,
} from 'react';
import { Bot, Check, CircleCheck, Loader2, TriangleAlert, User } from 'lucide-react';
import { RollingNumber } from './RollingNumber';

/*
 * Agent Recap – "what the agents did while you were away", written from scratch to match the look and
 * motion of the public affectUI demo (watched as a user, no source read).
 * The night is a small line chart (a smooth peak per event, an area fading out below); under it a board of
 * three lanes – needs you / failed / done – whose cards are acted on right where they stand.
 * Styles live in src/styles/recap.css (imported by ui.css).
 *
 * Exact (seen in the demo): chart is linear in time, hourly grid, one peak per event with a dot on it, the line
 * draws in while dots pop and cards blur in as the line passes them, header counts count along, lane counts are
 * totals, cards keep their place when acted on (state tag + Undo), every lane keeps room for `limit` cards.
 * Estimated: peak widths and heights, durations and curves, snap distance.
 */

export type RecapKind = 'needs' | 'failed' | 'done';

export type RecapEvent = {
  id: string;
  /** When it happened: a Date, an ISO string or a timestamp in ms. Events without a readable time are left out. */
  at: Date | string | number;
  kind: RecapKind;
  title: string;
  detail?: string;
  /** A small mark for the card – an icon, usually. */
  logo?: ReactNode;
  /** Merged events («۳۸ تیکت») – also makes the peak taller. */
  count?: number;
  /** The main action of a needs / failed card («تأیید», «تلاش دوباره»). */
  action?: string;
  /** Past tense of the action, shown once it ran («تأیید شد»). */
  doneLabel?: string;
};

export type AgentRecapProps = {
  events: RecapEvent[];
  /** When the person left. Defaults to a little before the first event. */
  since?: Date | string | number;
  /** Now. Defaults to the time the component first renders. */
  until?: Date | string | number;
  /** The main action ("primary") or Review. Return a promise and the card shows it working; a rejection puts the card back. */
  onAction?: (event: RecapEvent, action: 'primary' | 'review') => void | Promise<unknown>;
  onUndo?: (event: RecapEvent) => void;
  onRedo?: (event: RecapEvent) => void;
  /** Cards per lane at most; every lane keeps room for this many. */
  limit?: number;
  /** How long the night replays on open, in ms. 0 shows everything at once. */
  replay?: number;
  title?: string;
  locale?: string;
  className?: string;
};

type CardState = 'working' | 'resolved' | 'undone';
type Item = { ev: RecapEvent; ms: number; t: number; h: number };
type Role = 'primary' | 'undo' | 'redo';

const H = 96;                 // chart height, px
const BASE = H - 3.5;         // where the line rests, px from the top
const CHART_PAD = 14;         // snap distance, px

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const toMs = (v: Date | string | number | undefined): number | null => {
  if (v === undefined) return null;
  const n = v instanceof Date ? v.getTime() : typeof v === 'number' ? v : new Date(v).getTime();
  return Number.isFinite(n) ? n : null;
};

/** Peak height as a share of the chart: 1 event ≈ 0.63, many merged ones up to ≈ 0.83. */
const peak = (count?: number) => {
  const f = count && count > 6 ? clamp(Math.log(count / 6) / Math.log(38 / 6), 0, 1) : 0;
  return 0.63 + 0.2 * f;
};

function duration(ms: number, nf: (n: number) => string): string {
  const mins = Math.max(1, Math.round(ms / 60000));
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  const parts: string[] = [];
  if (d) parts.push(`${nf(d)} روز`);
  if (h) parts.push(`${nf(h)} ساعت`);
  if (m && !d) parts.push(`${nf(m)} دقیقه`);
  return parts.join(' و ') || `${nf(1)} دقیقه`;
}

const LANES: { kind: RecapKind; label: string; Icon: typeof User; empty: string }[] = [
  { kind: 'needs', label: 'منتظر توست', Icon: User, empty: 'چیزی منتظر تو نیست.' },
  { kind: 'failed', label: 'ناموفق', Icon: TriangleAlert, empty: 'چیزی ناموفق نبود.' },
  { kind: 'done', label: 'انجام‌شده', Icon: CircleCheck, empty: 'هنوز چیزی انجام نشده.' },
];

export function AgentRecap({
  events, since, until, onAction, onUndo, onRedo, limit = 3, replay = 1800,
  title = 'وقتی نبودی', locale = 'fa-IR', className,
}: AgentRecapProps) {
  const uid = useId();
  const rootRef = useRef<HTMLElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const drawRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const nf = useCallback((n: number) => n.toLocaleString(locale), [locale]);
  const tf = useMemo(() => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }), [locale]);
  const ff = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }), [locale]);

  /* ---- replay setup (decided once, on mount) ---- */
  const [intro] = useState(() => {
    if (!(replay > 0)) return false;
    try { return !window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return true; }
  });
  const [now] = useState(() => Date.now());
  const initialIds = useRef<Set<string> | null>(null);

  /* ---- model: sorted, clamped events ---- */
  const model = useMemo(() => {
    const valid = events
      .map((ev) => ({ ev, ms: toMs(ev.at) }))
      .filter((x): x is { ev: RecapEvent; ms: number } => x.ms !== null);
    const first = valid.length ? Math.min(...valid.map((x) => x.ms)) : now - 3600000;
    const last = valid.length ? Math.max(...valid.map((x) => x.ms)) : now;
    let s = toMs(since) ?? first - Math.max(1800000, (last - first) * 0.06);
    let u = toMs(until) ?? Math.max(now, last);
    if (u <= s) u = s + 3600000;
    const items: Item[] = valid
      .map(({ ev, ms }) => ({ ev, ms, t: clamp((ms - s) / (u - s), 0, 1), h: peak(ev.count) }))
      .sort((a, b) => a.ms - b.ms);
    // hour lines
    const hours: number[] = [];
    const d = new Date(s);
    d.setMinutes(0, 0, 0);
    if (d.getTime() <= s) d.setHours(d.getHours() + 1);
    while (d.getTime() < u && hours.length < 400) { hours.push((d.getTime() - s) / (u - s)); d.setHours(d.getHours() + 1); }
    const step = Math.max(1, Math.ceil(hours.length / 24));
    return { s, u, items, hours: hours.filter((_, i) => i % step === 0) };
  }, [events, since, until, now]);

  if (initialIds.current === null) initialIds.current = new Set(model.items.map((i) => i.ev.id));

  /* ---- chart width ---- */
  const [W, setW] = useState(656);
  useLayoutEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const read = () => setW(Math.max(120, Math.round(el.getBoundingClientRect().width)));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sigma = clamp(W * 0.022, 9, 16);
  const curveY = useCallback((x: number) => {
    let v = 0;
    for (const it of model.items) {
      const dx = x - it.t * W;
      v += it.h * H * Math.exp(-(dx * dx) / (2 * sigma * sigma));
    }
    return Math.max(2, BASE - v);
  }, [model.items, W, sigma]);

  const { line, area } = useMemo(() => {
    let p = '';
    for (let x = 0; x <= W; x += 2) p += `${p ? 'L' : 'M'}${x} ${curveY(x).toFixed(1)}`;
    if (W % 2) p += `L${W} ${curveY(W).toFixed(1)}`;
    return { line: p, area: `${p}L${W} ${H}L0 ${H}Z` };
  }, [W, curveY]);

  /* ---- intro: the line draws itself (CSS, same clock as the dots and cards); counts follow that clock ---- */
  const [passed, setPassed] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    if (!intro) return;
    const ids = initialIds.current ?? new Set<string>();
    const todo = model.items.filter((i) => ids.has(i.ev.id));
    const anim = drawRef.current?.getAnimations?.()[0];
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const ct = anim && anim.currentTime !== null ? Number(anim.currentTime) : performance.now() - t0;
      const due = todo.filter((i) => i.t * replay <= ct).map((i) => i.ev.id);
      setPassed((p) => (due.every((id) => p.has(id)) ? p : new Set(due)));
      if (ct < replay) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // the replay is scheduled once, for the events that were there when it opened
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intro, replay]);
  const isPassed = (id: string) => !intro || passed.has(id) || !(initialIds.current?.has(id));

  /* ---- card states ---- */
  const [st, setSt] = useState<Record<string, CardState>>({});
  const [live, setLive] = useState('');
  const focusNext = useRef<{ id: string; role: Role } | null>(null);
  const aliveRef = useRef(true);
  useEffect(() => { aliveRef.current = true; return () => { aliveRef.current = false; }; }, []);

  const setState = (id: string, s: CardState | null) =>
    setSt((cur) => {
      const next = { ...cur };
      if (s === null) delete next[id]; else next[id] = s;
      return next;
    });

  const cardEl = (id: string) =>
    rootRef.current?.querySelector<HTMLElement>(`[data-ar-id="${CSS.escape(id)}"]`) ?? null;

  const wantFocus = (id: string, role: Role) => {
    const card = cardEl(id);
    const ae = document.activeElement;
    // only follow the person: if they already went elsewhere, leave focus alone
    if (card && ae && ae !== document.body && !card.contains(ae)) return;
    focusNext.current = { id, role };
  };
  useEffect(() => {
    const f = focusNext.current;
    if (!f) return;
    focusNext.current = null;
    cardEl(f.id)?.querySelector<HTMLElement>(`[data-ar-btn="${f.role}"]`)?.focus();
  }, [st]);

  const labelOf = (ev: RecapEvent) =>
    ev.action ?? (ev.kind === 'failed' ? 'تلاش دوباره' : 'تأیید');
  const doneLabelOf = (ev: RecapEvent) =>
    ev.doneLabel ?? (ev.kind === 'failed' ? 'رفع شد' : ev.kind === 'needs' ? 'انجام شد' : 'انجام شد');

  const runPrimary = async (ev: RecapEvent) => {
    if (st[ev.id] === 'working') return;
    setState(ev.id, 'working');
    try {
      const r = onAction?.(ev, 'primary');
      if (r && typeof (r as Promise<unknown>).then === 'function') await r;
    } catch {
      if (aliveRef.current) setState(ev.id, null);
      return;
    }
    if (!aliveRef.current) return;
    wantFocus(ev.id, 'undo');
    setState(ev.id, 'resolved');
    setLive(`${doneLabelOf(ev)}: ${ev.title}`);
  };
  const runReview = (ev: RecapEvent) => { try { void onAction?.(ev, 'review'); } catch { /* the app handles it */ } };
  const runUndo = (ev: RecapEvent) => {
    onUndo?.(ev);
    if (ev.kind === 'done') { wantFocus(ev.id, 'redo'); setState(ev.id, 'undone'); setLive(`واگرد شد: ${ev.title}`); }
    else { wantFocus(ev.id, 'primary'); setState(ev.id, null); setLive(`واگرد شد: ${ev.title}`); }
  };
  const runRedo = (ev: RecapEvent) => {
    onRedo?.(ev);
    wantFocus(ev.id, 'undo');
    setState(ev.id, null);
    setLive(`دوباره انجام شد: ${ev.title}`);
  };

  /* ---- counts ---- */
  const stOf = (ev: RecapEvent): CardState | undefined => st[ev.id];
  const live_ = model.items.filter((i) => isPassed(i.ev.id));
  const sum = {
    done: live_.filter(({ ev }) => (ev.kind === 'done' ? stOf(ev) !== 'undone' : stOf(ev) === 'resolved')).length,
    needs: live_.filter(({ ev }) => ev.kind === 'needs' && stOf(ev) !== 'resolved').length,
    failed: live_.filter(({ ev }) => ev.kind === 'failed' && stOf(ev) !== 'resolved').length,
  };
  const laneCount = (kind: RecapKind) =>
    model.items.filter(({ ev }) => ev.kind === kind && (kind === 'done' ? stOf(ev) !== 'undone' : stOf(ev) !== 'resolved')).length;

  /* ---- pointing: chart <-> cards ---- */
  const [chart, setChart] = useState<{ x: number; snap: string | null } | null>(null);
  const [hotCard, setHotCard] = useState<string | null>(null);
  const [focusCard, setFocusCard] = useState<string | null>(null);
  const activeId = chart?.snap ?? hotCard ?? focusCard;
  const activeItem = activeId ? model.items.find((i) => i.ev.id === activeId) ?? null : null;
  const lastTip = useRef<Item | null>(null);
  if (activeItem) lastTip.current = activeItem;
  const tipItem = activeItem ?? lastTip.current;

  const onPlotMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = plotRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rtl = getComputedStyle(el).direction === 'rtl';
    const x = clamp(rtl ? r.right - e.clientX : e.clientX - r.left, 0, r.width);
    let best: Item | null = null;
    let bd = CHART_PAD;
    for (const it of model.items) {
      if (!isPassed(it.ev.id)) continue;
      const d = Math.abs(it.t * W - x);
      if (d <= bd) { best = it; bd = d; }
    }
    setChart({ x: best ? best.t * W : x, snap: best ? best.ev.id : null });
  };

  // keep the tip inside the chart
  useLayoutEffect(() => {
    const tip = tipRef.current;
    if (!tip || !tipItem) return;
    const w = tip.offsetWidth;
    const x = clamp(tipItem.t * W, w / 2, Math.max(w / 2, W - w / 2));
    tip.style.insetInlineStart = `${x}px`;
  }, [tipItem, W, activeItem]);

  const fullDate = (ms: number) => { try { return ff.format(new Date(ms)); } catch { return ''; } };

  const lanes = LANES.map((l) => {
    const all = model.items.filter((i) => i.ev.kind === l.kind);
    return { ...l, all, shown: all.slice(0, Math.max(1, limit)) };
  });

  const crumbs = [
    { key: 'done', Icon: CircleCheck, n: sum.done, label: 'انجام‌شده' },
    { key: 'needs', Icon: User, n: sum.needs, label: 'منتظر تو' },
    { key: 'failed', Icon: TriangleAlert, n: sum.failed, label: 'ناموفق' },
  ] as const;

  return (
    <section
      ref={rootRef}
      className={['ui-ar', className ?? ''].filter(Boolean).join(' ')}
      aria-labelledby={`${uid}-h`}
      data-intro={intro ? '' : undefined}
      style={{ '--ar-limit': Math.max(1, limit), '--ar-dur': `${replay}ms` } as CSSProperties}
    >
      <header className="ui-ar-head">
        <div className="ui-ar-headtext">
          <h2 className="ui-ar-title" id={`${uid}-h`}>{title}</h2>
          <p className="ui-ar-since">
            <span>از ساعت <time dateTime={new Date(model.s).toISOString()} title={fullDate(model.s)}>{tf.format(new Date(model.s))}</time></span>
            <span className="ui-ar-chip">{duration(model.u - model.s, nf)}</span>
          </p>
        </div>
        <ul className="ui-ar-sum">
          {crumbs.map(({ key, Icon, n, label }) => (
            <li key={key} className="ui-ar-sumitem">
              <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
              <span className="ui-ar-sumn"><RollingNumber value={n} format={nf} /></span>
              <span className="ui-ar-sumlabel">{label}</span>
            </li>
          ))}
        </ul>
      </header>

      <div className="ui-ar-chart" aria-hidden="true">
        <div
          ref={plotRef}
          className="ui-ar-plot"
          onPointerMove={onPlotMove}
          onPointerDown={onPlotMove}
          onPointerLeave={() => setChart(null)}
        >
          <svg className="ui-ar-svg ui-ar-grid" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={`h${i}`} x1={0} x2={W} y1={(H - 0.5) * (i / 4) + 0.25} y2={(H - 0.5) * (i / 4) + 0.25} />
            ))}
            {model.hours.map((t, i) => (
              <line key={`v${i}`} x1={t * W} x2={t * W} y1={0} y2={H} />
            ))}
          </svg>
          <div ref={drawRef} className="ui-ar-draw" data-intro={intro ? '' : undefined}>
            <svg className="ui-ar-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
              <defs>
                <linearGradient id={`${uid}-g`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="currentColor" stopOpacity="0.1" />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path className="ui-ar-area" d={area} fill={`url(#${uid}-g)`} />
              <path className="ui-ar-line" d={line} fill="none" />
            </svg>
          </div>
          {model.items.map((it) => (
            <span
              key={it.ev.id}
              className="ui-ar-dot"
              data-on={activeId === it.ev.id ? '' : undefined}
              data-intro={intro ? '' : undefined}
              style={{
                insetInlineStart: it.t * W,
                insetBlockStart: curveY(it.t * W),
                '--ar-d': `${Math.round(it.t * replay)}ms`,
              } as CSSProperties}
            />
          ))}
          <span className="ui-ar-cursor" data-on={chart ? '' : undefined} style={{ insetInlineStart: chart?.x ?? 0 }} />
          <div ref={tipRef} className="ui-ar-tip" data-on={activeItem ? '' : undefined}>
            {tipItem ? `${tf.format(new Date(tipItem.ms))} · ${tipItem.ev.title}` : null}
          </div>
        </div>
        <div className="ui-ar-axis">
          <span>{tf.format(new Date(model.s))}</span>
          <span>{tf.format(new Date(model.u))}</span>
        </div>
      </div>

      <div className="ui-ar-lanes">
        {lanes.map(({ kind, label, Icon, empty, all, shown }) => (
          <section key={kind} className="ui-ar-lane" data-kind={kind} aria-labelledby={`${uid}-l-${kind}`}>
            <h3 className="ui-ar-lanehead" id={`${uid}-l-${kind}`}>
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              <span className="ui-ar-lanelabel">{label}</span>
              <span className="ui-ar-count" aria-label={nf(laneCount(kind))}>{nf(laneCount(kind))}</span>
            </h3>
            {all.length === 0 ? (
              <p className="ui-ar-empty">{empty}</p>
            ) : (
              <ul className="ui-ar-cards">
                {shown.map((it) => {
                  const { ev } = it;
                  const state = st[ev.id];
                  const isDone = ev.kind === 'done';
                  const acted = !isDone && state === 'resolved';
                  const view: 'idle' | 'working' | 'acted' | 'undone' =
                    state === 'working' ? 'working' : acted || (isDone && !state) ? 'acted' : isDone && state === 'undone' ? 'undone' : 'idle';
                  const tagText = acted ? doneLabelOf(ev) : isDone && !state ? 'انجام شد' : 'واگرد شد';
                  const primary = labelOf(ev);
                  return (
                    <li
                      key={ev.id}
                      className="ui-ar-card"
                      data-ar-id={ev.id}
                      data-kind={ev.kind}
                      data-view={view}
                      data-lit={activeId === ev.id ? '' : undefined}
                      data-intro={intro ? '' : undefined}
                      style={{ '--ar-d': `${Math.round(it.t * replay)}ms` } as CSSProperties}
                      onPointerEnter={() => setHotCard(ev.id)}
                      onPointerLeave={() => setHotCard((c) => (c === ev.id ? null : c))}
                      onFocus={() => setFocusCard(ev.id)}
                      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusCard((c) => (c === ev.id ? null : c)); }}
                    >
                      <div className="ui-ar-cardhead">
                        <span className="ui-ar-logo" data-ok={view === 'acted' && !isDone ? '' : undefined}>
                          {view === 'acted' && !isDone
                            ? <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                            : (ev.logo ?? <Bot size={12} strokeWidth={1.75} aria-hidden="true" />)}
                        </span>
                        <span className="ui-ar-cardtitle" title={ev.title}>{ev.title}</span>
                      </div>
                      <div className="ui-ar-meta">
                        <span className="ui-ar-detail" title={ev.detail}>{ev.detail}</span>
                        {ev.count && ev.count > 1 ? <span className="ui-ar-chip ui-ar-n">{nf(ev.count)}</span> : null}
                        <time className="ui-ar-time" dateTime={new Date(it.ms).toISOString()} title={fullDate(it.ms)}>
                          {tf.format(new Date(it.ms))}
                        </time>
                      </div>
                      <div className="ui-ar-foot">
                        <div className="ui-ar-footin" key={view}>
                          {view === 'idle' || view === 'working' ? (
                            <>
                              {view === 'working' ? <span className="ui-ar-working">در حال انجام…</span> : null}
                              <span className="ui-ar-actions">
                                {ev.kind === 'needs' ? (
                                  <button
                                    type="button" className="ui-ar-btn" data-ar-btn="review"
                                    aria-disabled={view === 'working' || undefined}
                                    aria-label={`بررسی: ${ev.title}`}
                                    onClick={() => { if (view !== 'working') runReview(ev); }}
                                  >بررسی</button>
                                ) : null}
                                <button
                                  type="button" className="ui-ar-btn ui-ar-primary" data-ar-btn="primary"
                                  aria-disabled={view === 'working' || undefined}
                                  aria-label={`${primary}: ${ev.title}`}
                                  onClick={() => { void runPrimary(ev); }}
                                >
                                  {view === 'working' ? <Loader2 size={13} strokeWidth={2} className="ui-ar-spin" aria-hidden="true" /> : null}
                                  {primary}
                                </button>
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="ui-ar-tag" data-tone={view === 'undone' ? 'muted' : 'ok'}>{tagText}</span>
                              <button
                                type="button" className="ui-ar-btn" data-ar-btn={view === 'undone' ? 'redo' : 'undo'}
                                aria-label={`${view === 'undone' ? 'دوباره' : 'واگرد'}: ${ev.title}`}
                                onClick={() => (view === 'undone' ? runRedo(ev) : runUndo(ev))}
                              >{view === 'undone' ? 'دوباره' : 'واگرد'}</button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="ui-ar-live" role="status" aria-live="polite">{live}</p>
    </section>
  );
}

/** @deprecated kept only so `ui/index.ts` still compiles; the recap no longer takes stat tiles. */
export type RecapStat = { label: string; value: number };
