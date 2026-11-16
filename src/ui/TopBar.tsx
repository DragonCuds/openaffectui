import type { ReactNode } from 'react';
import { RoundIconButton } from './RoundIconButton';
import { cx } from './yv';

/**
 * Top bar with no colour: optional `leading` (an avatar or a back button) and the title block on the start side (right in RTL),
 * one round 44px icon button on the end side (`endIcon` with `endLabel`, and `onEndClick` or `endHref`) or any node as `end`.
 * `overline` is a small line above the title, `caption` a muted line under it. `large` picks the big title size.
 */
export function TopBar({ title, caption, overline, large = true, leading, endIcon, endLabel = '', onEndClick, endHref, endBadge = false, end, className }: {
  title: string;
  caption?: string;
  overline?: string;
  large?: boolean;
  leading?: ReactNode;
  endIcon?: ReactNode;
  endLabel?: string;
  onEndClick?: () => void;
  endHref?: string;
  endBadge?: boolean;
  end?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx('yv', 'yv-top', className)}>
      {leading}
      <div className="yv-top-text">
        {overline ? <span className="yv-cap">{overline}</span> : null}
        <span className={large ? 'yv-title' : 'yv-head'}>{title}</span>
        {caption ? <span className="yv-cap">{caption}</span> : null}
      </div>
      {end ?? (endIcon ? <RoundIconButton icon={endIcon} label={endLabel} onClick={onEndClick} href={endHref} badge={endBadge} /> : null)}
    </header>
  );
}
