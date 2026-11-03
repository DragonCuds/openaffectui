import { useState } from 'react';
import { History, Undo2 } from 'lucide-react';
import { Button } from './Button';
import { EmptyState } from './States';
import { StatusDot } from './StatusDot';

export type LedgerEntry = {
  id: string;
  /** Ready-made text such as «امروز ۱۴:۳۰». */
  when: string;
  title: string;
  detail?: string;
  state: 'done' | 'undone' | 'failed';
};

/** What the agent did, newest first as given, with a one-tap undo on finished items. */
export function AgentLedger({ entries, onUndo, empty = 'هنوز کاری انجام نشده' }: {
  entries: LedgerEntry[];
  onUndo: (id: string) => void | Promise<void>;
  empty?: string;
}) {
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());

  const undo = async (id: string) => {
    if (pending.has(id)) return;
    setPending((s) => new Set(s).add(id));
    try {
      await onUndo(id);
    } finally {
      setPending((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  };

  if (entries.length === 0) return <EmptyState icon={History} title={empty} />;

  return (
    <ul className="ledger" aria-label="سابقه‌ی کارهای انجام‌شده">
      {entries.map((e) => (
        <li key={e.id} className={`ledger-item${e.state === 'undone' ? ' ledger-undone' : ''}`}>
          <div className="ledger-main">
            <span className="ledger-when">
              {e.state === 'failed' ? <StatusDot tone="bad" /> : null}
              {e.when}
            </span>
            <p className="ledger-title">{e.title}</p>
            {e.detail ? <p className="ledger-detail">{e.detail}</p> : null}
            {e.state === 'failed' ? <span className="ledger-tag ledger-tag-bad">ناموفق بود</span> : null}
            {e.state === 'undone' ? <span className="ledger-tag">برگردانده شد</span> : null}
          </div>
          {e.state === 'done' ? (
            <Button
              className="ledger-undo"
              disabled={pending.has(e.id)}
              aria-busy={pending.has(e.id)}
              aria-label={`برگرداندن: ${e.title}`}
              onClick={() => undo(e.id)}
            >
              <Undo2 size={14} aria-hidden="true" />
              برگرداندن
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
