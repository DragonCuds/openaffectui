import type { ReactNode } from 'react';

/** Small rounded tag. `tone` tints it; `quiet` is the plain one. */
export function Chip({ children, icon, tone = 'quiet', className }: {
  children?: ReactNode;
  icon?: ReactNode;
  tone?: 'quiet' | 'ok' | 'busy' | 'bad' | 'dark';
  className?: string;
}) {
  return (
    <span className={['chip', `chip-${tone}`, className ?? ''].filter(Boolean).join(' ')}>
      {icon ? <span className="chip-ic" aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}
