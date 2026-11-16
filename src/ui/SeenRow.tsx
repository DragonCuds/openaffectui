import { InitialAvatar } from './InitialAvatar';
import { YaraIcon } from './YaraIcon';
import { cx, initialOf, toFaDigits } from './yv';

/** Who has seen an alert: 40px avatar with a small tick badge (when `seen`), the `name`, and the `time` («۱۴:۰۵» or «ندیده»). */
export function SeenRow({ name, time, seen = true, initial, className }: {
  name: string;
  time: string;
  seen?: boolean;
  initial?: string;
  className?: string;
}) {
  return (
    <div className={cx('yv', 'yv-seen', className)}>
      <span className="yv-seen-av" data-seen={seen}>
        <InitialAvatar name={name} initial={initial ?? initialOf(name)} size={40} />
        {seen ? <span className="yv-seen-tick" aria-hidden="true"><YaraIcon name="check" size={11} strokeWidth={3} /></span> : null}
      </span>
      <span className="yv-label yv-seen-name">{name}</span>
      <span className="yv-cap">{toFaDigits(time)}</span>
    </div>
  );
}
