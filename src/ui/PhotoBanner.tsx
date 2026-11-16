import type { ReactNode } from 'react';

/** Full-width photo with a dark veil and centred lines of text on top. With `href` the whole photo is a link. */
export function PhotoBanner({ src, alt, lines, width, height, id, href }: { src: string; alt: string; lines: string[]; width?: number; height?: number; id?: string; href?: string }) {
  const img = <img src={src} alt={href ? '' : alt} width={width} height={height} loading="lazy" decoding="async" />;
  const text = lines.map((l, i) => <p key={i} data-first={i === 0 ? '' : undefined}>{l}</p>);
  if (href) {
    return (
      <a className="lp-pban" data-link="" id={id} href={href} aria-label={lines.join('، ')}>
        {img}
        <span className="lp-pban-text">{text}</span>
      </a>
    );
  }
  return (
    <figure className="lp-pban" id={id}>
      {img}
      <figcaption className="lp-pban-text">{text}</figcaption>
    </figure>
  );
}

/** Two or more PhotoBanners side by side on wide screens, stacked on phones. */
export function PhotoBannerRow({ children }: { children: ReactNode }) {
  return <div className="lp-pban-row">{children}</div>;
}
