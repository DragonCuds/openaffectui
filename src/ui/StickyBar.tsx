import type { ReactNode } from 'react';

/** Bar fixed to the bottom of the screen (phones). Hidden from `minWidth` up unless `always`. Styles in src/styles/fact.css. */
export function StickyBar({ children, className, always }: { children?: ReactNode; className?: string; always?: boolean }) {
  return <div className={['sticky-bar', className ?? ''].filter(Boolean).join(' ')} data-always={always || undefined}>{children}</div>;
}
