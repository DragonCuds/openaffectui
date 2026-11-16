import type { ElementType } from 'react';

/** Path trail, e.g. خانه › تهران › عکاس عروسی. The last item is the current page and is not a link. Server-safe. */
export function Breadcrumb({ items, label = 'مسیر صفحه', as: Tag = 'a', className }: {
  items: { label: string; href?: string }[];
  label?: string;
  as?: ElementType;
  className?: string;
}) {
  return (
    <nav className={className ? `crumbs ${className}` : 'crumbs'} aria-label={label}>
      <ol>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${i}-${it.label}`}>
              {last || !it.href ? <span aria-current={last ? 'page' : undefined}>{it.label}</span> : <Tag href={it.href}>{it.label}</Tag>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
