import { useEffect, useState } from 'react';
import { Button, Section } from '../ui';
import { AgentMonitor, type MonitorStep } from '../ui/AgentMonitor';
import { UsageMeter } from '../ui/UsageMeter';

const LABELS = ['خواندن صفحه‌های سایت', 'پیدا کردن عنوان‌های ضعیف', 'نوشتن پیشنهاد جدید', 'ذخیره‌ی نتیجه'];
const wait = () => new Promise<void>((r) => setTimeout(r, 700));

const fresh = (): MonitorStep[] => LABELS.map((label, i) => ({ id: `s${i}`, label, state: i === 0 ? 'active' : 'waiting' }));

/** Agent monitor and usage meter samples for the showcase. */
export default function DemoRuns() {
  const [steps, setSteps] = useState<MonitorStep[]>(fresh);
  const [status, setStatus] = useState<'running' | 'done' | 'failed'>('running');
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      setSteps((list) => {
        const i = list.findIndex((s) => s.state === 'active');
        if (i < 0) return list;
        const next = list.map((s, k) => (k === i ? { ...s, state: 'done' as const } : k === i + 1 ? { ...s, state: 'active' as const } : s));
        if (i + 1 >= list.length) {
          setStatus('done');
          setPlaying(false);
        }
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, [playing]);

  const restart = () => {
    setSteps(fresh());
    setStatus('running');
    setElapsed(0);
    setPlaying(true);
  };

  const fail = () => {
    setPlaying(false);
    setStatus('failed');
    setSteps((list) => list.map((s) => (s.state === 'active' ? { ...s, state: 'failed' as const } : s)));
  };

  const stop = async () => {
    await wait();
    fail();
  };

  return (
    <>
      <Section
        title="کارت اجرا"
        aside={<Button onClick={restart}>{playing ? 'از اول' : 'شروع اجرا'}</Button>}
      >
        <AgentMonitor title="بازنویسی عنوان صفحه‌های دسته‌ی کفش" status={status} steps={steps} elapsedSec={elapsed} onStop={stop} />
      </Section>
      <Section title="مصرف">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
        <UsageMeter label="اعتبار نوشتن" used={40} limit={100} />
        <UsageMeter label="اعتبار صدا" used={85} limit={100} />
        <UsageMeter label="اعتبار تصویر" used={970} limit={1000} unit="تومان" period="این هفته" />
        <UsageMeter label="بدون سقف" used={12} limit={0} />
        </div>
      </Section>
    </>
  );
}
