import type { ReactNode } from 'react';
import { LinkButton } from './LinkButton';

/** Two-door hero: headline, then two side-by-side doors (stacked on phones), optional media. */
export function Hero({ eyebrow, title, lead, doors, media }: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  doors: { title: string; text: string; cta: { label: string; href: string }; tone?: 'calm' | 'warm' }[];
  media?: ReactNode;
}) {
  return (
    <section className="lp-hero">
      <div className="lp-hero-text">
        {eyebrow ? <p className="lp-eyebrow">{eyebrow}</p> : null}
        <h1 className="lp-hero-title">{title}</h1>
        {lead ? <p className="lp-hero-lead">{lead}</p> : null}
        <div className="lp-doors">
          {doors.map((d) => (
            <div key={d.title} className="lp-door" data-tone={d.tone ?? 'calm'}>
              <h2 className="lp-door-title">{d.title}</h2>
              <p className="lp-door-text">{d.text}</p>
              <LinkButton variant="primary" size="lg" href={d.cta.href}>{d.cta.label}</LinkButton>
            </div>
          ))}
        </div>
      </div>
      {media ? <div className="lp-hero-media">{media}</div> : null}
    </section>
  );
}
