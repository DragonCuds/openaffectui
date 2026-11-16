import type { ReactNode } from 'react';
import { cx } from './yv';

/** One destination of the BottomNav. `badge` shows the amber dot. With `href` it is a link, otherwise a button that calls `onSelect`. */
export type BottomNavItem = { key: string; label: string; icon: ReactNode; badge?: boolean; href?: string };

/**
 * Bottom navigation for phones: on the surface tone (no line), icon in a 64x32 pill that is soft primary when selected, small label.
 * `selected` is the key of the current item. Fixed to the bottom of the window by default; `phoneOnly` hides it from 720px up
 * (the desktop layout has its own navigation). Give the page enough bottom padding (about 100px) so nothing hides behind it.
 */
export function BottomNav({ items, selected, onSelect, label = 'منو', fixed = true, phoneOnly = true, className }: {
  items: BottomNavItem[];
  selected: string;
  onSelect?: (key: string) => void;
  /** Accessible name of the navigation. */
  label?: string;
  fixed?: boolean;
  phoneOnly?: boolean;
  className?: string;
}) {
  return (
    <nav className={cx('yv', 'yv-nav', className)} aria-label={label} data-fixed={fixed || undefined} data-phone-only={phoneOnly || undefined}>
      {items.map((it) => {
        const inner = (
          <>
            <span className="yv-nav-pill">
              <span aria-hidden="true" style={{ display: 'inline-grid' }}>{it.icon}</span>
              {it.badge ? <i className="yv-nav-badge" aria-hidden="true" /> : null}
            </span>
            <span>{it.label}</span>
          </>
        );
        const cur = it.key === selected ? ('page' as const) : undefined;
        return it.href ? (
          <a key={it.key} className="yv-nav-item" href={it.href} aria-current={cur} onClick={onSelect ? () => onSelect(it.key) : undefined}>{inner}</a>
        ) : (
          <button key={it.key} type="button" className="yv-nav-item" aria-current={cur} onClick={() => onSelect?.(it.key)}>{inner}</button>
        );
      })}
    </nav>
  );
}
