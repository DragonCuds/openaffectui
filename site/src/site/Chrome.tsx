import { useEffect, useRef, useState } from 'react';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { CATEGORIES } from '../docs/categories';
import { entriesOf } from '../docs/registry';
import { pages } from '../docs/pages';
import { Link } from './router';

export type Theme = 'light' | 'dark';
export const REPO = 'https://github.com/DragonCuds/openaffectui';

export function Mark() {
  return (
    <svg className="mark" viewBox="0 0 28 28" aria-hidden="true">
      <rect x="2" y="2" width="24" height="24" rx="8" fill="currentColor" />
      <circle cx="11" cy="14" r="4.2" fill="var(--bg)" />
      <path d="M16.5 9.8a4.2 4.2 0 0 1 0 8.4" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Header({ path, theme, onTheme, onSearch, onMenu }: {
  path: string; theme: Theme; onTheme: () => void; onSearch: () => void; onMenu: () => void;
}) {
  const at = (p: string) => (path === p || path.startsWith(p + '/') ? 'page' : undefined);
  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <header className="top">
      <div className="top-inner">
        <button type="button" className="icon-btn only-narrow" onClick={onMenu} aria-label="فهرست">
          <Menu size={18} strokeWidth={1.9} aria-hidden="true" />
        </button>
        <Link to="/" className="brand" aria-label="صفحه‌ی اول">
          <Mark />
          <span dir="ltr">OpenAffectui</span>
        </Link>
        <nav className="top-nav" aria-label="اصلی">
          <Link to="/components" aria-current={at('/components')}>اجزا</Link>
          <Link to="/docs/introduction" aria-current={at('/docs')}>راهنما</Link>
        </nav>
        <div className="top-tools">
          <button type="button" className="search-btn" onClick={onSearch} aria-label="جستجو">
            <Search size={15} strokeWidth={1.9} aria-hidden="true" />
            <span className="search-label">جستجو در اجزا…</span>
            <kbd dir="ltr">{mac ? '⌘' : 'Ctrl'} K</kbd>
          </button>
          <a className="icon-btn" href={REPO} target="_blank" rel="noreferrer" aria-label="کد در گیت‌هاب">
            <svg viewBox="0 0 16 16" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          </a>
          <button type="button" className="icon-btn" onClick={onTheme} aria-label={theme === 'dark' ? 'تم روشن' : 'تم تیره'}>
            {theme === 'dark' ? <Sun size={17} strokeWidth={1.9} aria-hidden="true" /> : <Moon size={17} strokeWidth={1.9} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}

function NavList({ path, onPick }: { path: string; onPick?: () => void }) {
  const cur = (to: string) => (path === to ? 'page' : undefined);
  return (
    <nav className="side-nav" aria-label="اجزا و راهنما">
      <div className="side-group">
        <p className="side-title">شروع</p>
        {pages.map((p) => (
          <Link key={p.slug} to={`/docs/${p.slug}`} aria-current={cur(`/docs/${p.slug}`)} onClick={onPick}>{p.title}</Link>
        ))}
      </div>
      {CATEGORIES.map((c) => (
        <div className="side-group" key={c.id}>
          <p className="side-title">{c.title}</p>
          {entriesOf(c.id).map((e) => (
            <Link key={e.slug} to={`/components/${e.slug}`} aria-current={cur(`/components/${e.slug}`)} onClick={onPick}>{e.title}</Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({ path }: { path: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = ref.current;
    const a = box?.querySelector<HTMLElement>('a[aria-current]');
    if (!box || !a) return;
    const top = a.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - 48) box.scrollTop = top - box.clientHeight / 3;
  }, [path]);
  return <aside className="side"><div className="side-scroll" ref={ref}><NavList path={path} /></div></aside>;
}

/** Narrow screens: the same list in a sheet. */
export function Drawer({ open, path, onClose }: { open: boolean; path: string; onClose: () => void }) {
  const [shown, setShown] = useState(open);
  useEffect(() => {
    if (open) { setShown(true); return; }
    const t = setTimeout(() => setShown(false), 320);
    return () => clearTimeout(t);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!shown) return null;
  return (
    <div className="drawer" data-open={open || undefined}>
      <div className="drawer-back" onClick={onClose} />
      <div className="drawer-sheet" role="dialog" aria-modal="true" aria-label="فهرست">
        <div className="drawer-head">
          <span className="brand"><Mark /><span dir="ltr">OpenAffectui</span></span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="بستن"><X size={18} aria-hidden="true" /></button>
        </div>
        <div className="drawer-links">
          <Link to="/components" onClick={onClose}>همه‌ی اجزا</Link>
        </div>
        <NavList path={path} onPick={onClose} />
      </div>
    </div>
  );
}
