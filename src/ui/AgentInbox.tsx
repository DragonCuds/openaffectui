import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import type { Tone } from './StatusDot';
import { RollingNumber } from './RollingNumber';
import { EmptyState } from './States';

/* Agent Inbox: background work in one calm board (or list). Cards unfold to the last steps with their actions
   and glide to their new column when the host moves them. Written from scratch to match the look and motion of
   the public demo of the affectui.com Agent Inbox; nothing of its source was used. */

export type InboxGroup = string;
export type InboxView = 'board' | 'list';

export type InboxStep = { text: string; time?: string };
export type InboxStat = { icon?: ReactNode; value: ReactNode; label?: string };
export type InboxAction = { id: string; label: string; primary?: boolean; onClick?: () => void };

export type InboxItem = {
  id: string;
  /** Which column / section the item sits in */
  group: InboxGroup;
  title: string;
  /** Short description: two lines while folded, in full once open */
  summary?: string;
  /** Status text, e.g. «منتظر شما». In the board, running/done items show only the clock to keep it short */
  meta?: string;
  /** Clock or duration shown after the status, e.g. «۳:۴۲» */
  time?: string;
  /** Colours the star, the status icon and the dot: warn = waits for you, busy = running, ok = done, bad = failed */
  tone?: Tone;
  /** Small counters at the end of the status line (icon + number) */
  stats?: InboxStat[];
  /** Model or agent name above the steps */
  model?: string;
  /** Latest steps, oldest first; only the last `maxSteps` are shown */
  steps?: InboxStep[];
  /** Buttons at the bottom of the open card */
  actions?: InboxAction[];
};

export type InboxGroupDef = { key: InboxGroup; label: string; tone: Tone };

const GROUPS: InboxGroupDef[] = [
  { key: 'need', label: 'منتظر تو', tone: 'warn' },
  { key: 'running', label: 'در حال اجرا', tone: 'busy' },
  { key: 'done', label: 'انجام شد', tone: 'ok' },
];

export function AgentInbox({
  items,
  groups = GROUPS,
  view: viewProp,
  defaultView = 'board',
  onViewChange,
  selectedId: selectedProp,
  defaultSelectedId,
  onSelect,
  crumbs,
  maxSteps = 4,
  viewLabels = { board: 'برد', list: 'فهرست' },
  empty = 'فعلاً کاری در صف نیست',
  label = 'صندوق کارها',
}: {
  items: InboxItem[];
  groups?: InboxGroupDef[];
  view?: InboxView;
  defaultView?: InboxView;
  onViewChange?: (v: InboxView) => void;
  /** Open card (controlled). Leave out to let the inbox keep it. */
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Breadcrumb above the board, last one is the current page. Pass nothing to hide the header row text. */
  crumbs?: string[];
  maxSteps?: number;
  viewLabels?: { board: string; list: string };
  empty?: string;
  label?: string;
}) {
  const [viewState, setViewState] = useState<InboxView>(defaultView);
  const view = viewProp ?? viewState;
  const [selState, setSelState] = useState<string | null>(defaultSelectedId ?? null);
  const selected = selectedProp !== undefined ? selectedProp : selState;
  const uid = useId();

  const rootRef = useRef<HTMLDivElement>(null);
  const snap = useRef<Map<string, DOMRect>>(new Map());
  const lastView = useRef(view);
  const mounted = useRef(false);

  // Where every card is right now, taken before React changes the DOM, so the layout effect can glide
  // each card that ended up somewhere else (new column, a neighbour left, ...) from there to its new place.
  if (typeof document !== 'undefined' && rootRef.current) {
    const m = new Map<string, DOMRect>();
    rootRef.current.querySelectorAll<HTMLElement>('[data-card]').forEach((el) => m.set(el.dataset.card!, el.getBoundingClientRect()));
    snap.current = m;
  }

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = [...root.querySelectorAll<HTMLElement>('[data-card]')];
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const viewChanged = lastView.current !== view;
    lastView.current = view;
    els.forEach((el) => el.getAnimations().filter((a) => a.id === 'ai-flip').forEach((a) => a.cancel()));
    els.forEach((el) => {
      const prev = snap.current.get(el.dataset.card!);
      if (calm) return;
      if (!prev) {
        if (mounted.current) {
          const a = el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
          a.id = 'ai-flip';
        }
        return;
      }
      if (viewChanged) return;
      const next = el.getBoundingClientRect();
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.dataset.moving = '';
      const a = el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      a.id = 'ai-flip';
      const done = () => { if (!el.getAnimations().some((x) => x.id === 'ai-flip' && x !== a && x.playState === 'running')) delete el.dataset.moving; };
      a.addEventListener('finish', done);
      a.addEventListener('cancel', done);
    });
    mounted.current = true;
  });

  const setView = (v: InboxView) => { setViewState(v); onViewChange?.(v); };
  const select = (id: string | null) => { setSelState(id); onSelect?.(id); };

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const all = [...(rootRef.current?.querySelectorAll<HTMLElement>('.ai-trigger') ?? [])];
    const i = all.indexOf(e.currentTarget);
    const n = all[i + (e.key === 'ArrowDown' ? 1 : -1)];
    if (n) { e.preventDefault(); n.focus(); }
  };

  const cols = groups.map((g) => ({ ...g, rows: items.filter((i) => i.group === g.key) }));
  const shown = view === 'list' ? cols.filter((c) => c.rows.length > 0) : cols;

  if (items.length === 0) return <EmptyState title={empty} />;

  return (
    <div className="ai" ref={rootRef} data-view={view} role="region" aria-label={label}>
      <div className="ai-bar">
        {crumbs?.length ? (
          <nav className="ai-crumbs" aria-label="مسیر">
            {crumbs.map((c, i) => (
              <span key={i} className="ai-crumb" aria-current={i === crumbs.length - 1 ? 'page' : undefined}>
                {i > 0 ? <span className="ai-slash" aria-hidden="true">/</span> : null}
                {c}
              </span>
            ))}
          </nav>
        ) : <span />}
        <div className="ai-seg" role="group" aria-label="نحوه‌ی نمایش" style={{ '--i': view === 'board' ? 0 : 1 } as CSSProperties}>
          <span className="ai-seg-thumb" aria-hidden="true" />
          <button type="button" className="ai-seg-opt" aria-pressed={view === 'board'} onClick={() => setView('board')}>
            <BoardIcon />{viewLabels.board}
          </button>
          <button type="button" className="ai-seg-opt" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <Menu size={14} strokeWidth={1.8} aria-hidden="true" />{viewLabels.list}
          </button>
        </div>
      </div>

      <div className="ai-cols" style={{ '--n': Math.max(1, shown.length) } as CSSProperties}>
        {shown.map((g) => (
          <section className="ai-col" key={g.key} data-empty={g.rows.length === 0 || undefined} aria-labelledby={`${uid}-${g.key}`}>
            <header className="ai-col-head">
              <Spark tone="info" soft />
              <h3 id={`${uid}-${g.key}`} className="ai-col-label">{g.label}</h3>
              <span className="ai-count"><RollingNumber value={g.rows.length} /></span>
            </header>
            <div className="ai-col-list">
              {g.rows.map((it) => (
                <Card
                  key={it.id}
                  item={it}
                  fallback={g.tone}
                  open={selected === it.id}
                  maxSteps={maxSteps}
                  uid={uid}
                  onToggle={() => select(selected === it.id ? null : it.id)}
                  onKey={onKey}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Card({ item, fallback, open, maxSteps, uid, onToggle, onKey }: {
  item: InboxItem; fallback: Tone; open: boolean; maxSteps: number; uid: string; onToggle: () => void; onKey: (e: KeyboardEvent<HTMLElement>) => void;
}) {
  const tone = item.tone ?? fallback;
  const steps = (item.steps ?? []).slice(-maxSteps);
  const hasMore = steps.length > 0 || !!item.actions?.length;
  const bodyId = `${uid}-b-${item.id}`;
  // Running and finished items only show the clock in the board, the word comes back in the list.
  const soft = tone === 'busy' || tone === 'ok';

  return (
    <article className="ai-card" data-card={item.id} data-open={open || undefined} data-tone={tone}>
      <button type="button" className="ai-trigger" aria-expanded={open} aria-controls={hasMore ? bodyId : undefined} onClick={onToggle} onKeyDown={onKey}>
        <span className="ai-head">
          <Spark tone={tone} />
          <span className="ai-title" dir="auto">{item.title}</span>
        </span>
        {item.summary ? <span className="ai-summary" dir="auto">{item.summary}</span> : null}
        {item.meta || item.time || item.stats?.length ? (
          <span className="ai-status">
            <span className="ai-st">
              <StatusIcon tone={tone} />
              <span className="ai-st-text">
                {item.meta ? <span className={soft && item.time ? 'ai-st-word' : undefined}>{item.meta}</span> : null}
                {item.meta && item.time ? <span className={soft ? 'ai-st-word' : undefined}> · </span> : null}
                {item.time ? <span className="ai-time">{item.time}</span> : null}
              </span>
            </span>
            {item.stats?.length ? (
              <span className="ai-stats">
                {item.stats.map((s, i) => (
                  <span className="ai-stat" key={i} title={s.label}>
                    {s.icon}<span className="ai-stat-n">{s.value}</span>
                  </span>
                ))}
              </span>
            ) : null}
          </span>
        ) : null}
      </button>

      {hasMore ? (
        <div className="ai-more" id={bodyId} data-open={open || undefined} inert={!open}>
          <div className="ai-more-in">
            <div className="ai-more-pad">
              {steps.length ? (
                <>
                  <div className="ai-rule" />
                  {item.model ? <p className="ai-model" dir="auto">{item.model}</p> : null}
                  <ol className="ai-steps">
                    {steps.map((s, i) => (
                      <li className="ai-step" key={s.text + i} data-last={i === steps.length - 1 || undefined}>
                        <span className="ai-step-text" dir="auto">{s.text}</span>
                        {s.time ? <span className="ai-step-time">{s.time}</span> : null}
                      </li>
                    ))}
                  </ol>
                </>
              ) : null}
              {item.actions?.length ? (
                <div className="ai-actions">
                  {item.actions.map((a) => (
                    <button type="button" key={a.id} className={a.primary ? 'ai-act ai-act-primary' : 'ai-act'} onClick={a.onClick}>{a.label}</button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

/* ---------- icons ---------- */

/** Four-point star with a small dot, tinted by tone (the column heads use a softer one). */
function Spark({ tone, soft }: { tone: Tone; soft?: boolean }) {
  return (
    <span className={`ai-spark${soft ? ' ai-spark-soft' : ''}`} data-tone={tone} aria-hidden="true">
      <svg viewBox="0 0 16 16" width="14" height="14">
        <path d="M6.6 1.4c.5 3.4 1.5 4.6 4.9 5.1-3.4.5-4.4 1.7-4.9 5.1-.5-3.4-1.5-4.6-4.9-5.1 3.4-.5 4.4-1.7 4.9-5.1Z" fill="currentColor" />
        <circle cx="12.6" cy="12.4" r="1.2" fill="currentColor" opacity="0.55" />
      </svg>
    </span>
  );
}

function StatusIcon({ tone }: { tone: Tone }) {
  if (tone === 'warn') return <svg className="ai-ic ai-ic-warn" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6.7 2.6a1.5 1.5 0 0 1 2.6 0l5 8.8a1.5 1.5 0 0 1-1.3 2.2H3a1.5 1.5 0 0 1-1.3-2.2Z" fill="currentColor" /></svg>;
  if (tone === 'bad') return <svg className="ai-ic ai-ic-bad" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="currentColor" /><path d="M8 4.8v3.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /><circle cx="8" cy="11.3" r="0.9" fill="#fff" /></svg>;
  if (tone === 'busy') return <svg className="ai-ic ai-ic-busy" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" /><circle className="ai-spin" cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="14 40" /></svg>;
  return <span className="ai-ic ai-ic-dot" data-tone={tone} aria-hidden="true" />;
}

function BoardIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2.2" y="2.5" width="4" height="11" rx="1.3" />
      <rect x="9.6" y="2.5" width="4" height="6.5" rx="1.3" />
    </svg>
  );
}
