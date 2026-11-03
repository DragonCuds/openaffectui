import { useState } from 'react';
import { Button, Section } from '../ui';
import { AgentInbox, type InboxItem } from '../ui/AgentInbox';
import { DecisionInbox, type Decision } from '../ui/DecisionInbox';

const ITEMS: InboxItem[] = [
  { id: 'r1', group: 'need', title: 'ریل «معرفی قهوه‌ی صبح» آماده‌ی تأیید است', meta: 'ساخته شد · ۱۲ دقیقه پیش', actions: <Button variant="primary">تأیید</Button> },
  { id: 'r2', group: 'need', title: 'ایده‌های جلسه‌ی هفتگی منتظر انتخاب‌اند', meta: 'پنج ایده · امروز صبح', actions: <Button>ببین</Button> },
  { id: 'r3', group: 'running', title: 'ساخت صدای ریل «برش سنگ»', meta: 'حدود دو دقیقه مانده' },
  { id: 'r4', group: 'done', title: 'اسکن سایت تمام شد', meta: 'دو صفحه نیاز به اصلاح دارد · دیروز', tone: 'ok' },
];

const DECISIONS: Decision[] = [
  {
    id: 'tone', question: 'لحن صفحه‌های محصول چطور باشد؟', hint: 'روی همه‌ی توضیح‌های محصول اعمال می‌شود.',
    options: [{ value: 'warm', label: 'صمیمی' }, { value: 'formal', label: 'رسمی' }, { value: 'short', label: 'کوتاه و مستقیم' }],
  },
  {
    id: 'cat', question: 'از کدام دسته شروع کنیم؟',
    options: [{ value: 'sell', label: 'پرفروش‌ترین‌ها' }, { value: 'low', label: 'کم‌بازدیدترین‌ها' }, { value: 'new', label: 'جدیدترین‌ها' }],
  },
  {
    id: 'pace', question: 'در هفته چند صفحه بازنویسی شود؟',
    options: [{ value: '5', label: 'پنج صفحه' }, { value: '10', label: 'ده صفحه' }],
  },
];

/** Agent inbox and decision inbox demos. */
export default function DemoInbox() {
  const [sel, setSel] = useState<string | undefined>('r1');
  const [answers, setAnswers] = useState<Record<string, string>>({ tone: 'warm' });
  const [none, setNone] = useState(false);

  return (
    <>
      <Section title="صندوق کارها" aside={<Button onClick={() => setNone((v) => !v)}>{none ? 'نمایش کارها' : 'خالی'}</Button>}>
        <AgentInbox items={none ? [] : ITEMS} selectedId={sel} onSelect={setSel} />
      </Section>
      <Section title="صندوق تصمیم‌ها">
        <DecisionInbox decisions={DECISIONS} answers={answers} onAnswer={(id, v) => setAnswers((a) => ({ ...a, [id]: v }))} />
      </Section>
    </>
  );
}
