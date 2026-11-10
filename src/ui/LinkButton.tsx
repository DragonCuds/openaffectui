import type { AnchorHTMLAttributes, ElementType } from 'react';

type Props = {
  variant?: 'primary' | 'soft';
  size?: 'md' | 'lg';
  /** Render with another link component (e.g. next/link) instead of a plain <a>. */
  as?: ElementType;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

/** Button that is a link. Same look as Button; use it for navigation. */
export function LinkButton({ variant = 'soft', size = 'md', as: Tag = 'a', className, ...rest }: Props) {
  const cls = ['btn', variant === 'primary' ? 'btn-primary' : '', size === 'lg' ? 'btn-lg' : '', className ?? ''].filter(Boolean).join(' ');
  return <Tag className={cls} {...rest} />;
}
