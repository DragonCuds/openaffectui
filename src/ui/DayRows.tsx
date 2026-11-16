import type { ReactNode } from 'react';
import { Chip } from './Chip';

/*
 * A list of days (or any rows), each with a label, a few labelled values and an optional soft tag. Plain list markup,
 * no table, no borders. Cells wrap on a narrow screen, so there is never a horizontal scroll. Styles in src/styles/dayrows.css.
 */

export type DayRowCell = {
  label: string;
  value: ReactNode;
  /** `flag` tints the value softly, for a value that stands out from the rest. */
  tone?: 'flag';
  /** Extra words for screen readers only, read after the value (for instance why it is flagged). */
  hint?: string;
};
export type DayRowItem = {
  id: string;
  /** Main label of the row, for instance the weekday. */
  label: ReactNode;
  /** Smaller text beside it, for instance the date. */
  sub?: ReactNode;
  cells: DayRowCell[];
  /** A soft tag at the end of the row heading. */
  tag?: ReactNode;
  /** Quieter row (no data). With `note`, the note replaces the cells. */
  muted?: boolean;
  note?: ReactNode;
};
export type DayRowsProps = {
  rows: DayRowItem[];
  /** Name of the list for screen readers. */
  label: string;
  /** Shown instead of the list when there are no rows. Default: nothing. */
  empty?: ReactNode;
  className?: string;
};

export function DayRows({ rows, label, empty, className }: DayRowsProps) {
  if (!rows.length) return <>{empty ?? null}</>;
  return (
    <ul className={className ? `dayrows ${className}` : 'dayrows'} aria-label={label}>
      {rows.map((r) => (
        <li key={r.id} className="dayrow" data-muted={r.muted || undefined}>
          <div className="dayrow-head">
            <div className="dayrow-when">
              <strong className="dayrow-label">{r.label}</strong>
              {r.sub ? <span className="dayrow-sub">{r.sub}</span> : null}
            </div>
            {r.tag ? <Chip tone="busy">{r.tag}</Chip> : null}
          </div>
          {r.muted && r.note ? <p className="dayrow-note">{r.note}</p> : (
            <dl className="dayrow-cells">
              {r.cells.map((c, i) => (
                <div key={i} className="dayrow-cell" data-tone={c.tone}>
                  <dt>{c.label}</dt>
                  <dd>{c.value}{c.hint ? <span className="dayrow-hint">{c.hint}</span> : null}</dd>
                </div>
              ))}
            </dl>
          )}
        </li>
      ))}
    </ul>
  );
}
