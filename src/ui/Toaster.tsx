import {
  isValidElement, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore,
  type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode,
} from 'react';
import { X } from 'lucide-react';

/* ------------------------------------------------------------------ types */

export type ToastKind = 'default' | 'success' | 'error' | 'info' | 'loading';
export type ToastId = string | number;

export interface ToastAction {
  label: ReactNode;
  /** Closes the toast afterwards, unless the handler calls event.preventDefault(). */
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}

export interface ToastOptions {
  /** Re-using an id updates that toast in place: timer restarts, text crossfades. */
  id?: ToastId;
  description?: ReactNode;
  action?: ToastAction;
  /** ms on screen; Infinity keeps it open. Default comes from <Toaster duration>. */
  duration?: number;
  /** Custom icon; `false` hides the icon. */
  icon?: ReactNode | false;
  /** Send to the <Toaster id="..."> with this id. */
  toaster?: string;
  onDismiss?: (id: ToastId) => void;
}

type PromiseMsg<T> = ReactNode | { title: ReactNode; description?: ReactNode } | ((value: T) => ReactNode | { title: ReactNode; description?: ReactNode });

export interface ToastPromiseMessages<T> {
  loading: ReactNode;
  success?: PromiseMsg<T>;
  error?: PromiseMsg<unknown>;
}

interface Rec {
  id: ToastId;
  kind: ToastKind;
  title: ReactNode;
  description?: ReactNode;
  action?: ToastAction;
  duration?: number;
  icon?: ReactNode | false;
  toaster?: string;
  onDismiss?: (id: ToastId) => void;
  epoch: number;
  seq: number;
  leaving: boolean;
}

/* ------------------------------------------------------------------ store (module level, no context) */

const EXIT_MS = 340;

let recs: Rec[] = [];
let seqN = 0;
let autoId = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};
const getSnapshot = () => recs;

function upsert(kind: ToastKind, title: ReactNode, opts: ToastOptions = {}): ToastId {
  const id = opts.id ?? `tsc-${++autoId}`;
  const live = recs.find((r) => r.id === id && !r.leaving);
  if (live) {
    recs = recs.map((r) => (r === live ? {
      ...r, kind, title,
      description: opts.description, action: opts.action, duration: opts.duration, icon: opts.icon,
      toaster: opts.toaster ?? r.toaster, onDismiss: opts.onDismiss ?? r.onDismiss,
      epoch: r.epoch + 1,
    } : r));
  } else {
    recs = [...recs.filter((r) => r.id !== id), {
      id, kind, title, description: opts.description, action: opts.action, duration: opts.duration,
      icon: opts.icon, toaster: opts.toaster, onDismiss: opts.onDismiss, epoch: 0, seq: ++seqN, leaving: false,
    }];
  }
  emit();
  return id;
}

function dismiss(id?: ToastId) {
  const targets = recs.filter((r) => !r.leaving && (id === undefined || r.id === id));
  if (!targets.length) return;
  recs = recs.map((r) => (targets.includes(r) ? { ...r, leaving: true } : r));
  emit();
  targets.forEach((t) => {
    try { t.onDismiss?.(t.id); } catch { /* a faulty callback must not block the exit */ }
    window.setTimeout(() => {
      const cur = recs.find((r) => r.id === t.id);
      if (!cur || !cur.leaving) return; // re-used meanwhile
      recs = recs.filter((r) => r !== cur);
      emit();
    }, EXIT_MS);
  });
}

function norm<T>(m: PromiseMsg<T> | undefined, v: T, fallback: ReactNode): { title: ReactNode; description?: ReactNode } {
  const r = typeof m === 'function' ? (m as (x: T) => ReactNode | { title: ReactNode; description?: ReactNode })(v) : m;
  if (r === undefined || r === null || r === false) return { title: fallback };
  if (typeof r === 'object' && !isValidElement(r) && 'title' in (r as object)) {
    return r as { title: ReactNode; description?: ReactNode };
  }
  return { title: r as ReactNode };
}

function promise<T>(p: Promise<T> | (() => Promise<T>), msgs: ToastPromiseMessages<T>, opts: Omit<ToastOptions, 'description'> = {}): ToastId {
  const id = upsert('loading', msgs.loading, { ...opts });
  const run = typeof p === 'function' ? p() : p;
  run.then(
    (v) => {
      const m = norm(msgs.success, v, 'Done');
      upsert('success', m.title, { ...opts, id, description: m.description });
    },
    (e) => {
      const m = norm(msgs.error, e, e instanceof Error ? e.message : 'Error');
      upsert('error', m.title, { ...opts, id, description: m.description });
    },
  );
  return id;
}

const base = (title: ReactNode, opts?: ToastOptions) => upsert('default', title, opts);

export const toast = Object.assign(base, {
  success: (title: ReactNode, opts?: ToastOptions) => upsert('success', title, opts),
  error: (title: ReactNode, opts?: ToastOptions) => upsert('error', title, opts),
  info: (title: ReactNode, opts?: ToastOptions) => upsert('info', title, opts),
  loading: (title: ReactNode, opts?: ToastOptions) => upsert('loading', title, { duration: Infinity, ...opts }),
  promise,
  dismiss,
});

/* ------------------------------------------------------------------ icon */

function ToastIcon({ kind }: { kind: ToastKind }) {
  // The spin keeps running while the ring closes, so the arc grows into a circle without a jump;
  // it is switched off a moment after the morph has settled.
  const loading = kind === 'loading';
  const [spin, setSpin] = useState(loading);
  useEffect(() => {
    if (loading) { setSpin(true); return; }
    const t = window.setTimeout(() => setSpin(false), 700);
    return () => window.clearTimeout(t);
  }, [loading]);
  return (
    <svg className="tsc-ico" data-kind={kind} viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <g className="tsc-ring-g" data-spin={spin ? 'true' : 'false'}>
        <circle className="tsc-ring" cx="10" cy="10" r="8.25" pathLength="100" />
      </g>
      <path className="tsc-glyph tsc-g-check" d="M6.3 10.4l2.5 2.5 4.9-5.3" pathLength="100" />
      <path className="tsc-glyph tsc-g-bang" d="M10 5.9v4.7M10 13.8v.01" pathLength="100" />
      <path className="tsc-glyph tsc-g-info" d="M10 9.3v4.8M10 6.2v.01" pathLength="100" />
    </svg>
  );
}

/* ------------------------------------------------------------------ one toast */

interface ItemLayout {
  ty: number; sc: number; h: number; i: number; peek: boolean; hidden: boolean; z: number;
}

const SWIPE_DISTANCE = 80;
const SWIPE_SPEED = 0.5;

function ToastItem({ rec, layout, ready, duration, paused, hairline, closeButton, closeLabel, edgeSign, onMeasure, onDrag, onReady }: {
  rec: Rec;
  layout: ItemLayout;
  ready: boolean;
  duration: number;
  paused: boolean;
  hairline: boolean;
  closeButton: boolean;
  closeLabel: string;
  edgeSign: 1 | -1;
  onMeasure: (id: ToastId, h: number) => void;
  onDrag: (on: boolean) => void;
  onReady: (id: ToastId) => void;
}) {
  const { id, kind, title, description, action, epoch, leaving, icon } = rec;
  const liRef = useRef<HTMLLIElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<HTMLDivElement>(null);

  // measure the natural height of the content, before paint
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    onMeasure(id, el.offsetHeight);
    const ro = new ResizeObserver(() => onMeasure(id, el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [id, onMeasure]);

  // enter: first paint in the "from" state, then flip after a forced style flush
  useLayoutEffect(() => {
    liRef.current?.getBoundingClientRect();
    onReady(id);
  }, [id, onReady]);

  /* timer: restarts on update (epoch), pauses with the stack */
  const remaining = useRef(duration);
  const seenEpoch = useRef(epoch);
  const seenDur = useRef(duration);
  useEffect(() => {
    if (seenEpoch.current !== epoch || seenDur.current !== duration) {
      seenEpoch.current = epoch; seenDur.current = duration; remaining.current = duration;
    }
    if (leaving || paused || !Number.isFinite(remaining.current)) return;
    const started = performance.now();
    const t = window.setTimeout(() => dismiss(id), Math.max(0, remaining.current));
    return () => {
      window.clearTimeout(t);
      remaining.current -= performance.now() - started;
    };
  }, [paused, leaving, epoch, duration, id]);

  /* text crossfade when the toast is updated by id */
  const textNode = (
    <>
      <div className="tsc-title">{title}</div>
      {description ? <div className="tsc-desc">{description}</div> : null}
    </>
  );
  const prev = useRef<{ epoch: number; node: ReactNode }>({ epoch, node: textNode });
  const [old, setOld] = useState<{ key: number; node: ReactNode } | null>(null);
  useLayoutEffect(() => {
    if (prev.current.epoch === epoch) return;
    setOld({ key: prev.current.epoch, node: prev.current.node });
    prev.current = { epoch, node: textNode };
    const t = window.setTimeout(() => setOld(null), 340);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epoch]);

  /* swipe to dismiss: sideways, or toward the stack's edge (pointer events, touch and pen) */
  const drag = useRef<{ pid: number; x0: number; y0: number; t0: number; axis: 'x' | 'y' | null; dx: number; dy: number } | null>(null);
  const moved = useRef(false);

  const setSwipe = (x: number, y: number, o: number) => {
    const s = swipeRef.current;
    if (!s) return;
    s.style.setProperty('--sx', `${x}px`);
    s.style.setProperty('--sy', `${y}px`);
    s.style.setProperty('--so', String(o));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' || !e.isPrimary || leaving) return;
    drag.current = { pid: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), axis: null, dx: 0, dy: 0 };
    moved.current = false;
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pid !== e.pointerId) return;
    d.dx = e.clientX - d.x0; d.dy = e.clientY - d.y0;
    if (!d.axis) {
      if (Math.abs(d.dx) < 7 && Math.abs(d.dy) < 7) return;
      d.axis = Math.abs(d.dx) >= Math.abs(d.dy) ? 'x' : 'y';
      swipeRef.current?.setPointerCapture(e.pointerId);
      swipeRef.current?.setAttribute('data-dragging', 'true');
      onDrag(true);
    }
    moved.current = true;
    if (d.axis === 'x') {
      setSwipe(d.dx, 0, Math.max(0.25, 1 - Math.abs(d.dx) / 320));
    } else {
      const toward = d.dy * edgeSign > 0; // toward the stack's own edge
      const y = toward ? d.dy : d.dy * 0.15; // resist the opposite way
      setSwipe(0, y, toward ? Math.max(0.25, 1 - Math.abs(d.dy) / 160) : 1);
    }
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.pid !== e.pointerId) return;
    drag.current = null;
    const s = swipeRef.current;
    if (!d.axis) return;
    s?.removeAttribute('data-dragging');
    onDrag(false);
    const dt = Math.max(1, performance.now() - d.t0);
    const dist = d.axis === 'x' ? d.dx : d.dy * edgeSign;
    const speed = Math.abs(dist) / dt;
    const goes = !cancelled && (d.axis === 'x' ? Math.abs(dist) > SWIPE_DISTANCE || speed > SWIPE_SPEED : dist > 40 || (dist > 12 && speed > SWIPE_SPEED));
    if (goes) {
      s?.setAttribute('data-swiped', 'true');
      liRef.current?.setAttribute('data-swiped', 'true');
      if (d.axis === 'x') setSwipe(Math.sign(d.dx || 1) * (window.innerWidth), 0, 0);
      else setSwipe(0, edgeSign * 140, 0);
      dismiss(id);
    } else {
      setSwipe(0, 0, 1);
    }
  };

  const onActionClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    action?.onClick?.(e);
    if (!e.defaultPrevented) dismiss(id);
  };

  const showIcon = icon !== false && (icon != null || kind !== 'default');
  const style = {
    '--ty': `${layout.ty}px`,
    '--sc': layout.sc,
    '--i': layout.i,
    zIndex: layout.z,
    ...(layout.h > 0 ? { '--h': `${layout.h}px` } : null),
  } as CSSProperties;
  const dur = Number.isFinite(duration) ? duration : 0;

  return (
    <li
      ref={liRef}
      className="tsc-toast"
      style={style}
      tabIndex={-1}
      role={kind === 'error' ? 'alert' : undefined}
      data-kind={kind}
      data-ready={ready ? 'true' : 'false'}
      data-front={layout.i === 0 ? 'true' : 'false'}
      data-peek={layout.peek ? 'true' : 'false'}
      data-hidden={layout.hidden ? 'true' : 'false'}
      data-leaving={leaving ? 'true' : 'false'}
      inert={layout.peek || layout.hidden || leaving ? true : undefined}
    >
      <div
        ref={swipeRef}
        className="tsc-swipe"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, false)}
        onPointerCancel={(e) => endDrag(e, true)}
        onClickCapture={(e) => { if (moved.current) { e.stopPropagation(); e.preventDefault(); moved.current = false; } }}
      >
        <div className="tsc-card">
          <div className="tsc-body" ref={bodyRef}>
            {showIcon ? (
              <span className="tsc-icon">{icon != null ? icon : <ToastIcon kind={kind} />}</span>
            ) : null}
            <div className="tsc-text">
              {old ? <div className="tsc-layer" data-swap="out" key={`o${old.key}`} aria-hidden="true">{old.node}</div> : null}
              <div className="tsc-layer" data-swap={epoch > 0 ? 'in' : 'none'} key={`n${epoch}`}>{textNode}</div>
            </div>
            {action ? (
              <button type="button" className="tsc-action" onClick={onActionClick}>{action.label}</button>
            ) : null}
          </div>
          {hairline ? (
            <span
              className="tsc-hair"
              key={epoch}
              data-still={dur === 0 || kind === 'loading' ? 'true' : 'false'}
              style={{ '--dur': `${dur}ms` } as CSSProperties}
              aria-hidden="true"
            />
          ) : null}
        </div>
        {closeButton ? (
          <button type="button" className="tsc-close" aria-label={closeLabel} onClick={() => dismiss(id)}>
            <X size={12} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ toaster */

type PosY = 'top' | 'bottom';
type PosX = 'left' | 'center' | 'right' | 'start' | 'end';
export type ToasterPosition =
  | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

export interface ToasterProps {
  /** Edge/corner the stack sits in; toasts slide in from that edge. Logical start/end follow the page direction. */
  position?: ToasterPosition;
  /** Keep the stack fanned out instead of on hover / focus / tap. */
  expand?: boolean;
  /** Toasts shown at once; older ones wait with a paused timer. */
  visibleToasts?: number;
  /** Space between toasts when fanned out, px. */
  gap?: number;
  /** Distance from the edges, px (phones always use 12px gutters). */
  offset?: number;
  /** Sit inside the nearest positioned ancestor instead of the viewport. */
  inline?: boolean;
  /** Default time on screen, ms. */
  duration?: number;
  /** 1px line along the bottom that runs down with the timer and stops when it pauses. */
  hairline?: boolean;
  closeButton?: boolean;
  /** Region name for screen readers; the hotkey is appended. */
  label?: string;
  /** KeyboardEvent.key or .code that moves focus to the newest toast; null disables. */
  hotkey?: string | null;
  /** Only shows toasts sent with { toaster: id }; without id it shows those sent without one. */
  id?: string;
  className?: string;
  closeLabel?: string;
  dir?: 'rtl' | 'ltr';
}

const PEEK = 11;      // px between the cards peeking behind the front one
const PEEK_SCALE = 0.05;

/** Mount once in App. */
export function Toaster({
  position = 'bottom-center', expand = false, visibleToasts = 3, gap = 10, offset, inline = false,
  duration = 4000, hairline = true, closeButton = true, label = 'اعلان‌ها', hotkey = 'F8',
  id, className, closeLabel = 'بستن', dir = 'rtl',
}: ToasterProps) {
  const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const rootRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [touchOpen, setTouchOpen] = useState(false);
  const [dragging, setDragging] = useState(0);
  const [hiddenTab, setHiddenTab] = useState(() => typeof document !== 'undefined' && document.hidden);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [readyIds, setReadyIds] = useState<Record<string, true>>({});

  const [yRaw, xRaw] = position.split('-') as [PosY, PosX];
  const y: PosY = yRaw === 'top' ? 'top' : 'bottom';
  const x: PosX = xRaw ?? 'center';
  const edgeSign: 1 | -1 = y === 'top' ? -1 : 1; // the edge is up for top stacks, down for bottom ones
  const dirSign = y === 'top' ? 1 : -1;            // the stack grows away from its edge
  const edge = offset ?? (inline ? 20 : 24);

  const V = Math.max(1, Math.floor(visibleToasts));

  const mine = all.filter((r) => r.toaster === id).sort((a, b) => b.seq - a.seq);
  const active = mine.filter((r) => !r.leaving);
  const n = active.length;

  const onMeasure = useCallback((tid: ToastId, h: number) => {
    setHeights((p) => (p[String(tid)] === h ? p : { ...p, [String(tid)]: h }));
  }, []);
  const onReady = useCallback((tid: ToastId) => {
    setReadyIds((p) => (p[String(tid)] ? p : { ...p, [String(tid)]: true }));
  }, []);
  const onDrag = useCallback((on: boolean) => setDragging((c) => Math.max(0, c + (on ? 1 : -1))), []);

  // drop bookkeeping for toasts that are gone
  useEffect(() => {
    const live = new Set(mine.map((r) => String(r.id)));
    setHeights((p) => {
      const keys = Object.keys(p);
      return keys.every((k) => live.has(k)) ? p : Object.fromEntries(keys.filter((k) => live.has(k)).map((k) => [k, p[k]]));
    });
    setReadyIds((p) => {
      const keys = Object.keys(p);
      return keys.every((k) => live.has(k)) ? p : Object.fromEntries(keys.filter((k) => live.has(k)).map((k) => [k, true as const]));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all]);

  // tab hidden: timers wait
  useEffect(() => {
    const on = () => setHiddenTab(document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  // hotkey: jump to the newest toast
  const lastActive = useRef<Element | null>(null);
  useEffect(() => {
    if (!hotkey) return;
    const on = (e: KeyboardEvent) => {
      if (e.key !== hotkey && e.code !== hotkey) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const front = listRef.current?.querySelector<HTMLElement>('.tsc-toast[data-front="true"]:not([data-leaving="true"])');
      if (!front) return;
      e.preventDefault();
      lastActive.current = document.activeElement;
      front.focus();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [hotkey]);

  // touch: a tap opens the stack, a tap outside closes it
  useEffect(() => {
    if (!touchOpen) return;
    const on = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setTouchOpen(false);
    };
    document.addEventListener('pointerdown', on, true);
    return () => document.removeEventListener('pointerdown', on, true);
  }, [touchOpen]);
  useEffect(() => { if (n === 0) { setTouchOpen(false); setHover(false); } }, [n]);
  useEffect(() => {
    // focus left with a removed toast
    if (focus && !rootRef.current?.contains(document.activeElement)) setFocus(false);
  }, [all, focus]);

  const interacting = hover || focus || touchOpen || dragging > 0;
  const fan = expand || interacting;

  /* layout: offsets from measured heights */
  const h = (r: Rec) => heights[String(r.id)] ?? 0;
  const front = active[0];
  const frontH = front ? h(front) : 0;
  const offs: number[] = [];
  let acc = 0;
  active.forEach((r, i) => {
    offs[i] = acc;
    if (i < V) acc += h(r) + gap;
  });
  const shown = Math.min(n, V);
  const expandedTotal = shown ? offs[shown - 1] + h(active[shown - 1]) : 0;
  const collapsedTotal = shown ? frontH + (shown - 1) * PEEK : 0;
  const listH = fan ? expandedTotal : collapsedTotal;

  const cache = useRef(new Map<string, ItemLayout>());
  const layouts = new Map<string, ItemLayout>();
  active.forEach((r, i) => {
    const slot = Math.min(i, V - 1);
    const hidden = i >= V;
    const own = h(r);
    const l: ItemLayout = fan
      ? { i, peek: false, hidden, z: 100 - i, h: own, sc: hidden ? 1 - slot * PEEK_SCALE : 1, ty: dirSign * (hidden ? offs[slot] : offs[i]) }
      : { i, peek: i > 0, hidden, z: 100 - i, h: i === 0 ? own : frontH, sc: 1 - slot * PEEK_SCALE, ty: dirSign * slot * PEEK };
    layouts.set(String(r.id), l);
  });
  useLayoutEffect(() => { layouts.forEach((v, k) => cache.current.set(k, v)); });
  const gone = new Set(mine.map((r) => String(r.id)));
  cache.current.forEach((_, k) => { if (!gone.has(k)) cache.current.delete(k); });

  const resolveDuration = (r: Rec) => {
    if (r.kind === 'loading') return r.duration ?? Infinity;
    if (r.duration !== undefined) return r.duration;
    return r.kind === 'error' ? Math.max(6000, duration) : duration;
  };

  const region = ['tsc', className].filter(Boolean).join(' ');
  const hk = hotkey ? ` (${hotkey})` : '';
  const regionStyle = {
    '--tsc-offset': `${edge}px`,
    ...(offset != null ? { '--tsc-phone-edge': `${offset}px` } : {}),
    '--tsc-enter': `${dirSign * -36}px`,
  } as CSSProperties;

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'Escape' && rootRef.current?.contains(document.activeElement)) {
      const back = lastActive.current as HTMLElement | null;
      (document.activeElement as HTMLElement | null)?.blur();
      setFocus(false); setTouchOpen(false);
      if (back && typeof back.focus === 'function') back.focus();
    }
  };

  return (
    <section
      ref={rootRef}
      className={region}
      style={regionStyle}
      dir={dir}
      aria-label={`${label}${hk}`}
      aria-live="polite"
      aria-relevant="additions text"
      data-y={y}
      data-x={x}
      data-inline={inline ? 'true' : undefined}
      data-fan={fan ? 'true' : 'false'}
      data-paused={interacting || hiddenTab ? 'true' : 'false'}
      onKeyDown={onKeyDown}
      onFocus={(e) => { if ((e.target as HTMLElement).matches(':focus-visible')) setFocus(true); }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocus(false); }}
    >
      <ol
        ref={listRef}
        className="tsc-list"
        style={{ height: n ? `${listH}px` : 0 }}
        onPointerEnter={(e) => { if (e.pointerType !== 'touch') setHover(true); }}
        onPointerLeave={(e) => { if (e.pointerType !== 'touch') setHover(false); }}
        onPointerUp={(e) => {
          if (e.pointerType !== 'touch' || touchOpen) return;
          if ((e.target as HTMLElement).closest('button')) return;
          setTouchOpen(true);
        }}
      >
        {mine.map((r) => {
          const key = String(r.id);
          const layout = layouts.get(key) ?? cache.current.get(key) ?? { i: 0, ty: 0, sc: 1, h: heights[key] ?? 0, peek: false, hidden: false, z: 0 };
          const hiddenWait = layout.hidden && !r.leaving;
          return (
            <ToastItem
              key={key}
              rec={r}
              layout={r.leaving ? { ...layout, z: 1 } : layout}
              ready={!!readyIds[key]}
              duration={resolveDuration(r)}
              paused={interacting || hiddenTab || hiddenWait || !readyIds[key]}
              hairline={hairline}
              closeButton={closeButton}
              closeLabel={closeLabel}
              edgeSign={edgeSign}
              onMeasure={onMeasure}
              onDrag={onDrag}
              onReady={onReady}
            />
          );
        })}
      </ol>
    </section>
  );
}
