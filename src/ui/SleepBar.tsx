import { useMemo, type ReactNode } from 'react';

/*
 * One night of sleep as a horizontal bar: coloured spans between the first and the last moment, clock labels at both
 * ends, and a legend of the stages that really appear. Time runs in the same direction as HrDayChart (`rtl`, default
 * true: it starts at the right edge). The bar sets its own `dir`, so it does not depend on the page direction.
 * The kit stays language-neutral: every word (legend, aria-label) comes from props. Styles in src/styles/sleepbar.css.
 */

export type SleepStage = 'awake' | 'light' | 'deep' | 'rem';
export type SleepBarSegment = { start: string; end: string; stage: SleepStage };
export type SleepBarProps = {
  /** Stage spans (ISO times with offset), like the day object's sleep.stages. Zero-width and unknown spans are skipped. */
  segments: SleepBarSegment[];
  /** Window of the bar; defaults to the earliest start and the latest end of the segments. */
  from?: string;
  to?: string;
  /** Legend words, one per stage. Required: the kit has no language of its own. */
  labels: Record<SleepStage, string>;
  /** Optional small text after a legend word, for instance the time spent in that stage. */
  notes?: Partial<Record<SleepStage, string>>;
  /** Description of the whole bar for screen readers. */
  ariaLabel: string;
  /** Text of the two end labels. Default: Tehran clock, Persian digits, 24 hours. */
  formatTime?: (iso: string) => string;
  /** Shown instead of the bar when there is nothing to draw. Default: nothing. */
  empty?: ReactNode;
  /** Time starts at the right edge (reading direction of Persian). Default true. */
  rtl?: boolean;
  className?: string;
};

export const SLEEP_STAGES: readonly SleepStage[] = ['awake', 'light', 'deep', 'rem'];
const isStage = (s: unknown): s is SleepStage => SLEEP_STAGES.includes(s as SleepStage);

export type SleepBarItem = { stage: SleepStage; /** offset from the start edge, percent */ offset: number; /** width, percent */ width: number };
export type SleepBarLayout = { from: number; to: number; items: SleepBarItem[] };

/** Pure layout: clips every span to the window and drops the ones with no width. Exported for tests. */
export function sleepBarLayout(segments: SleepBarSegment[], from?: string, to?: string): SleepBarLayout | null {
  const spans = segments
    .map((s) => ({ stage: s.stage, s: Date.parse(s.start), e: Date.parse(s.end) }))
    .filter((s) => isStage(s.stage) && Number.isFinite(s.s) && Number.isFinite(s.e) && s.e > s.s);
  let a = from ? Date.parse(from) : NaN;
  let b = to ? Date.parse(to) : NaN;
  if (!Number.isFinite(a)) a = spans.length ? Math.min(...spans.map((s) => s.s)) : NaN;
  if (!Number.isFinite(b)) b = spans.length ? Math.max(...spans.map((s) => s.e)) : NaN;
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return null;
  const span = b - a;
  const items = spans
    .map((x) => ({ stage: x.stage, s: Math.max(x.s, a), e: Math.min(x.e, b) }))
    .filter((x) => x.e > x.s)
    .sort((x, y) => x.s - y.s)
    .map((x) => ({ stage: x.stage, offset: ((x.s - a) / span) * 100, width: ((x.e - x.s) / span) * 100 }));
  return items.length ? { from: a, to: b, items } : null;
}

const clockFmt = new Intl.DateTimeFormat('fa-IR', { timeZone: 'Asia/Tehran', hour: 'numeric', minute: '2-digit', hourCycle: 'h23' });
const defaultTime = (iso: string) => clockFmt.format(new Date(iso));

export function SleepBar({ segments, from, to, labels, notes, ariaLabel, formatTime = defaultTime, empty, rtl = true, className }: SleepBarProps) {
  const layout = useMemo(() => sleepBarLayout(segments, from, to), [segments, from, to]);
  if (!layout) return <>{empty ?? null}</>;
  const present = SLEEP_STAGES.filter((st) => layout.items.some((i) => i.stage === st));
  const fmt = (ms: number) => formatTime(new Date(ms).toISOString());
  return (
    <figure className={className ? `sleepbar ${className}` : 'sleepbar'} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="sleepbar-chart" role="img" aria-label={ariaLabel}>
        <div className="sleepbar-track" aria-hidden="true">
          {layout.items.map((i, k) => (
            <span key={k} className="sleepbar-seg" data-stage={i.stage} style={{ insetInlineStart: `${i.offset}%`, inlineSize: `${i.width}%` }} />
          ))}
        </div>
        <div className="sleepbar-times" aria-hidden="true">
          <span>{fmt(layout.from)}</span>
          <span>{fmt(layout.to)}</span>
        </div>
      </div>
      <ul className="sleepbar-legend">
        {present.map((st) => (
          <li key={st}>
            <i className="sleepbar-sw" data-stage={st} aria-hidden="true" />
            <span>{labels[st]}</span>
            {notes?.[st] ? <span className="sleepbar-note">{notes[st]}</span> : null}
          </li>
        ))}
      </ul>
    </figure>
  );
}
