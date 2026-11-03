import { useState, useId, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { StatusDot, type Tone } from './StatusDot';

type Risk = 'low' | 'mid' | 'high';
type Status = 'pending' | 'approved' | 'rejected';

const RISK: Record<Risk, { tone: Tone; word: string }> = {
  low: { tone: 'ok', word: 'کم' },
  mid: { tone: 'warn', word: 'متوسط' },
  high: { tone: 'bad', word: 'زیاد' },
};

/** A proposed change waiting for a yes or no. Pass `status` to control it, or leave it out to let the card remember. */
export function ApprovalCard({ title, summary, detail, risk, onApprove, onReject, approveLabel = 'تأیید', rejectLabel = 'رد', status }: {
  title: string;
  summary: string;
  detail?: ReactNode;
  risk?: Risk;
  onApprove: () => void | Promise<void>;
  onReject: () => void | Promise<void>;
  approveLabel?: string;
  rejectLabel?: string;
  status?: Status;
}) {
  const [own, setOwn] = useState<Status>('pending');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const detailId = useId();
  const current = status ?? own;

  const run = async (handler: () => void | Promise<void>, next: Status) => {
    if (busy) return;
    setBusy(true);
    try {
      await handler();
      setOwn(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="appr" aria-label={title} aria-busy={busy}>
      <header className="appr-head">
        <h3 className="appr-title">{title}</h3>
        {risk ? (
          <span className="appr-risk">
            <StatusDot tone={RISK[risk].tone} />
            ریسک {RISK[risk].word}
          </span>
        ) : null}
      </header>
      <p className="appr-summary">{summary}</p>

      {detail ? (
        <>
          <button type="button" className="appr-toggle" aria-expanded={open} aria-controls={detailId} onClick={() => setOpen((o) => !o)}>
            جزئیات
            <ChevronDown className="appr-chev" size={14} aria-hidden="true" />
          </button>
          <div id={detailId} className="appr-detail" data-open={open} hidden={!open}>{detail}</div>
        </>
      ) : null}

      {current === 'pending' ? (
        <div className="appr-actions">
          <Button variant="primary" disabled={busy} aria-busy={busy} onClick={() => run(onApprove, 'approved')}>{approveLabel}</Button>
          <Button disabled={busy} aria-busy={busy} onClick={() => run(onReject, 'rejected')}>{rejectLabel}</Button>
        </div>
      ) : (
        <p className="appr-outcome" role="status">
          <StatusDot tone={current === 'approved' ? 'ok' : 'quiet'} />
          {current === 'approved' ? 'تأیید شد' : 'رد شد'}
        </p>
      )}
    </article>
  );
}
