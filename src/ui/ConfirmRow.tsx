import type { ReactNode } from 'react';
import { Button } from './Button';

/** One shared «are you sure?» row: a question and two buttons. Replaces hand-made confirm blocks. */
export function ConfirmRow({
  question, confirmLabel, cancelLabel = 'بی‌خیال', onConfirm, onCancel, busy = false, danger = false, label, className,
}: {
  question: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  /** Tints the question red (for deletes). */
  danger?: boolean;
  /** Accessible name of the group. */
  label?: string;
  className?: string;
}) {
  return (
    <div className={className ? `cfr ${className}` : 'cfr'} role="group" aria-label={label} data-danger={danger || undefined}>
      <span className="cfr-q">{question}</span>
      <Button variant="primary" onClick={onConfirm} disabled={busy} aria-busy={busy}>{confirmLabel}</Button>
      <Button onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
    </div>
  );
}
