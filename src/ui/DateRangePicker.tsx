/*
 * Date Range Picker (Jalali). Written from scratch to match the look and motion of the public affectUI "Date Range Picker" demo
 * (https://www.affectui.com/components/date-range-picker). No vendor code was used: sizes, colours and timings
 * were read from the public demo like a user would (screenshots / frames) and the API follows its public docs.
 * The calendar maths (Jalali conversion, month names, Saturday-first weeks) is our own code in ./jalali.
 */
import {
  useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore,
  type KeyboardEvent,
} from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { faNum } from './digits';
import {
  JALALI_MONTHS, WEEKDAYS_LONG, faPlain, jalaliMonthLength, jalaliWeekday, toGregorian, toJalali,
} from './jalali';

export type DateRange = { start: Date; end: Date };
export type CompareMode = 'off' | 'previous' | 'year';
export type DateRangePreset = { id: string; label: string; range: (today: Date) => DateRange };

export type DateRangePickerProps = {
  /** Controlled range (local midnight dates). */
  value?: DateRange;
  /** Starting range when uncontrolled; default = last 30 days. */
  defaultValue?: DateRange;
  /** Called on Apply with the range, the comparison range (or null) and the compare mode. */
  onChange?: (range: DateRange, compare: DateRange | null, mode: CompareMode) => void;
  /** The list at the start side (chips on phones). Default: today .. year to date. */
  presets?: DateRangePreset[];
  /** Show "مقایسه: خاموش / دوره‌ی قبل / سال قبل". Default true. */
  compare?: boolean;
  /** Comparison selected at the start. Default "previous". */
  defaultCompare?: CompareMode;
  /** 6 = Saturday (Persian default), 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1 | 6;
  /** Days outside can't be picked. `max` defaults to today. */
  min?: Date;
  max?: Date;
  defaultOpen?: boolean;
  /** Reference day for the presets (tests, screenshots). */
  today?: Date;
  className?: string;
  /** Accessible name of the trigger. */
  label?: string;
};

const DAY_MS = 86_400_000;
/** Whole-day index of a local calendar day (DST-proof). */
const dn = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS;
const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const monthIdx = (jy: number, jm: number) => jy * 12 + (jm - 1);
const fromIdx = (i: number) => ({ jy: Math.floor(i / 12), jm: ((i % 12) + 12) % 12 + 1 });
const idxOf = (d: Date) => { const j = toJalali(d); return monthIdx(j.jy, j.jm); };
const monthStart = (jy: number, jm: number) => toGregorian(jy, jm, 1);
const monthEnd = (jy: number, jm: number) => toGregorian(jy, jm, jalaliMonthLength(jy, jm));

/** «۱۳ مهر» / «۱۳ مهر ۱۴۰۵» */
const fmtDay = (d: Date, year = true) => {
  const j = toJalali(d);
  return `${faPlain(j.jd)} ${JALALI_MONTHS[j.jm - 1]}${year ? ` ${faPlain(j.jy)}` : ''}`;
};
/** «۱۳ مهر تا ۱۲ آبان ۱۴۰۵» (the start's year is dropped when it is the same). */
export function formatRangeFa(r: { start: Date; end: Date }) {
  if (dn(r.start) === dn(r.end)) return fmtDay(r.end);
  const sameYear = toJalali(r.start).jy === toJalali(r.end).jy;
  return `${fmtDay(r.start, !sameYear)} تا ${fmtDay(r.end)}`;
}

const spanDays = (r: { start: Date; end: Date }) => dn(r.end) - dn(r.start) + 1;

/** The comparison period: the same length right before, or the same Jalali dates one year earlier. */
export function compareRangeOf(r: DateRange, mode: CompareMode): DateRange | null {
  if (mode === 'off') return null;
  if (mode === 'previous') {
    const e = addDays(r.start, -1);
    return { start: addDays(e, -(spanDays(r) - 1)), end: e };
  }
  const back = (d: Date) => {
    const j = toJalali(d);
    return toGregorian(j.jy - 1, j.jm, Math.min(j.jd, jalaliMonthLength(j.jy - 1, j.jm)));
  };
  return { start: back(r.start), end: back(r.end) };
}

export const DEFAULT_PRESETS: DateRangePreset[] = [
  { id: 'today', label: 'امروز', range: (t) => ({ start: t, end: t }) },
  { id: 'yesterday', label: 'دیروز', range: (t) => ({ start: addDays(t, -1), end: addDays(t, -1) }) },
  { id: '7', label: '۷ روز اخیر', range: (t) => ({ start: addDays(t, -6), end: t }) },
  { id: '30', label: '۳۰ روز اخیر', range: (t) => ({ start: addDays(t, -29), end: t }) },
  { id: '90', label: '۹۰ روز اخیر', range: (t) => ({ start: addDays(t, -89), end: t }) },
  { id: 'month', label: 'این ماه', range: (t) => { const j = toJalali(t); return { start: monthStart(j.jy, j.jm), end: t }; } },
  {
    id: 'prev-month', label: 'ماه قبل',
    range: (t) => { const j = toJalali(t); const p = fromIdx(monthIdx(j.jy, j.jm) - 1); return { start: monthStart(p.jy, p.jm), end: monthEnd(p.jy, p.jm) }; },
  },
  { id: 'season', label: 'این فصل', range: (t) => { const j = toJalali(t); return { start: monthStart(j.jy, Math.floor((j.jm - 1) / 3) * 3 + 1), end: t }; } },
  { id: 'year', label: 'از ابتدای سال', range: (t) => ({ start: monthStart(toJalali(t).jy, 1), end: t }) },
];

const COMPARE_OPTIONS: { id: CompareMode; label: string }[] = [
  { id: 'off', label: 'خاموش' },
  { id: 'previous', label: 'دوره‌ی قبل' },
  { id: 'year', label: 'سال قبل' },
];

/** Short weekday letters, indexed by Date#getDay() (0 = Sunday). */
const WD_SHORT_BY_GETDAY = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
const WD_LONG_BY_GETDAY = [WEEKDAYS_LONG[1], WEEKDAYS_LONG[2], WEEKDAYS_LONG[3], WEEKDAYS_LONG[4], WEEKDAYS_LONG[5], WEEKDAYS_LONG[6], WEEKDAYS_LONG[0]];

const compactQuery = '(max-width: 600px)';
function useCompact(): boolean {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia(compactQuery); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); },
    () => window.matchMedia(compactQuery).matches,
    () => false,
  );
}
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Phase = 'closed' | 'open' | 'closing';
type Draft = { start: Date; end: Date | null };

export function DateRangePicker({
  value, defaultValue, onChange, presets = DEFAULT_PRESETS, compare = true, defaultCompare = 'previous',
  weekStartsOn = 6, min, max, defaultOpen = false, today: todayProp, className, label = 'بازه‌ی تاریخ',
}: DateRangePickerProps) {
  const today = useMemo(() => sod(todayProp ?? new Date()), [todayProp ? dn(todayProp) : 0]); // eslint-disable-line react-hooks/exhaustive-deps
  const maxD = useMemo(() => sod(max ?? today), [max, today]);
  const minD = useMemo(() => (min ? sod(min) : null), [min]);
  const minN = minD ? dn(minD) : -Infinity;
  const maxN = dn(maxD);

  const [inner, setInner] = useState<DateRange>(() => defaultValue ?? { start: addDays(today, -29), end: today });
  const range = value ?? inner;
  const [mode, setMode] = useState<CompareMode>(compare ? defaultCompare : 'off');

  const compact = useCompact();
  const [phase, setPhase] = useState<Phase>(defaultOpen ? 'open' : 'closed');
  const [draft, setDraft] = useState<Draft>({ start: range.start, end: range.end });
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [hover, setHover] = useState<Date | null>(null);
  const [gridFocus, setGridFocus] = useState(false);
  const [focusDay, setFocusDay] = useState<Date>(range.end);
  const [view, setView] = useState<number>(() => Math.min(idxOf(range.end), idxOf(maxD)));
  const [dir, setDir] = useState<'next' | 'prev' | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const presetsRef = useRef<HTMLDivElement>(null);
  const wantFocus = useRef(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const uid = useId();
  const open = phase !== 'closed';

  const clampDay = useCallback((d: Date) => {
    const n = dn(d);
    if (n < minN) return minD!;
    if (n > maxN) return maxD;
    return d;
  }, [minN, maxN, minD, maxD]);

  const enabled = (d: Date) => { const n = dn(d); return n >= minN && n <= maxN; };

  const firstShown = view - (compact ? 0 : 1);
  const maxIdx = idxOf(maxD);
  const minIdx = minD ? idxOf(minD) : -Infinity;

  /* ---------- open / close ---------- */
  const openPanel = () => {
    window.clearTimeout(closeTimer.current);
    setDraft({ start: range.start, end: range.end });
    setAnchor(null); setHover(null); setDir(null);
    setView(Math.min(idxOf(range.end), maxIdx));
    setFocusDay(clampDay(range.end));
    setPhase('open');
  };
  const close = useCallback((restoreFocus: boolean) => {
    setAnchor(null); setHover(null);
    window.clearTimeout(closeTimer.current);
    if (reduced()) setPhase('closed');
    else { setPhase('closing'); closeTimer.current = window.setTimeout(() => setPhase('closed'), 130); }
    if (restoreFocus) triggerRef.current?.focus();
  }, []);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (phase !== 'open') return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [phase, close]);

  // Scroll the active chip into view on phones.
  useEffect(() => {
    if (phase !== 'open') return;
    const el = presetsRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    el?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [phase, compact]);

  // Move DOM focus to the roving day after keyboard-driven moves.
  useEffect(() => {
    if (phase !== 'open' || !wantFocus.current) return;
    wantFocus.current = false;
    rootRef.current?.querySelector<HTMLButtonElement>('.drp-day[tabindex="0"]')?.focus();
  });

  /* ---------- navigation ---------- */
  const goView = (next: number, d?: 'next' | 'prev') => {
    if (next === view) return;
    setDir(d ?? (next > view ? 'next' : 'prev'));
    setView(next);
  };
  const ensureVisible = (d: Date) => {
    const mi = idxOf(d);
    if (mi < firstShown) goView(mi + (compact ? 0 : 1), 'prev');
    else if (mi > view) goView(mi, 'next');
  };
  const moveFocus = (d: Date) => {
    const c = clampDay(d);
    setHover(null);
    setFocusDay(c);
    ensureVisible(c);
    wantFocus.current = true;
  };
  const shiftMonths = (delta: number) => {
    const j = toJalali(focusDay);
    const t = fromIdx(monthIdx(j.jy, j.jm) + delta);
    moveFocus(toGregorian(t.jy, t.jm, Math.min(j.jd, jalaliMonthLength(t.jy, t.jm))));
  };

  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const col = (focusDay.getDay() - weekStartsOn + 7) % 7;
    let t: Date | null = null;
    if (e.key === fwd) t = addDays(focusDay, 1);
    else if (e.key === back) t = addDays(focusDay, -1);
    else if (e.key === 'ArrowDown') t = addDays(focusDay, 7);
    else if (e.key === 'ArrowUp') t = addDays(focusDay, -7);
    else if (e.key === 'Home') t = addDays(focusDay, -col);
    else if (e.key === 'End') t = addDays(focusDay, 6 - col);
    else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      shiftMonths((e.key === 'PageUp' ? -1 : 1) * (e.shiftKey ? 12 : 1));
      return;
    } else return;
    e.preventDefault();
    moveFocus(t);
  };

  const onRootKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (phase === 'open' && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
  };

  /* ---------- picking ---------- */
  const pick = (d: Date) => {
    if (!enabled(d)) return;
    setFocusDay(d);
    if (!anchor) {
      setAnchor(d); setHover(null);
      setDraft({ start: d, end: null });
    } else {
      const [s, e] = dn(anchor) <= dn(d) ? [anchor, d] : [d, anchor];
      setDraft({ start: s, end: e });
      setAnchor(null); setHover(null);
    }
  };

  const resolved = useMemo(() => presets.map((p) => {
    const r = p.range(today);
    const s = dn(r.start) < minN ? minD! : r.start;
    const e = dn(r.end) > maxN ? maxD : r.end;
    return { id: p.id, label: p.label, range: { start: s, end: e }, ok: dn(s) <= dn(e) };
  }), [presets, today, minN, maxN, minD, maxD]);

  const done: DateRange | null = draft.end ? { start: draft.start, end: draft.end } : null;
  const activePreset = done
    ? resolved.find((p) => p.ok && dn(p.range.start) === dn(done.start) && dn(p.range.end) === dn(done.end))?.id ?? null
    : null;

  const applyPreset = (r: DateRange) => {
    setAnchor(null); setHover(null);
    setDraft({ start: r.start, end: r.end });
    setFocusDay(clampDay(r.end));
    const mi = idxOf(r.end);
    if (mi < firstShown || mi > view) goView(Math.min(mi, maxIdx), mi < firstShown ? 'prev' : 'next');
  };

  const cmpMode: CompareMode = compare ? mode : 'off';
  const cmp = done ? compareRangeOf(done, cmpMode) : null;

  const apply = () => {
    if (!done) return;
    if (value === undefined) setInner(done);
    onChange?.(done, cmp, cmpMode);
    close(true);
  };

  /* ---------- what is painted ---------- */
  const paint = (() => {
    if (anchor) {
      const other = hover ?? (gridFocus ? focusDay : anchor);
      const [a, b] = dn(anchor) <= dn(other) ? [anchor, other] : [other, anchor];
      return { s: dn(a), e: dn(b), preview: true };
    }
    if (done) return { s: dn(done.start), e: dn(done.end), preview: false };
    return null;
  })();
  const cmpS = cmp ? dn(cmp.start) : null;
  const cmpE = cmp ? dn(cmp.end) : null;

  /* ---------- month panes ---------- */
  const weekdayHeads = Array.from({ length: 7 }, (_, i) => (weekStartsOn + i) % 7);
  const shownMonths = compact ? [view] : [view - 1, view];

  const visibleTabDay = (() => {
    const fi = idxOf(focusDay);
    if (shownMonths.includes(fi) && enabled(focusDay)) return dn(focusDay);
    for (const mi of shownMonths) {
      const { jy, jm } = fromIdx(mi);
      for (let d = 1; d <= jalaliMonthLength(jy, jm); d++) {
        const g = toGregorian(jy, jm, d);
        if (enabled(g)) return dn(g);
      }
    }
    return null;
  })();

  const renderMonth = (mi: number) => {
    const { jy, jm } = fromIdx(mi);
    const len = jalaliMonthLength(jy, jm);
    const first = monthStart(jy, jm);
    const lead = (first.getDay() - weekStartsOn + 7) % 7;
    const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= len; d++) cells.push(toGregorian(jy, jm, d));
    while (cells.length % 7) cells.push(null);
    const rows: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    const title = `${JALALI_MONTHS[jm - 1]} ${faPlain(jy)}`;
    return (
      <div className="drp-month" key={mi}>
        <div className="drp-title">{title}</div>
        <div className="drp-grid" role="grid" aria-label={title}>
          <div className="drp-row drp-wds" role="row">
            {weekdayHeads.map((g) => (
              <div key={g} className="drp-wd" role="columnheader" aria-label={WD_LONG_BY_GETDAY[g]}>
                <span aria-hidden="true">{WD_SHORT_BY_GETDAY[g]}</span>
              </div>
            ))}
          </div>
          {rows.map((row, ri) => (
            <div className="drp-row" role="row" key={ri}>
              {row.map((d, ci) => {
                if (!d) return <div className="drp-cell" role="gridcell" key={ci} aria-hidden="true" />;
                const n = dn(d);
                const j = toJalali(d);
                const off = !enabled(d);
                const inMain = !!paint && n >= paint.s && n <= paint.e;
                const multi = !!paint && paint.s !== paint.e;
                const isS = inMain && n === paint!.s;
                const isE = inMain && n === paint!.e;
                const inCmp = cmpS !== null && n >= cmpS! && n <= cmpE!;
                const isToday = n === dn(today);
                const isFri = jalaliWeekday(d) === 6;
                const tags = [
                  isFri ? 'تعطیل' : '',
                  isToday ? 'امروز' : '',
                  isS && !isE ? (anchor ? 'شروع بازه، پایان را انتخاب کن' : 'شروع بازه') : '',
                  isE && !isS ? 'پایان بازه' : '',
                  isS && isE ? 'روز انتخاب‌شده' : '',
                  inCmp ? 'بازه‌ی مقایسه' : '',
                  off ? 'غیرفعال' : '',
                ].filter(Boolean).join('، ');
                return (
                  <div
                    className="drp-cell" role="gridcell" key={ci}
                    aria-selected={inMain}
                    data-c={ci === 0 ? 'first' : ci === 6 ? 'last' : undefined}
                    data-band={multi && inMain ? (paint!.preview ? 'preview' : 'main') : undefined}
                    data-bs={(multi && inMain && (isS || j.jd === 1)) || undefined}
                    data-be={(multi && inMain && (isE || j.jd === len)) || undefined}
                    data-cmp={inCmp || undefined}
                    data-cs={(inCmp && (n === cmpS || j.jd === 1)) || undefined}
                    data-ce={(inCmp && (n === cmpE || j.jd === len)) || undefined}
                  >
                    <button
                      type="button"
                      className="drp-day"
                      tabIndex={n === visibleTabDay ? 0 : -1}
                      disabled={off}
                      data-edge={isS || isE || undefined}
                      data-today={isToday || undefined}
                      data-fri={isFri || undefined}
                      data-cmp-edge={(inCmp && (n === cmpS || n === cmpE)) || undefined}
                      aria-current={isToday ? 'date' : undefined}
                      aria-label={`${WEEKDAYS_LONG[jalaliWeekday(d)]} ${faPlain(j.jd)} ${JALALI_MONTHS[j.jm - 1]} ${faPlain(j.jy)}${tags ? `، ${tags}` : ''}`}
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
      </div>
    );
  };

  const triggerText = formatRangeFa(range);
  const summary = anchor
    ? `${fmtDay(anchor)} – روز پایان را انتخاب کن`
    : done ? formatRangeFa(done) : '';
  const panelId = `${uid}-panel`;
  const announce = shownMonths.map((mi) => { const m = fromIdx(mi); return `${JALALI_MONTHS[m.jm - 1]} ${faPlain(m.jy)}`; }).join('، ');

  return (
    <div
      className={`drp${className ? ` ${className}` : ''}`}
      ref={rootRef}
      onKeyDown={onRootKey}
      onBlur={(e) => {
        const to = e.relatedTarget as Node | null;
        if (phase === 'open' && to && rootRef.current && !rootRef.current.contains(to)) close(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="drp-trigger"
        aria-haspopup="dialog"
        aria-expanded={phase === 'open'}
        aria-controls={open ? panelId : undefined}
        aria-label={`${label}: ${triggerText}`}
        onClick={() => (phase === 'open' ? close(false) : openPanel())}
      >
        <CalendarDays size={16} aria-hidden="true" />
        <span className="drp-trigger-text">{triggerText}</span>
        <ChevronDown size={16} aria-hidden="true" className="drp-caret" />
      </button>

      {open ? (
        <div id={panelId} className="drp-panel" role="dialog" aria-label="انتخاب بازه‌ی تاریخ" data-state={phase}>
          <div className="drp-body">
            <div className="drp-presets" ref={presetsRef} role="group" aria-label="بازه‌های آماده">
              {resolved.map((p) => (
                <button
                  key={p.id} type="button" className="drp-preset" disabled={!p.ok}
                  aria-pressed={activePreset === p.id}
                  onClick={() => applyPreset(p.range)}
                >
                  {p.label}
                </button>
              ))}
              <button type="button" className="drp-preset" disabled aria-pressed={!!draft && activePreset === null}>
                سفارشی
              </button>
            </div>

            <div className="drp-cal" onKeyDown={onGridKey} onMouseLeave={() => setHover(null)}
              onFocus={() => setGridFocus(true)} onBlur={() => setGridFocus(false)}>
              <button
                type="button" className="drp-nav" data-side="start" aria-label="ماه قبلی"
                disabled={firstShown <= minIdx} onClick={() => goView(view - 1, 'prev')}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button" className="drp-nav" data-side="end" aria-label="ماه بعدی"
                disabled={view >= maxIdx} onClick={() => goView(view + 1, 'next')}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
              <div className="drp-months" key={`${view}-${compact}`} data-dir={dir ?? undefined}>
                {shownMonths.map(renderMonth)}
              </div>
              <span className="drp-sr" aria-live="polite">{announce}</span>
            </div>
          </div>

          <div className="drp-foot">
            <div className="drp-foot-main">
              <div className="drp-summary" aria-live="polite">
                <span className="drp-range">{summary}</span>
                <span className="drp-count">{faNum(paint ? paint.e - paint.s + 1 : 1)} روز</span>
              </div>
              {compare ? (
                <div className="drp-compare" role="group" aria-label="مقایسه">
                  <span className="drp-compare-label">مقایسه</span>
                  {COMPARE_OPTIONS.map((o) => (
                    <button
                      key={o.id} type="button" className="drp-chip" aria-pressed={mode === o.id}
                      onClick={() => setMode(o.id)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="drp-actions">
              <button type="button" className="drp-btn" onClick={() => close(true)}>لغو</button>
              <button type="button" className="drp-btn drp-btn-primary" disabled={!done} onClick={apply}>اعمال</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
