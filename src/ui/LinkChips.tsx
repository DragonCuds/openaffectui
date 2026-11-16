import type { ElementType } from 'react';

/** A wrapped row of small pill links, for «nearby places» and «other kinds of work». Server-safe. */
export function LinkChips({ items, label, as: Tag = 'a', className }: {
  /** `external` opens in a new tab (no referrer, nofollow) for links to other sites. */
  items: { label: string; href: string; note?: string; external?: boolean }[];
  label?: string;
  as?: ElementType;
  className?: string;
}) {
  return (
    <ul className={className ? `lchips ${className}` : 'lchips'} aria-label={label}>
      {items.map((it) => (
        <li key={it.href}>
          <Tag href={it.href} {...(it.external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}>{it.label}{it.note ? <small>{it.note}</small> : null}</Tag>
        </li>
      ))}
    </ul>
  );
}
