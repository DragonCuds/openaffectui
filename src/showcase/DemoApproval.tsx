import { useState } from 'react';
import { Button, Section } from '@kit/ui';
import { ApprovalCard } from '../ui/ApprovalCard';
import { AgentLedger, type LedgerEntry } from '../ui/AgentLedger';

const wait = () => new Promise<void>((r) => setTimeout(r, 600));

const SEED: LedgerEntry[] = [
  { id: 'a3', when: 'امروز ۱۴:۳۰', title: 'عنوان صفحه‌ی «کفش ورزشی» تغییر کرد', detail: 'از «کفش» به «خرید کفش ورزشی مردانه | فروشگاه»', state: 'done' },
  { id: 'a2', when: 'امروز ۱۱:۰۵', title: 'توضیح متا برای دسته‌ی «کیف» نوشته شد', state: 'done' },
  { id: 'a1', when: 'دیروز ۱۸:۴۰', title: 'ریدایرکت صفحه‌ی قدیمی به صفحه‌ی جدید', detail: 'سایت به این تغییر اجازه نداد.', state: 'failed' },
];

/** Approval card and agent ledger samples for the showcase. */
export default function DemoApproval() {
  const [run, setRun] = useState(0);
  const [entries, setEntries] = useState<LedgerEntry[]>(SEED);
  const [note, setNote] = useState('');

  const reset = () => {
    setRun((n) => n + 1);
    setEntries(SEED);
    setNote('');
  };

  const undo = async (id: string) => {
    await wait();
    setEntries((list) => list.map((e) => (e.id === id ? { ...e, state: 'undone' } : e)));
  };

  return (
    <>
      <Section title="تأیید تغییر" aside={<Button onClick={reset}>از اول</Button>}>
        <div className="kit-stack">
          <ApprovalCard
            key={`mid-${run}`}
            title="تغییر عنوان صفحه‌ی «کفش ورزشی»"
            summary="عنوان فعلی «کفش» است و کلمه‌ی کلیدی اصلی را ندارد. عنوان جدید پیشنهاد می‌شود."
            risk="mid"
            detail={<>قبل: کفش<br />بعد: خرید کفش ورزشی مردانه | فروشگاه<br />طول عنوان: ۴۲ نویسه، مناسب نمایش در گوگل.</>}
            onApprove={async () => { await wait(); setNote('تغییر اعمال شد.'); }}
            onReject={async () => { await wait(); setNote('تغییر رد شد.'); }}
          />
          <ApprovalCard
            key={`high-${run}`}
            title="حذف ۱۲ صفحه‌ی بدون بازدید"
            summary="این صفحه‌ها در سه ماه گذشته بازدید نداشته‌اند و به صفحه‌ی اصلی هدایت می‌شوند."
            risk="high"
            approveLabel="حذف کن"
            rejectLabel="نگه دار"
            onApprove={wait}
            onReject={wait}
          />
          <ApprovalCard
            key={`low-${run}`}
            title="افزودن متن جایگزین به تصویر محصول"
            summary="برای ۳ تصویر متن جایگزین نوشته می‌شود."
            risk="low"
            status="approved"
            onApprove={() => {}}
            onReject={() => {}}
          />
          {note ? <p className="muted" role="status">{note}</p> : null}
        </div>
      </Section>

      <Section title="سابقه‌ی کارهای عامل">
        <AgentLedger entries={entries} onUndo={undo} />
      </Section>

      <Section title="سابقه‌ی خالی">
        <AgentLedger entries={[]} onUndo={() => {}} />
      </Section>
    </>
  );
}
