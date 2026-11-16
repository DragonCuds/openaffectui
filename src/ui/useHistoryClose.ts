import { useEffect, useRef } from 'react';

// History entries pushed by layers that are closing but may still be reused (React's strict mode runs an effect twice;
// an entry is only taken back off the stack after a tick when nothing claimed it).
let spare = 0;

/**
 * While `open`, one history entry is pushed so the browser's back button closes the layer (dialog, sheet, viewer)
 * instead of leaving the page. Closing by other means (Esc, a click outside) removes that entry again.
 * The current history state is copied, so frameworks that keep their own state in it (Next) are not confused.
 */
export function useHistoryClose(open: boolean, onClose: () => void) {
  const cb = useRef(onClose);
  cb.current = onClose;
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    let popped = false;
    if (spare > 0) spare -= 1;
    else { try { window.history.pushState({ ...(window.history.state ?? {}), layer: true }, ''); } catch { /* no history */ } }
    const pop = () => { popped = true; cb.current(); };
    window.addEventListener('popstate', pop);
    return () => {
      window.removeEventListener('popstate', pop);
      if (popped) return;
      spare += 1;
      window.setTimeout(() => {
        if (spare > 0) { spare -= 1; try { window.history.back(); } catch { /* nothing to undo */ } }
      }, 0);
    };
  }, [open]);
}
