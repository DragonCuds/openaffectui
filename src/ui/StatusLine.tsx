import { cx, toFaDigits } from './yv';
import type { V3Tone } from './v3';

/**
 * One calm sentence with a dot in the state colour («همه‌چیز عادی است»), and a quiet ring chip at the far end
 * («حلقه وصل · ۶۴٪») that can carry its own small dot. Latin digits become Persian. Styles: src/styles/v3-statusline.css.
 */
export function StatusLine({ text, tone = 'calm', chip, chipTone, className }: {
  text: string;
  /** Colour of the sentence dot. */
  tone?: V3Tone;
  /** Ring chip text, e.g. «حلقه وصل · ۶۴٪». */
  chip?: string;
  /** Small dot inside the chip (calm = connected, attn = needs a look). Left out: no dot. */
  chipTone?: V3Tone;
  className?: string;
}) {
  return (
    <div className={cx('v3', 'v3-status', className)} data-tone={tone}>
      <span className="v3-status-dot" aria-hidden="true" />
      <b className="v3-status-text">{toFaDigits(text)}</b>
      {chip ? (
        <span className="v3-status-chip" data-tone={chipTone}>
          {chipTone ? <span className="v3-status-cdot" aria-hidden="true" /> : null}
          {toFaDigits(chip)}
        </span>
      ) : null}
    </div>
  );
}
