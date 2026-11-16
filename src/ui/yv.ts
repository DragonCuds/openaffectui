/* Small helpers shared by the v2 health pieces (InitialAvatar, MetricTile, PersonCard, AlertCard ...). Not exported from index.ts. */

/** Body area or status that owns a tint. Strong colour for icons and text, soft colour for backgrounds. */
export type TintArea = 'primary' | 'heart' | 'oxygen' | 'temp' | 'sleep' | 'steps' | 'calm' | 'attn' | 'help' | 'neutral';

const FA = '۰۱۲۳۴۵۶۷۸۹';
/** Latin digits become Persian digits; everything else stays. */
export const toFaDigits = (s: string): string => s.replace(/[0-9]/g, (d) => FA[Number(d)]);

/** First letter of a name; «؟» when blank. */
export const initialOf = (name: string): string => [...name.trim()][0] ?? '؟';

export const cx = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(' ');
