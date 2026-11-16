import type { ReactNode } from 'react';
import { Gauge, type GaugeProps } from './Gauge';
import { levelTone } from './v3';
import { cx } from './yv';

export type GaugeTrioItem = Omit<GaugeProps, 'size' | 'className' | 'label'> & {
  id: string;
  /** Name under the gauge, e.g. «ضربان». */
  name: string;
  /** One plain word under the name, e.g. «خوب», «دیر کرده». */
  word: string;
  /** Opens that sensor's page. */
  onClick?: () => void;
};

/**
 * Home card: up to three small gauges side by side (each a button with its name and one word under it), and room for
 * `children` (MetricRows) below. Word colour follows the level: calm, grey, attn; a `late` gauge is attn.
 * Styles: src/styles/v3-gaugetrio.css.
 */
export function GaugeTrio({ gauges, children, className }: {
  gauges: GaugeTrioItem[];
  children?: ReactNode;
  className?: string;
}) {
  const items = gauges.slice(0, 3);
  return (
    <div className={cx('v3', 'v3-card', 'v3-trio', className)}>
      <div className="v3-trio-row" style={{ gridTemplateColumns: `repeat(${Math.max(1, items.length)}, minmax(0, 1fr))` }}>
        {items.map(({ id, name, word, onClick, ...g }) => (
          <button key={id} type="button" className="v3-trio-g" onClick={onClick} disabled={!onClick}>
            <Gauge {...g} size="sm" label={name} />
            <span className="v3-trio-n">{name}</span>
            <span className="v3-trio-w" data-tone={g.value == null ? 'neutral' : levelTone(g.level, g.late)}>{word}</span>
          </button>
        ))}
      </div>
      {children ? <div className="v3-trio-rows">{children}</div> : null}
    </div>
  );
}
