import { useEffect, useState } from 'react';
import { Button, Section } from '../ui';
import { LiveChecks, LiveSteps, useStaggeredStates, type LiveCheck, type LiveState, type LiveStep } from '../ui/LiveSteps';

const GROUPS = [{ key: 'target', label: 'صفحه‌ی هدف' }, { key: 'home', label: 'خانه' }, { key: 'health', label: 'سلامت' }];
const CHECKS: Omit<LiveCheck, 'state'>[] = [
  { key: 't1', label: 'صفحه باز می‌شه', group: 'target' },
  { key: 't2', label: 'متن تازه دیده می‌شه', group: 'target' },
  { key: 'h1', label: 'صفحه‌ی اول باز می‌شه', group: 'home' },
  { key: 'h2', label: 'منو سر جاشه', group: 'home' },
  { key: 's1', label: 'خطای PHP نیست', group: 'health' },
  { key: 's2', label: 'سرعت مثل قبله', group: 'health' },
];
const STEPS = ['گرفتن نسخه‌ی پشتیبان', 'عکس صفحه‌ها قبل از تغییر', 'نوشتن روی سایت', 'خالی کردن کش', 'چک گاردها', 'تمام'];

/** LiveSteps + LiveChecks: a fake run; all six checks finish in one "poll" and turn green one by one. */
export default function DemoLive() {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (t === 0 || t >= 7) return;
    const id = setTimeout(() => setT((n) => n + 1), 1200);
    return () => clearTimeout(id);
  }, [t]);
  const stepState = (i: number): LiveState => (t === 0 ? 'wait' : i < Math.min(t - 1, 5) || t >= 7 ? 'ok' : i === Math.min(t - 1, 5) ? 'run' : 'wait');
  const checks: LiveCheck[] = CHECKS.map((c, i) => ({ ...c, state: t >= 6 ? 'ok' : t === 5 ? 'run' : 'wait', at: 1000 + i }));
  const { states, pending } = useStaggeredStates(checks, { gap: 220 });
  const steps: LiveStep[] = STEPS.map((label, i) => ({
    key: String(i), label,
    state: i === 4 && pending ? 'run' : i === 5 && pending ? 'wait' : stepState(i),
    children: i === 4 && t >= 5 ? <LiveChecks items={checks} groups={GROUPS} states={states} /> : undefined,
  }));
  const failed: LiveStep[] = STEPS.map((label, i) => ({ key: String(i), label, state: i < 4 ? 'ok' : i === 4 ? 'fail' : 'ok', detail: i === 4 ? 'صفحه‌ی اول بعد از تغییر باز نشد.' : undefined }));
  return (
    <>
      <Section title="مرحله‌های زنده" aside={<Button onClick={() => setT(1)}>{t ? 'از اول' : 'شروع'}</Button>}>
        <LiveSteps steps={steps} />
      </Section>
      <Section title="خلاصه بعد از تمام شدن" aside="compact">
        <LiveSteps steps={failed} compact />
        <LiveChecks compact groups={GROUPS} items={CHECKS.map((c) => ({ ...c, state: c.key === 'h1' ? 'fail' : 'ok', detail: c.key === 'h1' ? 'صفحه باز نشد.' : undefined }))} />
      </Section>
    </>
  );
}
