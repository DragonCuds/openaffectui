import type { ReactNode } from 'react';

/** Tinted panel. `tone="accent"` lifts it with a soft accent wash and shadow, for the one card a page is about. */
export function Surface({ as: Tag = 'div', className, tone, children }: {
  as?: 'div' | 'section' | 'article';
  className?: string;
  tone?: 'accent';
  children?: ReactNode;
}) {
  const cls = ['surface', tone ? `surface-${tone}` : '', className ?? ''].filter(Boolean).join(' ');
  return <Tag className={cls}>{children}</Tag>;
}
