import { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { highlight } from './highlight';

export function CopyButton({ text, label = 'کپی' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="copy-btn"
      aria-label={done ? 'کپی شد' : label}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1400); }, () => {});
      }}
    >
      <span className="copy-icons" data-done={done || undefined}>
        <Copy size={14} strokeWidth={1.9} aria-hidden="true" />
        <Check size={14} strokeWidth={2.2} aria-hidden="true" />
      </span>
    </button>
  );
}

/** Highlighted, copyable code. `lines` shows line numbers (long files). */
export function CodeBlock({ code, lang = 'tsx', title, lines = false, tall = false }: {
  code: string; lang?: string; title?: string; lines?: boolean; tall?: boolean;
}) {
  const text = code.replace(/\s+$/, '');
  const html = useMemo(() => highlight(text, lang), [text, lang]);
  const count = useMemo(() => text.split('\n').length, [text]);
  return (
    <div className="code" data-tall={tall || undefined}>
      {title ? <div className="code-title"><span dir="ltr">{title}</span></div> : null}
      <CopyButton text={text} />
      <div className="code-scroll" dir="ltr">
        {lines ? (
          <div className="code-lines" aria-hidden="true">
            {Array.from({ length: count }, (_, i) => <span key={i}>{i + 1}</span>)}
          </div>
        ) : null}
        <pre><code dangerouslySetInnerHTML={{ __html: html }} /></pre>
      </div>
    </div>
  );
}
