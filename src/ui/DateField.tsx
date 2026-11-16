"use client";

import { useId, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { faNum } from './digits';
import { JALALI_MONTHS, WEEKDAYS_SHORT, faPlain, jalaliMonthLength, jalaliWeekday, toGregorian, toJalali } from './jalali';

const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const same = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** «۱۸ آذر ۱۴۰۵» */
export const formatJalaliLong = (d: Date) => { const j = toJalali(d); return `${faPlain(j.jd)} ${JALALI_MONTHS[j.jm - 1]} ${faPlain(j.jy)}`; };

/**
 * One Jalali date. The field shows the chosen day; pressing it opens a month grid right under it (no popover, so a
 * dialog never clips it). Days outside `min`..`max` cannot be chosen. Value is a local-midnight Date or null.
 * Same look and label/error props as TextField. Styles in src/styles/datefield.css.
 */
export function DateField({ label, value, onChange, min, max, placeholder = 'انتخاب تاریخ', error, hint, id, className }: {
  label: string;
  value: Date | null;
  onChange: (d: Date) => void;
  min?: Date;
  max?: Date;
  placeholder?: string;
  error?: string | null;
  hint?: string;
  id?: string;
  className?: string;
}) {
  const uid = useId();
  const fid = id ?? uid;
  const [open, setOpen] = useState(false);
  const start = value ?? min ?? new Date();
  const [view, setView] = useState(() => { const j = toJalali(start); return j.jy * 12 + (j.jm - 1); });
  const jy = Math.floor(view / 12);
  const jm = (view % 12) + 1;
  const lo = min ? sod(min) : null;
  const hi = max ? sod(max) : null;
  const first = toGregorian(jy, jm, 1);
  const lead = jalaliWeekday(first);
  const len = jalaliMonthLength(jy, jm);
  const loIdx = lo ? toJalali(lo).jy * 12 + toJalali(lo).jm - 1 : -Infinity;
  const hiIdx = hi ? toJalali(hi).jy * 12 + toJalali(hi).jm - 1 : Infinity;
  const today = sod(new Date());
  const note = error || hint;

  return (
    <div className={['fld', 'dfd', className ?? ''].filter(Boolean).join(' ')}>
      <label className="fld-label" htmlFor={fid}>{label}</label>
      <button id={fid} type="button" className="fld-input dfd-btn" aria-expanded={open} aria-invalid={error ? true : undefined} onClick={() => setOpen((o) => !o)}>
        <span className="dfd-v" data-empty={value ? undefined : ''}>{value ? formatJalaliLong(value) : placeholder}</span>
        <CalendarDays size={16} aria-hidden="true" />
      </button>
      {open ? (
        <div className="dfd-cal" role="group" aria-label={`${JALALI_MONTHS[jm - 1]} ${faPlain(jy)}`}>
          <div className="dfd-nav">
            <button type="button" className="dfd-step" aria-label="ماه بعد" disabled={view >= hiIdx} onClick={() => setView(view + 1)}><ChevronLeft size={18} aria-hidden="true" /></button>
            <strong>{JALALI_MONTHS[jm - 1]} {faPlain(jy)}</strong>
            <button type="button" className="dfd-step" aria-label="ماه قبل" disabled={view <= loIdx} onClick={() => setView(view - 1)}><ChevronRight size={18} aria-hidden="true" /></button>
          </div>
          <div className="dfd-grid">
            {WEEKDAYS_SHORT.map((w) => <span key={w} className="dfd-wd" aria-hidden="true">{w}</span>)}
            {Array.from({ length: lead }, (_, k) => <span key={`b${k}`} />)}
            {Array.from({ length: len }, (_, k) => {
              const day = toGregorian(jy, jm, k + 1);
              const off = (lo && day < lo) || (hi && day > hi);
              const on = value && same(day, value);
              return (
                <button
                  key={k} type="button" className="dfd-day" disabled={!!off} data-on={on || undefined} data-today={same(day, today) || undefined}
                  aria-pressed={on || undefined} onClick={() => { onChange(day); setOpen(false); }}
                >{faNum(k + 1)}</button>
              );
            })}
          </div>
        </div>
      ) : null}
      {note ? <span className="fld-hint" data-error={error ? '' : undefined}>{note}</span> : null}
    </div>
  );
}
