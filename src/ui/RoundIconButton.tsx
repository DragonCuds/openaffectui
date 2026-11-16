import type { ReactNode } from 'react';
import { cx } from './yv';

/** 44px round icon button on the surface with a soft shadow; `badge` shows the amber dot. Renders a link when `href` is given, else a button. `label` is the accessible name. */
export function RoundIconButton({ icon, label, onClick, href, badge = false, className }: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  badge?: boolean;
  className?: string;
}) {
  const inner = (
    <>
      <span aria-hidden="true" style={{ display: 'inline-grid' }}>{icon}</span>
      {badge ? <i className="yv-iconbtn-badge" aria-hidden="true" /> : null}
    </>
  );
  if (href) return <a className={cx('yv', 'yv-iconbtn', className)} href={href} aria-label={label}>{inner}</a>;
  return <button type="button" className={cx('yv', 'yv-iconbtn', className)} onClick={onClick} aria-label={label}>{inner}</button>;
}
