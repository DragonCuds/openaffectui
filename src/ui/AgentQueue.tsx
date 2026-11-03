"use client";

import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject,
} from "react";
import { Bot, Check, Minus, Pause, Play, Plus, RotateCw, Rows3, Sparkles, UserRound, Wrench, X } from "lucide-react";
import { faNum } from "./digits";

/*
 * Agent Queue – the work waiting for your agents and how fast it moves.
 * Jobs drop into a live queue, glide into free worker slots as growing bars and land in
 * Done / Failed; a depth chart shows the backlog build while a rate limit pauses the workers
 * and drain when they resume.
 *
 * Written from scratch after watching the public demo of affectUI's Agent Queue (a Pro
 * component – none of its code was used). Persian copy, RTL, panel tokens, light + dark.
 * Styles live in src/styles/queue.css (imported by ui.css).
 */

export type QueueKind = "llm" | "tool" | "agent" | "human";
export type QueueStatus = "queued" | "running" | "done" | "failed";
export type QueuePriority = "high" | "normal" | "low";

export type QueueJob = {
  id: string;
  name: string;
  kind: QueueKind;
  status: QueueStatus;
  /** Same clock as `now` (epoch ms by default) */
  enqueuedAt: number;
  priority?: QueuePriority;
  startedAt?: number;
  endedAt?: number;
  worker?: string;
  /** 0–1 while it runs */
  progress?: number;
  /** Expected run time in ms – used to estimate progress when `progress` is missing */
  estimate?: number;
  attempt?: number;
  maxAttempts?: number;
  detail?: string;
  icon?: ReactNode;
  error?: string;
};

export type QueueWorker = { id: string; name: string; detail?: string; icon?: ReactNode };
export type QueueRateLimit = { from: number; until: number; label?: string };
/** Legacy name (the old list-with-buttons API is gone) */
export type QueueItem = QueueJob;

export type AgentQueueProps = {
  jobs: QueueJob[];
  workers: QueueWorker[];
  now?: number;
  rateLimits?: QueueRateLimit[];
  paused?: boolean;
  onPausedChange?: (paused: boolean) => void;
  onConcurrencyChange?: (workers: number) => void;
  minConcurrency?: number;
  maxConcurrency?: number;
  /** A depth that means trouble – dashed line on the chart; above it «در انتظار» turns amber */
  backpressure?: number;
  /** How far back the depth chart looks, in ms */
  window?: number;
  totals?: { done?: number; failed?: number };
  openId?: string | null;
  defaultOpenId?: string | null;
  onOpenChange?: (id: string | null, job?: QueueJob) => void;
  onPromote?: (job: QueueJob) => void;
  onCancel?: (job: QueueJob) => void;
  title?: string;
  name?: string;
  className?: string;
};

/* ───────────────────────── copy ───────────────────────── */

const KIND: Record<QueueKind, { label: string; Icon: typeof Sparkles }> = {
  llm: { label: "فراخوانی LLM", Icon: Sparkles },
  tool: { label: "ابزار", Icon: Wrench },
  agent: { label: "زیرعامل", Icon: Bot },
  human: { label: "بازبینی انسانی", Icon: UserRound },
};
const PRIORITY: Record<QueuePriority, string> = { high: "بالا", normal: "عادی", low: "پایین" };
const STATUS: Record<QueueStatus, string> = { queued: "در انتظار", running: "در حال اجرا", done: "انجام شد", failed: "ناموفق" };

const one = (n: number) => n.toLocaleString("fa-IR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
function fmtDur(ms: number): string {
  const s = Math.max(0, ms) / 1000;
  if (s < 10) return `${one(s)} ث`;
  if (s < 60) return `${faNum(Math.round(s))} ث`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${faNum(m)} د${Math.round(s % 60) ? ` و ${faNum(Math.round(s % 60))} ث` : ""}`;
  return `${faNum(Math.floor(m / 60))} س${m % 60 ? ` و ${faNum(m % 60)} د` : ""}`;
}

/* ───────────────────────── time maths ───────────────────────── */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function pausedMs(from: number, to: number, limits: QueueRateLimit[]): number {
  let sum = 0;
  for (const l of limits) sum += Math.max(0, Math.min(to, l.until) - Math.max(from, l.from));
  return sum;
}
/** Run time without the rate-limited stretches */
function runMs(j: QueueJob, now: number, limits: QueueRateLimit[]): number {
  if (j.startedAt == null) return 0;
  const end = j.endedAt ?? now;
  return Math.max(0, end - j.startedAt - pausedMs(j.startedAt, end, limits));
}
function progressOf(j: QueueJob, now: number, limits: QueueRateLimit[]): number {
  if (j.status === "done") return 1;
  if (j.progress != null) return clamp(j.progress, 0, 1);
  const r = runMs(j, now, limits);
  if (j.estimate) return Math.min(0.97, r / j.estimate);
  return Math.min(0.92, 1 - Math.exp(-r / 6000));
}
const prioRank = (p?: QueuePriority) => (p === "high" ? 0 : p === "low" ? 2 : 1);

/* ───────────────────────── small hooks ───────────────────────── */

function usePrefersReduced(): boolean {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(mq.matches);
    const f = () => setR(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return r;
}

function useVisible(ref: RefObject<HTMLElement | null>): boolean {
  const [v, setV] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return v;
}

/** One frame loop: ticks Date.now() while there is work and the queue is on screen, sleeps otherwise */
function useClock(nowProp: number | undefined, active: boolean, ref: RefObject<HTMLElement | null>): number {
  const [t, setT] = useState(() => nowProp ?? Date.now());
  const visible = useVisible(ref);
  useEffect(() => {
    if (nowProp != null || !active || !visible) return;
    let raf = 0, last = 0;
    const loop = (ts: number) => {
      if (ts - last >= 60) { last = ts; setT(Date.now()); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [nowProp, active, visible]);
  return nowProp ?? t;
}

/** Eases a number to its new value */
function useEased(target: number, ms = 480, off = false): number {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (off) { cur.current = target; setV(target); return; }
    const from = cur.current;
    if (from === target) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (ts: number) => {
      const k = clamp((ts - t0) / ms, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      cur.current = from + (target - from) * e;
      setV(cur.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, off]);
  return v;
}

/* ───────────────────────── layout / FLIP ───────────────────────── */

type Rect = { l: number; t: number; w: number; h: number };
/** Position inside `root` from layout only (ignores running transforms) */
function layoutRect(el: HTMLElement, root: HTMLElement): Rect {
  let l = 0, t = 0;
  let cur: HTMLElement | null = el;
  while (cur && cur !== root) {
    l += cur.offsetLeft; t += cur.offsetTop;
    const p = cur.offsetParent as HTMLElement | null;
    cur = p;
  }
  return { l, t, w: el.offsetWidth, h: el.offsetHeight };
}

type FlipRec = { a: number; t: number; w: number; type: string; at: number };

/** Every job element carries data-flip=id and data-flip-t=type; when its place changes it glides there */
function useFlip(rootRef: RefObject<HTMLDivElement | null>, rtl: boolean, reduced: boolean) {
  const prev = useRef(new Map<string, FlipRec>());
  const first = useRef(true);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nowT = performance.now();
    const rr = root.getBoundingClientRect();
    root.querySelectorAll<HTMLElement>("[data-flip]").forEach((el) => {
      const id = el.dataset.flip!;
      const type = el.dataset.flipT || "";
      const r = layoutRect(el, root);
      const p = prev.current.get(id);
      const running = el.getAnimations().length > 0;
      // the start edge (left, or right in RTL) is stable even while the width is being animated
      const a = rtl ? r.l + r.w : r.l;
      const w = running && p ? p.w : r.w;
      if (!reduced && !first.current) {
        if (p && nowT - p.at < 2500 && (p.type !== type || Math.abs(p.a - a) > 0.5 || Math.abs(p.t - r.t) > 0.5 || (!running && Math.abs(p.w - r.w) > 0.5))) {
          let fromA = p.a, fromT = p.t, fromW = p.w;
          if (running) {
            const bb = el.getBoundingClientRect();
            fromT = bb.top - rr.top; fromW = bb.width;
            fromA = rtl ? bb.right - rr.left : bb.left - rr.left;
          }
          el.getAnimations().forEach((x) => x.cancel());
          const toW = el.offsetWidth;
          const dx = fromA - a;
          const dy = fromT - r.t;
          const cross = p.type !== type;
          const fromChip = p.type === "c";
          const wide = !fromChip && Math.abs(fromW - toW) > 1;
          el.animate(
            [
              { transform: `translate(${dx}px, ${dy}px)`, ...(wide ? { width: `${fromW}px` } : {}), ...(fromChip ? { opacity: 0 } : {}) },
              { transform: "translate(0, 0)", ...(wide ? { width: `${toW}px` } : {}), opacity: 1 },
            ],
            { duration: fromChip ? 380 : cross ? 460 : 340, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
        } else if (!p && el.dataset.enter && !running) {
          el.animate(
            [{ opacity: 0, transform: "translateY(-12px) scale(0.94)" }, { opacity: 1, transform: "none" }],
            { duration: 380, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
        }
      }
      prev.current.set(id, { a, t: r.t, w, type, at: nowT });
    });
    first.current = false;
  });
}

/* ───────────────────────── chart ───────────────────────── */

const NICE = [4, 8, 12, 16, 20, 24, 30, 40, 50, 60, 80, 100, 150, 200, 300, 500, 1000];
const niceMax = (v: number) => NICE.find((n) => n >= v * 1.05) ?? Math.ceil(v * 1.05);

type Series = { pts: number[]; peak: number; avg: number };
function buildSeries(jobs: QueueJob[], now: number, win: number, n: number): Series {
  const from = now - win;
  const ev: [number, number][] = [];
  for (const j of jobs) {
    const leave = j.startedAt ?? (j.status === "done" || j.status === "failed" ? j.endedAt : undefined) ?? Infinity;
    if (leave <= from) continue;
    ev.push([j.enqueuedAt, 1]);
    if (leave !== Infinity) ev.push([leave, -1]);
  }
  ev.sort((a, b) => a[0] - b[0]);
  let d = 0, k = 0;
  const pts: number[] = [];
  let peak = 0, sum = 0;
  for (let i = 0; i <= n; i++) {
    const ts = from + (win * i) / n;
    while (k < ev.length && ev[k][0] <= ts) d += ev[k++][1];
    const v = Math.max(0, d);
    pts.push(v); peak = Math.max(peak, v); sum += v;
  }
  return { pts, peak, avg: sum / pts.length };
}

function DepthChart({ jobs, now, win, backpressure, limits, reduced }: {
  jobs: QueueJob[]; now: number; win: number; backpressure?: number; limits: QueueRateLimit[]; reduced: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    setW(el.clientWidth || 600);
    const ro = new ResizeObserver(() => setW(el.clientWidth || 600));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 112;
  const series = useMemo(() => buildSeries(jobs, now, win, clamp(Math.round(w / 4), 40, 240)), [jobs, now, win, w]);
  const target = niceMax(Math.max(series.peak, backpressure ?? 0, 4));
  const scale = useRef(target);
  scale.current = reduced ? target : scale.current + (target - scale.current) * 0.22;
  if (Math.abs(scale.current - target) < 0.02) scale.current = target;
  const S = scale.current;
  const y = (v: number) => H - (clamp(v, 0, S) / S) * H;
  const n = series.pts.length - 1;
  const xs = (i: number) => (i / n) * w;
  const line = series.pts.map((v, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)} ${y(v).toFixed(1)}`).join("");
  const area = `${line}L${w} ${H}L0 ${H}Z`;
  const from = now - win;
  const bands = limits
    .map((l) => ({ a: clamp(((l.from - from) / win) * w, 0, w), b: clamp(((l.until - from) / win) * w, 0, w) }))
    .filter((b) => b.b - b.a > 0.5);
  const last = series.pts[n];
  const summary = `نمودار عمق صف: اکنون ${faNum(last)} کار در انتظار است، اوج ${faNum(series.peak)}، میانگین ${faNum(Math.round(series.avg * 10) / 10)}${bands.length ? `، ${faNum(bands.length)} بازه‌ی محدودیت نرخ` : ""}.`;
  return (
    <div className="ui-agq__chart">
      <div className="ui-agq__axis" aria-hidden="true">
        <span style={{ insetBlockStart: 0 }}>{faNum(target)}</span>
        <span style={{ insetBlockStart: "50%" }}>{faNum(target / 2)}</span>
        <span style={{ insetBlockStart: "100%" }}>{faNum(0)}</span>
      </div>
      <div className="ui-agq__plot" ref={box}>
        <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label={summary} overflow="visible">
          <line x1="0" x2={w} y1="0.5" y2="0.5" className="ui-agq__grid" />
          <line x1="0" x2={w} y1={H - 0.5} y2={H - 0.5} className="ui-agq__grid" />
          {backpressure != null ? <line x1="0" x2={w} y1={y(backpressure)} y2={y(backpressure)} className="ui-agq__bp" /> : null}
          <path d={area} className="ui-agq__area" />
          {bands.map((b, i) => <rect key={i} x={b.a} y="0" width={b.b - b.a} height={H} className="ui-agq__band" />)}
          <path d={line} className="ui-agq__line" fill="none" />
          <circle cx={w} cy={y(last)} r="8" className="ui-agq__halo" />
          <circle cx={w} cy={y(last)} r="3.5" className="ui-agq__dot" />
        </svg>
        <div className="ui-agq__xs" aria-hidden="true">
          <span>{faNum(Math.round(win / 1000))} ث پیش</span>
          <span>اکنون</span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── component ───────────────────────── */

type Ghost = { id: string; job: QueueJob; outcome: "done" | "failed" | "retry"; worker?: string };
const HOLD = { done: 640, failed: 620, retry: 560 };

export function AgentQueue({
  jobs, workers, now: nowProp, rateLimits = [], paused, onPausedChange, onConcurrencyChange,
  minConcurrency = 1, maxConcurrency = 8, backpressure, window: win = 120000, totals,
  openId, defaultOpenId = null, onOpenChange, onPromote, onCancel,
  title = "صف", name, className,
}: AgentQueueProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const doneTile = useRef<HTMLDivElement>(null);
  const failTile = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReduced();
  const [dir, setDir] = useState<"rtl" | "ltr">("rtl");
  useLayoutEffect(() => {
    if (rootRef.current) setDir(getComputedStyle(rootRef.current).direction === "ltr" ? "ltr" : "rtl");
  });
  const rtl = dir === "rtl";

  /* ghosts: a job that just finished stays in its slot for a beat, then flies away */
  const [prevJobs, setPrevJobs] = useState(jobs);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [flights, setFlights] = useState({ done: 0, failed: 0 });
  if (prevJobs !== jobs) {
    setPrevJobs(jobs);
    if (!reduced) {
      const nu = new Map(jobs.map((j) => [j.id, j]));
      const add: Ghost[] = [];
      for (const o of prevJobs) {
        if (o.status !== "running") continue;
        const n = nu.get(o.id);
        if (!n) continue;
        if (n.status === "done") add.push({ id: o.id, job: { ...o, status: "done", endedAt: n.endedAt }, outcome: "done", worker: o.worker });
        else if (n.status === "failed") add.push({ id: o.id, job: { ...o, status: "failed", error: n.error }, outcome: "failed", worker: o.worker });
        else if (n.status === "queued" && (n.attempt ?? 1) > (o.attempt ?? 1)) add.push({ id: o.id, job: { ...o, status: "failed" }, outcome: "retry", worker: o.worker });
      }
      if (add.length) setGhosts((g) => [...g.filter((x) => !add.some((a) => a.id === x.id)), ...add]);
    }
  }

  const limits = rateLimits;
  const queuedAll = jobs.some((j) => j.status === "queued" || j.status === "running");
  const clockActive = queuedAll || ghosts.length > 0 || limits.some((l) => l.until > (nowProp ?? Date.now()));
  const now = useClock(nowProp, clockActive, rootRef);
  const rl = limits.find((l) => l.from <= now && now < l.until);
  const limited = !!rl;

  /* ghost timers */
  const timers = useRef(new Map<string, number>());
  useEffect(() => {
    for (const g of ghosts) {
      if (timers.current.has(g.id)) continue;
      const tid = window.setTimeout(() => {
        timers.current.delete(g.id);
        if (g.outcome !== "retry") launchFlyer(g);
        setGhosts((cur) => cur.filter((x) => x !== g));
      }, HOLD[g.outcome]);
      timers.current.set(g.id, tid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghosts]);
  useEffect(() => () => { timers.current.forEach((t) => clearTimeout(t)); }, []);

  const launchFlyer = (g: Ghost) => {
    const root = rootRef.current;
    const src = root?.querySelector<HTMLElement>(`[data-flip="${CSS.escape(g.id)}"]`);
    const tile = g.outcome === "done" ? doneTile.current : failTile.current;
    if (!root || !src || !tile) return;
    const s = layoutRect(src, root);
    const t = layoutRect(tile, root);
    const fly = document.createElement("div");
    fly.className = `ui-agq__fly ui-agq__fly--${g.outcome}`;
    fly.style.cssText = `left:${s.l}px;top:${s.t}px;width:${s.w}px;height:${s.h}px`;
    root.appendChild(fly);
    const tx = t.l + t.w / 2 - (s.l + s.w / 2);
    const ty = t.t + 26 - (s.t + s.h / 2);
    const key = g.outcome === "done" ? "done" : "failed";
    setFlights((f) => ({ ...f, [key]: f[key] + 1 }));
    const a = fly.animate(
      [
        { transform: "translate(0,0) scale(1,1)", opacity: 0.95 },
        { transform: `translate(${tx * 0.7}px, ${ty * 0.7}px) scale(0.72, 0.8)`, opacity: 0.9, offset: 0.65 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.2, 0.55)`, opacity: 0 },
      ],
      { duration: 360, easing: "cubic-bezier(0.5, 0, 0.75, 0.4)", fill: "forwards" },
    );
    a.onfinish = () => {
      fly.remove();
      setFlights((f) => ({ ...f, [key]: Math.max(0, f[key] - 1) }));
      tile.querySelector<HTMLElement>(".ui-agq__tile-ic")?.animate(
        [{ boxShadow: `0 0 0 0 color-mix(in srgb, var(--ui-agq-${key === "done" ? "ok" : "bad"}) 40%, transparent)` }, { boxShadow: `0 0 0 8px transparent` }],
        { duration: 520, easing: "ease-out" },
      );
    };
  };

  /* derived lists */
  const seenAt = useRef(new Map<string, number>());
  const retryIds = new Set(ghosts.filter((g) => g.outcome === "retry").map((g) => g.id));
  const queued = useMemo(() => {
    const t = performance.now();
    const list = jobs.filter((j) => j.status === "queued" && !retryIds.has(j.id));
    for (const j of list) if (!seenAt.current.has(j.id)) seenAt.current.set(j.id, t);
    // a high-priority job lands at the back first and only then glides past the others
    const eff = (j: QueueJob) => (t - (seenAt.current.get(j.id) ?? 0) > 520 || reduced ? prioRank(j.priority) : 1);
    return list.sort((a, b) => eff(a) - eff(b) || a.enqueuedAt - b.enqueuedAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, ghosts, now, reduced]);

  const slots = useMemo(() => {
    const map = new Map<string, { job: QueueJob; ghost?: Ghost }>();
    const running = jobs.filter((j) => j.status === "running");
    for (const g of ghosts) if (g.worker) map.set(g.worker, { job: g.job, ghost: g });
    const loose: QueueJob[] = [];
    for (const j of running) {
      if (j.worker && workers.some((w) => w.id === j.worker) && !map.has(j.worker)) map.set(j.worker, { job: j });
      else if (!ghosts.some((g) => g.id === j.id)) loose.push(j);
    }
    for (const j of loose) {
      const free = workers.find((w) => !map.has(w.id));
      if (free) map.set(free.id, { job: j });
    }
    return map;
  }, [jobs, ghosts, workers]);

  const runningNow = [...slots.values()].filter((s) => !s.ghost).length;
  const doneJobs = jobs.filter((j) => j.status === "done");
  const failedJobs = jobs.filter((j) => j.status === "failed");
  const ghostDone = ghosts.filter((g) => g.outcome === "done").length;
  const ghostFail = ghosts.filter((g) => g.outcome === "failed").length;
  const doneShown = Math.max(0, (totals?.done ?? 0) + doneJobs.length - ghostDone - flights.done);
  const failShown = Math.max(0, (totals?.failed ?? 0) + failedJobs.length - ghostFail - flights.failed);

  const stats = useMemo(() => {
    const spanMin = Math.min(60000, win);
    const doneRecent = doneJobs.filter((j) => (j.endedAt ?? 0) >= now - spanMin).length;
    const waits: number[] = [];
    for (const j of jobs) {
      if (j.startedAt != null && j.startedAt >= now - win) waits.push(j.startedAt - j.enqueuedAt);
      else if (j.status === "queued") waits.push(now - j.enqueuedAt);
    }
    waits.sort((a, b) => a - b);
    const p95 = waits.length ? waits[Math.min(waits.length - 1, Math.floor(waits.length * 0.95))] : 0;
    return { throughput: (doneRecent * 60000) / spanMin, p95 };
  }, [jobs, doneJobs, now, win]);

  const waitingN = queued.length;
  const hot = backpressure != null && waitingN > backpressure;
  const eWait = useEased(waitingN, 380, reduced);
  const eRun = useEased(runningNow, 380, reduced);
  const eTp = useEased(stats.throughput, 600, reduced);
  const eP95 = useEased(stats.p95 / 1000, 600, reduced);
  const eDone = useEased(doneShown, 300, reduced);
  const eFail = useEased(failShown, 300, reduced);

  /* open card */
  const [openLocal, setOpenLocal] = useState<string | null>(defaultOpenId);
  const pinned = openId !== undefined ? openId : openLocal;
  const [hoverId, setHoverId] = useState<string | null>(null);
  const hoverT = useRef(0);
  const byId = useMemo(() => {
    const m = new Map<string, QueueJob>();
    for (const j of jobs) m.set(j.id, j);
    for (const g of ghosts) m.set(g.id, g.job);
    return m;
  }, [jobs, ghosts]);
  const setPinned = useCallback((id: string | null) => {
    if (openId === undefined) setOpenLocal(id);
    onOpenChange?.(id, id ? byId.get(id) : undefined);
  }, [openId, onOpenChange, byId]);
  const cardId = pinned ?? hoverId;
  const cardJob = cardId ? byId.get(cardId) : undefined;

  const hover = (id: string | null, e?: { pointerType?: string }) => {
    if (e?.pointerType && e.pointerType !== "mouse") return;
    window.clearTimeout(hoverT.current);
    if (id) setHoverId(id);
    else hoverT.current = window.setTimeout(() => setHoverId(null), 140);
  };

  useLayoutEffect(() => {
    const root = rootRef.current, pop = popRef.current;
    if (!root || !pop || !cardId) return;
    const anchor = root.querySelector<HTMLElement>(`[data-flip="${CSS.escape(cardId)}"]`);
    if (!anchor) return;
    const r = layoutRect(anchor, root);
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    const rw = root.clientWidth, rh = root.clientHeight;
    let left = rtl ? r.l + r.w - pw : r.l;
    left = clamp(left, 8, Math.max(8, rw - pw - 8));
    let top = r.t + r.h + 6;
    if (top + ph > rh - 8) top = Math.max(8, r.t - ph - 6);
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  });

  /* roving focus */
  const navIds = useMemo(() => {
    const ids: string[] = [];
    for (const w of workers) { const s = slots.get(w.id); if (s) ids.push(s.job.id); }
    for (const j of queued) ids.push(j.id);
    return ids;
  }, [workers, slots, queued]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const activeId = focusId && navIds.includes(focusId) ? focusId : navIds[0];
  const focusJob = (id: string) => {
    setFocusId(id);
    rootRef.current?.querySelector<HTMLElement>(`[data-flip="${CSS.escape(id)}"]`)?.focus();
  };
  const onKey = (e: ReactKeyboardEvent<HTMLElement>) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>("[data-flip]");
    if (!t) return;
    const i = navIds.indexOf(t.dataset.flip!);
    if (i < 0) return;
    const next = rtl ? "ArrowLeft" : "ArrowRight", back = rtl ? "ArrowRight" : "ArrowLeft";
    let to = -1;
    if (e.key === "ArrowDown" || e.key === next) to = Math.min(navIds.length - 1, i + 1);
    else if (e.key === "ArrowUp" || e.key === back) to = Math.max(0, i - 1);
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = navIds.length - 1;
    else if (e.key === "Escape" && pinned) {
      e.preventDefault();
      const id = pinned;
      setPinned(null);
      focusJob(id);
      return;
    }
    if (to >= 0) { e.preventDefault(); focusJob(navIds[to]); }
  };

  /* live announcements */
  const [say, setSay] = useState("");
  const was = useRef({ rl: false, fail: new Set<string>(), attempt: new Map<string, number>(), hot: false });
  useEffect(() => {
    const w = was.current;
    const msgs: string[] = [];
    if (limited && !w.rl) msgs.push(`محدودیت نرخ آغاز شد${rl?.label ? ` (${rl.label})` : ""}؛ کارگرها مکث کردند`);
    if (!limited && w.rl) msgs.push("محدودیت نرخ تمام شد؛ کارگرها ادامه دادند");
    for (const j of jobs) {
      if (j.status === "failed" && !w.fail.has(j.id)) msgs.push(`«${j.name}» ناموفق بود`);
      const a = j.attempt ?? 1;
      if (j.status === "queued" && a > (w.attempt.get(j.id) ?? 1)) msgs.push(`«${j.name}» دوباره در صف رفت، تلاش ${faNum(a)}`);
      w.attempt.set(j.id, Math.max(a, w.attempt.get(j.id) ?? 1));
    }
    if (hot && !w.hot) msgs.push(`صف از خط فشار گذشت: ${faNum(waitingN)} کار در انتظار`);
    w.rl = limited; w.hot = hot; w.fail = new Set(failedJobs.map((j) => j.id));
    if (msgs.length) setSay(msgs.join("؛ "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limited, hot, jobs]);

  useFlip(rootRef, rtl, reduced);

  /* ───────── render helpers ───────── */
  const kindIcon = (j: QueueJob) => j.icon ?? (() => { const I = KINDS_ICON[j.kind]; return <I size={12} strokeWidth={1.9} aria-hidden="true" />; })();
  const waitLabel = (j: QueueJob) => fmtDur(now - j.enqueuedAt);
  const labelFor = (j: QueueJob, place?: string) => {
    const parts = [j.name, KIND[j.kind].label];
    if (j.status === "queued") parts.push(`${faNum(Math.floor((now - j.enqueuedAt) / 1000))} ثانیه منتظر`, place ?? "");
    else if (j.status === "running") parts.push(limited ? "مکث به‌خاطر محدودیت نرخ" : `${faNum(Math.floor(runMs(j, now, limits) / 1000))} ثانیه در حال اجرا`);
    else parts.push(STATUS[j.status]);
    if (j.priority && j.priority !== "normal") parts.push(`اولویت ${PRIORITY[j.priority]}`);
    if ((j.attempt ?? 1) > 1) parts.push(`تلاش ${faNum(j.attempt!)}`);
    return parts.filter(Boolean).join("، ");
  };
  const common = (j: QueueJob, place?: string) => ({
    type: "button" as const,
    "data-flip": j.id,
    "data-kind": j.kind,
    tabIndex: activeId === j.id ? 0 : -1,
    "aria-label": labelFor(j, place),
    "aria-expanded": cardId === j.id ? true : undefined,
    onClick: () => { setFocusId(j.id); setPinned(pinned === j.id ? null : j.id); },
    onFocus: () => { setFocusId(j.id); hover(j.id); },
    onBlur: () => hover(null),
    onPointerEnter: (e: ReactPointerEvent) => hover(j.id, e),
    onPointerLeave: (e: ReactPointerEvent) => hover(null, e),
  });

  const card = (j: QueueJob, state: "wait" | "run" | "paused" | "done" | "fail", place?: string) => {
    const p = state === "wait" ? 0 : progressOf(j, now, limits);
    const att = j.attempt ?? 1;
    let right: ReactNode;
    if (state === "wait") right = waitLabel(j);
    else if (state === "run") right = fmtDur(runMs(j, now, limits));
    else if (state === "paused") right = "مکث";
    else if (state === "done") right = "تمام";
    else right = "ناموفق";
    return (
      <button
        key={j.id}
        {...common(j, place)}
        className="ui-agq__job"
        data-state={state}
        data-enter={state === "wait" ? "1" : undefined}
        data-flip-t={state === "wait" ? "q" : "s"}
        style={{ "--p": p } as CSSProperties}
      >
        {state !== "wait" ? <span className="ui-agq__fill" aria-hidden="true" /> : null}
        <span className="ui-agq__job-ic" aria-hidden="true">{state === "done" ? <Check size={12} strokeWidth={2.2} /> : kindIcon(j)}</span>
        <span className="ui-agq__job-name">{j.name}</span>
        {att > 1 && state === "wait" ? <span className="ui-agq__retry" title={`تلاش ${faNum(att)}`}><RotateCw size={10} strokeWidth={2.2} aria-hidden="true" />{faNum(att)}</span> : null}
        {j.priority === "high" && state === "wait" ? <span className="ui-agq__hi" aria-hidden="true" /> : null}
        <span className="ui-agq__job-time">{right}</span>
      </button>
    );
  };

  const cards = queued.slice(0, 3);
  const chips = queued.slice(3);
  const MAXCHIPS = 36;

  const rlSecs = rl ? Math.max(0, Math.ceil((rl.until - now) / 1000)) : 0;
  const pill = limited
    ? { cls: "warn", text: `${rl?.label ?? "محدودیت نرخ"} · ${faNum(rlSecs)} ث` }
    : paused
      ? { cls: "idle", text: "متوقف" }
      : { cls: "live", text: "زنده" };

  const pos = cardJob && cardJob.status === "queued" ? queued.findIndex((j) => j.id === cardJob.id) + 1 : 0;
  const maxA = cardJob?.maxAttempts;
  const nWorkers = workers.length;
  const runTime = cardJob ? fmtDur(runMs(cardJob, now, limits)) : "";
  const waitedFor = cardJob
    ? fmtDur((cardJob.startedAt ?? (cardJob.status === "queued" ? now : cardJob.endedAt ?? now)) - cardJob.enqueuedAt)
    : "";

  return (
    <div
      ref={rootRef}
      className={`ui-agq${className ? ` ${className}` : ""}`}
      data-dir={dir}
      data-limited={limited || undefined}
      data-paused={paused || undefined}
      onKeyDown={onKey}
    >
      <header className="ui-agq__head">
        <Rows3 size={16} strokeWidth={1.9} className="ui-agq__logo" aria-hidden="true" />
        <h3 className="ui-agq__title">{title}</h3>
        {name ? <span className="ui-agq__name">{name}</span> : null}
        <span className={`ui-agq__pill ui-agq__pill--${pill.cls}`}><i aria-hidden="true" />{pill.text}</span>
        <div className="ui-agq__ctl">
          {onPausedChange ? (
            <button type="button" className="ui-agq__btn" aria-pressed={!!paused} onClick={() => onPausedChange(!paused)} data-on={paused || undefined}>
              {paused ? <Play size={14} strokeWidth={1.9} aria-hidden="true" /> : <Pause size={14} strokeWidth={1.9} aria-hidden="true" />}
              {paused ? "ادامه" : "مکث"}
            </button>
          ) : null}
          {onConcurrencyChange ? (
            <div className="ui-agq__step" role="group" aria-label="تعداد کارگرها">
              <button type="button" aria-label="کم کردن یک کارگر" disabled={nWorkers <= minConcurrency} onClick={() => onConcurrencyChange(nWorkers - 1)}>
                <Minus size={14} strokeWidth={1.9} aria-hidden="true" />
              </button>
              <output aria-live="polite" aria-label={`${faNum(nWorkers)} کارگر`}>{faNum(nWorkers)}</output>
              <button type="button" aria-label="اضافه کردن یک کارگر" disabled={nWorkers >= maxConcurrency} onClick={() => onConcurrencyChange(nWorkers + 1)}>
                <Plus size={14} strokeWidth={1.9} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <dl className="ui-agq__stats">
        <div className={hot ? "is-hot" : undefined}><dt>در انتظار</dt><dd>{faNum(Math.round(eWait))}</dd></div>
        <div><dt>در حال اجرا</dt><dd>{faNum(Math.round(eRun))}<small>/{faNum(nWorkers)}</small></dd></div>
        <div><dt>توان عملیاتی</dt><dd>{faNum(Math.round(eTp))}<small>/دقیقه</small></dd></div>
        <div><dt>انتظار P95</dt><dd>{faNum(Math.round(eP95))}<small> ث</small></dd></div>
      </dl>

      <div className="ui-agq__flow">
        <section className="ui-agq__col ui-agq__col--queue" aria-label="صف انتظار">
          <h4 className="ui-agq__h">صف <b>{faNum(waitingN)}</b></h4>
          <div className="ui-agq__qbody">
            {waitingN === 0 ? <p className="ui-agq__empty">چیزی در انتظار نیست</p> : null}
            <div className="ui-agq__cards">
              {cards.map((j, i) => card(j, "wait", `جایگاه ${faNum(i + 1)} از ${faNum(waitingN)}`))}
            </div>
            {chips.length > 0 ? (
              <div className="ui-agq__chips">
                {chips.slice(0, MAXCHIPS).map((j, i) => (
                  <button key={j.id} {...common(j, `جایگاه ${faNum(i + 4)} از ${faNum(waitingN)}`)} className="ui-agq__chip" data-enter="1" data-flip-t="c" />
                ))}
                {chips.length > MAXCHIPS ? <span className="ui-agq__more">+{faNum(chips.length - MAXCHIPS)}</span> : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="ui-agq__col ui-agq__col--workers" aria-label="کارگرها">
          <h4 className="ui-agq__h">کارگرها <b>{faNum(runningNow)}/{faNum(nWorkers)}</b></h4>
          <div className="ui-agq__rows">
            {workers.map((w) => {
              const s = slots.get(w.id);
              const st = s?.ghost ? (s.ghost.outcome === "done" ? "done" : "fail") : s ? (limited ? "paused" : "run") : null;
              return (
                <div key={w.id} className="ui-agq__row">
                  <span className="ui-agq__mark" aria-hidden="true">{w.icon ?? <Wrench size={14} strokeWidth={1.8} />}</span>
                  <span className="ui-agq__wname" title={w.detail ? `${w.name} · ${w.detail}` : w.name}>{w.name}</span>
                  <div className="ui-agq__slot" data-idle={s ? undefined : ""}>
                    {s && st ? card(s.job, st) : <span className="ui-agq__idle">{paused ? "مکث" : "بیکار"}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="ui-agq__tiles">
          <div className="ui-agq__tile ui-agq__tile--ok" ref={doneTile}>
            <span className="ui-agq__tile-ic"><Check size={13} strokeWidth={2.2} aria-hidden="true" /></span>
            <span className="ui-agq__tile-l">انجام‌شده</span>
            <span className="ui-agq__tile-n" aria-label={`${faNum(doneShown)} انجام‌شده`}>{faNum(Math.round(eDone))}</span>
          </div>
          <div className="ui-agq__tile ui-agq__tile--bad" ref={failTile}>
            <span className="ui-agq__tile-ic"><X size={13} strokeWidth={2.2} aria-hidden="true" /></span>
            <span className="ui-agq__tile-l">ناموفق</span>
            <span className="ui-agq__tile-n" aria-label={`${faNum(failShown)} ناموفق`}>{faNum(Math.round(eFail))}</span>
          </div>
        </div>
      </div>

      <section className="ui-agq__depth" aria-label="عمق صف">
        <h4 className="ui-agq__h">عمق صف</h4>
        <DepthChart jobs={jobs} now={now} win={win} backpressure={backpressure} limits={limits} reduced={reduced} />
      </section>

      {cardJob ? (
        <div
          ref={popRef}
          className="ui-agq__pop"
          role={pinned ? "dialog" : "tooltip"}
          aria-label={pinned ? cardJob.name : undefined}
          onPointerEnter={(e) => hover(cardJob.id, e)}
          onPointerLeave={(e) => hover(null, e)}
          data-kind={cardJob.kind}
        >
          <div className="ui-agq__pop-top">
            <span className="ui-agq__pop-ic" aria-hidden="true">{kindIcon(cardJob)}</span>
            <div className="ui-agq__pop-t">
              <strong>{cardJob.name}</strong>
              <span>{KIND[cardJob.kind].label}{cardJob.detail ? ` · ${cardJob.detail}` : ""}</span>
            </div>
            <span className={`ui-agq__badge ui-agq__badge--${cardJob.status}`}>{STATUS[cardJob.status]}</span>
            {pinned ? (
              <button type="button" className="ui-agq__x" aria-label="بستن کارت" onClick={() => { const id = pinned; setPinned(null); focusJob(id); }}>
                <X size={14} aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <dl className="ui-agq__facts">
            <div><dt>انتظار</dt><dd>{waitedFor}</dd></div>
            {cardJob.status === "queued"
              ? <div><dt>جایگاه</dt><dd>{faNum(pos)} از {faNum(waitingN)}</dd></div>
              : <div><dt>اجرا</dt><dd>{cardJob.startedAt != null ? runTime : "—"}</dd></div>}
            <div><dt>اولویت</dt><dd>{PRIORITY[cardJob.priority ?? "normal"]}</dd></div>
            <div><dt>تلاش</dt><dd>{faNum(cardJob.attempt ?? 1)}{maxA ? ` از ${faNum(maxA)}` : ""}</dd></div>
          </dl>
          {cardJob.error ? <p className="ui-agq__err">{cardJob.error}</p> : null}
          {pinned && (cardJob.status === "queued" || cardJob.status === "running") && (onPromote || onCancel) ? (
            <div className="ui-agq__acts">
              {onPromote && cardJob.status === "queued" ? (
                <button type="button" className="ui-agq__btn" onClick={() => { onPromote(cardJob); setPinned(null); }}>بردن به ابتدا</button>
              ) : null}
              {onCancel ? (
                <button type="button" className="ui-agq__btn ui-agq__btn--bad" onClick={() => { onCancel(cardJob); setPinned(null); }}>
                  <X size={13} aria-hidden="true" />لغو
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="ui-agq__sr" role="status" aria-live="polite">{say}</div>
    </div>
  );
}

const KINDS_ICON: Record<QueueKind, typeof Sparkles> = { llm: Sparkles, tool: Wrench, agent: Bot, human: UserRound };

export default AgentQueue;
