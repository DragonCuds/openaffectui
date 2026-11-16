"use client";

import type { CSSProperties } from 'react';
import { Camera, ChevronLeft, ChevronRight, Film, Pin, Play, Star, Trash2, TriangleAlert } from 'lucide-react';
import { faDuration, faNum } from './digits';

export type EditableWork = {
  id: string | number;
  hue: number;
  label: string;
  src?: string | null;
  /** A video shows a play badge with its length. */
  kind?: 'image' | 'video';
  /** `processing`: the server is still preparing a video; `failed`: it did not work. Default `ready`. */
  state?: 'ready' | 'processing' | 'failed';
  /** Seconds, for a video. */
  duration?: number | null;
  /** This one is the cover of its folder. */
  cover?: boolean;
  /** Picked as one of the «main» works (see `onFeature`). */
  featured?: boolean;
  /** Not shown to others now: the tile is dimmed and wears `hiddenLabel`. */
  hidden?: boolean;
};

/**
 * The owner's own sample works as numbered tiles, each with «earlier», «later» and «remove» buttons (no dragging).
 * Videos show a play badge with their length; a video still being prepared shows a spinner, a failed one shows a red
 * line (it only has «remove»). With `onCover` a ready tile also gets a star button that makes it the cover; the cover wears a mark.
 * The page does the moves and the delete (and asks «sure?» itself); `marked` tints the tile it is asking about,
 * `disabled` blocks every button while a request runs. Tiles show the tint of `hue` when there is no `src`.
 * With `onFeature` a ready tile gets a pin button («main work»); `featured` tiles wear a mark and `hidden` ones are dimmed with a label.
 * Styles in src/styles/workedit.css. No borders.
 */
export function WorkEditGrid({ items, onMove, onRemove, onCover, onFeature, marked, disabled, className, coverLabel = 'کاور', coverAction = 'کاورش کن', featureLabel = 'اصلی', featureAction = 'جزو اصلی‌ها', unfeatureAction = 'از اصلی‌ها دربیار', hiddenLabel = 'پنهان', processingLabel = 'در حال آماده‌سازی…', failedLabel = 'درست نشد' }: {
  items: EditableWork[];
  /** `-1` = one place earlier (toward the start), `1` = one place later. */
  onMove: (id: EditableWork['id'], dir: -1 | 1) => void;
  onRemove: (id: EditableWork['id']) => void;
  /** Makes the tile the cover. Leave out when covers do not exist. */
  onCover?: (id: EditableWork['id']) => void;
  /** Toggles «main work» on a ready tile. Leave out when there is no such pick. */
  onFeature?: (id: EditableWork['id']) => void;
  marked?: EditableWork['id'] | null;
  disabled?: boolean;
  className?: string;
  coverLabel?: string;
  coverAction?: string;
  featureLabel?: string;
  featureAction?: string;
  unfeatureAction?: string;
  hiddenLabel?: string;
  processingLabel?: string;
  failedLabel?: string;
}) {
  const n = items.length;
  return (
    <ul className={['wed', className ?? ''].filter(Boolean).join(' ')}>
      {items.map((it, i) => {
        const st = it.state ?? 'ready';
        return (
          <li key={it.id} className="wed-item" data-marked={marked === it.id || undefined} data-state={st} data-hidden={it.hidden || undefined}>
            <div className="wed-tile" style={{ '--h': it.hue } as CSSProperties}>
              {it.src ? <img src={it.src} alt="" loading="lazy" /> : it.kind === 'video' ? <Film size={22} aria-hidden="true" /> : <Camera size={22} aria-hidden="true" />}
              <span className="wed-n">{faNum(i + 1)}</span>
              {it.kind === 'video' && st === 'ready' ? <span className="wed-vid"><Play size={12} fill="currentColor" aria-hidden="true" />{it.duration ? faDuration(it.duration) : null}</span> : null}
              {it.label ? <span className="wed-cap">{it.label}</span> : null}
              {it.featured ? <span className="wed-feat"><Pin size={12} fill="currentColor" aria-hidden="true" />{featureLabel}</span> : null}
              {it.hidden ? <span className="wed-hid">{hiddenLabel}</span> : null}
              {it.cover ? <span className="wed-cover"><Star size={12} fill="currentColor" aria-hidden="true" />{coverLabel}</span> : null}
              {st === 'processing' ? <span className="wed-state" role="status"><span className="wed-spin" aria-hidden="true" />{processingLabel}</span> : null}
              {st === 'failed' ? <span className="wed-state wed-bad" role="alert"><TriangleAlert size={18} aria-hidden="true" />{failedLabel}</span> : null}
            </div>
            <div className="wed-act">
              <button type="button" className="wed-btn" disabled={disabled || i === 0} onClick={() => onMove(it.id, -1)} aria-label={`نمونه‌ی ${faNum(i + 1)} را جلوتر بیار`} title="جلوتر">
                <ChevronRight size={18} aria-hidden="true" />
              </button>
              <button type="button" className="wed-btn" disabled={disabled || i === n - 1} onClick={() => onMove(it.id, 1)} aria-label={`نمونه‌ی ${faNum(i + 1)} را عقب‌تر ببر`} title="عقب‌تر">
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              {onCover ? (
                <button type="button" className="wed-btn" disabled={disabled || it.cover || st !== 'ready'} onClick={() => onCover(it.id)} aria-label={`نمونه‌ی ${faNum(i + 1)}: ${coverAction}`} title={coverAction}>
                  <Star size={17} aria-hidden="true" />
                </button>
              ) : null}
              {onFeature ? (
                <button type="button" className="wed-btn" data-on={it.featured || undefined} aria-pressed={!!it.featured} disabled={disabled || st !== 'ready'} onClick={() => onFeature(it.id)} aria-label={`نمونه‌ی ${faNum(i + 1)}: ${it.featured ? unfeatureAction : featureAction}`} title={it.featured ? unfeatureAction : featureAction}>
                  <Pin size={17} fill={it.featured ? 'currentColor' : 'none'} aria-hidden="true" />
                </button>
              ) : null}
              <button type="button" className="wed-btn wed-del" disabled={disabled} onClick={() => onRemove(it.id)} aria-label={`نمونه‌ی ${faNum(i + 1)} را حذف کن`} title="حذف">
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
