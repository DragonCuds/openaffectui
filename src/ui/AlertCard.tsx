import type { ReactNode } from 'react';
import { BigButton } from './BigButton';
import { InitialAvatar } from './InitialAvatar';
import { YaraIcon } from './YaraIcon';
import { cx, initialOf, toFaDigits } from './yv';

/**
 * «لطفاً چک کنید» card: amber soft background; who and what (`who`, `what`), `whenText` in a small pill, a `title` and a one-sentence
 * `sentence`, who has seen it (`seenText` plus optional `seen` rows such as SeenRow), one primary action and one quiet action.
 * Amber, never alarm red. Announced politely to screen readers. Icons are nodes; defaults are check, call, clock and hourglass.
 */
export function AlertCard({
  title, sentence, whenText, who, what, initial, seenText, seenIcon, seen,
  primaryLabel, onPrimary, primaryIcon, primaryDisabled = false, quietLabel, onQuiet, quietIcon, className,
}: {
  title: string;
  sentence: string;
  whenText: string;
  who: string;
  what?: string;
  initial?: string;
  seenText?: string;
  seenIcon?: ReactNode;
  seen?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryIcon?: ReactNode;
  primaryDisabled?: boolean;
  quietLabel?: string;
  onQuiet?: () => void;
  quietIcon?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('yv', 'yv-card', 'yv-tinted', 'yv-alert', className)} data-area="attn" aria-live="polite">
      <div className="yv-alert-top">
        <InitialAvatar name={who} initial={initial ?? initialOf(who)} solid />
        <div className="yv-alert-who">
          <p className="yv-label">{who}</p>
          {what ? <p className="yv-cap">{what}</p> : null}
        </div>
        <span className="yv-alert-when">
          <span aria-hidden="true"><YaraIcon name="clock" size={18} filled={false} /></span>
          {toFaDigits(whenText)}
        </span>
      </div>
      <h2 className="yv-title">{title}</h2>
      <p className="yv-alert-sentence">{toFaDigits(sentence)}</p>
      {seenText ? (
        <p className="yv-alert-seentext">
          <span aria-hidden="true">{seenIcon ?? <YaraIcon name="hourglass" size={20} />}</span>
          {seenText}
        </p>
      ) : null}
      {seen ? <div className="yv-alert-seen">{seen}</div> : null}
      <div className="yv-alert-actions">
        <BigButton block icon={primaryIcon === undefined ? <YaraIcon name="check" size={22} /> : primaryIcon} onClick={onPrimary} disabled={primaryDisabled}>{primaryLabel}</BigButton>
        {quietLabel && onQuiet ? (
          <BigButton variant="quiet" block icon={quietIcon === undefined ? <YaraIcon name="call" size={22} /> : quietIcon} onClick={onQuiet}>{quietLabel}</BigButton>
        ) : null}
      </div>
    </section>
  );
}
