import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Props = {
  /** `ghost` is the quiet one: no fill until hovered, but with the same height and padding as the others (for «ویرایش», «جزئیات بیشتر»). */
  variant?: 'primary' | 'soft' | 'ghost';
  /** Shows a small spinner and blocks presses (use while a request is running). */
  loading?: boolean;
  /** Why the button is off: a short line under it, shown only while it is disabled. */
  reason?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = 'soft', loading, disabled, reason, className, type = 'button', ...rest }: Props) {
  const uid = useId();
  const off = !!(disabled || loading);
  const cls = ['btn', variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : '', className ?? ''].filter(Boolean).join(' ');
  const showReason = !!reason && !!disabled && !loading;
  const btn = (
    <button
      type={type} className={cls} disabled={off} aria-busy={loading || undefined} data-loading={loading || undefined}
      aria-describedby={showReason ? uid : undefined} {...rest}
    />
  );
  if (!showReason) return btn;
  return (
    <span className="btn-wrap">
      {btn}
      <small id={uid} className="btn-reason">{reason}</small>
    </span>
  );
}
