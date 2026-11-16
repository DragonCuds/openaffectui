"use client";

import type { CSSProperties, ElementType, ReactNode } from 'react';
import { Camera, Check, Film } from 'lucide-react';
import { Chip } from './Chip';
import { faNum } from './digits';

/**
 * A folder of sample works: the cover picture, the title, how many items, a few tags. A button when `onClick` is given
 * (open it, or pick it with `selected`), otherwise a plain block. `small` is the compact one for lists.
 * Tiles show the tint of `hue` when there is no `cover`. Styles in src/styles/foldercard.css. No borders.
 */
export function FolderCard({ title, cover, hue = 210, count, videos, tags = [], more, selected, small, onClick, disabled, hint, as: Tag, className }: {
  title: string;
  /** Cover picture URL. */
  cover?: string | null;
  hue?: number;
  count: number;
  /** Shows a small film mark when the cover itself is a video. */
  videos?: boolean;
  tags?: string[];
  /** Extra tags not shown, e.g. 2 → «+۲». */
  more?: number;
  /** In a pick list: on/off. Sets `aria-pressed`. */
  selected?: boolean;
  small?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  /** A line under the tags (e.g. «کاور ندارد»). */
  hint?: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  const Root: ElementType = Tag ?? (onClick ? 'button' : 'div');
  const props = onClick
    ? { type: Root === 'button' ? 'button' : undefined, onClick, disabled, 'aria-pressed': selected === undefined ? undefined : selected }
    : {};
  return (
    <Root className={['fcard', className ?? ''].filter(Boolean).join(' ')} data-small={small || undefined} data-selected={selected || undefined} data-action={onClick ? '' : undefined} {...props}>
      <span className="fcard-cover" style={{ '--h': hue } as CSSProperties}>
        {cover ? <img src={cover} alt="" loading="lazy" /> : videos ? <Film size={26} aria-hidden="true" /> : <Camera size={26} aria-hidden="true" />}
        <span className="fcard-n">{faNum(count)}</span>
        {selected ? <span className="fcard-on" aria-hidden="true"><Check size={16} /></span> : null}
      </span>
      <span className="fcard-body">
        <strong className="fcard-t">{title}</strong>
        {tags.length || more ? (
          <span className="fcard-tags">
            {tags.map((t) => <Chip key={t}>{t}</Chip>)}
            {more ? <Chip tone="quiet">+{faNum(more)}</Chip> : null}
          </span>
        ) : null}
        {hint ? <span className="fcard-hint">{hint}</span> : null}
      </span>
    </Root>
  );
}
