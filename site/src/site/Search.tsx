import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Box, CornerDownLeft, Search as SearchIcon } from 'lucide-react';
import { ENTRIES, categoryTitle } from '../docs/registry';
import { pages } from '../docs/pages';
import { navigate } from './router';

type Hit = { to: string; title: string; sub: string; code?: string; kind: 'comp' | 'doc'; hay: string };

const norm = (s: string) => s.toLowerCase().replace(/[‌\s-]+/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک');

const ALL: Hit[] = [
  ...ENTRIES.map((e) => ({
    to: `/components/${e.slug}`, title: e.title, sub: categoryTitle(e.category), code: e.name, kind: 'comp' as const,
    hay: norm(`${e.title} ${e.name} ${e.slug} ${e.summary}`),
  })),
  ...pages.map((p) => ({ to: `/docs/${p.slug}`, title: p.title, sub: 'راهنما', kind: 'doc' as const, hay: norm(`${p.title} ${p.slug} ${p.summary}`) })),
];

/** ⌘K / Ctrl+K palette over every component and guide page. */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [at, setAt] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const hits = useMemo(() => {
    const n = norm(q);
    if (!n) return ALL;
    return ALL
      .map((h) => ({ h, score: norm(h.title).startsWith(n) || (h.code && norm(h.code).startsWith(n)) ? 0 : h.hay.includes(n) ? 1 : 9 }))
      .filter((x) => x.score < 9)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.h);
  }, [q]);

  useEffect(() => { setAt(0); }, [q]);
  useEffect(() => {
    if (!open) return;
    setQ('');
    const t = requestAnimationFrame(() => input.current?.focus());
    document.body.style.overflow = 'hidden';
    return () => { cancelAnimationFrame(t); document.body.style.overflow = ''; };
  }, [open]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${at}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [at]);

  if (!open) return null;
  const go = (h?: Hit) => { if (!h) return; onClose(); navigate(h.to); };

  return (
    <div className="palette">
      <div className="palette-back" onClick={onClose} />
      <div className="palette-box" role="dialog" aria-modal="true" aria-label="جستجو">
        <div className="palette-field">
          <SearchIcon size={17} strokeWidth={1.9} aria-hidden="true" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="اسم جزء را بنویس، فارسی یا انگلیسی"
            aria-label="جستجو"
            aria-controls="palette-list"
            aria-activedescendant={hits[at] ? `ph-${at}` : undefined}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setAt((i) => Math.min(hits.length - 1, i + 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setAt((i) => Math.max(0, i - 1)); }
              else if (e.key === 'Enter') { e.preventDefault(); go(hits[at]); }
              else if (e.key === 'Escape') onClose();
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <ul className="palette-list" id="palette-list" role="listbox" ref={list}>
          {hits.length === 0 ? <li className="palette-empty">چیزی پیدا نشد.</li> : hits.map((h, i) => (
            <li
              key={h.to}
              id={`ph-${i}`}
              data-i={i}
              role="option"
              aria-selected={i === at}
              onMouseMove={() => setAt(i)}
              onClick={() => go(h)}
            >
              <span className="palette-ic">{h.kind === 'comp' ? <Box size={15} strokeWidth={1.8} /> : <BookOpen size={15} strokeWidth={1.8} />}</span>
              <span className="palette-t">{h.title}</span>
              {h.code ? <code dir="ltr">{h.code}</code> : null}
              <span className="palette-sub">{h.sub}</span>
              <CornerDownLeft className="palette-enter" size={14} aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
