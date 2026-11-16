import type { ReactNode } from 'react';
import { cx, type TintArea } from './yv';

/**
 * Row for use inside a card: optional `icon` in a 40px tinted square, a `title` with a muted `caption` under it
 * (above it when `captionAbove`, like «خواب دیشب» over the value), and a `trailing` text or node at the end.
 * Rows are separated by space, never by lines. A link when `href` is given, a button when `onClick` is.
 */
export function ListRow({ title, caption, captionAbove = false, icon, area = 'neutral', trailing, href, onClick, className }: {
  title: string;
  caption?: string;
  captionAbove?: boolean;
  icon?: ReactNode;
  area?: TintArea;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const cls = cx('yv', 'yv-row', className);
  const body = (
    <>
      {icon ? <span className="yv-row-ic" data-area={area} aria-hidden="true">{icon}</span> : null}
      <span className="yv-row-tx">
        {caption && captionAbove ? <span className="yv-cap">{caption}</span> : null}
        <span className="yv-head">{title}</span>
        {caption && !captionAbove ? <span className="yv-cap">{caption}</span> : null}
      </span>
      {trailing != null && trailing !== false ? <span className="yv-row-end">{trailing}</span> : null}
    </>
  );
  if (href) return <a className={cls} href={href}>{body}</a>;
  if (onClick) return <button type="button" className={cls} onClick={onClick}>{body}</button>;
  return <div className={cls}>{body}</div>;
}
