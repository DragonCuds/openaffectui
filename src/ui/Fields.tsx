import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/*
 * Form controls: TextField, Select, Checkbox, TimeField. Styles in src/styles/forms.css (imported by ui.css).
 * No borders: the control is a tinted surface; focus draws an outline ring.
 */

const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC = '٠١٢٣٤٥٦٧٨٩';
const toAscii = (s: string) => s
  .replace(/[۰-۹]/g, (c) => String(PERSIAN.indexOf(c)))
  .replace(/[٠-٩]/g, (c) => String(ARABIC.indexOf(c)));

export function TextField({
  label, value, onChange, ltr, placeholder, inputMode, maxLength, hint, error, autoFocus, disabled, type = 'text',
  autoComplete, name, id, className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Left-to-right content (phone, code, address): text aligns left. */
  ltr?: boolean;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url';
  maxLength?: number;
  hint?: ReactNode;
  /** Plain error text under the field; also marks the field invalid. */
  error?: string | null;
  autoFocus?: boolean;
  disabled?: boolean;
  type?: 'text' | 'password' | 'email' | 'url' | 'tel';
  autoComplete?: string;
  name?: string;
  id?: string;
  className?: string;
}) {
  const uid = useId();
  const fid = id ?? uid;
  const note = error || hint;
  return (
    <div className={className ? `fld ${className}` : 'fld'}>
      <label className="fld-label" htmlFor={fid}>{label}</label>
      <input
        id={fid} name={name} className="fld-input" type={type} value={value} dir={ltr ? 'ltr' : undefined} data-ltr={ltr || undefined}
        placeholder={placeholder} inputMode={inputMode} maxLength={maxLength} autoFocus={autoFocus} disabled={disabled}
        autoComplete={autoComplete} aria-invalid={error ? true : undefined} aria-describedby={note ? `${fid}-note` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {note ? <span id={`${fid}-note`} className="fld-hint" data-error={error ? '' : undefined}>{note}</span> : null}
    </div>
  );
}

type Place = { top?: number; bottom?: number; left?: number; right?: number; min: number; maxW: number; maxH: number; up: boolean; dir: 'rtl' | 'ltr' };

/**
 * A styled dropdown with the same props as a native select: the button shows the value, the list opens in a
 * popover (kept on top of dialogs, opens upward when there is no room below). Keyboard: arrows, Home/End,
 * Enter or Space to choose, Esc to close, typing jumps to a matching item. Select-only combobox + listbox roles.
 */
export function Select<V extends string>({
  label, value, onChange, options, placeholder, hint, disabled, id, className,
}: {
  label: string;
  value: V | '';
  onChange: (v: V | '') => void;
  options: { value: V; label: string }[];
  /** Shown as the empty choice (value ''). */
  placeholder?: string;
  hint?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const uid = useId();
  const fid = id ?? uid;
  const listId = `${uid}-list`;
  const labelId = `${uid}-label`;
  const optId = (i: number) => `${uid}-o${i}`;
  const items: { value: V | ''; label: string }[] = placeholder ? [{ value: '', label: placeholder }, ...options] : options;
  const sel = items.findIndex((o) => o.value === value);
  const shown = sel >= 0 ? items[sel] : null;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [place, setPlace] = useState<Place | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', at: 0 });
  // keyboard moves scroll the list; pointer moves must not (the list would jump under the mouse)
  const byKey = useRef(false);

  const measure = useCallback(() => {
    const b = btn.current;
    if (!b) return;
    const r = b.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 6;
    const pad = 8;
    const dir = getComputedStyle(b).direction === 'rtl' ? 'rtl' : 'ltr';
    const below = vh - r.bottom - gap - pad;
    const above = r.top - gap - pad;
    const want = Math.min(320, items.length * 40 + 8);
    const up = below < want && above > below;
    const maxH = Math.max(96, Math.min(320, up ? above : below));
    const maxW = Math.max(r.width, Math.min(360, (dir === 'rtl' ? r.right : vw - r.left) - pad));
    const x = dir === 'rtl' ? { right: vw - r.right } : { left: r.left };
    setPlace({ ...x, ...(up ? { bottom: vh - r.top + gap } : { top: r.bottom + gap }), min: r.width, maxW, maxH, up, dir });
  }, [items.length]);

  const close = useCallback((focus = true) => {
    setOpen(false);
    setPlace(null);
    if (focus) btn.current?.focus();
  }, []);

  const show = (at: number) => {
    if (disabled) return;
    byKey.current = true;
    setActive(at);
    setOpen(true);
  };

  const pick = (i: number) => {
    const o = items[i];
    close();
    if (o && o.value !== value) onChange(o.value);
  };

  useLayoutEffect(() => { if (open) measure(); }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (btn.current?.contains(t) || list.current?.contains(t)) return;
      close(false);
    };
    // window capture runs before a dialog's own Esc handler, so Esc closes only the list
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
    const move = () => measure();
    // the page (or a dialog body) scrolled: follow the button; the list's own scroll is ignored
    const scroll = (e: Event) => { if (!(e.target instanceof Node && list.current?.contains(e.target))) measure(); };
    document.addEventListener('pointerdown', down);
    window.addEventListener('keydown', key, true);
    window.addEventListener('resize', move);
    window.addEventListener('scroll', scroll, true);
    return () => {
      document.removeEventListener('pointerdown', down);
      window.removeEventListener('keydown', key, true);
      window.removeEventListener('resize', move);
      window.removeEventListener('scroll', scroll, true);
    };
  }, [open, close, measure]);

  useEffect(() => { if (disabled && open) close(false); }, [disabled, open, close]);

  // keep the active item in view while moving with the keyboard
  useEffect(() => {
    if (!open || !place || active < 0 || !byKey.current) return;
    document.getElementById(optId(active))?.scrollIntoView({ block: 'nearest' });
  });

  /** Type-to-jump: letters typed within 600 ms build one search; the same letter again cycles. */
  const jump = (ch: string) => {
    const now = Date.now();
    const t = typed.current;
    t.text = now - t.at > 600 ? ch : t.text + ch;
    t.at = now;
    const q = t.text.toLocaleLowerCase();
    // «ب», «ب», «ب» cycles through the items starting with «ب»; a longer word keeps the current item if it still fits
    const same = [...q].every((c) => c === q[0]);
    const word = same ? q[0] : q;
    const from = (open ? active : sel) + (same ? 1 : 0);
    const n = items.length;
    for (let k = 0; k < n; k += 1) {
      const i = (((from + k) % n) + n) % n;
      if (items[i].label.toLocaleLowerCase().startsWith(word)) return i;
    }
    return -1;
  };

  const onKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const k = e.key;
    const last = items.length - 1;
    const printable = k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
    const typing = Date.now() - typed.current.at < 600 && typed.current.text !== '';
    if (!open) {
      if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') { e.preventDefault(); show(sel >= 0 ? sel : k === 'ArrowUp' ? last : 0); return; }
      if (k === 'Home') { e.preventDefault(); show(0); return; }
      if (k === 'End') { e.preventDefault(); show(last); return; }
      if (printable && k !== ' ') { const i = jump(k); if (i >= 0) { e.preventDefault(); show(i); } }
      return;
    }
    byKey.current = true;
    if (k === 'ArrowDown') { e.preventDefault(); if (e.altKey) pick(active); else setActive((a) => Math.min(last, a + 1)); return; }
    if (k === 'ArrowUp') { e.preventDefault(); if (e.altKey) pick(active); else setActive((a) => Math.max(0, a - 1)); return; }
    if (k === 'Home') { e.preventDefault(); setActive(0); return; }
    if (k === 'End') { e.preventDefault(); setActive(last); return; }
    if (k === 'PageDown') { e.preventDefault(); setActive((a) => Math.min(last, a + 8)); return; }
    if (k === 'PageUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 8)); return; }
    if (k === 'Enter' || (k === ' ' && !typing)) { e.preventDefault(); if (active >= 0) pick(active); else close(); return; }
    if (k === 'Tab') { close(false); return; }
    if (printable) { const i = jump(k); if (i >= 0) { e.preventDefault(); setActive(i); } }
  };

  const pop = open && place && typeof document !== 'undefined' ? createPortal(
    <ul
      ref={list} id={listId} role="listbox" aria-labelledby={labelId} tabIndex={-1} dir={place.dir}
      className="sel-pop" data-up={place.up ? '' : undefined}
      style={{
        top: place.top, bottom: place.bottom, left: place.left, right: place.right,
        minInlineSize: place.min, maxInlineSize: place.maxW, maxBlockSize: place.maxH,
      }}
    >
      {items.map((o, i) => (
        <li
          key={o.value === '' ? '__empty' : o.value} id={optId(i)} role="option" aria-selected={i === sel}
          className="sel-opt" data-active={i === active ? '' : undefined} data-empty={o.value === '' ? '' : undefined}
          onPointerDown={(e) => e.preventDefault()}
          onPointerMove={() => { byKey.current = false; if (active !== i) setActive(i); }}
          onClick={() => pick(i)}
        >
          <span className="sel-opt-t">{o.label}</span>
          {i === sel ? (
            <svg className="sel-check" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
              <path d="M3.5 8.4 6.6 11.4 12.5 4.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </li>
      ))}
    </ul>,
    document.body,
  ) : null;

  return (
    <div className={className ? `fld ${className}` : 'fld'}>
      <label className="fld-label" id={labelId} htmlFor={fid}>{label}</label>
      <span className="fld-select">
        <button
          ref={btn} id={fid} type="button" className="fld-input sel-btn" disabled={disabled}
          role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} aria-labelledby={labelId}
          aria-activedescendant={open && active >= 0 ? optId(active) : undefined} data-open={open ? '' : undefined}
          onClick={() => (open ? close() : show(sel >= 0 ? sel : 0))} onKeyDown={onKey}
        >
          <span className="sel-value" data-empty={!shown || shown.value === '' ? '' : undefined}>{shown ? shown.label : (placeholder ?? '\u00a0')}</span>
        </button>
        <svg className="fld-chev" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          <path d="M4 6.2 8 10l4-3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {hint ? <span className="fld-hint">{hint}</span> : null}
      {pop}
    </div>
  );
}

export function Checkbox({ label, checked, onChange, disabled, hint, className }: {
  label: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <label className={className ? `chk ${className}` : 'chk'} data-disabled={disabled || undefined}>
      <input className="chk-input" type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="chk-box" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
          <path d="M3.5 8.4 6.6 11.4 12.5 4.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="chk-text">{label}{hint ? <span className="fld-hint">{hint}</span> : null}</span>
    </label>
  );
}

/** «930», «۹:۳۰», «09:30» -> "09:30"; anything that is not a valid 24-hour time -> null. */
export function normalizeTime(raw: string): string | null {
  const s = toAscii(raw).replace(/[٫٬.\s]/g, ':').trim();
  let h: string; let m: string;
  const parts = s.split(':').filter((x) => x !== '');
  if (s.includes(':')) {
    if (parts.length !== 2) return null;
    [h, m] = parts;
  } else {
    if (!/^\d{1,4}$/.test(s)) return null;
    if (s.length <= 2) { h = s; m = '00'; } else { h = s.slice(0, s.length - 2); m = s.slice(-2); }
  }
  if (!/^\d{1,2}$/.test(h) || !/^\d{1,2}$/.test(m)) return null;
  const hh = Number(h); const mm = Number(m);
  if (hh > 23 || mm > 59) return null;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

const faTime = (v: string) => v.replace(/\d/g, (d) => PERSIAN[Number(d)]);

/**
 * Time of day, 24-hour "HH:MM". Type «930» or «۲۲:۳۰»; on leaving the field it is tidied.
 * `value` and `onChange` use plain ASCII "HH:MM" ('' when empty). A half-typed value is not reported until it is valid.
 */
export function TimeField({ label, value, onChange, hint, disabled, id, className }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const uid = useId();
  const fid = id ?? uid;
  const [draft, setDraft] = useState(faTime(value));
  const [bad, setBad] = useState(false);
  useEffect(() => { setDraft(faTime(value)); setBad(false); }, [value]);

  const type = (raw: string) => {
    setDraft(raw);
    const n = raw.trim() === '' ? '' : normalizeTime(raw);
    if (n === null) { setBad(true); return; }
    setBad(false);
    if (n !== value) onChange(n);
  };
  const leave = () => {
    const n = draft.trim() === '' ? '' : normalizeTime(draft);
    if (n === null) { setBad(true); return; }
    setBad(false);
    setDraft(faTime(n));
  };
  const note = bad ? 'ساعت را مثل ۲۲:۳۰ بنویسید (۰۰:۰۰ تا ۲۳:۵۹).' : hint;
  return (
    <div className={className ? `fld ${className}` : 'fld'}>
      <label className="fld-label" htmlFor={fid}>{label}</label>
      <input
        id={fid} className="fld-input fld-time" type="text" inputMode="numeric" dir="ltr" data-ltr placeholder="۲۲:۳۰" maxLength={5}
        value={draft} disabled={disabled} autoComplete="off" aria-invalid={bad || undefined} aria-describedby={note ? `${fid}-note` : undefined}
        onChange={(e) => type(e.target.value)} onBlur={leave}
      />
      {note ? <span id={`${fid}-note`} className="fld-hint" data-error={bad ? '' : undefined}>{note}</span> : null}
    </div>
  );
}
