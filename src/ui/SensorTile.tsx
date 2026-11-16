import { useId, useState, type ReactNode } from 'react';
import { cx, toFaDigits, type TintArea } from './yv';

export type SensorLevel = 'great' | 'good' | 'fair' | 'check';

/**
 * Tile for one sensor of a ring: tinted `icon` + `label`, a big `value` with a small `unit` (optionally a second
 * `value2`/`unit2`, like «۶ ساعت ۵۲ دقیقه»), a plain level word (`levelText`, coloured by `level`: great, good, fair, check),
 * an optional quiet `notice` pill («هنوز نیامده»), a muted `caption` («۵ دقیقه پیش») and a «؟» button that opens
 * the `why` sentence inside the tile. `muted` softens the number (nothing has arrived yet). `progress` (0 to 1) adds a thin bar.
 * Latin digits in value, value2 and caption become Persian digits. Styles in src/styles/sensortile.css (imported by ui.css).
 */
export function SensorTile({ label, value, unit, value2, unit2, icon, area = 'neutral', level, levelText, notice, caption, why, whyLabel = 'چرا؟', progress, muted = false, className }: {
  label: string;
  value: string;
  unit?: string;
  value2?: string;
  unit2?: string;
  icon?: ReactNode;
  area?: TintArea;
  level?: SensorLevel;
  levelText?: string;
  notice?: string;
  caption?: string;
  why?: string;
  /** Accessible name of the «؟» button (the label is added after it). */
  whyLabel?: string;
  progress?: number;
  muted?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const whyId = useId();
  return (
    <div className={cx('yv', 'yv-sensor', className)} data-area={area} data-muted={muted || undefined}>
      <div className="yv-sensor-k">
        {icon ? <span className="yv-sensor-ic" aria-hidden="true">{icon}</span> : null}
        <span className="yv-sensor-name">{label}</span>
        {why ? (
          <button type="button" className="yv-sensor-q" aria-expanded={open} aria-controls={open ? whyId : undefined} aria-label={`${whyLabel} ${label}`} onClick={() => setOpen((o) => !o)}>؟</button>
        ) : null}
      </div>
      <div className="yv-sensor-v">
        {toFaDigits(value)}
        {unit ? <span className="yv-unit">{unit}</span> : null}
        {value2 ? <>{' '}{toFaDigits(value2)}</> : null}
        {unit2 ? <span className="yv-unit">{unit2}</span> : null}
      </div>
      {levelText || notice ? (
        <div className="yv-sensor-tags">
          {levelText ? <span className="yv-sensor-lv" data-level={level}>{levelText}</span> : null}
          {notice ? <span className="yv-sensor-note">{notice}</span> : null}
        </div>
      ) : null}
      {progress != null ? (
        <div className="yv-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(1, Math.max(0, progress)) * 100)} aria-label={label}>
          <b style={{ inlineSize: `${Math.min(1, Math.max(0, progress)) * 100}%` }} />
        </div>
      ) : null}
      {caption ? <p className="yv-cap">{toFaDigits(caption)}</p> : null}
      {why && open ? <p className="yv-sensor-why" id={whyId} role="note">{why}</p> : null}
    </div>
  );
}
