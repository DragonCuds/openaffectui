import type { ReactNode } from 'react';

export function FeatureCard({ icon, title, text }: { icon?: ReactNode; title: string; text: string }) {
  return (
    <article className="lp-card">
      {icon ? <span className="lp-card-icon" aria-hidden="true">{icon}</span> : null}
      <h3 className="lp-card-title">{title}</h3>
      <p className="lp-card-text">{text}</p>
    </article>
  );
}

/** Responsive grid: 1 column on phones, 2 on tablets, 3 on desktop. */
export function FeatureGrid({ children }: { children?: ReactNode }) {
  return <div className="lp-grid">{children}</div>;
}
