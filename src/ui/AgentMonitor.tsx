"use client";

/*
 * Agent Monitor – one agent at work, as a card (written from scratch for this kit; look and motion follow the
 * public demo of affectUI's Agent Monitor).
 * The current step sits in a "well" with the clock and the bill so far, a time strip draws every step as a bar
 * (the running one grows live), finished steps drop into a short list (click one, or its bar, for an info card),
 * and the foot holds the controls. Waiting shows the exact command with Allow / Decline (Enter / Esc);
 * the fold button turns the card into a small bar with the tools the agent has used.
 * The component only draws: update state, steps, since, pausedFor and cost from your agent's events.
 * Styles live in src/styles/monitor.css (imported by ui.css).
 */

import {
  useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type KeyboardEvent, type ReactNode,
} from 'react';
import {
  ArrowUpLeft, Brain, Check, ChevronsDownUp, CornerDownLeft, Globe, Pause, Pencil,
  Play, RotateCcw, Search, SquareTerminal, TriangleAlert, X, FileText, Circle,
} from 'lucide-react';
import { faNum } from './digits';

/* ---------------------------------------------------------------- types */

export type MonitorState = 'idle' | 'running' | 'waiting' | 'paused' | 'finished' | 'failed' | 'cancelled';
export type StepKind = 'read' | 'search' | 'edit' | 'run' | 'think' | 'web';

export type AgentRunStep = {
  id: string;
  label: string;
  /** A plain icon for steps without a logo */
  kind?: StepKind;
  /** The logo of the tool the step used */
  icon?: ReactNode;
  state: 'queued' | 'running' | 'done' | 'failed';
  /** When the step began (ms) – the running step grows from here */
  since?: number;
  /** How long it took (ms) */
  took?: number;
  /** Info card: the tool's name, what happened, and the command or place it touched */
  tool?: string;
  detail?: string;
  output?: string;
};

/** Kept for the old import name */
export type MonitorStep = AgentRunStep;

export type AgentMonitorProps = {
  state?: MonitorState;
  agent?: { name: string; role?: string; mark?: ReactNode };
  steps?: AgentRunStep[];
  /** Overrides what the well says while running – by default it is the running step */
  current?: { label: string; kind?: StepKind; icon?: ReactNode };
  /** When the run began and ended (ms). While paused, `until` is the moment of the pause. */
  since?: number;
  until?: number;
  /** Time already spent paused (ms), left out of the clock */
  pausedFor?: number;
  /** USD spent so far – shimmers while the agent is busy */
  cost?: number;
  /** While waiting: a short title, the exact command, the logo of the tool it is about to use */
  ask?: { title: string; command?: string; icon?: ReactNode };
  /** Once finished */
  outcome?: { added?: number; removed?: number; files?: number; note?: string };
  /** Once failed: what went wrong, in a few words */
  error?: string;
  onAllow?: () => void;
  onDecline?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  onOpenLog?: () => void;
  defaultFolded?: boolean;
  /** False when the start time is not known: the running clock is left out (default true) */
  clock?: boolean;
  /** Start with a step's info card open */
  defaultOpenId?: string;
  /** Persian copy – override any of it */
  labels?: Partial<typeof FA>;
  className?: string;
};

/* ---------------------------------------------------------------- copy */

const FA = {
  region: 'پایشگر عامل',
  idle: 'آماده',
  running: 'در حال اجرا',
  waiting: 'نیاز به شما',
  paused: 'متوقف',
  finished: 'تمام شد',
  failed: 'ناموفق',
  cancelled: 'لغو شد',
  noTask: 'هنوز کاری نیست',
  preparing: 'در حال آماده‌سازی',
  pausedWord: 'متوقف',
  pause: 'مکث',
  resume: 'ادامه',
  cancel: 'لغو',
  allow: 'اجازه',
  decline: 'رد',
  retry: 'تلاش دوباره',
  log: 'گزارش',
  fold: 'جمع کردن',
  unfold: 'باز کردن',
  esc: 'Esc',
  stepFailed: 'ناموفق',
  couldNotFinish: 'اجرا ناموفق بود',
  seconds: 'ثانیه',
  minutes: 'دقیقه',
  and: 'و',
  finishedIn: (d: string) => `در ${d} تمام شد`,
  cancelledAfter: (d: string) => `پس از ${d} لغو شد`,
  lines: 'خط',
  filesWord: 'فایل',
  cost: 'هزینه تا اینجا',
  dollars: 'دلار',
  elapsed: 'زمان گذشته',
  timeline: 'خط زمانی مرحله‌ها',
  doneSteps: 'مرحله‌های انجام‌شده',
  started: 'شروع',
  tookWord: 'مدت',
  share: 'سهم',
  state: 'وضعیت',
  stepDone: 'انجام شد',
  stepRunning: 'در حال اجرا',
  stepFailedWord: 'ناموفق',
  stepQueued: 'در صف',
  close: 'بستن',
  moreTools: 'ابزار دیگر',
};

/* ---------------------------------------------------------------- small helpers */

const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

const KIND_ICON: Record<StepKind, typeof Circle> = {
  read: FileText, search: Search, edit: Pencil, run: SquareTerminal, think: Brain, web: Globe,
};

function stepIcon(s: { icon?: ReactNode; kind?: StepKind }): ReactNode {
  if (s.icon) return s.icon;
  const K = s.kind ? KIND_ICON[s.kind] : Circle;
  return <K strokeWidth={1.75} aria-hidden="true" />;
}

const fa1 = (n: number) => n.toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** 0:08 – minutes and seconds, Persian digits */
function clock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${faNum(Math.floor(s / 60))}:${faNum(s % 60).padStart(2, '۰')}`;
}

/** 19 seconds, or 1 minute and 5 seconds */
function span(ms: number, L: typeof FA): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${faNum(s)} ${L.seconds}`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${faNum(m)} ${L.minutes} ${L.and} ${faNum(r)} ${L.seconds}` : `${faNum(m)} ${L.minutes}`;
}

const tookText = (ms: number, L: typeof FA) => `${fa1(ms / 1000)} ${L.seconds}`;

const usd = (n: number) =>
  `$${n.toLocaleString('fa-IR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;

function useReducedMotion() {
  const [r, setR] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const m = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!m) return;
    const f = () => setR(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return r;
}

function useNow(live: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!live) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [live]);
  return now;
}

/* ---------------------------------------------------------------- Swap: soft change of content */

const SWAP_MS = 300;

type Layer = { k: string; node: ReactNode; out?: boolean };

/**
 * The old content fades (and rolls up, or shrinks) away while the new one comes in; with `glide` the room
 * between them eases to the new width.
 */
function Swap({ k, children, mode = 'fade', glide = false, className, block = false }: {
  k: string;
  children: ReactNode;
  mode?: 'roll' | 'fade';
  glide?: boolean;
  block?: boolean;
  className?: string;
}) {
  const [layers, setLayers] = useState<Layer[]>([{ k, node: children }]);
  const lastNode = useRef<{ k: string; node: ReactNode }>({ k, node: children });
  const box = useRef<HTMLSpanElement>(null);
  const prevW = useRef<number | null>(null);
  const reduced = useReducedMotion();

  let ls = layers;
  if (!ls.some((l) => l.k === k && !l.out)) {
    ls = [
      ...ls.filter((l) => l.out),
      ...ls.filter((l) => !l.out).map((l) => ({ k: l.k, node: lastNode.current.node, out: true })),
      { k, node: children },
    ];
    setLayers(ls);
  }
  if (lastNode.current.k !== k || lastNode.current.node !== children) lastNode.current = { k, node: children };

  const leaving = ls.some((l) => l.out);
  useEffect(() => {
    if (!leaving) return;
    const id = setTimeout(() => setLayers((cur) => cur.filter((l) => !l.out)), SWAP_MS + 40);
    return () => clearTimeout(id);
  }, [leaving, k]);

  const lastKey = useRef(k);
  useEffect(() => {
    const el = box.current;
    if (!el || !glide || typeof ResizeObserver === 'undefined') return;
    prevW.current = el.getBoundingClientRect().width;
    const ro = new ResizeObserver((e) => { prevW.current = e[0].borderBoxSize?.[0]?.inlineSize ?? el.getBoundingClientRect().width; });
    ro.observe(el);
    return () => ro.disconnect();
  }, [glide]);
  useLayoutEffect(() => {
    if (lastKey.current === k) return;
    lastKey.current = k;
    const el = box.current;
    if (!el || !glide || reduced || prevW.current == null) return;
    const w = el.getBoundingClientRect().width;
    if (Math.abs(prevW.current - w) > 0.5) {
      el.animate(
        [{ inlineSize: `${prevW.current}px` }, { inlineSize: `${w}px` }],
        { duration: 340, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
    }
  }, [k]); // eslint-disable-line react-hooks/exhaustive-deps

  const animated = ls.length > 1;
  return (
    <span ref={box} className={cx('mon-sw', block && 'mon-sw-block', className)} data-mode={mode} data-glide={glide || undefined}>
      {ls.map((l) => (
        <span
          key={l.k + (l.out ? ':out' : '')}
          className="mon-sw-l"
          data-phase={l.out ? 'out' : animated ? 'in' : undefined}
          aria-hidden={l.out || undefined}
        >
          {l.out ? l.node : children}
        </span>
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------- Collapse: a part that opens and closes */

function Collapse({ open, children, className }: { open: boolean; children: ReactNode; className?: string }) {
  const keep = useRef(children);
  if (open) keep.current = children;
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);
  const [settled, setSettled] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setSettled(false);
      let r2 = 0;
      const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setShown(true)); });
      return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
    }
    setShown(false);
    setSettled(false);
    const id = setTimeout(() => setMounted(false), 460);
    return () => clearTimeout(id);
  }, [open]);

  if (!open && !mounted) return null;
  return (
    <div
      className={cx('mon-co', className)}
      data-shown={shown || undefined}
      data-settled={settled || undefined}
      onTransitionEnd={(e) => { if (e.target === e.currentTarget && e.propertyName === 'grid-template-rows' && shown) setSettled(true); }}
    >
      <div>{keep.current}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- Tile: a logo in a small white square */

function Tile({ size, children, className, style }: { size: number; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span className={cx('mon-tile', className)} style={{ '--mon-t': `${size}px`, ...style } as CSSProperties} aria-hidden="true">
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- the component */

type Seg = { id: string; ms: number; kind: 'done' | 'failed' | 'run' | 'wait' | 'hold' };

export function AgentMonitor({
  state = 'idle',
  agent = { name: 'Agent' },
  steps = [],
  current,
  since,
  until,
  pausedFor = 0,
  cost,
  ask,
  outcome,
  error,
  onAllow, onDecline, onPause, onResume, onCancel, onRetry, onOpenLog,
  defaultFolded = false,
  clock: showClock = true,
  defaultOpenId,
  labels,
  className,
}: AgentMonitorProps) {
  const L = useMemo(() => ({ ...FA, ...labels }), [labels]);
  const uid = useId();
  const reduced = useReducedMotion();

  const root = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const foldBtn = useRef<HTMLButtonElement>(null);
  const barBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const focusAfterFold = useRef<'fold' | 'bar' | null>(null);

  const [folded, setFolded] = useState(defaultFolded);
  const [hover, setHover] = useState<string | null>(null);
  const [info, setInfo] = useState<{ id: string; top: number } | null>(null);
  const [more, setMore] = useState<{ start: boolean; end: boolean }>({ start: false, end: false });
  const [armed, setArmed] = useState(false); // rows animate in only after the first paint

  useEffect(() => { setArmed(true); }, []);

  /* ---- time */
  const live = state === 'running' || state === 'waiting';
  const now = useNow(live);
  const lastLive = useRef(now);
  if (live) lastLive.current = now;
  const t = live ? now : (until ?? lastLive.current);
  const elapsed = Math.max(0, t - (since ?? t) - pausedFor);

  /* ---- steps */
  const running = steps.find((s) => s.state === 'running');
  const settledSteps = steps.filter((s) => s.state === 'done' || s.state === 'failed');
  const rows = useMemo(() => [...settledSteps].reverse(), [settledSteps.map((s) => s.id + s.state + (s.took ?? '')).join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = steps.length;
  const doneCount = settledSteps.length;
  const currentLabel = current?.label ?? running?.label ?? '';
  const currentIcon = current ? stepIcon(current) : running ? stepIcon(running) : null;
  const runSince = useRef<number>(t);
  if (running?.since != null) runSince.current = running.since;
  else if (!running) runSince.current = t;

  const segs = useMemo<Seg[]>(() => {
    const out: Seg[] = settledSteps.map((s) => ({ id: s.id, ms: Math.max(120, s.took ?? 1000), kind: s.state === 'failed' ? 'failed' : 'done' }));
    if (running) {
      if (state === 'waiting') out.push({ id: running.id, ms: 0, kind: 'wait' });
      else if (state === 'paused') out.push({ id: running.id, ms: Math.max(120, t - runSince.current), kind: 'hold' });
      else out.push({ id: running.id, ms: 0, kind: 'run' });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settledSteps.map((s) => s.id + s.state + (s.took ?? '')).join('|'), running?.id, state, state === 'paused' ? t : 0]);

  /* the running bar grows live, written straight to the DOM each frame */
  useEffect(() => {
    if (state !== 'running' || folded) return;
    let raf = 0;
    const tick = () => {
      const seg = stripRef.current?.querySelector<HTMLElement>('[data-run]');
      if (seg) seg.style.flexGrow = String(Math.max(120, Date.now() - runSince.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state, folded, running?.id]);

  /* ---- fade at the edge of the list that has more */
  const measureList = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const start = el.scrollTop > 1;
    const end = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    setMore((m) => (m.start === start && m.end === end ? m : { start, end }));
  }, []);
  useLayoutEffect(() => { measureList(); }, [rows.length, measureList]);
  useEffect(() => {
    const el = listRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measureList());
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows.length > 0, measureList]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- fold: the card turns into the bar and back, the size easing in between */
  const sizeRef = useRef<{ w: number; h: number } | null>(null);
  const foldedPrev = useRef(folded);
  useEffect(() => {
    const el = root.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((e) => {
      const b = e[0].borderBoxSize?.[0];
      if (b && !el.classList.contains('mon-morph')) sizeRef.current = { w: b.inlineSize, h: b.blockSize };
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [folded]);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const prev = sizeRef.current;
    if (foldedPrev.current !== folded) {
      foldedPrev.current = folded;
      if (prev && !reduced) {
        const r = el.getBoundingClientRect();
        el.classList.add('mon-morph');
        const a = el.animate(
          [{ inlineSize: `${prev.w}px`, blockSize: `${prev.h}px` }, { inlineSize: `${r.width}px`, blockSize: `${r.height}px` }],
          { duration: 360, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        );
        const done = () => { el.classList.remove('mon-morph'); sizeRef.current = { w: r.width, h: r.height }; };
        a.onfinish = done;
        a.oncancel = done;
      }
    }
  }, [folded]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (focusAfterFold.current === 'fold') foldBtn.current?.focus();
    if (focusAfterFold.current === 'bar') barBtn.current?.focus();
    focusAfterFold.current = null;
  }, [folded]);

  const setFold = (v: boolean) => {
    setInfo(null);
    setHover(null);
    focusAfterFold.current = v ? 'bar' : 'fold';
    setFolded(v);
  };

  /* ---- hover pairs and the info card */
  const rowEl = (id: string) => listRef.current?.querySelector<HTMLElement>(`[data-row="${CSS.escape(id)}"]`) ?? null;

  const revealRow = (id: string, smooth: boolean) => {
    const list = listRef.current;
    const row = rowEl(id);
    if (!list || !row) return;
    const top = row.offsetTop;
    const bottom = top + row.offsetHeight;
    if (top < list.scrollTop) list.scrollTo({ top, behavior: smooth && !reduced ? 'smooth' : 'auto' });
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTo({ top: bottom - list.clientHeight, behavior: smooth && !reduced ? 'smooth' : 'auto' });
  };

  const place = (id: string): number => {
    const host = root.current;
    const row = rowEl(id);
    if (!host) return 0;
    const h = host.getBoundingClientRect();
    if (row) return row.getBoundingClientRect().bottom - h.top + 8;
    const l = listRef.current?.getBoundingClientRect();
    return (l ? l.bottom - h.top : h.height) + 8;
  };

  const openInfo = (id: string, from: HTMLElement | null) => {
    revealRow(id, false);
    returnTo.current = from;
    focusInfo.current = true;
    setInfo({ id, top: place(id) });
  };
  const closeInfo = (focusBack: boolean) => {
    setInfo(null);
    if (focusBack) {
      const el = returnTo.current && returnTo.current.isConnected ? returnTo.current : null;
      requestAnimationFrame(() => el?.focus());
    }
  };
  const toggleInfo = (id: string, from: HTMLElement | null) => (info?.id === id ? closeInfo(false) : openInfo(id, from));

  const focusInfo = useRef(false);
  const didDefault = useRef(false);
  useLayoutEffect(() => {
    if (didDefault.current || !defaultOpenId || folded) return;
    didDefault.current = true;
    if (steps.some((s) => s.id === defaultOpenId)) setInfo({ id: defaultOpenId, top: place(defaultOpenId) });
  });

  // keep the card under its row when the list changes under it
  useLayoutEffect(() => {
    if (!info) return;
    const top = place(info.id);
    if (Math.abs(top - info.top) > 0.5) setInfo({ id: info.id, top });
  });

  useEffect(() => {
    if (!info) return;
    if (focusInfo.current) closeBtn.current?.focus({ preventScroll: true });
    focusInfo.current = false;
    const down = (e: PointerEvent) => {
      const tg = e.target as Element | null;
      if (!tg) return;
      if (infoRef.current?.contains(tg)) return;
      if (tg.closest('[data-step-id]')) return;
      setInfo(null);
    };
    document.addEventListener('pointerdown', down);
    return () => document.removeEventListener('pointerdown', down);
  }, [info?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (info && !steps.some((s) => s.id === info.id)) setInfo(null); }, [steps, info]);

  const onSegEnter = (id: string) => { setHover(id); revealRow(id, true); };

  /* ---- keyboard on the card */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.defaultPrevented) return;
    if (e.key === 'Escape') {
      if (info) { e.preventDefault(); closeInfo(true); return; }
      if (state === 'waiting' && onDecline && !folded) { e.preventDefault(); onDecline(); }
    } else if (e.key === 'Enter' && state === 'waiting' && onAllow && !folded) {
      const tg = e.target as HTMLElement;
      if (!tg.closest('button, a, input, textarea, [role="button"]')) { e.preventDefault(); onAllow(); }
    }
  };

  /* ---- derived labels */
  const stateText = L[state];
  const hot = hover ?? info?.id ?? null;
  const busy = state === 'running';
  const headName = agent.name;
  const a11yName = `${headName}، ${stateText}${currentLabel && (state === 'running' || state === 'waiting' || state === 'paused') ? `، ${currentLabel}` : ''}`;

  const timelineLabel = `${L.timeline}: ${segs.map((s) => {
    const st = steps.find((x) => x.id === s.id);
    return `${st?.label ?? ''}${st?.took != null ? ` ${tookText(st.took, L)}` : ''}`;
  }).join('، ')}`;

  const totalMs = useMemo(
    () => settledSteps.reduce((a, s) => a + (s.took ?? 0), 0) + (running ? Math.max(0, t - runSince.current) : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settledSteps.map((s) => s.took ?? 0).join('|'), running?.id, state === 'running' ? 0 : t],
  );

  /* ---- tools used (folded bar) */
  const tools = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, { key: string; icon: ReactNode; last: AgentRunStep }>();
    for (const s of steps) {
      if (s.state === 'queued') continue;
      const key = s.tool ?? s.kind ?? s.id;
      if (!map.has(key)) order.push(key);
      map.set(key, { key, icon: stepIcon(s), last: s });
    }
    return order.map((k) => map.get(k)!);
  }, [steps]);
  const activeTool = running ? (running.tool ?? running.kind ?? running.id) : null;
  const shownTools = tools.slice(-4);
  const hiddenTools = tools.length - shownTools.length;

  /* ================================================================ folded bar */
  if (folded) {
    const tag: { k: string; node: ReactNode } = (() => {
      switch (state) {
        case 'waiting': return { k: 'waiting', node: <span className="mon-tag" data-tone="warn"><TriangleAlert size={14} strokeWidth={1.75} aria-hidden="true" />{L.waiting}</span> };
        case 'finished': return { k: 'finished', node: <span className="mon-tag" data-tone="ok" aria-label={L.finished}><Check size={14} strokeWidth={2} aria-hidden="true" /></span> };
        case 'failed': return { k: 'failed', node: <span className="mon-tag" data-tone="bad"><X size={14} strokeWidth={2} aria-hidden="true" />{L.failed}</span> };
        case 'cancelled': return { k: 'cancelled', node: <span className="mon-tag" data-tone="mute">{L.cancelled}</span> };
        case 'idle': return { k: 'idle', node: <span className="mon-tag" data-tone="mute">{L.idle}</span> };
        default: if (!showClock) return { k: 'state', node: <span className="mon-tag" data-tone="mute">{stateText}</span> };
          return { k: 'clock', node: busy ? <span className="mon-shm mon-clock" dir="ltr">{clock(elapsed)}</span> : <span className="mon-clock" dir="ltr" data-still>{clock(elapsed)}</span> };
      }
    })();
    return (
      <div ref={root} className={cx('mon', className)} data-folded="" data-state={state} role="region" aria-label={a11yName}>
        <button
          ref={barBtn}
          type="button"
          className="mon-bar"
          aria-label={`${a11yName}، ${L.unfold}`}
          onClick={() => setFold(false)}
        >
          <Tile size={27} className="mon-avatar">{agent.mark ?? <span className="mon-letter">{headName.slice(0, 1)}</span>}</Tile>
          <span className="mon-name mon-name-bar">{headName}</span>
          {tools.length ? (
            <span className="mon-stack" aria-hidden="true">
              {hiddenTools > 0 ? <span className="mon-more">+{faNum(hiddenTools)}</span> : null}
              {shownTools.map((tl, i) => {
                const isLive = activeTool === tl.key;
                const last = tl.last;
                return (
                  <span key={tl.key} className="mon-stack-i" data-live={isLive || undefined} data-warn={(isLive && state === 'waiting') || undefined} style={{ zIndex: i + 1 }}>
                    <Tile size={23}>{tl.icon}</Tile>
                    <span className="mon-pop" role="presentation">
                      {last.label}{last.took != null ? ` · ${tookText(last.took, L)}` : ''}
                    </span>
                  </span>
                );
              })}
            </span>
          ) : null}
          <Swap k={tag.k} glide className="mon-bar-end">{tag.node}</Swap>
        </button>
      </div>
    );
  }

  /* ================================================================ the card */
  const pillTone = state === 'running' ? 'info' : state === 'waiting' ? 'warn' : state === 'finished' ? 'ok' : state === 'failed' ? 'bad' : 'mute';
  const hasCost = cost != null && state !== 'idle';

  const wellKey = `${state}:${state === 'running' || state === 'paused' ? running?.id ?? '' : ''}`;
  const wellTone = state === 'waiting' ? 'warn' : state === 'idle' || state === 'paused' || state === 'cancelled' ? 'quiet' : 'base';

  const wellBody: ReactNode = (() => {
    switch (state) {
      case 'idle':
        return <span className="mon-well-text" data-quiet>{L.noTask}</span>;
      case 'running':
        return (
          <>
            {currentIcon ? <Tile size={24}>{currentIcon}</Tile> : null}
            <span className="mon-well-text mon-shm">{currentLabel || L.preparing}</span>
          </>
        );
      case 'waiting':
        return (
          <>
            {(ask?.icon ?? currentIcon) ? <Tile size={24}>{ask?.icon ?? currentIcon}</Tile> : null}
            <span className="mon-well-title">{ask?.title ?? currentLabel}</span>
            {ask?.command ? <code className="mon-cmd" dir="ltr" title={ask.command}>{ask.command}</code> : <span className="mon-grow" />}
          </>
        );
      case 'paused':
        return (
          <>
            <span className="mon-well-text mon-well-flat" data-quiet>{L.pausedWord}{currentLabel ? ` · ${currentLabel}` : ''}</span>
          </>
        );
      case 'finished': {
        const bits: string[] = [];
        if (outcome?.added != null || outcome?.removed != null) bits.push(`+${faNum(outcome?.added ?? 0)} −${faNum(outcome?.removed ?? 0)} ${L.lines}`);
        if (outcome?.files != null) bits.push(`${faNum(outcome.files)} ${L.filesWord}`);
        if (outcome?.note) bits.unshift(outcome.note);
        return (
          <span className="mon-well-text mon-well-flat">
            <b>{L.finishedIn(span(elapsed, L))}</b>
            {bits.length ? <span className="mon-well-note">{bits.join(' · ')}</span> : null}
          </span>
        );
      }
      case 'failed':
        return (
          <>
            <span className="mon-fdot" aria-hidden="true" />
            <span className="mon-well-text">{error ?? L.couldNotFinish}</span>
          </>
        );
      case 'cancelled':
        return <span className="mon-well-text mon-well-flat" data-quiet>{L.cancelledAfter(span(elapsed, L))}</span>;
    }
  })();

  const hasClock = showClock && (state === 'running' || state === 'waiting' || state === 'paused' || state === 'failed');

  const controls: { k: string; node: ReactNode } = (() => {
    if (state === 'running') {
      return { k: 'run', node: (
        <>
          {onPause ? <button type="button" className="mon-btn" onClick={onPause}><Pause size={10} strokeWidth={2.25} aria-hidden="true" />{L.pause}</button> : null}
          {onCancel ? <button type="button" className="mon-btn" onClick={onCancel}><X size={10} strokeWidth={2.25} aria-hidden="true" />{L.cancel}</button> : null}
        </>
      ) };
    }
    if (state === 'paused') {
      return { k: 'paused', node: (
        <>
          {onResume ? <button type="button" className="mon-btn" onClick={onResume}><Play size={10} strokeWidth={2.25} aria-hidden="true" />{L.resume}</button> : null}
          {onCancel ? <button type="button" className="mon-btn" onClick={onCancel}><X size={10} strokeWidth={2.25} aria-hidden="true" />{L.cancel}</button> : null}
        </>
      ) };
    }
    if (state === 'waiting') {
      return { k: 'wait', node: (
        <>
          {onDecline ? <button type="button" className="mon-btn mon-btn-quiet" onClick={onDecline}>{L.decline}<kbd className="mon-kbd" aria-hidden="true">{L.esc}</kbd></button> : null}
          {onAllow ? <button type="button" className="mon-btn mon-btn-solid" onClick={onAllow}>{L.allow}<kbd className="mon-kbd" aria-hidden="true"><CornerDownLeft size={11} strokeWidth={2} /></kbd></button> : null}
        </>
      ) };
    }
    if (state === 'failed' && onRetry) {
      return { k: 'failed', node: <button type="button" className="mon-btn mon-btn-solid" onClick={onRetry}><RotateCcw size={12} strokeWidth={2} aria-hidden="true" />{L.retry}</button> };
    }
    return { k: 'none', node: null };
  })();

  const hasList = rows.length > 0 && state !== 'idle';
  const hasStrip = segs.length > 0 && state !== 'idle';
  const stripTone = state === 'finished' ? 'ok' : state === 'failed' || state === 'cancelled' ? 'end' : 'live';
  const showCount = total > 0 && state !== 'idle';
  const shownCount = Math.min(total, doneCount + (running ? 1 : 0));
  const infoStep = info ? steps.find((s) => s.id === info.id) : undefined;
  const infoId = `${uid}-info`;

  /* the info card's numbers */
  const infoNums = (() => {
    if (!infoStep) return null;
    let start = 0;
    if (infoStep.since != null && since != null) start = Math.max(0, infoStep.since - since - pausedFor);
    else {
      for (const s of steps) { if (s.id === infoStep.id) break; if (s.state === 'done' || s.state === 'failed') start += s.took ?? 0; }
    }
    const took = infoStep.took ?? (infoStep.state === 'running' ? Math.max(0, t - runSince.current) : 0);
    const share = totalMs > 0 ? Math.round((took / totalMs) * 100) : 0;
    const st = infoStep.state === 'done' ? L.stepDone : infoStep.state === 'failed' ? L.stepFailedWord : infoStep.state === 'running' ? L.stepRunning : L.stepQueued;
    return { start, took, share, st };
  })();

  return (
    <div
      ref={root}
      className={cx('mon', className)}
      data-state={state}
      role="region"
      aria-label={a11yName}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onMouseLeave={() => setHover(null)}
    >
      {/* ---- head */}
      <div className="mon-head">
        <Tile size={26} className="mon-avatar">{agent.mark ?? <span className="mon-letter">{headName.slice(0, 1)}</span>}</Tile>
        <div className="mon-who">
          <span className="mon-name">{headName}</span>
          {agent.role ? <span className="mon-role">{agent.role}</span> : null}
        </div>
        {hasCost ? (
          <span className={cx('mon-cost', busy && 'mon-shm')} dir="ltr" role="img" aria-label={`${L.cost}: ${(cost as number).toLocaleString('fa-IR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${L.dollars}`}>
            {usd(cost as number)}
          </span>
        ) : null}
        <Swap k={state} mode="roll" glide className="mon-pill-box">
          <span className="mon-pill" data-tone={pillTone}><i aria-hidden="true" />{stateText}</span>
        </Swap>
        <button ref={foldBtn} type="button" className="mon-fold" aria-label={L.fold} title={L.fold} onClick={() => setFold(true)}>
          <ChevronsDownUp size={14} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      {/* ---- well */}
      <div className="mon-well" data-tone={wellTone} aria-live="polite">
        <Swap k={wellKey} mode="roll" block className="mon-well-sw">
          <span className="mon-well-in">{wellBody}</span>
        </Swap>
        <Swap k={hasClock ? 'on' : 'off'} mode="fade" className="mon-well-clock">
          {hasClock ? <span className="mon-well-time" dir="ltr">{clock(elapsed)}</span> : null}
        </Swap>
      </div>

      {/* ---- time strip */}
      <Collapse open={hasStrip}>
        <div
          ref={stripRef}
          className="mon-strip"
          data-tone={stripTone}
          data-hot={hot ? '' : undefined}
          role="img"
          aria-label={timelineLabel}
        >
          {segs.map((s) => (
            <span
              key={s.id}
              className="mon-seg"
              data-kind={s.kind}
              data-id={s.id}
              data-lit={hot === s.id || undefined}
              data-run={s.kind === 'run' ? '' : undefined}
              data-step-id={s.kind === 'done' || s.kind === 'failed' ? s.id : undefined}
              style={s.kind === 'wait' ? undefined : s.kind === 'run' ? undefined : { flexGrow: s.ms }}
              onMouseEnter={s.kind === 'done' || s.kind === 'failed' ? () => onSegEnter(s.id) : undefined}
              onMouseLeave={s.kind === 'done' || s.kind === 'failed' ? () => setHover(null) : undefined}
              onClick={s.kind === 'done' || s.kind === 'failed' ? () => {
                toggleInfo(s.id, rowEl(s.id)?.querySelector('button') ?? null);
              } : undefined}
            />
          ))}
        </div>
      </Collapse>

      {/* ---- finished rows */}
      <Collapse open={hasList}>
        <ul
          ref={listRef}
          className="mon-list"
          data-more={more.start && more.end ? 'both' : more.start ? 'start' : more.end ? 'end' : undefined}
          data-hot={hot ? '' : undefined}
          aria-label={L.doneSteps}
          tabIndex={more.start || more.end ? 0 : undefined}
          onScroll={measureList}
        >
          {rows.map((s) => (
            <li key={s.id} className="mon-li" data-row={s.id} data-fresh={armed || undefined}>
              <button
                type="button"
                className="mon-row"
                data-step-id={s.id}
                data-lit={hot === s.id || undefined}
                data-failed={s.state === 'failed' || undefined}
                aria-expanded={info?.id === s.id}
                aria-controls={info?.id === s.id ? infoId : undefined}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setHover(s.id); }}
                onBlur={() => setHover(null)}
                onClick={(e) => toggleInfo(s.id, e.currentTarget)}
              >
                <Tile size={18}>{stepIcon(s)}</Tile>
                <span className="mon-row-label">{s.label}</span>
                <span className="mon-row-time">{s.state === 'failed' ? L.stepFailed : s.took != null ? tookText(s.took, L) : ''}</span>
              </button>
            </li>
          ))}
        </ul>
      </Collapse>

      {/* ---- foot */}
      {controls.node || showCount || onOpenLog ? (
        <div className="mon-foot">
          <Swap k={controls.k} glide className="mon-controls">
            <span className="mon-controls-in">{controls.node}</span>
          </Swap>
          {showCount ? <span className="mon-count" dir="ltr" aria-label={`${faNum(shownCount)} / ${faNum(total)}`}>{faNum(shownCount)}/{faNum(total)}</span> : null}
          {onOpenLog ? (
            <button type="button" className="mon-log" onClick={onOpenLog}>
              {L.log}
              <ArrowUpLeft size={12} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}

      {/* ---- info card */}
      {info && infoStep && infoNums ? (
        <div
          ref={infoRef}
          id={infoId}
          className="mon-info"
          role="dialog"
          aria-label={infoStep.label}
          style={{ insetBlockStart: info.top }}
        >
          <div className="mon-info-head">
            <Tile size={26}>{stepIcon(infoStep)}</Tile>
            <div className="mon-info-who">
              <span className="mon-info-title">{infoStep.label}</span>
              {infoStep.tool ? <span className="mon-info-tool">{infoStep.tool}</span> : null}
            </div>
            <button ref={closeBtn} type="button" className="mon-info-x" aria-label={L.close} onClick={() => closeInfo(true)}>
              <X size={14} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
          <dl className="mon-stats">
            <div><dt>{L.started}</dt><dd dir="ltr">+{clock(infoNums.start)}</dd></div>
            <div><dt>{L.tookWord}</dt><dd>{infoStep.took != null || infoStep.state === 'running' ? tookText(infoNums.took, L) : '—'}</dd></div>
            <div><dt>{L.share}</dt><dd>{faNum(infoNums.share)}٪</dd></div>
            <div><dt>{L.state}</dt><dd>{infoNums.st}</dd></div>
          </dl>
          {infoStep.detail ? <p className="mon-info-detail">{infoStep.detail}</p> : null}
          {infoStep.output ? <code className="mon-info-out" dir="ltr">{infoStep.output}</code> : null}
        </div>
      ) : null}
    </div>
  );
}
