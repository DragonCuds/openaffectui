import { useState } from 'react';
import { Button, Meter, PageTitle, RollingNumber, Section, Segmented, StatusDot, Surface } from '../ui';
import { Toaster } from '../ui/Toaster';
import DemoToastSwap from './DemoToastSwap';
import DemoLoaders from './DemoLoaders';
import DemoApproval from './DemoApproval';
import DemoInbox from './DemoInbox';
import DemoDial from './DemoDial';
import DemoRuns from './DemoRuns';
import DemoQueue from './DemoQueue';
import DemoChat from './DemoChat';
import DemoText from './DemoText';
import './showcase.css';

const GUARDS = [
  { value: 'watch', label: 'فقط ببین' },
  { value: 'ask', label: 'بپرس' },
  { value: 'auto', label: 'خودکار' },
];

/** Every shared component with Persian sample data. Grows by one block per phase. */
export function Showcase() {
  const [guard, setGuard] = useState('ask');
  const [count, setCount] = useState(1284);
  return (
    <div className="kit-page">
      <PageTitle title="ویترین کیت" summary="همه‌ی اجزای مشترک اکسس و دیددش یک‌جا. با هر فاز یک بخش بهش اضافه می‌شود." />

      <Section title="دکمه‌ها">
        <div className="kit-row">
          <Button variant="primary">تأیید</Button>
          <Button>انصراف</Button>
          <Button disabled>غیرفعال</Button>
        </div>
      </Section>

      <Section title="انتخاب یکی از چند حالت">
        <Segmented label="سطح گارد" value={guard} options={GUARDS} onChange={setGuard} />
      </Section>

      <Section title="عدد غلتان" aside={<Button onClick={() => setCount((n) => n + 137)}>یکی بزن</Button>}>
        <p className="kit-big"><RollingNumber value={count} /></p>
      </Section>

      <Section title="نوار پیشرفت">
        <div className="kit-stack">
          <Meter value={72} max={100} label="مصرف ماه" />
          <Meter value={18} max={100} label="سهمیه‌ی ریل" />
        </div>
      </Section>

      <Section title="نقطه‌ی وضعیت">
        <div className="kit-row">
          {(['ok', 'busy', 'warn', 'bad', 'info', 'quiet'] as const).map((t) => (
            <span className="kit-dot" key={t}><StatusDot tone={t} />{{ ok: 'آماده', busy: 'در حال اجرا', warn: 'منتظر', bad: 'خطا', info: 'خبر', quiet: 'ساکت' }[t]}</span>
          ))}
        </div>
      </Section>

      <Section title="سطح">
        <Surface><p>این یک کارت ساده است. متن فارسی، راست‌چین و با ارقام فارسی: ۱۲۳۴۵۶۷۸۹۰</p></Surface>
      </Section>

      <DemoToastSwap />
      <DemoLoaders />
      <DemoApproval />
      <DemoInbox />
      <DemoDial />
      <DemoRuns />
      <DemoQueue />
      <DemoChat />
      <DemoText />
      <Toaster />
    </div>
  );
}
