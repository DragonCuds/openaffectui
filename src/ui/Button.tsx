import type { ButtonHTMLAttributes } from 'react';

type Props = {
  variant?: 'primary' | 'soft';
  /** Shows a small spinner and blocks presses (use while a request is running). */
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = 'soft', loading, disabled, className, type = 'button', ...rest }: Props) {
  const cls = ['btn', variant === 'primary' ? 'btn-primary' : '', className ?? ''].filter(Boolean).join(' ');
  return <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} data-loading={loading || undefined} {...rest} />;
}
