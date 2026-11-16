"use client";

import { useEffect, useState, type CSSProperties } from 'react';
import { Camera, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Modal } from './Modal';
import { faDuration, faNum } from './digits';

export type GalleryItem = {
  id: string | number;
  kind: 'image' | 'video';
  hue?: number;
  /** Big picture (or the poster of a video). */
  src?: string | null;
  /** Small picture for the strip. */
  thumb?: string | null;
  /** Video file URL (mp4). */
  video?: string | null;
  duration?: number | null;
};

/**
 * Modal that shows the items of one folder, one big at a time: a photo, or a video with the browser's own controls.
 * Previous / next in the footer and a strip of small tiles under the picture. `start` is the index to open at.
 * Styles in src/styles/workgallery.css. No borders.
 */
export function WorkGallery({ open, onClose, title, items, start = 0 }: {
  open: boolean;
  onClose: () => void;
  title: string;
  items: GalleryItem[];
  start?: number;
}) {
  const [i, setI] = useState(start);
  const n = items.length;
  useEffect(() => { if (open) setI(Math.min(Math.max(0, start), Math.max(0, n - 1))); }, [open, start, n]);
  const cur = items[i];
  const go = (d: number) => setI((x) => (x + d + n) % n);

  return (
    <Modal
      open={open && n > 0} onClose={onClose} title={title} wide
      footer={n > 1 ? (
        <div className="wg-nav">
          <button type="button" className="wg-step" onClick={() => go(1)} aria-label="بعدی"><ChevronLeft size={20} aria-hidden="true" /></button>
          <span>{faNum(i + 1)} از {faNum(n)}</span>
          <button type="button" className="wg-step" onClick={() => go(-1)} aria-label="قبلی"><ChevronRight size={20} aria-hidden="true" /></button>
        </div>
      ) : undefined}
    >
      {cur ? (
        <div className="wgal-big" style={{ '--h': cur.hue ?? 210 } as CSSProperties}>
          {cur.kind === 'video' && cur.video ? (
            <video key={cur.id} src={cur.video} poster={cur.src ?? cur.thumb ?? undefined} controls playsInline preload="metadata" />
          ) : cur.src ? (
            <img key={cur.id} src={cur.src} alt="" />
          ) : <Camera size={44} aria-hidden="true" />}
        </div>
      ) : null}
      {n > 1 ? (
        <div className="wgal-strip" role="list">
          {items.map((it, k) => (
            <button
              key={it.id} type="button" role="listitem" className="wgal-t" data-on={k === i || undefined} style={{ '--h': it.hue ?? 210 } as CSSProperties}
              onClick={() => setI(k)} aria-label={`${it.kind === 'video' ? 'ویدیوی' : 'عکس'} ${faNum(k + 1)}`} aria-current={k === i ? 'true' : undefined}
            >
              {it.thumb ?? it.src ? <img src={(it.thumb ?? it.src) as string} alt="" loading="lazy" /> : <Camera size={16} aria-hidden="true" />}
              {it.kind === 'video' ? <span className="wgal-v"><Play size={12} fill="currentColor" aria-hidden="true" />{it.duration ? faDuration(it.duration) : null}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </Modal>
  );
}
