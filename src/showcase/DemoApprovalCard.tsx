import { useState } from 'react';
import { Mail, Rocket } from 'lucide-react';
import { Button, Section } from '../ui';
import { ApprovalCard, ApprovalPeople } from '../ui/ApprovalCard';

const wait = (ms = 900) => new Promise<void>((r) => setTimeout(r, ms));

const RECIPIENTS = ['مریم', 'یونس', 'سارا', 'آرش'];

/** Approval card samples: the full card, controlled with edit, and a deploy request with a countdown. */
export default function DemoApprovalCard() {
  const [run, setRun] = useState(0);
  const [status, setStatus] = useState<'pending' | 'approved' | 'denied'>('pending');
  const [note, setNote] = useState('');

  const reset = () => { setRun((n) => n + 1); setStatus('pending'); setNote(''); };

  return (
    <>
      <Section title="کارت تأیید" aside={<Button onClick={reset}>از اول</Button>}>
        <div className="kit-stack">
          <ApprovalCard
            key={`mail-${run}`}
            title="ارسال ایمیل کمپین"
            description="به‌روزرسانی مهر · خبرنامه"
            risk="medium"
            icon={<Mail size={16} strokeWidth={1.75} />}
            preview={<ApprovalPeople names={RECIPIENTS} more={38} />}
            details={[
              { label: 'موضوع', value: 'تازه‌های مهر' },
              { label: 'ارسال', value: 'امروز، ۹:۰۰ صبح' },
            ]}
            onApprove={async () => { await wait(); }}
          />

          <ApprovalCard
            key={`ctl-${run}`}
            title="حذف ۱۲ صفحه‌ی بدون بازدید"
            description="این صفحه‌ها سه ماه است بازدید نداشته‌اند"
            risk="high"
            status={status}
            onEdit={() => setNote('ویرایش باز شد.')}
            details={[{ label: 'مقصد', value: 'ریدایرکت به صفحه‌ی اصلی' }, { label: 'برگشت', value: 'تا ۳۰ روز' }]}
            allowAlways={false}
            approveLabel="حذف کن"
            denyLabel="نگه دار"
            onApprove={async () => { await wait(700); setStatus('approved'); setNote('صفحه‌ها حذف شدند.'); }}
            onDeny={() => { setStatus('denied'); setNote('هیچ صفحه‌ای حذف نشد.'); }}
            onUndo={() => { setStatus('pending'); setNote(''); }}
          />
          {note ? <p className="muted" role="status">{note}</p> : null}

          <ApprovalCard
            key={`dep-${run}`}
            title="انتشار نسخه‌ی ۲٫۴ روی سرور اصلی"
            description="شاخه‌ی main · ۱۴ تغییر"
            risk="medium"
            icon={<Rocket size={16} strokeWidth={1.75} />}
            actions="tray"
            label="مرحله‌ی ۴ · deploy.run"
            expiresIn={42}
            allowAlways={false}
            details={[{ label: 'محیط', value: 'production' }, { label: 'زمان', value: 'حدود ۲ دقیقه' }]}
            onApprove={async () => { await wait(1200); }}
          />

          <ApprovalCard
            key={`low-${run}`}
            title="افزودن متن جایگزین به تصویر محصول"
            description="برای ۳ تصویر نوشته می‌شود"
            risk="low"
            defaultStatus="approved"
          />
          <ApprovalCard
            key={`den-${run}`}
            title="تغییر عنوان صفحه‌ی «کفش»"
            risk="low"
            defaultStatus="denied"
          />
        </div>
      </Section>
    </>
  );
}
