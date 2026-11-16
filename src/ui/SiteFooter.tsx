import type { ReactNode } from 'react';

/** Site footer: brand, link groups, and a note slot for the disclaimer. */
export function SiteFooter({ brand, groups, note }: {
  brand: ReactNode;
  groups: { title: string; links: { label: string; href: string }[] }[];
  note?: ReactNode;
}) {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-in">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">{brand}</div>
          <div className="lp-footer-groups">
            {groups.map((g) => (
              <nav key={g.title} className="lp-footer-group" aria-label={g.title}>
                <h2 className="lp-footer-h">{g.title}</h2>
                <ul>
                  {g.links.map((l) => <li key={l.href + l.label}><a href={l.href}>{l.label}</a></li>)}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        {note ? <div className="lp-footer-note">{note}</div> : null}
      </div>
    </footer>
  );
}
