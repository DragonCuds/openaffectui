import { useState } from 'react';
import { Button, Section, Segmented, Surface } from '../ui';
import { BlurSwap } from '../ui/BlurSwap';

const TABS = [
  { value: 'short', label: 'خلاصه' },
  { value: 'mid', label: 'امروز' },
  { value: 'long', label: 'جزئیات' },
];

const TAB_BODY: Record<string, string> = {
  short: 'همه‌چیز آماده است.',
  mid: 'امروز سه پست منتشر شد و همه بدون خطا رفتند. پست چهارم برای ساعت شش عصر زمان‌بندی شده است.',
  long: 'این هفته چهارده پست زمان‌بندی شده و دو مورد منتظر تأیید توست. یکی از آن‌ها تصویر جدیدی دارد که هنوز بررسی نشده و دیگری متنی طولانی است که باید پیش از انتشار یک بار خوانده شود. اگر تا فردا صبح تأیید نشوند، به‌طور خودکار از صف بیرون می‌روند و باید دوباره زمان‌بندی شوند.',
};

const STATUSES = ['در حال انتشار', 'منتشر شد', 'خطا'];

const STEPS = [
  'اول حساب اینستاگرامت را وصل کن تا بتوانیم پست‌ها را برایت زمان‌بندی کنیم.',
  'بعد از اتصال، یکی از قالب‌های آماده را انتخاب کن یا با یک متن کوتاه از صفر شروع کن. پیش‌نمایش همان‌جا کنارت می‌ماند و با هر تغییر به‌روز می‌شود.',
  'آماده‌ای. ساعت انتشار را بگذار و بقیه‌اش با ما.',
];

/** BlurSwap in three shapes: block height morph, inline width morph, paragraph cycler. */
export default function DemoBlur() {
  const [tab, setTab] = useState('mid');
  const [status, setStatus] = useState(0);
  const [step, setStep] = useState(0);
  return (
    <>
      <Section title="تعویض محتوا با تغییر ارتفاع">
        <Segmented label="برگه" value={tab} options={TABS} onChange={setTab} />
        <Surface>
          <BlurSwap id={tab}>{TAB_BODY[tab]}</BlurSwap>
        </Surface>
      </Section>

      <Section title="کلمه‌ی وسط جمله">
        <div className="kit-row">
          <span aria-live="polite">
            وضعیت:{' '}
            <BlurSwap id={status} as="span" morph="both">
              {STATUSES[status]}
            </BlurSwap>{' '}
            (پست امروز)
          </span>
          <Button onClick={() => setStatus((s) => (s + 1) % STATUSES.length)}>بعدی</Button>
        </div>
      </Section>

      <Section title="مرحله به مرحله">
        <Surface>
          <BlurSwap id={step}>{STEPS[step]}</BlurSwap>
        </Surface>
        <div className="kit-row">
          <Button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>قبلی</Button>
          <Button variant="primary" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>
            بعدی
          </Button>
        </div>
      </Section>
    </>
  );
}
