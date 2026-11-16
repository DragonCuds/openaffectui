import type { ReactNode } from 'react';

/**
 * An on/off switch with a label and an optional line of explanation. The whole row is the button.
 * `prominent` makes it a big tinted card (for the one switch that matters most); `compact` a small pill for a
 * header or a menu (label + track, no hint). The on colour can be set with `--sw-on`. Styles in src/styles/choice.css.
 */
export function Switch({ label, hint, checked, onChange, prominent, compact, disabled, icon, id, className }: {
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  prominent?: boolean;
  compact?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <button
      id={id} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
      className={['sw', prominent ? 'sw-big' : '', compact ? 'sw-sm' : '', className ?? ''].filter(Boolean).join(' ')}
    >
      {icon ? <span className="sw-ic" aria-hidden="true">{icon}</span> : null}
      <span className="sw-text">
        <span className="sw-label">{label}</span>
        {hint && !compact ? <span className="sw-hint">{hint}</span> : null}
      </span>
      <span className="sw-track" aria-hidden="true"><span className="sw-knob" /></span>
    </button>
  );
}
