import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import {
  JALALI_MONTHS, WEEKDAYS_LONG, WEEKDAYS_SHORT,
  faPlain, formatJalali, jalaliMonthLength, jalaliWeekday, toGregorian, toJalali,
} from './jalali';

export type DateRange = { start: Date | null; end: Date | null };

const DAY_MS = 86_400_000;
/** Whole-day index of a local calendar day (DST-proof). */
const dn = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS;
const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

type View = { jy: number; jm: number };

/**
 * Persian (Jalali) date range picker. Value is Gregorian `Date` (local midnight), the UI is Jalali.
 * Pick start, then end (an end before the start swaps). `onChange` fires once the range is complete
 * or a preset is used.
 *
 * Keyboard in the day grid (logical for RTL, the grid reads right to left):
 *   ArrowRight = previous day, ArrowLeft = next day (flipped automatically in an LTR context),
 *   ArrowUp / ArrowDown = previous / next week, Home / End = first (Sat) / last (Fri) day of the week,
 *   PageUp / PageDown = previous / next month (Shift = year), Enter / Space = select,
 *   Escape = close and return focus to the trigger.
 */
export function DateRangePicker({ value, onChange, min, max, label = 'بازه تاریخ' }: {
  value: DateRange;
  onChange: (v: DateRange) => void;
  min?: Date;
  max?: Date;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>({ jy: 1400, jm: 1 });
  const [focusDay, setFocusDay] = useState<Date>(() => sod(new Date()));
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [hover, setHover] = useState<Date | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wantFocus = useRef(false);
  const uid = useId();

  const minN = min ? dn(min) : -Infinity;
  const maxN = max ? dn(max) : Infinity;
  const today = useMemo(() => sod(new Date()), []);

  const clamp = useCallback((d: Date): Date => {
    const n = dn(d);
    if (n < minN) return sod(min!);
    if (n > maxN) return sod(max!);
    return d;
  }, [minN, maxN, min, max]);

  const showDay = useCallback((d: Date, focus: boolean) => {
    const c = clamp(d);
    const j = toJalali(c);
    setFocusDay(c);
    setView({ jy: j.jy, jm: j.jm });
    wantFocus.current = focus;
  }, [clamp]);

  const openPanel = () => {
    const base = value.start ?? today;
    setAnchor(null);
    setHover(null);
    showDay(base, true);
    setOpen(true);
  };

  const close = useCallback((restore: boolean) => {
    setOpen(false);
    setAnchor(null);
    setHover(null);
    if (restore) triggerRef.current?.focus();
  }, []);

  // Move DOM focus to the roving day after state-driven moves.
  useEffect(() => {
    if (!open || !wantFocus.current) return;
    wantFocus.current = false;
    wrapRef.current?.querySelector<HTMLButtonElement>('.dr-day[tabindex="0"]')?.focus();
  });

  // Click outside closes.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, close]);

  const commit = (a: Date, b: Date) => {
    const [s, e] = dn(a) <= dn(b) ? [a, b] : [b, a];
    onChange({ start: sod(s), end: sod(e) });
    close(true);
  };

  const pick = (d: Date) => {
    if (dn(d) < minN || dn(d) > maxN) return;
    setFocusDay(d);
    if (anchor) commit(anchor, d);
    else { setAnchor(d); setHover(null); }
  };

  const monthBounds = (jy: number, jm: number): [Date, Date] =>
    [toGregorian(jy, jm, 1), toGregorian(jy, jm, jalaliMonthLength(jy, jm))];

  const shiftMonth = (delta: number): View => {
    const idx = view.jy * 12 + (view.jm - 1) + delta;
    return { jy: Math.floor(idx / 12), jm: (idx % 12 + 12) % 12 + 1 };
  };
  const monthEnabled = (v: View) => {
    const [a, b] = monthBounds(v.jy, v.jm);
    return dn(b) >= minN && dn(a) <= maxN;
  };
  const prevView = shiftMonth(-1);
  const nextView = shiftMonth(1);

  const goMonth = (delta: number, focus: boolean) => {
    const t = view.jy * 12 + (view.jm - 1) + delta;
    const jy = Math.floor(t / 12), jm = (t % 12 + 12) % 12 + 1;
    const jd = Math.min(toJalali(focusDay).jd, jalaliMonthLength(jy, jm));
    showDay(toGregorian(jy, jm, jd), focus); // showDay clamps into min/max
  };

  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const next = rtl ? 'ArrowLeft' : 'ArrowRight';
    const prev = rtl ? 'ArrowRight' : 'ArrowLeft';
    let t: Date | null = null;
    if (e.key === next) t = addDays(focusDay, 1);
    else if (e.key === prev) t = addDays(focusDay, -1);
    else if (e.key === 'ArrowDown') t = addDays(focusDay, 7);
    else if (e.key === 'ArrowUp') t = addDays(focusDay, -7);
    else if (e.key === 'Home') t = addDays(focusDay, -jalaliWeekday(focusDay));
    else if (e.key === 'End') t = addDays(focusDay, 6 - jalaliWeekday(focusDay));
    else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      goMonth((e.key === 'PageUp' ? -1 : 1) * (e.shiftKey ? 12 : 1), true);
      return;
    } else return;
    e.preventDefault();
    showDay(t, true);
  };

  const onPanelKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (open && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
  };

  const presets = useMemo(() => {
    const t = today;
    const j = toJalali(t);
    const prev = j.jm === 1 ? { jy: j.jy - 1, jm: 12 } : { jy: j.jy, jm: j.jm - 1 };
    const range = (a: Date, b: Date): [Date, Date] => [a, b];
    return [
      { id: '7', label: '۷ روز اخیر', r: range(addDays(t, -6), t) },
      { id: '30', label: '۳۰ روز اخیر', r: range(addDays(t, -29), t) },
      { id: 'this', label: 'این ماه', r: monthBounds(j.jy, j.jm) },
      { id: 'prev', label: 'ماه قبل', r: monthBounds(prev.jy, prev.jm) },
    ].map((p) => {
      const s = dn(p.r[0]) < minN ? sod(min!) : p.r[0];
      const e = dn(p.r[1]) > maxN ? sod(max!) : p.r[1];
      return { id: p.id, label: p.label, s, e, ok: dn(s) <= dn(e) };
    });
  }, [today, minN, maxN, min, max]);

  const sameRange = (s: Date, e: Date) =>
    !!value.start && !!value.end && dn(value.start) === dn(s) && dn(value.end) === dn(e);

  // Range to paint: pending anchor (+ hover/focus preview) or the committed value.
  const paint = useMemo(() => {
    if (anchor) {
      const other = hover ?? focusDay;
      const [a, b] = dn(anchor) <= dn(other) ? [anchor, other] : [other, anchor];
      return { s: dn(a), e: dn(b), pending: true };
    }
    if (value.start) {
      const e = value.end ?? value.start;
      const [a, b] = dn(value.start) <= dn(e) ? [value.start, e] : [e, value.start];
      return { s: dn(a), e: dn(b), pending: false };
    }
    return null;
  }, [anchor, hover, focusDay, value.start, value.end]);

  // Month grid: leading blanks (Saturday first), then the days.
  const len = jalaliMonthLength(view.jy, view.jm);
  const first = toGregorian(view.jy, view.jm, 1);
  const lead = jalaliWeekday(first);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= len; d++) cells.push(toGregorian(view.jy, view.jm, d));
  while (cells.length % 7) cells.push(null);
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const focusInView = (() => {
    const j = toJalali(focusDay);
    return j.jy === view.jy && j.jm === view.jm ? dn(focusDay) : dn(clamp(first));
  })();

  const title = `${JALALI_MONTHS[view.jm - 1]} ${faPlain(view.jy)}`;
  const triggerText = value.start
    ? `${formatJalali(value.start)} تا ${value.end ? formatJalali(value.end) : '…'}`
    : null;
  const panelId = `${uid}-panel`;

  return (
    <div
      className="dr"
      ref={wrapRef}
      onKeyDown={onPanelKey}
      onBlur={(e) => {
        const to = e.relatedTarget as Node | null;
        if (open && to && wrapRef.current && !wrapRef.current.contains(to)) close(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="dr-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={triggerText ? `${label}: ${triggerText}` : `${label}: بازه را انتخاب کن`}
        data-empty={!triggerText || undefined}
        onClick={() => (open ? close(false) : openPanel())}
      >
        <CalendarDays size={16} aria-hidden="true" />
        <span className="dr-trigger-text">{triggerText ?? 'بازه را انتخاب کن'}</span>
      </button>

      {open ? (
        <div id={panelId} className="dr-panel" role="dialog" aria-label="انتخاب بازه تاریخ">
          <div className="dr-presets" role="group" aria-label="بازه‌های آماده">
            {presets.map((p) => (
              <Button
                key={p.id}
                className="dr-preset"
                disabled={!p.ok}
                aria-pressed={sameRange(p.s, p.e)}
                onClick={() => { onChange({ start: p.s, end: p.e }); close(true); }}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <div className="dr-head">
            <button
              type="button" className="dr-nav" aria-label="ماه قبل"
              disabled={!monthEnabled(prevView)} onClick={() => goMonth(-1, false)}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <div className="dr-title" aria-live="polite">{title}</div>
            <button
              type="button" className="dr-nav" aria-label="ماه بعد"
              disabled={!monthEnabled(nextView)} onClick={() => goMonth(1, false)}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="dr-grid" role="grid" aria-label={title} onKeyDown={onGridKey} onMouseLeave={() => setHover(null)}>
            <div className="dr-row" role="row">
              {WEEKDAYS_SHORT.map((w, i) => (
                <div key={w} className="dr-wd" role="columnheader" aria-label={WEEKDAYS_LONG[i]} data-fri={i === 6 || undefined}>
                  <abbr title={WEEKDAYS_LONG[i]}>{w}</abbr>
                </div>
              ))}
            </div>
            {rows.map((row, ri) => (
              <div className="dr-row" role="row" key={ri}>
                {row.map((d, ci) => {
                  if (!d) return <div className="dr-cell" role="gridcell" key={ci} aria-hidden="true" />;
                  const n = dn(d);
                  const j = toJalali(d);
                  const off = n < minN || n > maxN;
                  const isS = !!paint && n === paint.s;
                  const isE = !!paint && n === paint.e;
                  const inR = !!paint && n > paint.s && n < paint.e;
                  const multi = !!paint && paint.s !== paint.e;
                  const fri = ci === 6;
                  const isToday = n === dn(today);
                  const tags = [
                    fri ? 'تعطیل' : '',
                    isToday ? 'امروز' : '',
                    isS && !isE ? (paint?.pending ? 'شروع بازه، پایان را انتخاب کن' : 'شروع بازه') : '',
                    isE && !isS ? 'پایان بازه' : '',
                    isS && isE ? 'روز انتخاب‌شده' : '',
                    off ? 'غیرفعال' : '',
                  ].filter(Boolean).join('، ');
                  return (
                    <div
                      className="dr-cell" role="gridcell" key={ci}
                      aria-selected={isS || isE || inR}
                      data-in={inR || undefined}
                      data-s={(isS && multi) || undefined}
                      data-e={(isE && multi) || undefined}
                    >
                      <button
                        type="button"
                        className="dr-day"
                        tabIndex={n === focusInView && !off ? 0 : -1}
                        disabled={off}
                        data-fri={fri || undefined}
                        data-today={isToday || undefined}
                        data-edge={isS || isE || undefined}
                        aria-current={isToday ? 'date' : undefined}
                        aria-label={`${WEEKDAYS_LONG[ci]} ${faPlain(j.jd)} ${JALALI_MONTHS[j.jm - 1]} ${faPlain(j.jy)}${tags ? `، ${tags}` : ''}`}
                        onClick={() => pick(d)}
                        onMouseEnter={() => { if (anchor) setHover(d); }}
                        onFocus={() => { if (dn(focusDay) !== n) setFocusDay(d); }}
                      >
                        {faPlain(j.jd)}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <p className="dr-hint" aria-live="polite">
            {anchor ? 'حالا روز پایان را انتخاب کن.' : 'روز شروع را انتخاب کن.'}
            <span className="dr-legend"><span className="dr-fri-mark" aria-hidden="true" /> جمعه، تعطیل</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
