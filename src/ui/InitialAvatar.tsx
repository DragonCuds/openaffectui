import type { CSSProperties } from 'react';
import { cx, initialOf, type TintArea } from './yv';

/**
 * Initial on a tinted circle (48px; pass 64 for the large one). `area` picks the tint; `solid` fills it with the strong colour
 * (e.g. the amber avatar on an alert). `initial` overrides the first letter of `name`. Hidden from screen readers unless `label` is given.
 */
export function InitialAvatar({ name = '', initial, size = 48, area = 'primary', solid = false, label, className }: {
  name?: string;
  initial?: string;
  size?: number;
  area?: TintArea;
  solid?: boolean;
  label?: string;
  className?: string;
}) {
  const style = { '--yv-av': `${size}px` } as CSSProperties;
  return (
    <span
      className={cx('yv', 'yv-avatar', className)} data-area={area} data-solid={solid || undefined} style={style}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {initial ?? initialOf(name)}
    </span>
  );
}
