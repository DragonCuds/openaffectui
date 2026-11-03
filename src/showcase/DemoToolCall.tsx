import { useEffect, useRef, useState } from 'react';
import { FileText, Globe, Save } from 'lucide-react';
import { Button, Section, ToolCallCard, ToolCallGroup } from '../ui';

const ICON = { size: 16, strokeWidth: 1.5 } as const;

const READ_ARGS = { url: 'https://example.ir/category/shoes', selector: 'h1, .meta-description', renderJs: false };
const READ_RESULT = { status: 200, title: 'کفش ورزشی', description: null, wordCount: 412, links: 38 };
const AUDIT_ARGS = { pages: 12, rules: ['title-length', 'duplicate-title', 'missing-meta'] };
const AUDIT_RESULT = {
  checked: 12,
  issues: [
    { page: '/category/shoes', rule: 'title-length', detail: 'عنوان ۱۸ نویسه است؛ حداقل ۳۰' },
    { page: '/category/boots', rule: 'duplicate-title', detail: 'همان عنوان /category/shoes' },
    { page: '/blog/how-to-choose', rule: 'missing-meta', detail: 'توضیح متا ندارد' },
    { page: '/product/101', rule: 'title-length', detail: 'عنوان ۱۱ نویسه است؛ حداقل ۳۰' },
    { page: '/product/204', rule: 'title-length', detail: 'عنوان ۹ نویسه است؛ حداقل ۳۰' },
  ],
  ok: true,
};

/** A group of tool calls: one running (then done), one finished with a long result, one failed with retry. */
function Calls() {
  const [t0, setT0] = useState(() => Date.now());
  const [status, setStatus] = useState<'running' | 'success'>('running');
  const [saveStatus, setSaveStatus] = useState<'error' | 'running' | 'success'>('error');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const rerun = () => {
    setT0(Date.now());
    setStatus('running');
    timers.current.push(setTimeout(() => setStatus('success'), 3200));
  };
  useEffect(() => {
    timers.current.push(setTimeout(() => setStatus('success'), 3200));
  }, []);

  const retry = () => {
    setSaveStatus('running');
    timers.current.push(setTimeout(() => setSaveStatus('success'), 1800));
  };

  return (
    <div className="kit-stack">
      <ToolCallGroup defaultOpen>
        <ToolCallCard
          name="read_page"
          icon={<Globe {...ICON} />}
          summary="خواندن صفحه‌ی دسته‌ی کفش"
          status={status}
          startedAt={t0}
          duration={status === 'success' ? 3200 : undefined}
          args={READ_ARGS}
          result={status === 'success' ? READ_RESULT : undefined}
        />
        <ToolCallCard
          name="audit_titles"
          icon={<FileText {...ICON} />}
          summary="پیدا کردن عنوان‌های ضعیف در ۱۲ صفحه"
          status="success"
          duration={7400}
          args={AUDIT_ARGS}
          result={AUDIT_RESULT}
          defaultOpen
        />
        <ToolCallCard
          name="save_title"
          icon={<Save {...ICON} />}
          summary="ذخیره‌ی عنوان جدید در سایت"
          status={saveStatus}
          duration={saveStatus === 'success' ? 1800 : 65000}
          args={{ page: '/category/shoes', title: 'کفش ورزشی مردانه اصل | ارسال رایگان' }}
          result={saveStatus === 'success' ? { saved: true } : undefined}
          error="سایت جواب نداد (۵۰۴). عنوان قبلی دست نخورده ماند."
          onRetry={retry}
        />
      </ToolCallGroup>
      <div>
        <Button onClick={rerun}>اجرای دوباره‌ی اولی</Button>
      </div>
    </div>
  );
}

export default function DemoToolCall() {
  return (
    <>
      <Section title="خط ابزار">
        <Calls />
      </Section>
      <Section title="یک ابزار تنها">
        <ToolCallCard
          name="search_web"
          summary="جستجو برای «قیمت سی‌آرام ۱۴۰۵»"
          status="success"
          duration={820}
          args={{ query: 'قیمت سی‌آرام ۱۴۰۵', limit: 5 }}
          result="۵ نتیجه پیدا شد."
        />
      </Section>
    </>
  );
}
