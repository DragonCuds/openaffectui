import { useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, Ref } from 'react';
import { Check, ChevronLeft, ChevronRight, Sparkles, Undo2, X } from 'lucide-react';
import { faNum } from './digits';

/* Inline diff: AI edits to prose, accepted or rejected one by one.
   Written from scratch; look and motion matched by watching the public demo. */

export type DiffSegment =
  | { type: 'equal'; text: string }
  | { type: 'change'; remove: string; insert: string };

export type InlineDiffHandle = {
  /** Highlight (and open the popover of) the change at this index, or clear with null. */
  highlight: (index: number | null) => void;
  accept: (index: number) => void;
  reject: (index: number) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  undo: () => void;
  reset: () => void;
};

type Decision = 'pending' | 'accept' | 'reject';

/* ---------- diff ---------- */

/** Words and punctuation runs, each with its trailing whitespace; the last one always carries some so segments glue back together. */
const TOKEN = /[\p{L}\p{N}\p{M}_'’\-\u200c]+\s*|[^\p{L}\p{N}\p{M}\s\u200c]+\s*/gu;
const tokenize = (s: string): string[] => {
  const t = s.trim().match(TOKEN) ?? [];
  if (t.length && !/\s$/.test(t[t.length - 1])) t[t.length - 1] += ' ';
  return t;
};
const key = (t: string) => t.trim();

/** Word-level diff (longest common subsequence). Adjacent removals and insertions are grouped into one change. */
export function diffWords(original: string, suggested: string): DiffSegment[] {
  const a = tokenize(original);
  const b = tokenize(suggested);
  const n = a.length;
  const m = b.length;
  const out: DiffSegment[] = [];
  let rem = '';
  let ins = '';
  const flush = () => {
    if (rem || ins) out.push({ type: 'change', remove: rem, insert: ins });
    rem = '';
    ins = '';
  };
  const equal = (text: string) => {
    flush();
    const last = out[out.length - 1];
    if (last && last.type === 'equal') last.text += text;
    else out.push({ type: 'equal', text });
  };

  if (n * m > 4_000_000) {
    rem = a.join('');
    ins = b.join('');
    flush();
    return out;
  }

  const w = m + 1;
  const t = new Uint32Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      t[i * w + j] = key(a[i]) === key(b[j]) ? t[(i + 1) * w + j + 1] + 1 : Math.max(t[(i + 1) * w + j], t[i * w + j + 1]);
    }
  }
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (key(a[i]) === key(b[j])) { equal(b[j]); i++; j++; }
    else if (t[(i + 1) * w + j] >= t[i * w + j + 1]) rem += a[i++];
    else ins += b[j++];
  }
  while (i < n) rem += a[i++];
  while (j < m) ins += b[j++];
  flush();
  return out;
}

/* ---------- text ---------- */

type Lang = 'fa' | 'en';
type Strings = {
  suggestion: string; acceptAll: string; rejectAll: string; accept: string; reject: string; undo: string; prev: string; next: string;
  reviewed: string; group: string; accepted: string; rejected: string; allAccepted: string; allRejected: string; undone: string; restarted: string;
  left: (n: number) => string; label: (i: number, n: number, what: string) => string; what: (remove: string, insert: string) => string;
};
const q = (s: string) => `“${s.trim()}”`;
const fq = (s: string) => `«${s.trim()}»`;
const STR: Record<Lang, Strings> = {
  fa: {
    suggestion: 'پیشنهاد', acceptAll: 'پذیرفتن همه', rejectAll: 'رد همه', accept: 'بپذیر', reject: 'رد کن', undo: 'بازگردانی',
    prev: 'پیشنهاد قبلی', next: 'پیشنهاد بعدی', reviewed: 'همه‌ی تغییرها بررسی شد', group: 'بررسی پیشنهاد',
    accepted: 'پذیرفته شد', rejected: 'رد شد', allAccepted: 'همه پذیرفته شد.', allRejected: 'همه رد شد.', undone: 'بازگردانی شد.', restarted: 'از اول شروع شد.',
    left: (n) => (n === 0 ? 'همه‌ی تغییرها بررسی شد.' : `${faNum(n)} پیشنهاد مانده.`),
    label: (i, n, w) => `پیشنهاد ${faNum(i)} از ${faNum(n)}: ${w}. برای پذیرفتن Y و برای رد N را بزنید`,
    what: (r, i) => (!i.trim() ? `حذف ${fq(r)}` : !r.trim() ? `افزودن ${fq(i)}` : `جایگزینی ${fq(r)} با ${fq(i)}`),
  },
  en: {
    suggestion: 'suggestion', acceptAll: 'Accept all', rejectAll: 'Reject all', accept: 'Accept', reject: 'Reject', undo: 'Undo',
    prev: 'Previous suggestion', next: 'Next suggestion', reviewed: 'All changes reviewed', group: 'Review suggestion',
    accepted: 'Accepted', rejected: 'Rejected', allAccepted: 'All accepted.', allRejected: 'All rejected.', undone: 'Undone.', restarted: 'Started over.',
    left: (n) => (n === 0 ? 'All changes reviewed.' : `${n} suggestion${n === 1 ? '' : 's'} left.`),
    label: (i, n, w) => `Suggestion ${i} of ${n}: ${w}. Press Y to accept, N to reject`,
    what: (r, i) => (!i.trim() ? `remove ${q(r)}` : !r.trim() ? `add ${q(i)}` : `replace ${q(r)} with ${q(i)}`),
  },
};

const splitEnd = (s: string): [string, string] => {
  const core = s.trimEnd();
  return [core, s.slice(core.length)];
};

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const DUR = 320;

/** Shrink a side of a change to nothing, or grow it back. The element is only taken out of the flow after the shrink ends. */
function runSide(el: HTMLElement, expand: boolean) {
  el.getAnimations().forEach((a) => a.cancel());
  if (reducedMotion()) {
    if (expand) delete el.dataset.out;
    else el.dataset.out = '1';
    delete el.dataset.anim;
    return;
  }
  if (expand) delete el.dataset.out;
  el.dataset.anim = '1';
  const w = el.getBoundingClientRect().width;
  const frames: Keyframe[] = expand
    ? [{ width: '0px', opacity: 0 }, { width: `${w}px`, opacity: 1 }]
    : [{ width: `${w}px`, opacity: 1 }, { width: '0px', opacity: 0 }];
  const a = el.animate(frames, { duration: DUR, easing: EASE, fill: 'forwards' });
  a.finished.then(
    () => {
      if (!expand) el.dataset.out = '1';
      delete el.dataset.anim;
      a.cancel();
    },
    () => { /* cancelled by a newer decision */ },
  );
}

/* ---------- component ---------- */

export type InlineDiffProps = {
  original?: string;
  suggested?: string;
  /** Pre-computed segments instead of original and suggested. */
  changes?: DiffSegment[];
  onChange?: (text: string) => void;
  onDone?: (text: string) => void;
  /** Small line above the text, e.g. "پیشنهاد هوش مصنوعی · کوتاه‌ترش کن". */
  label?: string;
  /** Put the label on a gray tray above the card instead of inside it. */
  tray?: boolean;
  /** Language of the built-in texts (decides nothing about the direction, which comes from the page). */
  lang?: Lang;
  className?: string;
  ref?: Ref<InlineDiffHandle>;
};

export function InlineDiff({ original = '', suggested = '', changes, onChange, onDone, label, tray = false, lang = 'fa', className, ref }: InlineDiffProps) {
  const uid = useId();
  const T = STR[lang];
  const segs = useMemo(() => changes ?? diffWords(original, suggested), [changes, original, suggested]);
  const list = useMemo(() => {
    const out: { seg: number; remove: string; insert: string }[] = [];
    segs.forEach((s, i) => { if (s.type === 'change') out.push({ seg: i, remove: s.remove, insert: s.insert }); });
    return out;
  }, [segs]);
  const total = list.length;

  const [dec, setDec] = useState<Decision[]>(() => list.map(() => 'pending'));
  const decRef = useRef<Decision[]>(dec);
  const history = useRef<Decision[][]>([]);
  const [hl, setHl] = useState<number | null>(null);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [popOpen, setPopOpen] = useState(false);
  const [popGlide, setPopGlide] = useState(false);
  const [msg, setMsg] = useState('');

  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const undoBtn = useRef<HTMLButtonElement>(null);
  const changeEls = useRef<(HTMLSpanElement | null)[]>([]);
  const sideEls = useRef<Record<string, HTMLElement | null>>({});
  const hoverTimer = useRef<number | undefined>(undefined);
  const wantUndoFocus = useRef(false);
  const lastDec = useRef<Decision[]>(dec);
  const placed = useRef(false);
  const raf = useRef(0);

  /* the incoming data changed: start over */
  const sig = useMemo(() => JSON.stringify(segs), [segs]);
  const firstSig = useRef(sig);
  useEffect(() => {
    if (firstSig.current === sig) return;
    firstSig.current = sig;
    history.current = [];
    const fresh: Decision[] = list.map(() => 'pending');
    decRef.current = fresh;
    lastDec.current = fresh;
    setDec(fresh);
    setHl(null);
    setMsg('');
  }, [sig, list]);

  const pendingOf = (d: Decision[]) => d.reduce<number[]>((acc, v, i) => (v === 'pending' ? (acc.push(i), acc) : acc), []);
  const pending = useMemo(() => pendingOf(dec), [dec]);
  const done = total > 0 && pending.length === 0;

  const textOf = useCallback((d: Decision[]) => {
    let c = 0;
    let s = '';
    for (const seg of segs) {
      if (seg.type === 'equal') s += seg.text;
      else s += d[c++] === 'accept' ? seg.insert : seg.remove;
    }
    return s.trim();
  }, [segs]);

  /* every decision goes through here */
  const commit = useCallback((next: Decision[], announce: string, nextHl: number | null) => {
    history.current.push(decRef.current);
    decRef.current = next;
    setDec(next);
    setHl(nextHl);
    const left0 = pendingOf(next).length;
    setMsg(`${announce} ${T.left(left0)}`);
    const text = textOf(next);
    onChange?.(text);
    if (left0 === 0) onDone?.(text);
  }, [textOf, onChange, onDone, T]);

  const nextPendingAfter = (d: Decision[], from: number): number | null => {
    const p = pendingOf(d);
    if (!p.length) return null;
    return p.find((i) => i > from) ?? p[0];
  };

  const decideOne = useCallback((i: number, v: 'accept' | 'reject', viaFocus = false) => {
    const cur = decRef.current;
    if (i < 0 || i >= total || cur[i] !== 'pending') return;
    const next = cur.slice();
    next[i] = v;
    const nx = nextPendingAfter(next, i);
    const c = list[i];
    const verb = v === 'accept' ? T.accepted : T.rejected;
    commit(next, `${verb}: ${T.what(c.remove, c.insert)}.`, nx);
    if (viaFocus) {
      if (nx == null) wantUndoFocus.current = true;
      else requestAnimationFrame(() => changeEls.current[nx]?.focus({ preventScroll: true }));
    }
  }, [commit, list, total, T]);

  const decideAll = useCallback((v: 'accept' | 'reject') => {
    const cur = decRef.current;
    if (!cur.includes('pending')) return;
    const next = cur.map((d) => (d === 'pending' ? v : d));
    const root0 = document.activeElement;
    if (root.current?.contains(root0) && root0 !== document.body) wantUndoFocus.current = true;
    commit(next, v === 'accept' ? T.allAccepted : T.allRejected, null);
  }, [commit, T]);

  const undo = useCallback(() => {
    const prev = history.current.pop();
    if (!prev) return;
    const cur = decRef.current;
    decRef.current = prev;
    setDec(prev);
    setHl(null);
    setMsg(`${T.undone} ${T.left(pendingOf(prev).length)}`);
    onChange?.(textOf(prev));
    if (document.activeElement === undoBtn.current) {
      const back = prev.findIndex((d, i) => d !== cur[i]);
      requestAnimationFrame(() => changeEls.current[back]?.focus({ preventScroll: true }));
    }
  }, [onChange, textOf, T]);

  const reset = useCallback(() => {
    const fresh: Decision[] = list.map(() => 'pending');
    if (decRef.current.every((d) => d === 'pending')) return;
    history.current = [];
    decRef.current = fresh;
    setDec(fresh);
    setHl(null);
    setMsg(`${T.restarted} ${T.left(fresh.length)}`);
    onChange?.(textOf(fresh));
  }, [list, onChange, textOf, T]);

  const scrollTo = useCallback((i: number) => {
    const el = changeEls.current[i];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pad = 72;
    if (r.top < pad || r.bottom > window.innerHeight - pad) {
      el.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
  }, []);

  useImperativeHandle(ref, () => ({
    highlight: (i) => { setHl(i == null || decRef.current[i] !== 'pending' ? null : i); if (i != null) scrollTo(i); },
    accept: (i) => decideOne(i, 'accept'),
    reject: (i) => decideOne(i, 'reject'),
    acceptAll: () => decideAll('accept'),
    rejectAll: () => decideAll('reject'),
    undo,
    reset,
  }), [decideOne, decideAll, undo, reset, scrollTo]);

  /* animate the sides of every change that was just decided or undone */
  useLayoutEffect(() => {
    const prev = lastDec.current;
    lastDec.current = dec;
    dec.forEach((d, i) => {
      if (d === prev[i]) return;
      const wasPending = prev[i] === 'pending';
      const loser = d === 'accept' ? 'del' : d === 'reject' ? 'ins' : prev[i] === 'accept' ? 'del' : 'ins';
      const el = sideEls.current[`${i}:${loser}`];
      if (el) runSide(el, !wasPending);
    });
    if (!reducedMotion()) {
      cancelAnimationFrame(raf.current);
      const end = performance.now() + DUR + 80;
      const tick = () => {
        place();
        if (performance.now() < end) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dec]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /* after the last decision focus lands on Undo */
  useEffect(() => {
    if (done && wantUndoFocus.current) {
      wantUndoFocus.current = false;
      undoBtn.current?.focus({ preventScroll: true });
    }
  }, [done]);

  /* popover */
  const active = focusIdx ?? hl ?? hover;
  const activeOk = active != null && dec[active] === 'pending' ? active : null;
  const activeRef = useRef<number | null>(null);
  activeRef.current = activeOk;

  const place = useCallback(() => {
    const i = activeRef.current;
    const p = pop.current;
    const b = body.current;
    const c = card.current;
    if (i == null || !p || !b || !c) return;
    const el = changeEls.current[i];
    if (!el) return;
    const rects = Array.from(el.getClientRects()).filter((r) => r.width > 0);
    if (!rects.length) return;
    const first = rects[0];
    const line = rects.filter((r) => Math.abs(r.top - first.top) < 4);
    const l = Math.min(...line.map((r) => r.left));
    const r = Math.max(...line.map((r) => r.right));
    const br = b.getBoundingClientRect();
    const cr = c.getBoundingClientRect();
    const pw = p.offsetWidth;
    const ph = p.offsetHeight;
    // Physical coordinates on purpose: the popover is positioned with transform, which is not mirrored in RTL.
    const minX = cr.left - br.left + 8;
    const maxX = cr.right - br.left - pw - 8;
    let x = (l + r) / 2 - br.left - pw / 2;
    x = Math.max(minX, Math.min(x, Math.max(minX, maxX)));
    let y = first.top - br.top - ph - 6;
    if (first.top - ph - 6 < 4) y = first.bottom - br.top + 6;
    p.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  }, []);

  useLayoutEffect(() => {
    if (activeOk == null) { setPopOpen(false); placed.current = false; return; }
    setPopGlide(placed.current);
    place();
    placed.current = true;
    setPopOpen(true);
  }, [activeOk, place]);

  useEffect(() => {
    const b = body.current;
    if (!b || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => place());
    ro.observe(b);
    return () => ro.disconnect();
  }, [place]);

  /* keys and arrows */
  const stepTo = (dir: 1 | -1) => {
    if (!pending.length) return;
    const cur = focusIdx ?? hl;
    let nx: number;
    if (cur == null) nx = dir === 1 ? pending[0] : pending[pending.length - 1];
    else {
      const pos = pending.indexOf(cur);
      if (pos === -1) nx = dir === 1 ? (pending.find((i) => i > cur) ?? pending[0]) : ([...pending].reverse().find((i) => i < cur) ?? pending[pending.length - 1]);
      else nx = pending[(pos + dir + pending.length) % pending.length];
    }
    scrollTo(nx);
    if (focusIdx != null) changeEls.current[nx]?.focus({ preventScroll: true });
    else setHl(nx);
  };

  const onChangeKey = (e: KeyboardEvent<HTMLSpanElement>, i: number) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.code === 'KeyY' || e.key === 'Enter') { e.preventDefault(); decideOne(i, 'accept', true); }
    else if (e.code === 'KeyN' || e.key === 'Backspace') { e.preventDefault(); decideOne(i, 'reject', true); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setHl(null); setHover(null); (e.currentTarget as HTMLElement).blur(); }
  };

  const onRootKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { setHl(null); setHover(null); }
    else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyZ' && history.current.length) { e.preventDefault(); undo(); }
  };

  const hoverOn = (i: number) => { window.clearTimeout(hoverTimer.current); setHover(i); };
  const hoverOff = () => { window.clearTimeout(hoverTimer.current); hoverTimer.current = window.setTimeout(() => setHover(null), 140); };
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  /* render */
  let c = 0;
  const parts = segs.map((seg, si) => {
    if (seg.type === 'equal') return seg.text;
    const i = c++;
    const d = dec[i] ?? 'pending';
    const isPending = d === 'pending';
    const [rc, rt] = splitEnd(seg.remove);
    const [ic, it] = splitEnd(seg.insert);
    return (
      <span
        key={si}
        ref={(el) => { changeEls.current[i] = el; }}
        className="idf-change"
        data-state={d}
        data-active={activeOk === i ? '' : undefined}
        role={isPending ? 'button' : undefined}
        tabIndex={isPending ? 0 : undefined}
        aria-label={isPending ? T.label(i + 1, total, T.what(seg.remove, seg.insert)) : undefined}
        onKeyDown={isPending ? (e) => onChangeKey(e, i) : undefined}
        onFocus={isPending ? () => setFocusIdx(i) : undefined}
        onBlur={() => setFocusIdx((f) => (f === i ? null : f))}
        onPointerEnter={isPending ? (e) => { if (e.pointerType === 'mouse') hoverOn(i); } : undefined}
        onPointerLeave={isPending ? (e) => { if (e.pointerType === 'mouse') hoverOff(); } : undefined}
      >
        {rc ? (
          <span className="idf-side idf-del" data-side="del" ref={(el) => { sideEls.current[`${i}:del`] = el; }} aria-hidden={d === 'accept' ? true : undefined}>
            <del className="idf-w">{rc}</del>{rt}
          </span>
        ) : null}
        {ic ? (
          <span className="idf-side idf-ins" data-side="ins" ref={(el) => { sideEls.current[`${i}:ins`] = el; }} aria-hidden={d === 'reject' ? true : undefined}>
            <ins className="idf-w">{ic}</ins>{it}
          </span>
        ) : null}
      </span>
    );
  });

  const labelEl = label ? (
    <p className="idf-label">
      <Sparkles size={15} strokeWidth={1.9} aria-hidden="true" className="idf-spark" />
      <span>{label}</span>
    </p>
  ) : null;

  const activeCh = activeOk != null ? list[activeOk] : null;
  const popId = `${uid}-pop`;

  const cardEl = (
    <div className="idf-card" ref={card}>
      {tray ? null : labelEl}
      <div className="idf-body" ref={body}>
        <p className="idf-text" dir="auto">{parts}</p>
        <div
          ref={pop}
          id={popId}
          className="idf-pop"
          role="group"
          aria-label={T.group}
          data-open={popOpen && activeOk != null ? '' : undefined}
          data-glide={popGlide ? '' : undefined}
          onPointerEnter={() => window.clearTimeout(hoverTimer.current)}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') hoverOff(); }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button type="button" className="idf-pbtn idf-pbtn-yes" tabIndex={-1} aria-label={T.accept} onClick={() => activeOk != null && decideOne(activeOk, 'accept', focusIdx != null)}>
            <Check size={16} strokeWidth={2} aria-hidden="true" />
            <span>{T.accept}</span>
            <kbd className="idf-kbd" aria-hidden="true">Y</kbd>
          </button>
          <button type="button" className="idf-pbtn idf-pbtn-no" tabIndex={-1} aria-label={T.reject} onClick={() => activeOk != null && decideOne(activeOk, 'reject', focusIdx != null)}>
            <X size={16} strokeWidth={2} aria-hidden="true" />
            <span>{T.reject}</span>
            <kbd className="idf-kbd" aria-hidden="true">N</kbd>
          </button>
        </div>
      </div>

      <div className="idf-bar" data-done={done ? '' : undefined}>
        <div className="idf-bar-a" inert={done}>
          <p className="idf-count"><span className="idf-num">{lang === 'fa' ? faNum(pending.length) : pending.length}</span> {lang === 'en' && pending.length !== 1 ? 'suggestions' : T.suggestion}</p>
          <div className="idf-nav">
            <button type="button" className="idf-icon" aria-label={T.prev} onMouseDown={(e) => e.preventDefault()} onClick={() => stepTo(-1)}>
              <ChevronLeft size={18} strokeWidth={1.8} aria-hidden="true" className="idf-flip" />
            </button>
            <button type="button" className="idf-icon" aria-label={T.next} onMouseDown={(e) => e.preventDefault()} onClick={() => stepTo(1)}>
              <ChevronRight size={18} strokeWidth={1.8} aria-hidden="true" className="idf-flip" />
            </button>
          </div>
          <button type="button" className="idf-btn" onClick={() => decideAll('reject')}>{T.rejectAll}</button>
          <button type="button" className="idf-btn idf-btn-primary" onClick={() => decideAll('accept')}>{T.acceptAll}</button>
        </div>
        <div className="idf-bar-b" inert={!done}>
          <p className="idf-reviewed">
            <svg className="idf-tick" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
              <circle cx="10" cy="10" r="9" className="idf-tick-bg" />
              <path d="M6 10.4l2.7 2.7L14 7.6" pathLength="1" className="idf-tick-path" />
            </svg>
            <span>{T.reviewed}</span>
          </p>
          <button type="button" ref={undoBtn} className="idf-btn" onClick={undo}>
            <Undo2 size={16} strokeWidth={1.8} aria-hidden="true" className="idf-flip" />
            {T.undo}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={root} className={['idf', tray ? 'idf-tray' : '', className].filter(Boolean).join(' ')} onKeyDown={onRootKey} data-has-active={activeCh ? '' : undefined}>
      {tray ? labelEl : null}
      {cardEl}
      <p className="idf-sr" role="status" aria-live="polite">{msg}</p>
    </div>
  );
}
