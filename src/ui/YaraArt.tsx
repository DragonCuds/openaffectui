import { useId } from 'react';
import { cx } from './yv';

/**
 * Soft drawing for the top of a calm page (door, empty state). `kind` 'ring' is the green ring with small tinted dots around it,
 * 'home' is a house with a heart and two people. Decorative: hidden from screen readers. Colours come from the host's CSS variables.
 */
export function YaraArt({ kind = 'ring', size = 220, className }: { kind?: 'ring' | 'home'; size?: number; className?: string }) {
  const gid = `yvart${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg className={cx('yv', 'yv-art', className)} viewBox="0 0 240 240" width={size} height={size} aria-hidden="true" focusable="false">
      {kind === 'ring' ? (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" className="yv-art-g1" />
              <stop offset="1" className="yv-art-g2" />
            </linearGradient>
          </defs>
          <circle cx="120" cy="116" r="104" className="yv-art-halo2" />
          <circle cx="120" cy="116" r="80" className="yv-art-halo" />
          <ellipse cx="120" cy="196" rx="48" ry="7" className="yv-art-shadow" />
          <circle cx="120" cy="116" r="66" fill={`url(#${gid})`} />
          <circle cx="120" cy="116" r="40" className="yv-art-hole" />
          <circle cx="120" cy="52" r="12" className="yv-art-gem" />
          <circle cx="120" cy="52" r="5" className="yv-art-gem-core" />
          <circle cx="40" cy="62" r="15" className="yv-art-soft-sleep" /><circle cx="40" cy="62" r="6" className="yv-art-dot-sleep" />
          <circle cx="204" cy="82" r="13" className="yv-art-soft-temp" /><circle cx="204" cy="82" r="6" className="yv-art-dot-temp" />
          <circle cx="54" cy="168" r="11" className="yv-art-soft-heart" /><circle cx="54" cy="168" r="5" className="yv-art-dot-heart" />
          <circle cx="186" cy="176" r="9" className="yv-art-soft-oxygen" />
        </>
      ) : (
        <>
          <circle cx="120" cy="112" r="92" className="yv-art-halo" />
          <ellipse cx="120" cy="190" rx="58" ry="7" className="yv-art-shadow" />
          <rect x="82" y="104" width="76" height="82" rx="20" className="yv-art-wall" />
          <path d="M70 108 L120 66 L170 108" className="yv-art-roof" fill="none" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M120 150s-16-9.5-16-22a9 9 0 0 1 16-5.5A9 9 0 0 1 136 128c0 12.500-16 22-16 22z" className="yv-art-heart" />
          <rect x="108" y="158" width="24" height="28" rx="12" className="yv-art-halo" />
          <circle cx="46" cy="140" r="24" className="yv-art-wall" /><circle cx="46" cy="132" r="8" className="yv-art-dot-temp" />
          <path d="M30 156a16 14 0 0 1 32 0z" className="yv-art-soft-temp" />
          <circle cx="196" cy="84" r="24" className="yv-art-wall" /><circle cx="196" cy="76" r="8" className="yv-art-dot-sleep" />
          <path d="M180 100a16 14 0 0 1 32 0z" className="yv-art-soft-sleep" />
          <circle cx="60" cy="52" r="6" className="yv-art-soft-steps" /><circle cx="198" cy="150" r="5" className="yv-art-soft-temp" />
        </>
      )}
    </svg>
  );
}
