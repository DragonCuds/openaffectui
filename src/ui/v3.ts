/* Shared bits of the «instrument» (v3) pieces: Gauge, StatusLine, MetricRow, GaugeTrio, LivePill, BandChart, WeekBars, SensorPage.
   Not exported from index.ts except the types. */
import type { SensorLevel } from './SensorTile';

/** Colour means something: calm (green), attn (amber), help (red). Neutral is the quiet grey. */
export type V3Tone = 'calm' | 'attn' | 'help' | 'neutral';

/** great / good are calm, fair is neutral, check is attn. A late reading is always attn. */
export function levelTone(level?: SensorLevel, late?: boolean): V3Tone {
  if (late) return 'attn';
  if (level === 'great' || level === 'good') return 'calm';
  if (level === 'check') return 'attn';
  return 'neutral';
}

/** Level to use when the caller gave none: inside the band is good, anything else fair. */
export function autoLevel(value: number | null, low?: number, high?: number): SensorLevel {
  if (value == null || low == null || high == null) return 'fair';
  return value >= low && value <= high ? 'good' : 'fair';
}

/** Polar point on a 100x100 board, 0 degrees at the top, clockwise. */
export const polar = (deg: number, r: number): [number, number] => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
};

/** SVG arc path between two angles (clockwise). */
export function arcPath(d0: number, d1: number, r: number): string {
  const [x0, y0] = polar(d0, r);
  const [x1, y1] = polar(d1, r);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${d1 - d0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}
