import { useEffect, useRef, useSyncExternalStore } from 'react';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';

type Kind = 'success' | 'error' | 'info';
type Item = { id: number; kind: Kind; msg: string; leaving: boolean };

const MAX_VISIBLE = 3;
const EXIT_MS = 220;

// Module-level store: no context needed.
let items: Item[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};
const getSnapshot = () => items;

function add(kind: Kind, msg: string) {
  items = [...items, { id: nextId++, kind, msg, leaving: false }];
  emit();
}

function dismiss(id: number) {
  if (!items.some((t) => t.id === id && !t.leaving)) return;
  items = items.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, EXIT_MS);
}

export const toast = {
  success: (msg: string) => add('success', msg),
  error: (msg: string) => add('error', msg),
  info: (msg: string) => add('info', msg),
};

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info };

function ToastItem({ item }: { item: Item }) {
  const { id, kind, msg, leaving } = item;
  const ms = kind === 'error' ? 6000 : 4000;
  const timer = useRef<number | undefined>(undefined);
  const Icon = ICONS[kind];

  const start = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => dismiss(id), ms);
  };
  const stop = () => window.clearTimeout(timer.current);

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`toast toast-${kind}${leaving ? ' toast-leave' : ''}`}
      role={kind === 'error' ? 'alert' : undefined}
      onMouseEnter={stop}
      onMouseLeave={start}
      onFocus={stop}
      onBlur={start}
    >
      <Icon className="toast-icon" size={18} aria-hidden="true" />
      <span className="toast-msg">{msg}</span>
      <button type="button" className="toast-close" aria-label="بستن" onClick={() => dismiss(id)}>
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Mount once in App. */
export function Toaster() {
  const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  // Only the newest few are shown; older ones are hidden until room frees up.
  const visible = all.slice(-MAX_VISIBLE);
  return (
    <div className="toast-stack" dir="rtl" aria-live="polite">
      {visible.map((t) => <ToastItem key={t.id} item={t} />)}
    </div>
  );
}
