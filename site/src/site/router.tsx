import { useEffect, useState, type AnchorHTMLAttributes } from 'react';

const listeners = new Set<() => void>();

function scrollFor(hash: string) {
  if (!hash) { window.scrollTo(0, 0); return; }
  requestAnimationFrame(() => document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ block: 'start' }));
}

/** Client-side navigation; nginx serves index.html for every path. */
export function navigate(to: string) {
  const [path, hash = ''] = to.split('#');
  if (path !== location.pathname || `#${hash}` !== location.hash) history.pushState(null, '', to);
  listeners.forEach((f) => f());
  scrollFor(hash);
}

export function usePath() {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const f = () => setPath(location.pathname);
    listeners.add(f);
    window.addEventListener('popstate', f);
    return () => { listeners.delete(f); window.removeEventListener('popstate', f); };
  }, []);
  return path;
}

type LinkProps = { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>;

export function Link({ to, onClick, ...rest }: LinkProps) {
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
    />
  );
}
