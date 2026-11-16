import { useEffect, useReducer, useRef, type ReactNode } from 'react';
import { Check, Minus, X } from 'lucide-react';
import { faNum } from './digits';

/*
 * Live steps and live checks: a job that runs on a real system, shown while it happens.
 * LiveSteps is a short vertical list of steps (wait / run / ok / fail / skip). The running step spins, finished ones
 * get a green check, a failed one turns red with one plain sentence under it. A step can hold children (e.g. the
 * LiveChecks of that step). `compact` folds the whole list into one wrapping row, for a summary after the run.
 * LiveChecks is a grouped list of checks with the same five states. `compact` shows one line per group with a count
 * and keeps only the failed ones visible.
 * useStaggeredStates turns states that arrive in bursts (polling) into a one-by-one reveal in the order of `at`.
 * It only ever delays a final state; anything else (and any correction of a final state) shows at once, so it never
 * shows "ok" for something whose real state is not ok.
 * Written from scratch for this kit. Styles in src/styles/livesteps.css.
 */

export type LiveState = 'wait' | 'run' | 'ok' | 'fail' | 'skip';

export type LiveStep = {
  key: string;
  label: string;
  state: LiveState;
  /** One plain sentence; shown under a failed step, or muted under others */
  detail?: string | null;
  /** Shown under the step (any state), e.g. the checks of this step */
  children?: ReactNode;
};

export type LiveCheck = {
  key: string;
  label: string;
  state: LiveState;
  /** Group key; groups come in the order of `groups`, then in the order they first appear */
  group?: string | null;
  detail?: string | null;
  /** When the check really finished (ISO or ms) – the reveal order */
  at?: string | number | null;
};

export type LiveGroup = { key: string; label: string };

const FINAL = (s: LiveState | undefined) => s === 'ok' || s === 'fail' || s === 'skip';
const RAYS = Array.from({ length: 8 }, (_, i) => i);
const atMs = (a: LiveCheck['at']) => {
  if (a == null) return Number.POSITIVE_INFINITY;
  const t = typeof a === 'number' ? a : Date.parse(a);
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
};
const SR: Record<LiveState, string> = { wait: 'منتظر', run: 'در حال انجام', ok: 'انجام شد', fail: 'رد شد', skip: 'لازم نبود' };

/** The state icon: a quiet dot, a spinner, a check, a cross or a dash. */
export function LiveIcon({ state, size = 'md' }: { state: LiveState; size?: 'sm' | 'md' }) {
  return (
    <span className="lvs-ico" data-state={state} data-size={size} aria-hidden="true">
      {state === 'run' ? (
        <svg className="lvs-spin" viewBox="0 0 16 16">
          {RAYS.map((i) => <line key={i} x1="8" y1="1.75" x2="8" y2="4.75" transform={`rotate(${i * 45} 8 8)`} style={{ animationDelay: `${(i - 8) * 100}ms` }} />)}
        </svg>
      ) : state === 'ok' ? <Check strokeWidth={2.6} />
        : state === 'fail' ? <X strokeWidth={2.6} />
        : state === 'skip' ? <Minus strokeWidth={2.4} />
        : <i />}
    </span>
  );
}

/**
 * Delays final states that arrive together so they show one by one, `gap` ms apart, in the order of `at`.
 * `from` = the states shown last time (e.g. before a remount); changes from those are revealed too.
 * Returns the states to show and how many are still waiting to be revealed.
 */
export function useStaggeredStates(items: LiveCheck[], { gap = 200, from }: { gap?: number; from?: Record<string, LiveState> | null } = {}) {
  const shown = useRef<Record<string, LiveState> | null>(null);
  if (shown.current === null) {
    const init: Record<string, LiveState> = {};
    for (const it of items) {
      const was = from?.[it.key];
      // start from what was on screen, but never from a final state the real one no longer has
      init[it.key] = was !== undefined && !FINAL(was) && FINAL(it.state) ? was : it.state;
    }
    shown.current = init;
  }
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const latest = useRef(items);
  latest.current = items;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingOf = (list: LiveCheck[], s: Record<string, LiveState>) =>
    list.map((it, i) => ({ it, i })).filter(({ it }) => FINAL(it.state) && !FINAL(s[it.key]))
      .sort((a, b) => atMs(a.it.at) - atMs(b.it.at) || a.i - b.i).map(({ it }) => it);

  const sig = items.map((it) => `${it.key}:${it.state}`).join('|');
  useEffect(() => {
    const s = shown.current!;
    let changed = false;
    for (const it of items) {
      const cur = s[it.key];
      // not final yet, or a final state that changed: show the real one at once
      if (cur === undefined) { s[it.key] = FINAL(it.state) ? 'wait' : it.state; changed = true; }
      else if (cur !== it.state && (!FINAL(it.state) || FINAL(cur))) { s[it.key] = it.state; changed = true; }
    }
    if (changed) bump();
    if (timer.current) return; // a reveal is already walking; it reads the latest items on each tick
    const tick = () => {
      const next = pendingOf(latest.current, shown.current!)[0];
      if (!next) { timer.current = null; return; }
      shown.current![next.key] = next.state;
      bump();
      timer.current = setTimeout(tick, gap);
    };
    tick();
  }, [sig, gap]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const s = shown.current!;
  const states: Record<string, LiveState> = {};
  for (const it of items) {
    const cur = s[it.key];
    states[it.key] = cur === undefined ? (FINAL(it.state) ? 'wait' : it.state) : cur;
  }
  const pending = items.filter((it) => states[it.key] !== it.state).length;
  return { states, pending };
}

/** The steps of one live run. */
export function LiveSteps({ steps, compact, label = 'مرحله‌ها', className }: { steps: LiveStep[]; compact?: boolean; label?: string; className?: string }) {
  const cls = ['lvs', compact ? 'lvs-compact' : '', className ?? ''].filter(Boolean).join(' ');
  if (compact) {
    return (
      <ul className={cls} aria-label={label}>
        {steps.map((s) => (
          <li key={s.key} className="lvs-chip" data-state={s.state}>
            <LiveIcon state={s.state} size="sm" />{s.label}<span className="lvs-sr"> ({SR[s.state]})</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ol className={cls} aria-label={label}>
      {steps.map((s) => (
        <li key={s.key} className="lvs-step" data-state={s.state} aria-current={s.state === 'run' ? 'step' : undefined}>
          <LiveIcon state={s.state} />
          <div className="lvs-body">
            <span className="lvs-label">{s.label}<span className="lvs-sr"> ({SR[s.state]})</span></span>
            {s.detail ? <span className="lvs-detail">{s.detail}</span> : null}
            {s.children ? <div className="lvs-kids">{s.children}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function grouped(items: LiveCheck[], groups: LiveGroup[] | undefined, otherLabel: string) {
  const known = new Map((groups ?? []).map((g) => [g.key, g.label]));
  const order: string[] = (groups ?? []).map((g) => g.key);
  const by = new Map<string, LiveCheck[]>();
  for (const it of items) {
    const k = it.group || '';
    if (!by.has(k)) { by.set(k, []); if (!order.includes(k)) order.push(k); }
    by.get(k)!.push(it);
  }
  return order.filter((k) => by.has(k)).map((k) => ({ key: k, label: known.get(k) ?? (k || otherLabel), items: by.get(k)! }));
}

/**
 * A grouped list of checks. Pass `states` (from useStaggeredStates) to show delayed states; otherwise each check's
 * own state is shown. `compact`: one line per group with a count, plus the failed ones.
 */
export function LiveChecks({
  items, groups, states, compact, label = 'چک‌ها', otherLabel = 'بقیه', okWord = 'سالم', className,
}: {
  items: LiveCheck[];
  groups?: LiveGroup[];
  states?: Record<string, LiveState>;
  compact?: boolean;
  label?: string;
  otherLabel?: string;
  okWord?: string;
  className?: string;
}) {
  const st = (it: LiveCheck) => states?.[it.key] ?? it.state;
  const list = grouped(items, groups, otherLabel);
  const cls = ['lvc', compact ? 'lvc-compact' : '', className ?? ''].filter(Boolean).join(' ');
  if (compact) {
    return (
      <ul className={cls} aria-label={label}>
        {list.map((g) => {
          const fails = g.items.filter((it) => st(it) === 'fail');
          const done = g.items.filter((it) => st(it) === 'ok' || st(it) === 'skip').length;
          const open = g.items.some((it) => !FINAL(st(it)));
          const tone: LiveState = fails.length ? 'fail' : open ? (g.items.some((it) => st(it) === 'run') ? 'run' : 'wait') : 'ok';
          return (
            <li key={g.key} className="lvc-gline" data-state={tone}>
              <span className="lvc-ghead"><LiveIcon state={tone} size="sm" /><b>{g.label}</b>
                <span className="lvc-count">{faNum(done)} از {faNum(g.items.length)} {okWord}</span></span>
              {fails.length ? (
                <ul className="lvc-fails">
                  {fails.map((it) => <li key={it.key}><span className="lvc-label">{it.label}</span>{it.detail ? <span className="lvc-detail">{it.detail}</span> : null}</li>)}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <div className={cls} role="group" aria-label={label}>
      {list.map((g) => (
        <div key={g.key} className="lvc-group">
          <span className="lvc-gname">{g.label}</span>
          <ul className="lvc-items">
            {g.items.map((it) => {
              const s = st(it);
              return (
                <li key={it.key} className="lvc-item" data-state={s}>
                  <LiveIcon state={s} size="sm" />
                  <span className="lvc-text">
                    <span className="lvc-label">{it.label}<span className="lvs-sr"> ({SR[s]})</span></span>
                    {it.detail && FINAL(s) ? <span className="lvc-detail">{it.detail}</span> : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
