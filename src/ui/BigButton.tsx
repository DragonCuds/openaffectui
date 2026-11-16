import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './yv';

/** Big 56px pill button for the v2 look. `primary` is the one main action, `soft` a neutral one, `quiet` a text button, `help` only for a help request. */
export function BigButton({ variant = 'primary', block = false, icon, children, className, type = 'button', ...rest }: {
  variant?: 'primary' | 'soft' | 'quiet' | 'help';
  /** Full width. */
  block?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>) {
  return (
    <button type={type} className={cx('yv', 'yv-btn', className)} data-variant={variant} data-block={block || undefined} {...rest}>
      {icon ? <span className="yv-btn-ic" aria-hidden="true">{icon}</span> : null}
      {children}
    </button>
  );
}
