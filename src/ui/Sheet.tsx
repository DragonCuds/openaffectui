"use client";

import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useHistoryClose } from './useHistoryClose';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Bottom sheet on phones, centred dialog from 761px up. Opens only when told to. Esc, a click on the dim and the
 * browser's back button close it (one history entry, see useHistoryClose). Tab stays inside; focus returns to what opened it.
 * `className` lands on the dim layer, so a page can re-colour the sheet by overriding the kit variables there
 * (the sheet is rendered in a portal and does not inherit from the page). Styles in src/styles/sheet.css.
 */
export function Sheet({ open, onClose, title, hint, children, className, style, closeLabel = 'بستن' }: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Small grey line under the title. */
  hint?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Inline style of the dim layer (e.g. custom properties). */
  style?: CSSProperties;
  closeLabel?: string;
}) {
  const uid = useId();
  const box = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useHistoryClose(open, () => closeRef.current());

  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const el = box.current;
    (el?.querySelector<HTMLElement>('[data-autofocus]') ?? el)?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== 'Tab' || !el) return;
      const list = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!list.length) { e.preventDefault(); el.focus(); return; }
      const first = list[0]; const last = list[list.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key, true);
    return () => {
      document.removeEventListener('keydown', key, true);
      document.body.style.overflow = prev;
      before?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className={['sheet-back', className ?? ''].filter(Boolean).join(' ')} style={style} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={box} className="sheet" role="dialog" aria-modal="true" aria-labelledby={`${uid}-t`} tabIndex={-1}>
        <header className="sheet-head">
          <div>
            <h2 id={`${uid}-t`}>{title}</h2>
            {hint ? <p className="sheet-hint">{hint}</p> : null}
          </div>
          <button type="button" className="sheet-x" aria-label={closeLabel} onClick={onClose}>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="m4 4 8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
