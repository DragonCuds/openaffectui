import {
  useCallback, useEffect, useId, useLayoutEffect, useRef, useState,
  type KeyboardEvent, type ReactNode,
} from 'react';
import { Shield } from 'lucide-react';
import { faNum } from './digits';

type Risk = 'low' | 'medium' | 'high';
type Status = 'pending' | 'approved' | 'denied';
type View = 'card' | 'row';
type DenyReason = 'user' | 'timeout';

export interface ApprovalDetail { label: string; value: ReactNode }

export interface ApprovalCardProps {
  /** The action, e.g. «ارسال ایمیل کمپین». Also the card's accessible name. */
  title: string;
  /** One line of context under the title; truncates. */
  description?: ReactNode;
  /** Tinted badge in the header (gray, amber, red). Leave out to hide it. */
  risk?: Risk;
  /** Icon in the 32px header tile. */
  icon?: ReactNode;
  /** Key-value rows in the preview panel. */
  details?: ApprovalDetail[];
  /** Custom content above the details (recipients, a diff…). `children` work the same. */
  preview?: ReactNode;
  children?: ReactNode;
  /** Controlled status. Setting it back to «pending» starts a fresh request. */
  status?: Status;
  defaultStatus?: Status;
  /** Return a promise to show the spinner and lock the card. A rejection keeps the card pending. */
  onApprove?: (info: { always: boolean }) => void | Promise<unknown>;
  onDeny?: (info: { reason: DenyReason }) => void;
  /** Shows an edit button before Deny. */
  onEdit?: () => void;
  /** Shows a quiet undo button on the resolved row. */
  onUndo?: () => void;
  /** Seconds until the request expires. Pauses while hovered or focused. */
  expiresIn?: number;
  onExpire?: () => void;
  allowAlways?: boolean;
  alwaysLabel?: string;
  approveLabel?: string;
  denyLabel?: string;
  editLabel?: string;
  undoLabel?: string;
  pendingLabel?: string;
  approvedLabel?: string;
  deniedLabel?: string;
  expiredLabel?: string;
  alwaysWord?: string;
  justNowLabel?: string;
  expiresLabel?: string;
  /** Show the Ctrl+Enter / Esc hints on the buttons (the shortcuts work either way). */
  shortcuts?: boolean;
  /** Small label on the gray tray above the card, e.g. «مرحله‌ی ۴ · gmail.send». */
  label?: ReactNode;
  /** Where the buttons sit: «card» (last row of the card) or «tray» (gray tray below it). */
  actions?: 'card' | 'tray';
  className?: string;
}

const RISK_WORD: Record<Risk, string> = { low: 'کم', medium: 'متوسط', high: 'زیاد' };

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '');
const clock = (s: number) => faNum(Math.floor(s / 60)) + ':' + faNum(s % 60).padStart(2, '۰').slice(-2);

function Spinner() {
  return (
    <svg className="apc-spin" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="26 12" />
    </svg>
  );
}

/** Avatars + names helper for the preview slot. */
export function ApprovalPeople({ names, more, moreLabel }: { names: string[]; more?: number; moreLabel?: string }) {
  return (
    <div className="apc-people">
      <span className="apc-avatars" aria-hidden="true">
        {names.slice(0, 4).map((n, i) => (
          <span className="apc-avatar" data-tone={i % 4} key={n + i}>{[...n][0]}</span>
        ))}
      </span>
      <span className="apc-names">{names.join('، ')}</span>
      {more ? <span className="apc-more">{moreLabel ?? `+${faNum(more)} نفر دیگر`}</span> : null}
    </div>
  );
}

/** An agent asks before it acts: risk badge, preview, approve/deny with shortcuts, an optional countdown, and a morph into a resolved row. */
export function ApprovalCard(props: ApprovalCardProps) {
  const {
    title, description, risk, icon, details, preview, children, status, defaultStatus = 'pending',
    onApprove, onDeny, onEdit, onUndo, expiresIn, onExpire, allowAlways = true,
    alwaysLabel = 'همیشه اجازه بده', approveLabel = 'تأیید', denyLabel = 'رد', editLabel = 'ویرایش', undoLabel = 'لغو',
    pendingLabel = 'در حال انجام…', approvedLabel = 'تأیید شد', deniedLabel = 'رد شد', expiredLabel = 'منقضی شد',
    alwaysWord = 'همیشه', justNowLabel = 'همین الان', expiresLabel = 'مهلت',
    shortcuts = true, label, actions = 'card', className,
  } = props;

  const [own, setOwn] = useState<Status>(defaultStatus);
  const current = status ?? own;
  const want: View = current === 'pending' ? 'card' : 'row';

  const [always, setAlways] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState<DenyReason>('user');
  const [doneAlways, setDoneAlways] = useState(false);
  const [paused, setPaused] = useState(false);
  const [left, setLeft] = useState(expiresIn ?? 0);

  // view morph: the previous view stays mounted (absolute) while the new one fades in
  const [view, setView] = useState<View>(want);
  const [leaving, setLeaving] = useState<View | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const timer = useRef<number>(0);
  const mac = useRef(isMac());

  const nameId = useId();
  const descId = useId();
  const expId = useId();

  useLayoutEffect(() => {
    if (want === view) return;
    const hadFocus = !!rootRef.current?.contains(document.activeElement);
    if (reduced() || !wrapRef.current) { setView(want); return; }
    window.clearTimeout(timer.current);
    setHeight(wrapRef.current.offsetHeight);
    setLeaving(view);
    setView(want);
    requestAnimationFrame(() => {
      if (inRef.current) setHeight(inRef.current.offsetHeight);
      if (hadFocus) requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>('.apc-done:not([aria-hidden])')?.focus({ preventScroll: true }));
    });
    timer.current = window.setTimeout(() => { setLeaving(null); setHeight(null); }, 620);
  }, [want, view]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // a fresh request: reset local state
  const prev = useRef(current);
  useEffect(() => {
    if (prev.current !== 'pending' && current === 'pending') { setAlways(false); setBusy(false); setLeft(expiresIn ?? 0); }
    prev.current = current;
  }, [current, expiresIn]);

  const settle = useCallback((next: Status) => { if (status === undefined) setOwn(next); }, [status]);

  const deny = useCallback((r: DenyReason) => {
    if (current !== 'pending' || busy) return;
    setReason(r);
    onDeny?.({ reason: r });
    settle('denied');
  }, [current, busy, onDeny, settle]);

  const approve = useCallback(async () => {
    if (current !== 'pending' || busy) return;
    const a = allowAlways && always;
    let result: void | Promise<unknown>;
    try { result = onApprove?.({ always: a }); } catch { return; }
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      setBusy(true);
      try { await result; } catch { setBusy(false); return; }
      setBusy(false);
    }
    setDoneAlways(a);
    settle('approved');
  }, [current, busy, allowAlways, always, onApprove, settle]);

  // countdown
  const denyRef = useRef(deny);
  denyRef.current = deny;
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;
  useEffect(() => {
    if (!expiresIn || current !== 'pending' || paused || busy) return;
    const id = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) { window.clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresIn, current, paused, busy]);
  const fired = useRef(false);
  useEffect(() => {
    if (current !== 'pending') { fired.current = false; return; }
    if (expiresIn && left === 0 && !fired.current) {
      fired.current = true;
      expireRef.current?.();
      denyRef.current('timeout');
    }
  }, [left, expiresIn, current]);

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (current !== 'pending' || e.defaultPrevented) return;
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void approve(); }
    else if (e.key === 'Escape') { e.preventDefault(); deny('user'); }
  };

  const hint = mac.current ? '⌘ ↵' : 'Ctrl ↵';
  const hasPreview = !!(preview ?? children) || !!details?.length;
  const critical = !!expiresIn && left <= 10;

  const expiry = expiresIn && current === 'pending' ? (
    <span className="apc-expiry" data-critical={critical || undefined} aria-hidden="true">{expiresLabel} {clock(left)}</span>
  ) : null;

  const buttons = (
    <div className="apc-btns">
      {onEdit ? (
        <button type="button" className="apc-btn apc-quiet" aria-disabled={busy || undefined} onClick={() => !busy && onEdit()}>{editLabel}</button>
      ) : null}
      <button type="button" className="apc-btn apc-quiet" aria-disabled={busy || undefined} aria-keyshortcuts="Escape" onClick={() => deny('user')}>
        {denyLabel}
        {shortcuts ? <kbd className="apc-kbd" aria-hidden="true">Esc</kbd> : null}
      </button>
      <button type="button" className="apc-btn apc-primary" data-focus aria-disabled={busy || undefined} aria-busy={busy || undefined}
        aria-keyshortcuts="Control+Enter Meta+Enter" onClick={() => void approve()}>
        {approveLabel}
        {busy ? <><Spinner /><span className="apc-sr">{pendingLabel}</span></> : shortcuts ? <kbd className="apc-kbd" dir="ltr" aria-hidden="true">{hint}</kbd> : null}
      </button>
    </div>
  );

  const renderCard = (leave: boolean) => (
    <div className="apc-card" data-busy={busy && !leave} aria-hidden={leave || undefined}>
      <header className="apc-head">
        <span className="apc-tile" aria-hidden="true">{icon ?? <Shield size={16} strokeWidth={1.75} />}</span>
        <div className="apc-text">
          <h3 className="apc-title" id={leave ? undefined : nameId}>{title}</h3>
          {description ? <p className="apc-desc" id={leave ? undefined : descId}>{description}</p> : null}
        </div>
        {risk ? (
          <span className="apc-badge" data-risk={risk}>
            <span className="apc-risk-word">ریسک</span>{RISK_WORD[risk]}
          </span>
        ) : null}
      </header>
      {hasPreview ? (
        <div className="apc-preview">
          {preview ?? children}
          {details?.length ? (
            <dl className="apc-details">
              {details.map((d, i) => (
                <div className="apc-row" key={i}>
                  <dt>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : null}
      <div className="apc-foot" hidden={actions === 'tray' && !allowAlways}>
        {allowAlways ? (
          <label className="apc-always" data-locked={busy || undefined}>
            <span className="apc-check">
              <input type="checkbox" checked={always} disabled={leave} aria-disabled={busy || undefined}
                onChange={(e) => !busy && setAlways(e.target.checked)} />
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8.4l2.4 2.4 4.6-5" pathLength="1" /></svg>
            </span>
            {alwaysLabel}
          </label>
        ) : null}
        {actions === 'card' ? <>{expiry}{buttons}</> : null}
      </div>
    </div>
  );

  const rowText = current === 'denied' && reason === 'timeout' ? expiredLabel : current === 'approved' ? approvedLabel : deniedLabel;
  const renderRow = (leave: boolean, enter: boolean) => (
    <div className="apc-done" data-state={current === 'approved' ? 'ok' : 'no'} data-enter={enter || undefined} tabIndex={leave ? undefined : -1} aria-hidden={leave || undefined}>
      <span className="apc-mark" aria-hidden="true">
        <svg viewBox="0 0 22 22">
          {current === 'approved'
            ? <path className="apc-draw" d="M6.6 11.4l3 3 5.8-6.4" pathLength="1" />
            : <><path className="apc-draw" d="M7.6 7.6l6.8 6.8" pathLength="1" /><path className="apc-draw apc-draw-2" d="M14.4 7.6l-6.8 6.8" pathLength="1" /></>}
        </svg>
      </span>
      <span className="apc-done-title">{title}</span>
      <span className="apc-done-meta">
        {rowText}
        {current === 'approved' && doneAlways ? <> · {alwaysWord}</> : null}
        <span className="apc-done-time"> · {justNowLabel}</span>
      </span>
      {onUndo ? <button type="button" className="apc-undo" onClick={onUndo}>{undoLabel}</button> : null}
    </div>
  );

  const slot = (v: View, isLeaving: boolean) => (
    <div
      key={v + (isLeaving ? '-out' : '-in')}
      ref={isLeaving ? undefined : inRef}
      className={`apc-slot ${isLeaving ? 'apc-leave' : leaving ? 'apc-enter' : ''}`}
    >
      {v === 'card' ? renderCard(isLeaving) : renderRow(isLeaving, !isLeaving && !!leaving)}
    </div>
  );

  const trayFoot = actions === 'tray' && current === 'pending' && view === 'card' ? (
    <div className="apc-tray-foot">
      {expiry}
      {buttons}
    </div>
  ) : null;

  return (
    <section
      ref={rootRef}
      className={`apc ${actions === 'tray' ? 'apc-has-tray' : ''} ${className ?? ''}`}
      role="group"
      aria-labelledby={nameId}
      aria-describedby={[description ? descId : '', expiresIn ? expId : ''].filter(Boolean).join(' ') || undefined}
      aria-busy={busy || undefined}
      data-status={current}
      onKeyDown={onKey}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}
    >
      {label && actions === 'tray' ? <div className="apc-label">{label}</div> : null}
      <div
        ref={wrapRef}
        className="apc-wrap"
        data-anim={leaving ? '' : undefined}
        style={height != null ? { height } : undefined}
      >
        {leaving ? slot(leaving, true) : null}
        {slot(view, false)}
      </div>
      <div className={`apc-tray-wrap ${trayFoot ? '' : 'apc-tray-gone'}`} data-open={!!trayFoot}>{trayFoot}</div>
      {expiresIn ? (
        <span id={expId} className="apc-sr">
          {`تا ${faNum(left)} ثانیه‌ی دیگر منقضی می‌شود، مگر تأیید شود. با رفتن اشاره‌گر یا فوکوس روی کارت شمارش متوقف می‌شود.`}
        </span>
      ) : null}
      <span className="apc-sr" role="status" aria-live="polite">
        {current === 'pending' ? '' : `${rowText}: ${title}`}
      </span>
    </section>
  );
}
