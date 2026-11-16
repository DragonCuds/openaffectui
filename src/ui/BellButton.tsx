import type { AnchorHTMLAttributes, ElementType } from 'react';
import { Bell } from 'lucide-react';
import { faNum } from './digits';

/**
 * Round bell button with a small count badge (new notices). It is a link by default; pass `as` for next/link.
 * No count (0 or missing) shows no badge; above 99 shows «+۹۹». Styles in src/styles/bell.css.
 */
export function BellButton({ count = 0, label = 'خبرها', as: Tag = 'a', className, ...rest }: {
  count?: number;
  /** Accessible name; the count is added to it. */
  label?: string;
  as?: ElementType;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const n = Math.max(0, Math.floor(count));
  return (
    <Tag className={['bell', className ?? ''].filter(Boolean).join(' ')} aria-label={n ? `${label}، ${faNum(n)} تازه` : label} {...rest}>
      <Bell size={18} aria-hidden="true" />
      {n ? <span className="bell-badge" aria-hidden="true">{n > 99 ? '+۹۹' : faNum(n)}</span> : null}
    </Tag>
  );
}
