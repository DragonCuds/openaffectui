import type { ReactNode } from 'react';
import { InitialAvatar } from './InitialAvatar';
import { LiveDot } from './LiveDot';
import { Sparkline } from './Sparkline';
import { YaraIcon } from './YaraIcon';
import { cx, initialOf, toFaDigits, type TintArea } from './yv';

/** One small reading in a PersonCard: tinted icon + label, value with optional unit, optional trend. */
export type PersonMetric = {
  label: string;
  value: string;
  icon?: ReactNode;
  area?: TintArea;
  unit?: string;
  spark?: number[];
};

/**
 * Card for one person, the whole card is the link (`href`) or button (`onClick`): avatar, `name`, live line `caption`
 * («آخرین خبر ۴ دقیقه پیش») with a LiveDot when `live`, a state (`state` + coloured `stateAccent`) and up to three mini metrics in a row.
 * `hero` = tinted gradient card with the state as a big title; otherwise a plain card with the state as a chip under the name.
 * `tone` is 'calm' or 'attn' (amber).
 */
export function PersonCard({ name, href, onClick, caption, live = true, state, stateAccent, tone = 'calm', hero = false, metrics = [], initial, chevron, className }: {
  name: string;
  href?: string;
  onClick?: () => void;
  caption?: string;
  live?: boolean;
  state?: string;
  stateAccent?: string;
  tone?: 'calm' | 'attn';
  hero?: boolean;
  metrics?: PersonMetric[];
  initial?: string;
  /** End-side arrow; default is a left-pointing chevron. Pass null to hide it. */
  chevron?: ReactNode | null;
  className?: string;
}) {
  const cls = cx('yv', 'yv-card', 'yv-person', hero && 'yv-tinted', className);
  const data = hero ? { 'data-area': tone } : {};
  const go = chevron === undefined ? <YaraIcon name="chevron" /> : chevron;
  const chipText = state ? (stateAccent ? `${state} ${stateAccent}` : state) : null;
  const body = (
    <>
      <span className="yv-person-top">
        <InitialAvatar name={name} initial={initial ?? initialOf(name)} size={64} />
        <span className="yv-person-who">
          <span className="yv-head">{name}</span>
          {caption ? (
            <span className="yv-person-live">
              {live ? <LiveDot tone="calm" /> : null}
              <span className="yv-cap">{toFaDigits(caption)}</span>
            </span>
          ) : null}
          {!hero && chipText ? <span className="yv-person-chip" data-area={tone}>{chipText}</span> : null}
        </span>
        {go ? <span className="yv-person-go" aria-hidden="true">{go}</span> : null}
      </span>
      {hero && state ? (
        <span className="yv-title yv-person-state">
          {state}
          {stateAccent ? <> <span className="yv-accent">{stateAccent}</span></> : null}
        </span>
      ) : null}
      {metrics.length > 0 ? (
        <span className="yv-person-metrics">
          {metrics.slice(0, 3).map((m) => (
            <span key={m.label} className="yv-mini" data-area={m.area ?? 'neutral'}>
              <span className="yv-mini-k">
                {m.icon ? <span aria-hidden="true">{m.icon}</span> : null}
                <span>{m.label}</span>
              </span>
              <span className="yv-mini-v">
                {toFaDigits(m.value)}
                {m.unit ? <span className="yv-unit">{m.unit}</span> : null}
              </span>
              {m.spark && m.spark.length > 1 ? <Sparkline values={m.spark} endDot /> : null}
            </span>
          ))}
        </span>
      ) : null}
    </>
  );
  if (href) return <a className={cls} href={href} {...data}>{body}</a>;
  if (onClick) return <button type="button" className={cls} onClick={onClick} {...data}>{body}</button>;
  return <div className={cls} {...data}>{body}</div>;
}
