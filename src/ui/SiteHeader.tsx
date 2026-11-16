import type { ReactNode } from 'react';
import { LinkButton } from './LinkButton';

/** Sticky light site header: brand, anchor links, one call-to-action. Links wrap on phones. */
export function SiteHeader({ brand, links, cta }: {
  brand: ReactNode;
  links: { label: string; href: string }[];
  cta?: { label: string; href: string };
}) {
  return (
    <header className="lp-header">
      <div className="lp-header-in">
        <div className="lp-brand">{brand}</div>
        <nav className="lp-nav" aria-label="منوی اصلی">
          {links.map((l) => <a key={l.href + l.label} href={l.href} className="lp-nav-a">{l.label}</a>)}
        </nav>
        {cta ? <LinkButton variant="primary" href={cta.href} className="lp-header-cta">{cta.label}</LinkButton> : null}
      </div>
    </header>
  );
}
