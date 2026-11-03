import { InlineDiff, Section, ToolCallCard } from '../ui';

const BEFORE = 'خرید اینترنتی کفش ورزشی مردانه با بهترین قیمت';
const AFTER = 'خرید آنلاین کفش ورزشی مردانه اصل با ارسال رایگان';

/** Text diff and tool call samples for the showcase. */
export default function DemoText() {
  return (
    <>
      <Section title="تغییر عنوان صفحه">
        <InlineDiff before={BEFORE} after={AFTER} />
      </Section>
      <Section title="بدون تغییر">
        <InlineDiff before={BEFORE} after={BEFORE} />
      </Section>
      <Section title="کارت ابزار">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
          <ToolCallCard title="خواندن صفحه‌ی دسته‌ی کفش" state="running" durationSec={2} />
          <ToolCallCard
            title="پیدا کردن عنوان‌های ضعیف"
            state="done"
            durationSec={7}
            defaultOpen
            details={['۱۲ صفحه بررسی شد', '۴ عنوان بیش از حد کوتاه بود', '۲ عنوان تکراری پیدا شد']}
          />
          <ToolCallCard
            title="ذخیره‌ی عنوان جدید در سایت"
            state="failed"
            durationSec={65}
            details={['سایت جواب نداد', 'عنوان قبلی دست نخورده ماند']}
          />
        </div>
      </Section>
    </>
  );
}
