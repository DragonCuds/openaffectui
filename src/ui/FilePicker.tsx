"use client";

import { useId, useRef, type ReactNode } from 'react';
import { FilePlus2 } from 'lucide-react';

/**
 * A button that opens the file chooser (several files at once) and hands the chosen ones to `onPick`.
 * For adding to a list that already shows its own tiles. `hint` / `error` sit under the button.
 * Styles in src/styles/imagepicker.css. No borders.
 */
export function FilePicker({ label, onPick, accept = 'image/*,video/*', multiple = true, disabled, hint, error, className }: {
  label: string;
  onPick: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  hint?: ReactNode;
  error?: string | null;
  className?: string;
}) {
  const uid = useId();
  const input = useRef<HTMLInputElement>(null);
  const note = error || hint;
  return (
    <div className={['fpk', className ?? ''].filter(Boolean).join(' ')}>
      <button type="button" className="fpk-btn" disabled={disabled} onClick={() => input.current?.click()} aria-describedby={note ? `${uid}-note` : undefined}>
        <FilePlus2 size={18} aria-hidden="true" />{label}
      </button>
      <input
        ref={input} className="imgp-input" type="file" accept={accept} multiple={multiple} tabIndex={-1} aria-hidden="true"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length) onPick(files);
        }}
      />
      {note ? <span id={`${uid}-note`} className="fld-hint" data-error={error ? '' : undefined} role={error ? 'alert' : undefined}>{note}</span> : null}
    </div>
  );
}
