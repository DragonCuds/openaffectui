"use client";

import { useState, type CSSProperties } from 'react';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from './Modal';
import { faNum } from './digits';

/**
 * Grid of sample-work tiles. Tiles are tinted gradients (`hue`) until real images (`src`) exist.
 * A tap opens a bigger tile in a Modal with previous / next. Styles in src/styles/people.css.
 */
export function WorkGrid({ items, title = 'نمونه‌کار' }: {
  items: { hue: number; label: string; src?: string; /** small version for the grid; `src` is the big one */ thumb?: string }[];
  title?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const n = items.length;
  const cur = open != null ? items[open] : null;
  const go = (d: number) => setOpen((i) => (i == null ? i : (i + d + n) % n));

  return (
    <>
      <div className="wg">
        {items.map((it, i) => (
          <button key={i} type="button" className="wg-tile" style={{ '--h': it.hue } as CSSProperties} onClick={() => setOpen(i)} aria-label={`${it.label}، نمونه‌ی ${faNum(i + 1)} از ${faNum(n)}`} aria-haspopup="dialog">
            {it.thumb ?? it.src ? <img src={(it.thumb ?? it.src) as string} alt="" loading="lazy" /> : <Camera size={22} aria-hidden="true" />}
            <span className="wg-cap">{it.label}</span>
          </button>
        ))}
      </div>
      <Modal
        open={cur != null}
        onClose={() => setOpen(null)}
        title={title}
        footer={n > 1 ? (
          <div className="wg-nav">
            <button type="button" className="wg-step" onClick={() => go(1)} aria-label="بعدی"><ChevronLeft size={20} aria-hidden="true" /></button>
            <span>{open != null ? faNum(open + 1) : ''} از {faNum(n)}</span>
            <button type="button" className="wg-step" onClick={() => go(-1)} aria-label="قبلی"><ChevronRight size={20} aria-hidden="true" /></button>
          </div>
        ) : undefined}
      >
        {cur ? (
          <div className="wg-big" style={{ '--h': cur.hue } as CSSProperties}>
            {cur.src ? <img src={cur.src} alt="" /> : <Camera size={44} aria-hidden="true" />}
            <span className="wg-cap">{cur.label}</span>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
