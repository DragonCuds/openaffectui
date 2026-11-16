import type { ReactNode } from 'react';
import { Avatar } from './Avatar';

/** A column of conversations (one `ThreadRow` each). */
export function ThreadList({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <ul className={className ? `thl ${className}` : 'thl'} aria-label={label}>{children}</ul>;
}

/**
 * One conversation in a list: avatar, name, a small line (rating, time), one line of the last message, an unread dot and tags.
 * `active` marks the open one. Styles in src/styles/chat.css.
 */
export function ThreadRow({ name, hue, src, sub, preview, unread = false, active = false, tags, onSelect }: {
  name: string;
  hue?: number;
  src?: string;
  /** Small line next to the name, e.g. rating or time. */
  sub?: ReactNode;
  /** One line of the last message. */
  preview?: ReactNode;
  unread?: boolean;
  active?: boolean;
  /** Small tags at the end, e.g. <Chip>انتخاب شد</Chip>. */
  tags?: ReactNode;
  onSelect: () => void;
}) {
  return (
    <li>
      <button type="button" className="thl-row" data-active={active ? '' : undefined} aria-current={active ? 'true' : undefined} onClick={onSelect}>
        <Avatar name={name} hue={hue} src={src} size={42} />
        <span className="thl-body">
          <span className="thl-top">
            <span className="thl-name" data-unread={unread ? '' : undefined}>{name}</span>
            {sub ? <span className="thl-sub">{sub}</span> : null}
          </span>
          {preview ? <span className="thl-prev">{preview}</span> : null}
        </span>
        <span className="thl-end">
          {tags}
          {unread ? <span className="thl-dot" role="img" aria-label="پیام خوانده‌نشده" /> : null}
        </span>
      </button>
    </li>
  );
}
