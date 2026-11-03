import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { faNum } from './digits';

/** Controlled chat input: auto-growing textarea (about 6 lines, then scrolls), Enter sends, Shift+Enter adds a line. */
export function ChatComposer({ value, onChange, onSend, placeholder = 'پیام بنویس…', maxLength, sending = false, disabled = false }: {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void | Promise<void>;
  placeholder?: string;
  maxLength?: number;
  sending?: boolean;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const counterId = useId();
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  // Grow with the content; the CSS max-block-size caps it and turns on scrolling.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.blockSize = 'auto';
    el.style.blockSize = `${el.scrollHeight}px`;
  }, [value]);

  const working = sending || busy;
  const text = value.trim();
  const canSend = !disabled && !working && text.length > 0;

  const send = async () => {
    if (!canSend || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      await onSend(text);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    void send();
  };

  const length = value.length;
  const nearLimit = maxLength !== undefined && maxLength > 0 && length >= maxLength * 0.9;
  const atLimit = maxLength !== undefined && length >= maxLength;

  return (
    <div className={`composer${disabled ? ' composer-disabled' : ''}`} dir="rtl">
      <div className="composer-row">
        <textarea
          ref={ref}
          className="composer-input"
          rows={1}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          aria-label="متن پیام"
          aria-describedby={maxLength !== undefined ? counterId : undefined}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className="composer-send"
          disabled={!canSend}
          aria-label="ارسال پیام"
          onClick={() => void send()}
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="composer-foot">
        <span className="composer-status" role="status">{working ? 'در حال ارسال…' : ''}</span>
        {maxLength !== undefined ? (
          <span
            id={counterId}
            className={`composer-count${atLimit ? ' composer-count-bad' : nearLimit ? ' composer-count-warn' : ''}`}
          >
            {faNum(length)} / {faNum(maxLength)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
