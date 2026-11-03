import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { StatusDot, type Tone } from './StatusDot';
import { RollingNumber } from './RollingNumber';
import { EmptyState } from './States';

export type InboxGroup = 'need' | 'running' | 'done';
export type InboxItem = { id: string; title: string; meta?: string; group: InboxGroup; tone?: Tone; actions?: ReactNode };

const GROUPS: { key: InboxGroup; label: string; tone: Tone }[] = [
  { key: 'need', label: 'منتظر تو', tone: 'warn' },
  { key: 'running', label: 'در حال اجرا', tone: 'busy' },
  { key: 'done', label: 'انجام شد', tone: 'ok' },
];

/** Work grouped by who it is waiting on. One listbox, arrow keys move across groups. */
export function AgentInbox({ items, selectedId, onSelect, empty = 'فعلاً کاری در صف نیست' }: {
  items: InboxItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  empty?: string;
}) {
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const groups = GROUPS.map((g) => ({ ...g, rows: items.filter((i) => i.group === g.key) })).filter((g) => g.rows.length > 0);
  // Visual order = group order, so keys follow what the eye sees.
  const flat = groups.flatMap((g) => g.rows);

  if (flat.length === 0) return <EmptyState title={empty} />;

  const cur = flat.findIndex((i) => i.id === selectedId);
  const tabId = flat[cur >= 0 ? cur : 0].id;

  const go = (n: number) => {
    const it = flat[n];
    onSelect(it.id);
    refs.current[it.id]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    // Keys pressed on a button inside a row's actions belong to that button.
    if (e.target !== e.currentTarget) return;
    const i = flat.findIndex((x) => x.id === e.currentTarget.dataset.id);
    let n = i;
    if (e.key === 'ArrowDown') n = Math.min(flat.length - 1, i + 1);
    else if (e.key === 'ArrowUp') n = Math.max(0, i - 1);
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = flat.length - 1;
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(flat[i].id); return; }
    else return;
    e.preventDefault();
    go(n);
  };

  return (
    <div className="inbox">
      {groups.map((g) => (
        <div className="inbox-group" key={g.key}>
          <div className="inbox-head">
            <StatusDot tone={g.tone} />
            <h3 id={`inbox-h-${g.key}`}>{g.label}</h3>
            <span className="inbox-count"><RollingNumber value={g.rows.length} /></span>
          </div>
          <div className="inbox-list" role="listbox" aria-labelledby={`inbox-h-${g.key}`}>
            {g.rows.map((it) => (
              <div
                key={it.id}
                ref={(el) => { refs.current[it.id] = el; }}
                data-id={it.id}
                role="option"
                aria-selected={it.id === selectedId}
                tabIndex={it.id === tabId ? 0 : -1}
                className="inbox-row"
                onClick={() => onSelect(it.id)}
                onKeyDown={onKey}
              >
                <StatusDot tone={it.tone ?? g.tone} />
                <span className="inbox-text">
                  <span className="inbox-title">{it.title}</span>
                  {it.meta ? <span className="inbox-meta">{it.meta}</span> : null}
                </span>
                {it.actions ? <span className="inbox-actions" onClick={(e) => e.stopPropagation()}>{it.actions}</span> : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
