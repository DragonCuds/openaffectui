import type { ReactNode } from 'react';
import type { SensorLevel } from './SensorTile';
import { levelTone } from './v3';
import { cx, toFaDigits } from './yv';

/**
 * One line of a v3 card: optional `icon`, `name`, big `value` with a small `unit`, and a level word («خوب») coloured by `level`
 * (great / good calm, fair grey, check attn). With `onClick` the row is a button with a chevron. Latin digits become Persian.
 * Styles: src/styles/v3-metricrow.css. Rows next to each other are separated by a tone gap, not a border.
 */
export function MetricRow({ name, value, unit, level, levelText, late = false, icon, onClick, className }: {
  name: string;
  value: string;
  unit?: string;
  level?: SensorLevel;
  levelText?: string;
  /** Old reading: the word turns attn. */
  late?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const body = (
    <>
      {icon ? <span className="v3-row-ic" aria-hidden="true">{icon}</span> : null}
      <span className="v3-row-name">{name}</span>
      <span className="v3-row-val"><b>{toFaDigits(value)}</b>{unit ? <i>{unit}</i> : null}</span>
      <span className="v3-row-lv" data-tone={levelTone(level, late)}>{levelText}</span>
      {onClick ? (
        <svg className="v3-row-chev" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ) : null}
    </>
  );
  return onClick ? (
    <button type="button" className={cx('v3', 'v3-row', className)} onClick={onClick}>{body}</button>
  ) : (
    <div className={cx('v3', 'v3-row', className)}>{body}</div>
  );
}
