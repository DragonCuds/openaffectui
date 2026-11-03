import { useState } from 'react';
import { Button, Section } from '@kit/ui';
import { ThinkingLoader } from '../ui/ThinkingLoader';

const PHASES = ['در حال فکر کردن', 'جستجو در وب', 'خواندن منابع', 'نوشتن پاسخ'];

/** Thinking Loader samples for the showcase. */
export default function DemoLoaders() {
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <>
      <Section title="در حال فکر کردن" aside="چرخش خودکار، اندازه‌ی md">
        <div className="kit-row">
          <ThinkingLoader loop />
        </div>
      </Section>

      <Section title="اندازه‌ی کوچک" aside="sm">
        <div className="kit-row">
          <ThinkingLoader size="sm" loop />
        </div>
      </Section>

      <Section title="بدون کپسول" aside="plain، مثلا داخل حباب گفتگو">
        <div className="kit-row">
          <ThinkingLoader variant="plain" loop />
        </div>
      </Section>

      <Section title="مرحله‌ی کنترل‌شده" aside="مرحله را خودت جلو ببر">
        <div className="kit-row">
          <ThinkingLoader phases={PHASES} phase={phase} />
          <Button onClick={() => setPhase((p) => (p + 1) % PHASES.length)}>مرحله‌ی بعد</Button>
        </div>
      </Section>

      <Section title="تمام شد" aside="اسپینر به تیک تبدیل می‌شود">
        <div className="kit-row">
          <ThinkingLoader done={done} />
          <Button onClick={() => setDone((d) => !d)}>{done ? 'شروع دوباره' : 'تمام شد'}</Button>
        </div>
      </Section>

      <Section title="برچسب ثابت" aside="پراپ قدیمی label">
        <div className="kit-row">
          <ThinkingLoader label="در حال ساخت ریل" />
        </div>
      </Section>
    </>
  );
}
