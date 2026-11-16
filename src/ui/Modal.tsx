import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Dialog over a dimmed page. Esc and a click on the dim close it (unless `dismissable` is false); Tab stays inside;
 * focus returns to what opened it; the page behind does not scroll. Styles in src/styles/modal.css.
 */
export function Modal({ open, onClose, title, children, footer, dismissable = true, closeLabel = 'بستن', wide = false }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  /** Buttons row at the bottom. */
  footer?: ReactNode;
  dismissable?: boolean;
  closeLabel?: string;
  /** Wider box (640px) for forms with a big text box. */
  wide?: boolean;
}) {
  const uid = useId();
  const box = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const el = box.current;
    (el?.querySelector<HTMLElement>('[data-autofocus]') ?? el?.querySelector<HTMLElement>(FOCUSABLE) ?? el)?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissable) { e.stopPropagation(); closeRef.current(); return; }
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
      document.body.style.overflow = prevOverflow;
      before?.focus?.();
    };
  }, [open, dismissable]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="modal-back" onMouseDown={(e) => { if (dismissable && e.target === e.currentTarget) onClose(); }}>
      <div ref={box} className="modal" data-wide={wide ? '' : undefined} role="dialog" aria-modal="true" aria-labelledby={`${uid}-t`} tabIndex={-1}>
        <header className="modal-head">
          <h2 id={`${uid}-t`}>{title}</h2>
          {dismissable ? (
            <button type="button" className="modal-x" aria-label={closeLabel} onClick={onClose}>
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="m4 4 8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          ) : null}
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-foot">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
