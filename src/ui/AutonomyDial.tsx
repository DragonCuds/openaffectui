import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { Lock, LockOpen, OctagonAlert, TriangleAlert } from 'lucide-react';
import { faNum } from './digits';

/*
 * Autonomy Dial: how much an agent may do on its own. A three-stop dial (any number of stops works)
 * and the agent's real actions below it, gliding between "runs on its own" and "asks you first".
 * A lock pins an action to "asks first", whatever the dial says.
 * Written from scratch after watching the public affectUI demo; styles live in src/styles/dial.css.
 */

export type DialLevel = { label: string; /** Longer description, read out by screen readers */ hint?: string };
export type DialRisk = 'risky' | 'destructive';
export type DialAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Shows a badge. Without a risk the action is safe and runs from the second stop on */
  risk?: DialRisk;
  /** Lowest dial stop at which this action runs on its own (default: 1 when safe, last stop when risky) */
  autoAt?: number;
  /** Starts locked: always asks, whatever the dial says */
  locked?: boolean;
};

export const DEFAULT_DIAL_LEVELS: DialLevel[] = [
  { label: 'همیشه بپرس', hint: 'هر کاری اول از تو اجازه می‌گیرد.' },
  { label: 'اگر ریسکی بود', hint: 'کارهای بی‌خطر را خودش انجام می‌دهد و برای بقیه می‌پرسد.' },
  { label: 'کاملاً خودکار', hint: 'همه‌چیز را خودش انجام می‌دهد، جز کارهایی که قفل کرده‌ای.' },
];

export type DialLabels = {
  runs: string;
  asks: string;
  emptyRuns: string;
  emptyAsks: string;
  risky: string;
  destructive: string;
  lock: (action: string) => string;
  unlock: (action: string) => string;
  lockTitle: string;
  unlockTitle: string;
};

const DEFAULT_LABELS: DialLabels = {
  runs: 'خودش انجام می‌دهد',
  asks: 'اول از تو می‌پرسد',
  emptyRuns: 'هر کاری منتظر تو می‌ماند',
  emptyAsks: 'هیچ کاری منتظر تو نمی‌ماند',
  risky: 'ریسکی',
  destructive: 'مخرب',
  lock: (a) => `همیشه قبل از «${a}» بپرس`,
  unlock: (a) => `«${a}» همیشه می‌پرسد، باز کردن قفل`,
  lockTitle: 'همیشه بپرس، هر سطحی که انتخاب شده باشد',
  unlockTitle: 'همیشه می‌پرسد، برای پیروی دوباره از سطح کلیک کن',
};

const ROW_PITCH = 32.5;
const HEAD_H = 26;
const EMPTY_H = 36;
const GROUP_GAP = 10;

const autoAt = (a: DialAction, n: number) => a.autoAt ?? (a.risk ? Math.max(1, n - 1) : Math.min(1, n - 1));

function Sparkle() {
  return (
    <svg className="dial-spark" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M7 1.6c.5 2.9 1.9 4.3 4.8 4.8-2.9.5-4.3 1.9-4.8 4.8-.5-2.9-1.9-4.3-4.8-4.8C5.1 5.9 6.5 4.5 7 1.6Z" fill="currentColor" />
      <circle cx="12.6" cy="12" r="1.15" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

/** Small badge number: the old digit leaves upward, the new one rolls in from below. */
function Count({ n }: { n: number }) {
  const [prev, setPrev] = useState<number | null>(null);
  const last = useRef(n);
  const animated = useRef(false);
  useEffect(() => {
    if (last.current === n) return;
    animated.current = true;
    setPrev(last.current);
    last.current = n;
    const t = window.setTimeout(() => setPrev(null), 420);
    return () => window.clearTimeout(t);
  }, [n]);
  return (
    <span className="dial-count" aria-hidden="true">
      {prev !== null && <span key={`o${prev}`} className="dial-num" data-out="">{faNum(prev)}</span>}
      <span key={`n${n}`} className="dial-num" data-in={animated.current || undefined}>{faNum(n)}</span>
    </span>
  );
}

export function AutonomyDial({
  title, subtitle, icon, value, onChange, levels = DEFAULT_DIAL_LEVELS, actions,
  locked, defaultLocked, onLockedChange, labels, disabled = false, label,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Index of the selected stop */
  value: number;
  onChange: (n: number) => void;
  levels?: DialLevel[];
  actions: DialAction[];
  /** Ids pinned to "asks first". Leave out to let the dial keep it itself (starts from each action's `locked`) */
  locked?: string[];
  defaultLocked?: string[];
  onLockedChange?: (ids: string[]) => void;
  labels?: Partial<DialLabels>;
  disabled?: boolean;
  /** Accessible name of the stops (defaults to the title) */
  label?: string;
}) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const uid = useId();
  const n = levels.length;
  const idx = Math.min(n - 1, Math.max(0, Math.round(value)));
  const [own, setOwn] = useState<string[]>(() => defaultLocked ?? actions.filter((a) => a.locked).map((a) => a.id));
  const pinned = locked ?? own;
  const setPinned = (ids: string[]) => {
    if (locked === undefined) setOwn(ids);
    onLockedChange?.(ids);
  };
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // first paint must not glide
  const [ready, setReady] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(r); }, []);

  const isAuto = (a: DialAction) => !pinned.includes(a.id) && idx >= autoAt(a, n);
  const auto = actions.filter(isAuto);
  const ask = actions.filter((a) => !isAuto(a));

  // positions: [heading A, rows A | empty], gap, [heading B, rows B | empty]
  const pos: Record<string, number> = {};
  let y = HEAD_H;
  if (auto.length) auto.forEach((a) => { pos[a.id] = y; y += ROW_PITCH; });
  else y += EMPTY_H;
  const headB = y + GROUP_GAP;
  y = headB + HEAD_H;
  if (ask.length) ask.forEach((a) => { pos[a.id] = y; y += ROW_PITCH; });
  else y += EMPTY_H;
  const total = Math.round(y);
  const at = (v: number) => `translateY(${Math.round(v)}px)`;

  // heading B and the empty notes re-appear after every move
  const sig = ask.map((a) => a.id).join('|');
  const moved = useRef(false);
  const prevSig = useRef(sig);
  if (prevSig.current !== sig) { moved.current = true; prevSig.current = sig; }
  const reveal = moved.current || undefined;

  const go = (i: number) => {
    if (i === idx || i < 0 || i >= n) return;
    onChange(i);
    refs.current[i]?.focus();
  };
  // RTL: the first stop sits on the right, so ArrowLeft goes to the next one
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const next = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    let t = idx;
    if (e.key === next || e.key === 'ArrowDown') t = Math.min(n - 1, idx + 1);
    else if (e.key === back || e.key === 'ArrowUp') t = Math.max(0, idx - 1);
    else if (e.key === 'Home') t = 0;
    else if (e.key === 'End') t = n - 1;
    else return;
    e.preventDefault();
    go(t);
  };

  const toggle = (id: string) => setPinned(pinned.includes(id) ? pinned.filter((x) => x !== id) : [...pinned, id]);

  return (
    <section className="dial" data-ready={ready || undefined} data-disabled={disabled || undefined} aria-labelledby={`${uid}t`}>
      <header className="dial-top">
        <div className="dial-id">
          <span className="dial-ico">{icon ?? <Sparkle />}</span>
          <div className="dial-text">
            <h3 id={`${uid}t`} className="dial-title">{title}</h3>
            {subtitle && <p className="dial-sub">{subtitle}</p>}
          </div>
        </div>
        <div className="dial-stops" role="radiogroup" aria-label={label ?? title} aria-disabled={disabled || undefined}
          style={{ '--n': n } as CSSProperties} onKeyDown={onKey}>
          {levels.map((l, i) => (
            <button
              key={l.label}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="radio"
              className="dial-stop"
              aria-checked={i === idx}
              aria-description={l.hint}
              tabIndex={i === idx ? 0 : -1}
              disabled={disabled}
              data-on={i === idx || undefined}
              onClick={() => go(i)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      <div className="dial-body">
        <div className="dial-list" style={{ height: total }}>
          <div className="dial-head" style={{ transform: at(0) }}>
            <span className="dial-lbl">{L.runs}</span><Count n={auto.length} />
          </div>
          <div className="dial-empty" data-show={!auto.length || undefined} data-reveal={reveal} style={{ transform: at(HEAD_H) }} aria-hidden={auto.length ? true : undefined}>
            <span key={sig}>{L.emptyRuns}</span>
          </div>

          <div className="dial-head dial-head-b" data-reveal={reveal} style={{ transform: at(headB) }}>
            <span className="dial-hb" key={sig}><span className="dial-lbl">{L.asks}</span><Count n={ask.length} /></span>
          </div>
          <div className="dial-empty" data-show={!ask.length || undefined} data-reveal={reveal} style={{ transform: at(headB + HEAD_H) }} aria-hidden={ask.length ? true : undefined}>
            <span key={sig}>{L.emptyAsks}</span>
          </div>

          {actions.map((a) => {
            const pin = pinned.includes(a.id);
            return (
              <div key={a.id} className="dial-row" data-pinned={pin || undefined} style={{ transform: at(pos[a.id]) }}>
                {a.icon && <span className="dial-aicon" aria-hidden="true">{a.icon}</span>}
                <span className="dial-label">{a.label}</span>
                {a.risk && (
                  <span className="dial-badge" data-risk={a.risk}>
                    {a.risk === 'risky' ? <TriangleAlert size={14} strokeWidth={2} aria-hidden="true" /> : <OctagonAlert size={14} strokeWidth={2} aria-hidden="true" />}
                    {a.risk === 'risky' ? L.risky : L.destructive}
                  </span>
                )}
                <button
                  type="button"
                  className="dial-lock"
                  aria-pressed={pin}
                  aria-label={pin ? L.unlock(a.label) : L.lock(a.label)}
                  title={pin ? L.unlockTitle : L.lockTitle}
                  disabled={disabled}
                  onClick={() => toggle(a.id)}
                >
                  {pin ? <Lock size={14} strokeWidth={1.8} aria-hidden="true" /> : <LockOpen size={14} strokeWidth={1.8} aria-hidden="true" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <p className="dial-sr" aria-live="polite">{`${L.runs}: ${auto.map((a) => a.label).join('، ')}`}</p>
    </section>
  );
}
