import type { ReactNode } from 'react';
import { cx } from './yv';

/**
 * Big soft-tinted card: optional `visual` (badge or drawing), a one-line `state` with coloured `accent` words
 * («حالِ حسین» + «خوب است»), a muted `caption`, an optional `trailing` node (a battery, say) and extra `children` below.
 * `tone` is 'calm' (all fine) or 'attn' («لطفاً چک کنید», amber, never alarm red).
 */
export function StatusHero({ state, accent, caption, tone = 'calm', visual, trailing, children, className }: {
  state: string;
  accent?: string;
  caption?: string;
  tone?: 'calm' | 'attn';
  visual?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('yv', 'yv-card', 'yv-tinted', 'yv-hero', className)} data-area={tone}>
      <div className="yv-hero-row">
        {visual}
        <div className="yv-hero-text">
          <h2 className="yv-title">
            {state}
            {accent ? <> <span className="yv-accent">{accent}</span></> : null}
          </h2>
          {caption ? <p className="yv-cap">{caption}</p> : null}
        </div>
        {trailing}
      </div>
      {children}
    </section>
  );
}
