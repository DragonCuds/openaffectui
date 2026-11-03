import { useState } from 'react';
import { CircleDollarSign, FileText, GitMerge, Mail, MessageSquare, Rocket, Ticket, Users } from 'lucide-react';
import { Button, Section } from '@kit/ui';
import { AgentLedger, type LedgerEntry } from '../ui/AgentLedger';

const wait = (ms = 700) => new Promise<void>((r) => setTimeout(r, ms));
const ic = (I: typeof Mail) => <I size={16} strokeWidth={1.7} />;

const SEED: LedgerEntry[] = [
  { id: 'l8', when: 'همین الان', title: 'ایمیل فرستاده شد', target: '۳٬۸۱۲ مشترک', detail: 'قیمت جدید و کد LAUNCH20', system: 'ایمیل', icon: ic(Mail), state: 'done', irreversible: true, dependsOn: ['l5'] },
  { id: 'l7', when: '۱ دقیقه پیش', title: 'پیام در کانال #launch', target: 'قیمت جدید فعال شد', detail: 'با لینک به صفحه‌ی قیمت‌ها', system: 'اسلک', icon: ic(MessageSquare), state: 'done', dependsOn: ['l5'] },
  { id: 'l6', when: '۱ دقیقه پیش', title: 'به‌روزرسانی ۲۱۲ معامله', target: 'تمدیدهای فصل چهارم', change: ['۲۹ تومان برای هر صندلی', '۳۴ تومان برای هر صندلی'], system: 'سی‌آرام', icon: ic(Users), state: 'done', dependsOn: ['l5'] },
  { id: 'l5', when: '۲ دقیقه پیش', title: 'قیمت تغییر کرد', target: 'پلن حرفه‌ای', change: ['۲۹ / ماه', '۳۴ / ماه'], system: 'پرداخت', icon: ic(CircleDollarSign), state: 'done' },
  { id: 'l4', when: '۲ دقیقه پیش', title: 'صفحه‌ی سؤال‌های رایج به‌روز شد', target: 'قیمت‌ها', change: ['۳ پاسخ', '۳ پاسخ بازنویسی‌شده'], system: 'ویکی', icon: ic(FileText), state: 'done' },
  { id: 'l3', when: '۳ دقیقه پیش', title: 'کد تخفیف ساخته شد', target: 'LAUNCH20', detail: '۲۰٪ تخفیف سال اول · تا ۷ روز دیگر', system: 'پرداخت', icon: ic(Ticket), state: 'done' },
  { id: 'l2', when: '۳ دقیقه پیش', title: 'نسخه منتشر شد', target: 'سایت اصلی', change: ['نسخه‌ی ۴۸۱', 'نسخه‌ی ۴۸۳ در سرور اصلی'], system: 'استقرار', icon: ic(Rocket), state: 'done' },
  { id: 'l1', when: '۴ دقیقه پیش', title: 'ادغام شد', target: 'صفحه‌ی قیمت نسخه‌ی ۲', change: ['pricing-v2', 'main'], system: 'گیت', icon: ic(GitMerge), state: 'done' },
];

let seq = 100;
const NEXT: Omit<LedgerEntry, 'id' | 'when' | 'state'>[] = [
  { title: 'عنوان صفحه تغییر کرد', target: 'کفش ورزشی', change: ['کفش', 'خرید کفش ورزشی مردانه'], system: 'سایت', icon: ic(FileText) },
  { title: 'ریدایرکت اضافه شد', target: '/old-shoes', detail: 'به صفحه‌ی دسته‌ی کفش', system: 'سایت', icon: ic(GitMerge) },
  { title: 'پیام در کانال', target: 'گزارش هفتگی', detail: 'خلاصه‌ی ۱۲ صفحه‌ی بهبودیافته', system: 'اسلک', icon: ic(MessageSquare) },
];

/** Agent ledger samples for the showcase: undo chain, irreversible rows, new rows, failures, narrow, empty. */
export default function DemoLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>(SEED);
  const [live, setLive] = useState(0);

  const setStates = (ids: string[], state: LedgerEntry['state']) =>
    setEntries((list) => list.map((e) => (ids.includes(e.id) ? { ...e, state } : e)));

  const add = () => {
    const base = NEXT[live % NEXT.length];
    setLive((n) => n + 1);
    setEntries((list) => [{ ...base, id: `n${seq++}`, when: 'همین الان', state: 'done' }, ...list]);
  };

  // a row whose undo fails: the request is rejected and the row says so
  const [flaky, setFlaky] = useState<LedgerEntry[]>([
    { id: 'f2', when: '۱ دقیقه پیش', title: 'توضیح متا نوشته شد', target: 'دسته‌ی کیف', detail: 'برای ۴ صفحه', system: 'سایت', icon: ic(FileText), state: 'done' },
    { id: 'f1', when: '۲ دقیقه پیش', title: 'ریدایرکت اضافه شد', target: '/old-bag', detail: 'سایت این تغییر را نپذیرفت', system: 'سایت', icon: ic(GitMerge), state: 'failed' },
  ]);

  return (
    <>
      <Section title="سابقه‌ی کارهای عامل" aside={<><Button onClick={add}>تغییر تازه</Button> <Button onClick={() => { setEntries(SEED); setLive(0); }}>از اول</Button></>}>
        <AgentLedger
          title="سابقه"
          agent="عامل راه‌اندازی"
          entries={entries}
          onUndo={async (_id, ids) => {
            await wait();
            setStates(ids, 'undone');
          }}
          onRedo={async (_id, ids) => {
            await wait(500);
            setStates(ids, 'done');
          }}
        />
        <p className="muted" style={{ marginBlockStart: 12 }}>
          نشانگر را روی «برگردان» ببرید: ردیف و هر چه روی آن ساخته شده روشن می‌شود. «همراه برمی‌گردد» آبی است و «برگشت‌پذیر نیست» نارنجی.
        </p>
      </Section>

      <Section title="نشان‌دادن وابستگی (بدون نشانگر)">
        <AgentLedger title="سابقه" agent="عامل راه‌اندازی" entries={SEED.slice(0, 5)} pointAt="l5" onUndo={() => {}} />
      </Section>

      <Section title="برگرداندن ناموفق">
        <AgentLedger
          title="سابقه"
          entries={flaky}
          onUndo={async (id, ids) => {
            await wait(900);
            if (id === 'f2') throw new Error('rejected');
            setFlaky((l) => l.map((e) => (ids.includes(e.id) ? { ...e, state: 'undone' } : e)));
          }}
        />
      </Section>

      <Section title="عرض باریک">
        <div style={{ maxInlineSize: 340 }}>
          <AgentLedger title="سابقه" entries={SEED.slice(2, 6)} onUndo={() => {}} />
        </div>
      </Section>

      <Section title="سابقه‌ی خالی">
        <AgentLedger title="سابقه" entries={[]} onUndo={() => {}} />
      </Section>
    </>
  );
}
