import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Check, LoaderCircle, Lock, NotepadText, Redo2, TriangleAlert, Undo2 } from 'lucide-react';
import { EmptyState } from './States';
import { faNum } from './digits';

export type LedgerEntry = {
  id: string;
  /** Ready-made time text such as «۲ دقیقه پیش» or «امروز ۱۴:۳۰». */
  when: string;
  /** What the agent did, e.g. «قیمت تغییر کرد». */
  title: string;
  /** What it touched, shown next to the title, e.g. «پلن حرفه‌ای». */
  target?: string;
  /** One line under the title. Ignored when `change` is given. */
  detail?: string;
  /** [before, after]: before is struck, then an arrow, then after. */
  change?: [string, string];
  /** The system it happened in («استریپ», «گیت‌هاب»); shown after the time. */
  system?: string;
  /** Logo or glyph for the tile; defaults to a state icon. */
  icon?: ReactNode;
  /** `pending` = an undo is running right now. `failed` = the agent's own action failed. */
  state: 'done' | 'failed' | 'undone' | 'pending';
  /** True for things that cannot be taken back (an email that went out): no Undo. */
  irreversible?: boolean;
  /** Ids of the changes this one builds on: undoing one of those undoes this one too. */
  dependsOn?: string[];
};

type Point = 'root' | 'also' | 'cant';

/**
 * What the agent did, newest first as given. Pointing at (or focusing) a row's Undo lights up
 * the row and everything built on it; Undo strikes the rows through, one after another.
 */
export function AgentLedger({
  entries,
  onUndo,
  onRedo,
  title = 'سابقه',
  agent,
  pointAt,
  empty = 'هنوز کاری انجام نشده',
  countLabel = 'تغییر',
  className,
}: {
  entries: LedgerEntry[];
  /** `id` is the row clicked; `ids` is that row plus every reversible change that builds on it. */
  onUndo?: (id: string, ids: string[]) => void | Promise<void>;
  /** When given, undone rows offer a «دوباره» button. */
  onRedo?: (id: string, ids: string[]) => void | Promise<void>;
  title?: string;
  /** Who made the changes, next to the title. */
  agent?: string;
  /** Lights up a change and what builds on it, as if its Undo were pointed at. `null` = none. */
  pointAt?: string | null;
  empty?: string;
  /** The word after the count in the header (default «تغییر») */
  countLabel?: string;
  className?: string;
}) {
  const [hot, setHot] = useState<string | null>(null);
  const [busy, setBusy] = useState<ReadonlySet<string>>(new Set());
  const [errs, setErrs] = useState<ReadonlySet<string>>(new Set());
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // rows that appear after the first render get the open + fade-in animation
  const known = useRef<Set<string> | null>(null);
  const fresh = useRef<Set<string>>(new Set());
  if (known.current === null) known.current = new Set(entries.map((e) => e.id));
  for (const e of entries) {
    if (!known.current.has(e.id)) {
      known.current.add(e.id);
      fresh.current.add(e.id);
    }
  }

  const byId = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);

  /** Everything that builds on `id` (transitively) and is still in place, in list order. */
  const dependentsOf = (id: string): LedgerEntry[] => {
    const hit = new Set<string>([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const e of entries) {
        if (!hit.has(e.id) && e.state === 'done' && e.dependsOn?.some((d) => hit.has(d))) {
          hit.add(e.id);
          grew = true;
        }
      }
    }
    return entries.filter((e) => e.id !== id && hit.has(e.id));
  };

  const active = pointAt !== undefined ? pointAt : hot;
  const point = new Map<string, Point>();
  const root = active ? byId.get(active) : undefined;
  if (onUndo && root && root.state === 'done' && !root.irreversible && !busy.has(root.id)) {
    point.set(root.id, 'root');
    for (const d of dependentsOf(root.id)) point.set(d.id, d.irreversible ? 'cant' : 'also');
  }

  // stagger: a row struck because of another one waits a beat after it
  const depth = useMemo(() => {
    const memo = new Map<string, number>();
    const go = (id: string, seen: Set<string>): number => {
      const hit = memo.get(id);
      if (hit !== undefined) return hit;
      if (seen.has(id)) return 0;
      seen.add(id);
      const e = byId.get(id);
      let d = 0;
      for (const p of e?.dependsOn ?? []) {
        if (byId.get(p)?.state === 'undone') d = Math.max(d, 1 + go(p, seen));
      }
      memo.set(id, d);
      return d;
    };
    return (id: string) => go(id, new Set());
  }, [byId]);

  const run = async (id: string, fn: (id: string, ids: string[]) => void | Promise<void>, ids: string[]) => {
    if (busy.has(id)) return;
    setHot(null);
    setBusy((s) => new Set([...s, ...ids]));
    try {
      await fn(id, ids);
    } catch {
      setErrs((s) => new Set(s).add(id));
      timers.current.push(window.setTimeout(() => setErrs((s) => { const n = new Set(s); n.delete(id); return n; }), 4000));
    } finally {
      setBusy((s) => {
        const n = new Set(s);
        ids.forEach((i) => n.delete(i));
        return n;
      });
    }
  };

  const undone = entries.filter((e) => e.state === 'undone').length;

  return (
    <section className={`alc${className ? ` ${className}` : ''}`}>
      <header className="alc-head">
        <NotepadText className="alc-head-ic" size={14} strokeWidth={1.8} aria-hidden="true" />
        <h3 className="alc-title">{title}</h3>
        {agent ? <span className="alc-agent">{agent}</span> : null}
        <span className="alc-counts">
          <span><b>{faNum(entries.length)}</b> {countLabel}</span>
          {undone > 0 ? <span className="alc-undone-count"><b>{faNum(undone)}</b> برگردانده</span> : null}
        </span>
      </header>

      <div className="alc-card">
        {entries.length === 0 ? (
          <EmptyState icon={NotepadText} title={empty} />
        ) : (
          <ol className="alc-list" aria-label={title}>
            {entries.map((e) => {
              const isBusy = busy.has(e.id) || e.state === 'pending';
              const s = isBusy ? 'pending' : e.state;
              const pt = point.get(e.id);
              const dep = e.state === 'done' && !e.irreversible ? dependentsOf(e.id) : [];
              const ids = [e.id, ...dep.filter((d) => !d.irreversible).map((d) => d.id)];
              const canUndo = e.state === 'done' && !e.irreversible && !!onUndo;
              const canRedo = e.state === 'undone' && !!onRedo;
              const redoIds = [e.id, ...entries.filter((d) => d.state === 'undone' && d.id !== e.id && d.dependsOn?.includes(e.id)).map((d) => d.id)];
              const pointProps = {
                onPointerEnter: (ev: ReactPointerEvent) => { if (ev.pointerType === 'mouse') setHot(e.id); },
                onPointerLeave: () => setHot((h) => (h === e.id ? null : h)),
                onFocus: () => setHot(e.id),
                onBlur: () => setHot((h) => (h === e.id ? null : h)),
              };
              return (
                <li key={e.id} className="alc-item" data-new={fresh.current.has(e.id) ? '' : undefined}>
                  <div className="alc-clip">
                    <div
                      className={`alc-row${canRedo ? ' alc-has-redo' : ''}`}
                      data-s={s}
                      data-pt={pt}
                      data-err={errs.has(e.id) ? '' : undefined}
                      style={{ ['--alc-d' as string]: `${(s === 'undone' ? depth(e.id) : 0) * 110}ms` }}
                      aria-busy={isBusy || undefined}
                    >
                      <span className="alc-tile" aria-hidden="true">
                        <span className="alc-tile-in">
                          {e.icon ?? (
                            s === 'failed' ? <TriangleAlert size={14} strokeWidth={1.8} className="alc-ic-bad" />
                              : s === 'undone' ? <Undo2 size={14} strokeWidth={1.8} />
                              : s === 'pending' ? <LoaderCircle size={14} strokeWidth={1.8} className="alc-spin" />
                              : <Check size={14} strokeWidth={2} />
                          )}
                        </span>
                      </span>

                      <div className="alc-txt">
                        <p className="alc-l1">
                          <span className="alc-strike">
                            <span className="alc-name">{e.title}</span>
                            {e.target ? <span className="alc-target">{e.target}</span> : null}
                          </span>
                          {s === 'undone' ? <span className="alc-sr">، برگردانده شد</span> : null}
                        </p>
                        {e.change ? (
                          <p className="alc-l2">
                            <span className="alc-before">{e.change[0]}</span>
                            <span className="alc-arrow" aria-hidden="true">→</span>
                            <span className="alc-sr"> به </span>
                            <span>{e.change[1]}</span>
                          </p>
                        ) : e.detail ? (
                          <p className="alc-l2"><span>{e.detail}</span></p>
                        ) : null}
                      </div>

                      <div className="alc-slot">
                        <span className="alc-l alc-l-time">
                          {e.when}
                          {e.system ? <span className="alc-sys"> · {e.system}</span> : null}
                        </span>
                        <span className="alc-l alc-l-label">برگردانده شد</span>
                        <span className="alc-l alc-l-busy"><LoaderCircle size={13} strokeWidth={2} className="alc-spin" aria-hidden="true" />در حال برگرداندن…</span>
                        <span className="alc-l alc-l-pill alc-pill-bad alc-l-failed">ناموفق بود</span>
                        <span className="alc-l alc-l-pill alc-pill-bad alc-l-err">برگرداندن نشد</span>
                        <span className="alc-l alc-l-pill alc-pill-blue alc-l-also">همراه برمی‌گردد</span>
                        <span className="alc-l alc-l-pill alc-pill-amber alc-l-cant"><Lock size={13} strokeWidth={1.9} aria-hidden="true" />برگشت‌پذیر نیست</span>

                        <span className="alc-l alc-l-undo">
                          {canUndo ? (
                            <button
                              type="button"
                              className="alc-btn"
                              aria-label={`برگرداندن: ${e.title}${dep.length ? ` (${faNum(dep.length)} تغییر وابسته هم برگردانده می‌شود)` : ''}`}
                              onClick={() => run(e.id, onUndo!, ids)}
                              {...pointProps}
                            >
                              <Undo2 size={14} strokeWidth={1.9} aria-hidden="true" />
                              <span className="alc-btn-t">برگردان</span>
                            </button>
                          ) : null}
                        </span>
                        <span className="alc-l alc-l-redo">
                          {canRedo ? (
                            <button
                              type="button"
                              className="alc-btn alc-btn-redo"
                              aria-label={`انجام دوباره: ${e.title}`}
                              onClick={() => run(e.id, onRedo!, redoIds)}
                            >
                              <Redo2 size={14} strokeWidth={1.9} aria-hidden="true" />
                              <span className="alc-btn-t">دوباره</span>
                            </button>
                          ) : null}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
