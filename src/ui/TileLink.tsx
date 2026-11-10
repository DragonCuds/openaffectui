import type { CSSProperties, ElementType, ReactNode } from 'react';

/** A tappable tile: icon on a soft disc, a title and one small line. Used for categories and places. */
export function TileLink({ icon, title, caption, href = '#', as: Tag = 'a', hue, className }: {
  icon?: ReactNode;
  title: string;
  caption?: ReactNode;
  href?: string;
  as?: ElementType;
  /** Tints the icon disc (0-360). */
  hue?: number;
  className?: string;
}) {
  return (
    <Tag href={href} className={className ? `tile ${className}` : 'tile'} style={hue != null ? ({ '--h': hue } as CSSProperties) : undefined}>
      {icon ? <span className="tile-ic" aria-hidden="true">{icon}</span> : null}
      <span className="tile-t">{title}</span>
      {caption ? <span className="tile-c">{caption}</span> : null}
    </Tag>
  );
}
