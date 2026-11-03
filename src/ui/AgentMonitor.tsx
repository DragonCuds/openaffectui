import { useState } from 'react';
import { Square } from 'lucide-react';
import { Button } from './Button';
import { Meter } from './Meter';
import { StatusDot, type Tone } from './StatusDot';
import { faNum } from './digits';

export type MonitorStep = {
  id: string;
  label: string;
  state: 'done' | 'active' | 'waiting' | 'failed';
};

const STEP_TONE: Record<MonitorStep['state'], Tone> = { done: 'ok', active: 'busy', waiting: 'quiet', failed: 'bad' };
const STEP_TEXT: Record<MonitorStep['state'], string> = { done: 'انجام شد', active: 'در حال انجام', waiting: 'منتظر', failed: 'خطا' };

const pad = (n: number) => faNum(n).padStart(2, '۰');

/** Seconds as Persian mm:ss. */
function clock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

/** One agent run: title, current step, progress, elapsed time, step list and a stop button while running. */
export function AgentMonitor({ title, status, steps, elapsedSec, onStop }: {
  title: string;
  status: 'running' | 'done' | 'failed';
  steps: MonitorStep[];
  elapsedSec: number;
  onStop?: () => void | Promise<void>;
}) {
  const [stopping, setStopping] = useState(false);
  const doneCount = steps.filter((s) => s.state === 'done').length;
  const active = steps.find((s) => s.state === 'active');
  const current = status === 'running' ? (active?.label ?? 'در حال آماده‌سازی') : '';

  const stop = async () => {
    if (stopping || !onStop) return;
    setStopping(true);
    try {
      await onStop();
    } finally {
      setStopping(false);
    }
  };

  return (
    <article className={`monitor monitor-${status}`} aria-label={`اجرا: ${title}`}>
      <header className="monitor-head">
        <div className="monitor-main">
          <h3 className="monitor-title">{title}</h3>
          <p className="monitor-now" aria-live="polite">{current}</p>
        </div>
        <span className="monitor-time" role="timer" aria-label="زمان گذشته">{clock(elapsedSec)}</span>
      </header>

      <Meter value={doneCount} max={steps.length} label="پیشرفت اجرا" />
      <p className="monitor-count">{faNum(doneCount)} از {faNum(steps.length)} مرحله</p>

      <ol className="monitor-steps" aria-label="مرحله‌ها">
        {steps.map((s) => (
          <li key={s.id} className={`monitor-step monitor-step-${s.state}`}>
            <StatusDot tone={STEP_TONE[s.state]} />
            <span className="monitor-step-label">{s.label}</span>
            <span className="monitor-step-state">{STEP_TEXT[s.state]}</span>
          </li>
        ))}
      </ol>

      {status === 'running' ? (
        <footer className="monitor-foot">
          {onStop ? (
            <Button className="monitor-stop" disabled={stopping} aria-busy={stopping} onClick={stop}>
              <Square size={14} aria-hidden="true" />
              توقف
            </Button>
          ) : null}
        </footer>
      ) : (
        <p className={`monitor-result monitor-result-${status}`}>
          <StatusDot tone={status === 'done' ? 'ok' : 'bad'} />
          {status === 'done' ? 'تمام شد' : 'ناموفق بود'}
        </p>
      )}
    </article>
  );
}
