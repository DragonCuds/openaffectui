import type { ButtonHTMLAttributes } from 'react';

type Props = { variant?: 'primary' | 'soft' } & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = 'soft', className, type = 'button', ...rest }: Props) {
  const cls = ['btn', variant === 'primary' ? 'btn-primary' : '', className ?? ''].filter(Boolean).join(' ');
  return <button type={type} className={cls} {...rest} />;
}
