"use client";

import { useState, type ReactNode } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Film, RotateCw, X } from 'lucide-react';
import { faNum } from './digits';

export type UploadTrayItem = {
  id: string;
  name: string;
  /** Small preview picture (a video has none). */
  thumb?: string | null;
  kind: 'image' | 'video';
  /** `queued` waits its turn, `sending` shows the bar, `processing` is the server working on a video. */
  state: 'queued' | 'sending' | 'processing' | 'done' | 'error';
  /** 0..100 while sending. */
  percent: number;
  /** Plain line shown for `error`. */
  message?: string;
};

/**
 * A strip fixed at the bottom of the screen listing files being sent: preview, name, bar and percent; after a video is
 * sent it says «در حال آماده‌سازی ویدیو…». A failed file shows its line and «دوباره». It renders nothing when `items` is empty.
 * The page owns the list and the queue. Styles in src/styles/uploadtray.css. No borders.
 */
export function UploadTray({ items, onRetry, onDismiss, title, labels }: {
  items: UploadTrayItem[];
  onRetry?: (id: string) => void;
  onDismiss?: (id: string) => void;
  /** Header text; defaults to a count line. */
  title?: ReactNode;
  labels?: Partial<Record<'queued' | 'processing' | 'done' | 'retry' | 'dismiss' | 'collapse' | 'expand', string>>;
}) {
  const [folded, setFolded] = useState(false);
  if (!items.length) return null;
  const L = {
    queued: 'منتظر نوبت…', processing: 'در حال آماده‌سازی ویدیو…', done: 'آماده شد', retry: 'دوباره', dismiss: 'برداشتن',
    collapse: 'کوچک کردن', expand: 'باز کردن', ...labels,
  };
  const left = items.filter((x) => x.state !== 'done' && x.state !== 'error').length;
  const bad = items.filter((x) => x.state === 'error').length;
  const head = title ?? (left ? `در حال فرستادن ${faNum(left)} فایل` : bad ? `${faNum(bad)} فایل نرفت` : 'همه فرستاده شد');
  return (
    <section className="upt" aria-label="فایل‌های در حال فرستادن" aria-live="polite">
      <header className="upt-head">
        <strong>{head}</strong>
        <button type="button" className="upt-fold" onClick={() => setFolded((f) => !f)} aria-label={folded ? L.expand : L.collapse} aria-expanded={!folded}>
          {folded ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
        </button>
      </header>
      {folded ? null : (
        <ul className="upt-list">
          {items.map((it) => (
            <li key={it.id} className="upt-row" data-state={it.state}>
              <span className="upt-thumb">{it.thumb ? <img src={it.thumb} alt="" /> : <Film size={18} aria-hidden="true" />}</span>
              <span className="upt-main">
                <span className="upt-name">{it.name}</span>
                {it.state === 'sending' || it.state === 'queued' ? (
                  <span className="upt-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(it.percent)} aria-label={it.name}>
                    <span style={{ inlineSize: `${Math.max(0, Math.min(100, it.percent))}%` }} />
                  </span>
                ) : null}
                <span className="upt-note">
                  {it.state === 'queued' ? L.queued
                    : it.state === 'sending' ? `${faNum(Math.round(it.percent))}٪`
                      : it.state === 'processing' ? L.processing
                        : it.state === 'done' ? <><CheckCircle2 size={14} aria-hidden="true" />{L.done}</>
                          : it.message}
                </span>
              </span>
              {it.state === 'error' ? (
                <span className="upt-act">
                  {onRetry ? <button type="button" className="upt-btn" onClick={() => onRetry(it.id)}><RotateCw size={14} aria-hidden="true" />{L.retry}</button> : null}
                  {onDismiss ? <button type="button" className="upt-x" onClick={() => onDismiss(it.id)} aria-label={L.dismiss}><X size={16} aria-hidden="true" /></button> : null}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
