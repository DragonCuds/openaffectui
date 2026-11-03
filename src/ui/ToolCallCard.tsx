import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { StatusDot, type Tone } from './StatusDot';
import { faNum } from './digits';

type State = 'running' | 'done' | 'failed';

const TONE: Record<State, Tone> = { running: 'busy', done: 'ok', failed: 'bad' };
const TEXT: Record<State, string> = { running: 'در حال اجرا', done: 'انجام شد', failed: 'خطا' };

/** Seconds as Persian words: «۲ ثانیه», «۱ دقیقه و ۵ ثانیه». */
function duration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  if (s < 1) return 'کمتر از ۱ ثانیه';
  if (s < 60) return `${faNum(s)} ثانیه`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${faNum(m)} دقیقه و ${faNum(r)} ثانیه` : `${faNum(m)} دقیقه`;
}

/** One tool call of an agent: title, state, time and plain-language details behind a «جزئیات» toggle. */
export function ToolCallCard({ title, state, durationSec, details, defaultOpen = false }: {
  title: string;
  state: State;
  durationSec?: number;
  details?: string[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId();
  const hasDetails = !!details && details.length > 0;

  return (
    <article className={`toolcall toolcall-${state}`} aria-label={`ابزار: ${title}`}>
      <header className="toolcall-head">
        <StatusDot tone={TONE[state]} />
        <h4 className="toolcall-title">{title}</h4>
        <span className="toolcall-state">{TEXT[state]}</span>
        {durationSec != null ? <span className="toolcall-time">{duration(durationSec)}</span> : null}
      </header>

      {hasDetails ? (
        <>
          <button
            type="button"
            className="toolcall-toggle"
            aria-expanded={open}
            aria-controls={`${uid}-body`}
            id={`${uid}-btn`}
            onClick={() => setOpen((o) => !o)}
          >
            <ChevronDown size={14} aria-hidden="true" className="toolcall-chev" />
            جزئیات
          </button>
          <div id={`${uid}-body`} role="region" aria-labelledby={`${uid}-btn`} className="toolcall-body" hidden={!open}>
            <ul className="toolcall-list">
              {(details ?? []).map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          </div>
        </>
      ) : null}
    </article>
  );
}
