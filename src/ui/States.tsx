import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox, CircleAlert } from 'lucide-react';
import { Button } from './Button';
import { ShimmerBlock } from './Shimmer';

/** Stacked placeholder blocks with the shared shimmer sweep while a screen loads. */
export function Skeleton({ rows = 3, height = 64 }: { rows?: number; height?: number }) {
  return (
    <div className="skel-stack" aria-busy="true" aria-label="در حال بارگذاری">
      {Array.from({ length: rows }, (_, i) => <ShimmerBlock key={i} height={height} radius="var(--radius-card)" style={{ flexShrink: 0 }} />)}
    </div>
  );
}

/** Nothing here yet: an icon, a sentence, and optionally the next step. */
export function EmptyState({ icon: Icon = Inbox, title, hint, action }: { icon?: LucideIcon; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-ic"><Icon size={22} strokeWidth={1.6} aria-hidden="true" /></span>
      <p className="empty-title">{title}</p>
      {hint ? <p className="muted">{hint}</p> : null}
      {action}
    </div>
  );
}

/** A failed load, with a retry. */
export function Notice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="empty" role="alert">
      <span className="empty-ic bad"><CircleAlert size={22} strokeWidth={1.6} aria-hidden="true" /></span>
      <p className="empty-title">{message}</p>
      {onRetry ? <Button onClick={onRetry}>دوباره امتحان کن</Button> : null}
    </div>
  );
}

/** A quiet box with a sentence and, optionally, buttons for the next step. */
export function Callout({ children, action, role, tone }: { children: ReactNode; action?: ReactNode; role?: 'status' | 'note' | 'alert'; /** 'bad' tints it red (a danger the person must read). */ tone?: 'bad' }) {
  return (
    <div className="callout" role={role} data-tone={tone}>
      <p className="callout-t">{children}</p>
      {action ? <div className="callout-act">{action}</div> : null}
    </div>
  );
}
