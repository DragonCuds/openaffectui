import type { SVGProps } from 'react';

/* Simple rounded line icons (24 grid) for the v2 health pieces. The pieces take any node as an icon; these are the ones the ring web uses. */
export type YaraIconName =
  | 'heart' | 'oxygen' | 'temp' | 'sleep' | 'steps' | 'home' | 'bell' | 'group' | 'chevron' | 'arrow'
  | 'check' | 'clock' | 'call' | 'hourglass' | 'battery';

const PATHS: Record<YaraIconName, string> = {
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  oxygen: 'M3 9h10a3 3 0 1 0-3-3M3 15h14a3 3 0 1 1-3 3M3 12h6',
  temp: 'M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z',
  sleep: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  steps: 'M13.5 4.5v.01M10 21l2-6-2.5-2.5 1-4.5M8 10l-1.5 3.5M11 8l3 2 2.5 1M12 15l3 2.5 1 3.5',
  home: 'M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
  bell: 'M6 17v-6a6 6 0 1 1 12 0v6l2 2H4zM10 21h4',
  group: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.8c2 .6 3.5 2.3 3.5 5.2',
  /** Points left: «forward» in right-to-left reading. */
  chevron: 'M15 5l-7 7 7 7',
  /** Points right: «back» in right-to-left reading. */
  arrow: 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  call: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  hourglass: 'M7 3h10M7 21h10M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9',
  battery: 'M4 8h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM21 11v2',
};

/** Round-cap line icon in the current text colour. `filled` fills the shape (heart, moon, bell, ...). */
export function YaraIcon({ name, size = 24, filled = false, ...rest }: { name: YaraIconName; size?: number; filled?: boolean } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  return (
    <svg
      viewBox="0 0 24 24" width={size} height={size} fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
