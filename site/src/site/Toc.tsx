import { useEffect, useState } from 'react';

export type TocItem = { id: string; label: string };

/** "On this page": follows the heading nearest the top. */
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (ents) => {
        const vis = ents.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: '-72px 0px -65% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  if (items.length < 2) return null;
  return (
    <nav className="toc" aria-label="در این صفحه">
      <p className="toc-title">در این صفحه</p>
      {items.map((i) => (
        <a key={i.id} href={`#${i.id}`} aria-current={active === i.id ? 'location' : undefined}
          onClick={(e) => { e.preventDefault(); document.getElementById(i.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', `#${i.id}`); }}>
          {i.label}
        </a>
      ))}
    </nav>
  );
}
