import type { ReactNode } from 'react';

/** Re-mounts on id change so the new content fades in from a blur. */
export function BlurSwap({ id, className, children }: {
  id: string | number;
  className?: string;
  children?: ReactNode;
}) {
  return <div key={id} className={className ? `blurswap ${className}` : 'blurswap'}>{children}</div>;
}
