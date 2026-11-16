import type { ReactNode } from 'react';

/**
 * One message bubble in a talk between two people. `mine` sits on the reading-start side in a strong tint,
 * the other person's on the opposite side in a soft one. `label` is a small line above the text (e.g. «پیام درخواست»),
 * `time` a quiet line below. Styles in src/styles/chat.css.
 */
export function ChatBubble({ mine = false, label, time, children, className }: {
  mine?: boolean;
  label?: ReactNode;
  time?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `chb ${className}` : 'chb'} data-mine={mine ? '' : undefined}>
      <div className="chb-box">
        {label ? <span className="chb-label">{label}</span> : null}
        <div className="chb-text">{children}</div>
      </div>
      {time ? <span className="chb-time">{time}</span> : null}
    </div>
  );
}

/** A centered quiet line inside a talk («کارفرما فرد دیگه‌ای رو انتخاب کرد»). */
export function ChatSystemLine({ children }: { children: ReactNode }) {
  return <p className="chb-sys">{children}</p>;
}
