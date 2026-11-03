import type { ReactNode } from 'react';

export function Surface({ as: Tag = 'div', className, children }: {
  as?: 'div' | 'section' | 'article';
  className?: string;
  children?: ReactNode;
}) {
  return <Tag className={className ? `surface ${className}` : 'surface'}>{children}</Tag>;
}
