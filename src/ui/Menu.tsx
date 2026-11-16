import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export type MenuItem = { label: ReactNode; onSelect: () => void; icon?: ReactNode };

/**
 * A button that opens a small list of actions (account menu). Esc, a click outside, or choosing an item closes it;
 * focus goes back to the button. Arrow keys move between the items, Home/End jump. `top` is optional content above
 * the items (a switch, a small choice) that does not close the menu when used. Open state can be controlled with
 * `open` + `onOpenChange`. Styles in src/styles/menu.css (same look as the Select list).
 */
export function Menu({ label, items, menuLabel, className, top, open: openProp, onOpenChange }: {
  /** Text on the button, e.g. the person's first name. */
  label: ReactNode;
  items: MenuItem[];
  /** Accessible name of the list. */
  menuLabel?: string;
  className?: string;
  /** Content above the items, e.g. a Segmented or a compact Switch. */
  top?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [own, setOwn] = useState(false);
  const open = openProp ?? own;
  const setOpen = (v: boolean) => { if (openProp === undefined) setOwn(v); onOpenChange?.(v); };
  const setRef = useRef(setOpen);
  setRef.current = setOpen;
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const focusFirst = useRef(false);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    if (focusFirst.current) { focusFirst.current = false; list.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus(); }
    const down = (e: PointerEvent) => { if (root.current && !root.current.contains(e.target as Node)) setRef.current(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setRef.current(false); btn.current?.focus(); } };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key); };
  }, [open]);

  const onBtnKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (open || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    e.preventDefault();
    focusFirst.current = true;
    setOpen(true);
  };

  const onListKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const all = Array.from(list.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (!all.length) return;
    const at = all.indexOf(document.activeElement as HTMLElement);
    let n = -1;
    if (e.key === 'ArrowDown') n = (at + 1) % all.length;
    else if (e.key === 'ArrowUp') n = at <= 0 ? all.length - 1 : at - 1;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = all.length - 1;
    else return;
    e.preventDefault();
    all[n]?.focus();
  };

  return (
    <div ref={root} className={className ? `menu ${className}` : 'menu'}>
      <button
        ref={btn} type="button" className="btn menu-btn" aria-haspopup="menu" aria-expanded={open} aria-controls={id}
        onClick={() => setOpen(!open)} onKeyDown={onBtnKey}
      >
        <span className="menu-label">{label}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open ? (
        <div className="menu-pop">
          {top ? <div className="menu-top">{top}</div> : null}
          <div ref={list} id={id} className="menu-list" role="menu" aria-label={menuLabel} onKeyDown={onListKey}>
            {items.map((it, i) => (
              <button key={i} type="button" role="menuitem" className="menu-item" onClick={() => { setOpen(false); btn.current?.focus(); it.onSelect(); }}>
                {it.icon}{it.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
