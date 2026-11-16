import type { ReactNode } from 'react';
import { Sparkline } from './Sparkline';
import { cx, toFaDigits, type TintArea } from './yv';

/**
 * Soft tinted tile for one body area, two per row: tinted `icon` + `label`, a big `value` with a small muted `unit`
 * (optionally a second `value2`/`unit2`, like «۷ ساعت ۱۵ دقیقه»), an optional `spark` trend or a `progress` bar (0 to 1),
 * and a muted `caption` («۴ دقیقه پیش»). Latin digits in value and value2 are shown as Persian digits.
 */
export function MetricTile({ label, value, unit, value2, unit2, caption, icon, area = 'steps', spark, sparkStyle = 'line', progress, className }: {
  label: string;
  value: string;
  unit?: string;
  value2?: string;
  unit2?: string;
  caption?: string;
  icon?: ReactNode;
  area?: TintArea;
  spark?: number[];
  sparkStyle?: 'line' | 'bars';
  progress?: number;
  className?: string;
}) {
  return (
    <div className={cx('yv', 'yv-metric', className)} data-area={area}>
      <div className="yv-metric-k">
        {icon ? <span className="yv-metric-ic" aria-hidden="true">{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div className="yv-metric-v">
        {toFaDigits(value)}
        {unit ? <span className="yv-unit">{unit}</span> : null}
        {value2 ? <>{' '}{toFaDigits(value2)}</> : null}
        {unit2 ? <span className="yv-unit">{unit2}</span> : null}
      </div>
      {spark && spark.length > 0 ? <Sparkline values={spark} style={sparkStyle} strokeWidth={2.5} fill={false} /> : null}
      {progress != null ? (
        <div className="yv-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(1, Math.max(0, progress)) * 100)} aria-label={label}>
          <b style={{ inlineSize: `${Math.min(1, Math.max(0, progress)) * 100}%` }} />
        </div>
      ) : null}
      {caption ? <p className="yv-cap">{caption}</p> : null}
    </div>
  );
}
