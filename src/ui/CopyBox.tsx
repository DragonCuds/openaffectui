import { useEffect, useRef, useState } from 'react';

type State = 'idle' | 'copied' | 'failed';

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* fall through to the old way */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch { return false; }
}

/** A value to copy (key, link, code): the text, always left-to-right and selectable, plus a copy button. Styles in src/styles/copybox.css. */
export function CopyBox({ value, label, copyLabel = 'کپی', copiedLabel = 'کپی شد', failedLabel = 'کپی نشد؛ متن را انتخاب و کپی کنید', onCopy, className }: {
  value: string;
  /** Small caption above the text. */
  label?: string;
  copyLabel?: string;
  copiedLabel?: string;
  failedLabel?: string;
  onCopy?: () => void;
  className?: string;
}) {
  const [state, setState] = useState<State>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const text = useRef<HTMLElement>(null);

  const copy = async () => {
    const ok = await writeClipboard(value);
    if (!ok && text.current) {
      const r = document.createRange(); r.selectNodeContents(text.current);
      const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(r);
    }
    setState(ok ? 'copied' : 'failed');
    if (ok) onCopy?.();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), ok ? 2000 : 4000);
  };

  return (
    <div className={className ? `copybox ${className}` : 'copybox'} data-state={state}>
      {label ? <span className="copybox-label">{label}</span> : null}
      <div className="copybox-row">
        <code ref={text} className="copybox-text" dir="ltr">{value}</code>
        <button type="button" className="btn copybox-btn" onClick={() => void copy()}>
          {state === 'copied' ? copiedLabel : copyLabel}
        </button>
      </div>
      <span className="copybox-live" role="status" aria-live="polite">
        {state === 'copied' ? copiedLabel : state === 'failed' ? failedLabel : ''}
      </span>
    </div>
  );
}
