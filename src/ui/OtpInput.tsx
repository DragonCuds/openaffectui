import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC = '٠١٢٣٤٥٦٧٨٩';
/** Persian and Arabic digits become 0-9; everything else that is not a digit is dropped. */
const clean = (s: string) => s
  .replace(/[۰-۹]/g, (c) => String(PERSIAN.indexOf(c)))
  .replace(/[٠-٩]/g, (c) => String(ARABIC.indexOf(c)))
  .replace(/\D/g, '');

/**
 * A code typed one digit per box (SMS code). Value is a plain 0-9 string; boxes show Persian digits.
 * Typing moves on, backspace moves back, pasting fills all boxes, the phone's «from SMS» suggestion works.
 * Written from scratch (look only at the free affectUI OTP Input).
 */
export function OtpInput({
  value, onChange, onComplete, length = 6, label = 'کد پیامک', disabled = false, invalid = false, autoFocus = false, id, className,
}: {
  value: string;
  onChange: (v: string) => void;
  /** Called once when all boxes are filled. */
  onComplete?: (v: string) => void;
  length?: number;
  label?: string;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  id?: string;
  className?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');
  const focus = (i: number) => { const el = refs.current[Math.max(0, Math.min(length - 1, i))]; el?.focus(); el?.select(); };
  const commit = (next: string) => {
    const v = next.slice(0, length);
    onChange(v);
    if (v.length === length && onComplete) onComplete(v);
  };

  const type = (i: number, raw: string) => {
    let d = clean(raw);
    if (!d) return;
    if (d.length === 2 && digits[i]) d = d.slice(-1); // typed over a filled box: keep the new digit
    if (d.length > 1) { // several at once: autofill or a fast paste
      const next = (value.slice(0, i) + d).slice(0, length);
      commit(next);
      focus(Math.min(next.length, length - 1));
      return;
    }
    const arr = digits.slice();
    arr[i] = d;
    commit(arr.join('').slice(0, length));
    if (i < length - 1) focus(i + 1);
  };
  const key = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i]) { const arr = digits.slice(); arr[i] = ''; onChange(arr.join('').replace(/\s+$/, '')); }
      else if (i > 0) { onChange(value.slice(0, i - 1) + value.slice(i)); focus(i - 1); }
    } else if (e.key === 'ArrowLeft') { e.preventDefault(); focus(i - 1); } // boxes are always left-to-right
    else if (e.key === 'ArrowRight') { e.preventDefault(); focus(i + 1); }
  };
  const paste = (e: ClipboardEvent<HTMLInputElement>) => {
    const d = clean(e.clipboardData.getData('text'));
    if (!d) return;
    e.preventDefault();
    commit(d);
    focus(Math.min(d.length, length - 1));
  };

  return (
    <div className={className ? `otp ${className}` : 'otp'} role="group" aria-label={label} data-invalid={invalid || undefined} dir="ltr">
      {digits.map((d, i) => (
        <input
          key={i}
          id={i === 0 ? id : undefined}
          ref={(el) => { refs.current[i] = el; }}
          className="otp-box"
          data-filled={d ? '' : undefined}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`${label}، رقم ${(i + 1).toLocaleString('fa-IR')}`}
          aria-invalid={invalid || undefined}
          maxLength={length}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          value={d ? Number(d).toLocaleString('fa-IR') : ''}
          onChange={(e) => type(i, e.target.value)}
          onKeyDown={(e) => key(i, e)}
          onPaste={paste}
          onFocus={(e) => e.currentTarget.select()}
        />
      ))}
    </div>
  );
}
