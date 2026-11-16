"use client";

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { faDuration, faNum } from './digits';
import { useHistoryClose } from './useHistoryClose';

export type LightboxItem = {
  id: string | number;
  kind: 'image' | 'video';
  /** Big picture (or the poster of a video). */
  src: string;
  /** Video file URL. */
  video?: string | null;
  duration?: number | null;
  w?: number;
  h?: number;
};

/**
 * Full-screen viewer: one photo (or a video with the browser's own controls) on a dark layer, with previous / next
 * buttons and the arrow keys (in a right-to-left page ← goes forward). Nothing plays by itself. Esc, a click on the
 * dark area and the browser's back button close it. `start` is the index it opens at. Styles in src/styles/lightbox.css.
 */
export function Lightbox({ open, onClose, items, start = 0, className }: {
  open: boolean;
  onClose: () => void;
  items: LightboxItem[];
  start?: number;
  className?: string;
}) {
  const n = items.length;
  const [i, setI] = useState(start);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useHistoryClose(open && n > 0, () => closeRef.current());

  useEffect(() => { if (open) setI(Math.min(Math.max(0, start), Math.max(0, n - 1))); }, [open, start, n]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); }
      else if (e.key === 'ArrowLeft') setI((x) => (x + 1) % Math.max(1, n));
      else if (e.key === 'ArrowRight') setI((x) => (x - 1 + n) % Math.max(1, n));
    };
    document.addEventListener('keydown', key, true);
    return () => { document.removeEventListener('keydown', key, true); document.body.style.overflow = prev; };
  }, [open, n]);

  if (!open || !n || typeof document === 'undefined') return null;
  const cur = items[Math.min(i, n - 1)];
  const go = (d: number) => setI((x) => (x + d + n) % n);

  return createPortal(
    <div className={['lbx', className ?? ''].filter(Boolean).join(' ')} role="dialog" aria-modal="true" aria-label="نمایش عکس" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button type="button" className="lbx-x" onClick={onClose} aria-label="بستن" autoFocus><X size={20} aria-hidden="true" /></button>
      <div className="lbx-stage" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        {cur.kind === 'video' && cur.video ? (
          <video key={cur.id} className="lbx-media" src={cur.video} poster={cur.src} controls playsInline preload="metadata" />
        ) : (
          <img key={cur.id} className="lbx-media" src={cur.src} alt="" width={cur.w} height={cur.h} />
        )}
      </div>
      {n > 1 ? (
        <>
          <button type="button" className="lbx-step" data-side="next" onClick={() => go(1)} aria-label="بعدی"><ChevronLeft size={24} aria-hidden="true" /></button>
          <button type="button" className="lbx-step" data-side="prev" onClick={() => go(-1)} aria-label="قبلی"><ChevronRight size={24} aria-hidden="true" /></button>
        </>
      ) : null}
      <div className="lbx-count">
        {cur.kind === 'video' ? <Play size={12} fill="currentColor" aria-hidden="true" /> : null}
        {faNum(Math.min(i, n - 1) + 1)} از {faNum(n)}
        {cur.kind === 'video' && cur.duration ? ` · ${faDuration(cur.duration)}` : ''}
      </div>
    </div>,
    document.body,
  );
}
