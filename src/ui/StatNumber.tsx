import type { ReactNode } from 'react';

/**
 * A big or small count that never shows a lone Persian zero (۰ reads like a dot or radio button).
 * value 0 / null: big size shows `empty` as a calm sentence; small size shows a muted «—» (or `empty` if given).
 * Otherwise the number in Persian digits with an optional unit and label.
 */
export function StatNumber({ value, label, unit, empty, size = 'big', className }: {
  value: number | null | undefined;
  label?: ReactNode;
  unit?: string;
  empty?: ReactNode;
  size?: 'big' | 'small';
  className?: string;
}) {
  const none = value == null || !Number.isFinite(value) || value === 0;
  const cls = ['statnum', `statnum-${size}`, none ? 'is-empty' : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <span className={cls}>
      {none ? (
        <span className="statnum-empty">{empty ?? (size === 'small' ? '—' : 'هیچی')}</span>
      ) : (
        <span className="statnum-v">{Math.round(value).toLocaleString('fa-IR')}{unit ? <span className="statnum-unit">{unit}</span> : null}</span>
      )}
      {label ? <span className="statnum-label">{label}</span> : null}
    </span>
  );
}
