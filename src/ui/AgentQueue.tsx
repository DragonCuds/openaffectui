import { useState } from 'react';
import { ChevronDown, ChevronUp, ListOrdered, X } from 'lucide-react';
import { EmptyState } from './States';
import { faNum } from './digits';

export type QueueItem = {
  id: string;
  title: string;
  meta?: string;
};

/** Waiting jobs in order, with keyboard-friendly move up/down and remove. The parent owns the order. */
export function AgentQueue({ items, onMove, onRemove, empty = 'صف خالی است' }: {
  items: QueueItem[];
  onMove: (id: string, dir: 'up' | 'down') => void | Promise<void>;
  onRemove: (id: string) => void | Promise<void>;
  empty?: string;
}) {
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());

  const run = async (id: string, fn: (id: string) => void | Promise<void>) => {
    if (pending.has(id)) return;
    setPending((s) => new Set(s).add(id));
    try {
      await fn(id);
    } finally {
      setPending((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  };

  if (items.length === 0) return <EmptyState icon={ListOrdered} title={empty} />;

  return (
    <ol className="queue" aria-label="صف کارهای منتظر">
      {items.map((it, i) => {
        const busy = pending.has(it.id);
        return (
          <li key={it.id} className="queue-item" aria-busy={busy}>
            <span className="queue-num" aria-hidden="true">{faNum(i + 1)}</span>
            <div className="queue-main">
              <p className="queue-title">{it.title}</p>
              {it.meta ? <p className="queue-meta">{it.meta}</p> : null}
            </div>
            <div className="queue-actions">
              <button
                type="button"
                className="queue-btn"
                disabled={busy || i === 0}
                aria-label={`بالا بردن: ${it.title}`}
                onClick={() => run(it.id, (id) => onMove(id, 'up'))}
              >
                <ChevronUp size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="queue-btn"
                disabled={busy || i === items.length - 1}
                aria-label={`پایین بردن: ${it.title}`}
                onClick={() => run(it.id, (id) => onMove(id, 'down'))}
              >
                <ChevronDown size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="queue-btn queue-remove"
                disabled={busy}
                aria-label={`حذف از صف: ${it.title}`}
                onClick={() => run(it.id, onRemove)}
              >
                <X size={14} aria-hidden="true" />
                <span className="queue-remove-text">حذف از صف</span>
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
