import type { CSSProperties } from 'react';

/** Initials on a soft gradient (hue 0-360), or a photo when `src` is given. */
export function Avatar({ name, hue = 210, size = 40, src, className }: {
  name: string;
  hue?: number;
  size?: number;
  src?: string;
  className?: string;
}) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.length > 1 ? `${[...words[0]][0]}‌${[...words[1]][0]}` : [...(words[0] ?? '؟')][0];
  const style = { '--av': `${size}px`, '--h': hue } as CSSProperties;
  return (
    <span className={className ? `avatar ${className}` : 'avatar'} style={style} role="img" aria-label={name}>
      {src ? <img src={src} alt="" loading="lazy" /> : <span aria-hidden="true">{initials}</span>}
    </span>
  );
}
