import { useCallback, useEffect, useState } from 'react';
import { Toaster } from '@kit/ui';
import { bySlug } from './docs/registry';
import { pages } from './docs/pages';
import { Drawer, Header, Sidebar, type Theme } from './site/Chrome';
import { SearchDialog } from './site/Search';
import { ComponentPage } from './site/ComponentPage';
import { GuidePage } from './site/GuidePage';
import { ComponentsIndex, Landing } from './site/Landing';
import { Link, usePath } from './site/router';

const KEY = 'openaffectui-theme';

function initial(): Theme {
  try { const t = localStorage.getItem(KEY); if (t === 'dark' || t === 'light') return t; } catch { /* storage blocked */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function NotFound() {
  return (
    <div className="doc notfound">
      <h1>این صفحه نیست</h1>
      <p className="doc-lead">شاید اسمش عوض شده. از <Link to="/components" className="inline-link">فهرست اجزا</Link> پیدایش کن.</p>
    </div>
  );
}

/** Docs site for the shared kit: landing, component pages, guides. */
export default function App() {
  const path = usePath().replace(/\/+$/, '') || '/';
  const [theme, setTheme] = useState<Theme>(initial);
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch { /* storage blocked */ }
  }, [theme]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setSearch((s) => !s); }
      else if (e.key === '/' && !typing) { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const closeMenu = useCallback(() => setMenu(false), []);
  const closeSearch = useCallback(() => setSearch(false), []);

  let body;
  let withSide = true;
  const comp = path.match(/^\/components\/([\w-]+)$/);
  const doc = path.match(/^\/docs\/([\w-]+)$/);
  if (path === '/') { body = <Landing />; withSide = false; }
  else if (path === '/components') body = <ComponentsIndex />;
  else if (comp && bySlug.has(comp[1])) body = <ComponentPage slug={comp[1]} />;
  else if (doc && pages.some((p) => p.slug === doc[1])) body = <GuidePage slug={doc[1]} />;
  else body = <NotFound />;

  return (
    <div className="site">
      <a href="#main" className="skip">رفتن به محتوا</a>
      <Header path={path} theme={theme} onTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} onSearch={() => setSearch(true)} onMenu={() => setMenu(true)} />
      <div className={withSide ? 'shell' : 'shell shell-wide'}>
        {withSide ? <Sidebar path={path} /> : null}
        <main id="main" className="main">{body}</main>
      </div>
      <Drawer open={menu} path={path} onClose={closeMenu} />
      <SearchDialog open={search} onClose={closeSearch} />
      <Toaster />
    </div>
  );
}
