import type { ReactNode } from 'react';

/**
 * A row of chips you tap to choose. `multiple` lets several be on (gear, perks); otherwise one at a time (type, role).
 * In single mode, tapping the chosen chip again clears it unless `required`. Styles in src/styles/choice.css.
 */
export function ToggleChips<V extends string>({
  label, options, value, onChange, multiple, required, id, className,
}: {
  /** Names the group for screen readers. */
  label: string;
  options: { value: V; label: ReactNode; icon?: ReactNode }[];
  /** Chosen values (a one-item array or empty in single mode). */
  value: V[];
  onChange: (next: V[]) => void;
  multiple?: boolean;
  /** Single mode: the chosen chip cannot be tapped off. */
  required?: boolean;
  /** Put on the group so a form can focus it when it has an error. */
  id?: string;
  className?: string;
}) {
  const tap = (v: V) => {
    const on = value.includes(v);
    if (multiple) onChange(on ? value.filter((x) => x !== v) : [...value, v]);
    else onChange(on ? (required ? value : []) : [v]);
  };
  return (
    <div id={id} tabIndex={id ? -1 : undefined} className={['tchips', className ?? ''].filter(Boolean).join(' ')} role="group" aria-label={label}>
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button key={o.value} type="button" className="tchip" aria-pressed={on} onClick={() => tap(o.value)}>
            {o.icon ? <span className="tchip-ic" aria-hidden="true">{o.icon}</span> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
