import { useEffect, useRef, useState } from 'react';
import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react';

export type Feedback = 'up' | 'down';

const COPIED_MS = 2000;

/** Copies text; falls back to a hidden textarea when the Clipboard API is missing or refused. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.insetBlockStart = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** Small action row under an assistant message: copy, regenerate, like/dislike (one active; click again to clear). */
export function MessageActions({ text, onRegenerate, onFeedback }: {
  text: string;
  onRegenerate?: () => void;
  onFeedback?: (v: Feedback | null) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const [vote, setVote] = useState<Feedback | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    const ok = await copyText(text);
    setCopied(ok);
    setFailed(!ok);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, COPIED_MS);
  };

  const choose = (v: Feedback) => {
    const next = vote === v ? null : v;
    setVote(next);
    onFeedback?.(next);
  };

  return (
    <div className="mact" role="group" aria-label="اقدام‌های پیام">
      <button type="button" className="mact-btn" onClick={() => void copy()}>
        {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        <span className="mact-label">کپی</span>
      </button>
      {onRegenerate ? (
        <button type="button" className="mact-btn" onClick={onRegenerate}>
          <RefreshCw size={16} aria-hidden="true" />
          <span className="mact-label">جواب دوباره</span>
        </button>
      ) : null}
      {onFeedback ? (
        <>
          <button type="button" className="mact-btn mact-icon" aria-pressed={vote === 'up'} onClick={() => choose('up')}>
            <ThumbsUp size={16} aria-hidden="true" />
            <span className="mact-sr">جواب خوب بود</span>
          </button>
          <button type="button" className="mact-btn mact-icon" aria-pressed={vote === 'down'} onClick={() => choose('down')}>
            <ThumbsDown size={16} aria-hidden="true" />
            <span className="mact-sr">جواب خوب نبود</span>
          </button>
        </>
      ) : null}
      <span className="mact-status" role="status">{copied ? 'کپی شد' : failed ? 'کپی نشد' : ''}</span>
    </div>
  );
}
