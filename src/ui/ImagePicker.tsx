"use client";
import { useId, useRef, type ReactNode } from 'react';
import { ImagePlus, Play, X } from 'lucide-react';
import { faNum } from './digits';

export type PickedImage = { id: string; src: string; name?: string; /** `src` is a video file: the tile shows its first frame with a play mark. */ video?: boolean };

/**
 * Choose pictures from the phone or computer and see small previews with a remove button.
 * The page owns the list (it makes the preview `src`, e.g. with URL.createObjectURL, and frees it) and gets the new files in `onAdd`.
 * Shows «۳ از ۱۰» when `max` is more than 1. `renderExtra` puts something under each tile (a select, a caption).
 * Styles in src/styles/imagepicker.css. No borders.
 */
export function ImagePicker({
  label, items, onAdd, onRemove, max = 10, min, accept = 'image/*', hint, error, addLabel, renderExtra, round, id, className,
}: {
  label: string;
  items: PickedImage[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  max?: number;
  /** Shown in the counter as the goal: «۳ از ۱۰ (حداقل ۳)». */
  min?: number;
  accept?: string;
  hint?: ReactNode;
  /** Plain error text; also marks the picker invalid. */
  error?: string | null;
  addLabel?: string;
  renderExtra?: (item: PickedImage, index: number) => ReactNode;
  /** Round tiles (a profile photo): use with `max={1}`. */
  round?: boolean;
  id?: string;
  className?: string;
}) {
  const uid = useId();
  const fid = id ?? uid;
  const input = useRef<HTMLInputElement>(null);
  const full = items.length >= max;
  const note = error || hint;
  const single = max === 1;

  return (
    <div className={['imgp', className ?? ''].filter(Boolean).join(' ')} data-invalid={error ? '' : undefined} data-round={round ? '' : undefined}>
      <div className="imgp-head">
        <span className="fld-label">{label}</span>
        {!single ? (
          <span className="imgp-count" aria-live="polite">{faNum(items.length)} از {faNum(max)}{min && items.length < min ? ` (حداقل ${faNum(min)})` : ''}</span>
        ) : null}
      </div>
      <div className="imgp-grid">
        {items.map((it, i) => (
          <div key={it.id} className="imgp-item">
            <div className="imgp-tile">
              {it.video ? (
                <>
                  <video src={`${it.src}#t=0.1`} muted playsInline preload="metadata" />
                  <span className="imgp-vid"><Play size={12} fill="currentColor" aria-hidden="true" />ویدیو</span>
                </>
              ) : <img src={it.src} alt="" />}
              <button type="button" className="imgp-x" aria-label={`حذف ${it.name ?? 'عکس'} ${faNum(i + 1)}`} onClick={() => onRemove(it.id)}><X size={16} aria-hidden="true" /></button>
            </div>
            {renderExtra ? renderExtra(it, i) : null}
          </div>
        ))}
        {!full ? (
          <button type="button" id={fid} className="imgp-add" onClick={() => input.current?.click()} aria-describedby={note ? `${fid}-note` : undefined}>
            <ImagePlus size={24} aria-hidden="true" />
            <span>{addLabel ?? (single ? 'انتخاب عکس' : 'افزودن عکس')}</span>
          </button>
        ) : null}
      </div>
      <input
        ref={input} className="imgp-input" type="file" accept={accept} multiple={!single} tabIndex={-1} aria-hidden="true"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length) onAdd(files);
        }}
      />
      {note ? <span id={`${fid}-note`} className="fld-hint" data-error={error ? '' : undefined} role={error ? 'alert' : undefined}>{note}</span> : null}
    </div>
  );
}
