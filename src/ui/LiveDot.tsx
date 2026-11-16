import type { CSSProperties } from 'react';
import { cx, type TintArea } from './yv';

/** Small live dot with a soft halo and a gentle pulse (no pulse when the person prefers reduced motion). Decorative: put the meaning in text next to it. */
export function LiveDot({ tone = 'calm', pulse = true, size = 8, className }: {
  tone?: TintArea;
  pulse?: boolean;
  /** Dot diameter in px; the halo adds 4px on every side. */
  size?: number;
  className?: string;
}) {
  const style = { '--yv-dot': `${size}px` } as CSSProperties;
  return <span className={cx('yv', 'yv-live', className)} data-area={tone} data-pulse={pulse} style={style} aria-hidden="true" />;
}
