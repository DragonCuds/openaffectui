import { useState } from 'react';
import { Button, Section } from '../ui';
import { AgentQueue, type QueueItem } from '../ui/AgentQueue';
import { AgentRecap, type RecapEvent, type RecapStat } from '../ui/AgentRecap';

const QUEUE: QueueItem[] = [
  { id: 'q1', title: 'بازنویسی توضیح محصول‌های دسته‌ی قهوه', meta: 'دوازده صفحه · حدود ده دقیقه' },
  { id: 'q2', title: 'ساخت ریل «معرفی قهوه‌ی صبح»', meta: 'منتظر صدای ریل قبلی' },
  { id: 'q3', title: 'اسکن دوباره‌ی صفحه‌های بدون توضیح متا' },
  { id: 'q4', title: 'ساخت گزارش هفتگی', meta: 'پنجشنبه' },
];

const STATS: RecapStat[] = [
  { label: 'انجام شد', value: 14, tone: 'ok' },
  { label: 'منتظر تو', value: 3, tone: 'warn' },
  { label: 'خطا', value: 1, tone: 'bad' },
];

const EVENTS: RecapEvent[] = [
  { id: 'e1', when: '۲۳:۴۰', text: 'اسکن سایت تمام شد؛ دو صفحه نیاز به اصلاح دارد.' },
  { id: 'e2', when: '۲۱:۱۵', text: 'ریل «برش سنگ» ساخته شد و منتظر تأیید توست.' },
  { id: 'e3', when: '۱۹:۰۵', text: 'ساخت صدای یک ریل ناموفق بود.' },
];

/** Agent queue and return-recap demos. */
export default function DemoQueue() {
  const [items, setItems] = useState<QueueItem[]>(QUEUE);
  const [shown, setShown] = useState(true);

  const move = (id: string, dir: 'up' | 'down') =>
    setItems((list) => {
      const i = list.findIndex((x) => x.id === id);
      const j = dir === 'up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <>
      <Section
        title="صف کارها"
        aside={<Button onClick={() => setItems(items.length ? [] : QUEUE)}>{items.length ? 'خالی' : 'بازنشانی'}</Button>}
      >
        <AgentQueue items={items} onMove={move} onRemove={(id) => setItems((l) => l.filter((x) => x.id !== id))} />
      </Section>
      <Section
        title="خلاصه‌ی برگشت"
        aside={shown ? undefined : <Button onClick={() => setShown(true)}>نمایش دوباره</Button>}
      >
        {shown ? <AgentRecap period="۸ ساعت گذشته" stats={STATS} events={EVENTS} onDismiss={() => setShown(false)} /> : null}
      </Section>
    </>
  );
}
