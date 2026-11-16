import type { DocEntry } from '../types';

export const foundations: DocEntry[] = [
  {
    slug: 'button',
    name: 'Button',
    title: 'دکمه',
    category: 'foundations',
    summary: 'دکمه‌ی ساده با دو حالت: اصلی (پررنگ) و نرم (کم‌رنگ)، بدون حاشیه.',
    origin: 'own',
    file: 'ui/Button.tsx',
    extraFiles: ['styles/ui.css'],
    importLine: "import { Button } from '@kit/ui';",
    whenToUse: [
      'برای هر کاری که کاربر با یک کلیک انجام می‌دهد: ذخیره، ارسال، تأیید.',
      'در هر صفحه فقط یک دکمه‌ی اصلی بگذارید و بقیه را نرم نگه دارید.',
      'وقتی به دکمه‌ی native نیاز دارید که با بقیه‌ی کیت هم‌شکل باشد.',
    ],
    whenNot: [
      { text: 'برای انتخاب یکی از چند گزینه، از چند دکمه‌ی جدا استفاده نکنید.', see: 'segmented' },
      { text: 'برای پرسش «مطمئنی؟» یک ردیف آماده دارید.', see: 'confirm-row' },
    ],
    usage: `import { useState } from 'react';
import { Button } from '@kit/ui';

export function SaveBar() {
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="primary" onClick={() => setSaved(true)}>
        {saved ? 'ذخیره شد' : 'ذخیره‌ی تغییرها'}
      </Button>
      <Button onClick={() => setSaved(false)}>بی‌خیال</Button>
      <Button disabled>غیرفعال</Button>
    </div>
  );
}`,
    props: [
      {
        items: [
          { name: 'variant', type: "'primary' | 'soft'", default: "'soft'", desc: 'ظاهر دکمه؛ primary پررنگ است و soft کم‌رنگ.' },
          { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", desc: 'نوع دکمه؛ پیش‌فرض button است تا فرم را ناخواسته ارسال نکند.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه که کنار btn گذاشته می‌شود.' },
          { name: '...rest', type: 'ButtonHTMLAttributes<HTMLButtonElement>', desc: 'همه‌ی ویژگی‌های دکمه‌ی native مثل onClick و disabled و aria-busy.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'Enter / Space', action: 'دکمه را فعال می‌کند (رفتار native مرورگر).' },
    ],
    a11y: [
      'یک عنصر button واقعی است و با Tab به آن می‌رسید.',
      'نوع پیش‌فرض button است، پس داخل فرم ناخواسته submit نمی‌شود.',
      'حالت disabled را مرورگر خودش به صفحه‌خوان می‌گوید.',
    ],
    related: ['confirm-row', 'segmented', 'states'],
  },
  {
    slug: 'segmented',
    name: 'Segmented',
    title: 'انتخاب قرصی',
    category: 'foundations',
    summary: 'چند گزینه‌ی کنار هم که فقط یکی از آن‌ها انتخاب است و یک تیکه‌ی نرم زیر آن می‌لغزد.',
    origin: 'own',
    file: 'ui/Segmented.tsx',
    extraFiles: ['styles/ui.css'],
    importLine: "import { Segmented } from '@kit/ui';",
    whenToUse: [
      'برای عوض کردن بازه یا نما، مثل «هفته / ماه / سال».',
      'وقتی گزینه‌ها کم هستند (دو تا پنج تا) و همه باید یک‌جا دیده شوند.',
      'برای تنظیم‌هایی که با انتخاب فوراً اعمال می‌شوند.',
    ],
    whenNot: [
      { text: 'برای کاری که باید انجام شود (مثل ذخیره) دکمه بگذارید، نه گزینه.', see: 'button' },
      { text: 'برای چند گام پشت سر هم، نشانگر مرحله بهتر است.', see: 'stepper' },
    ],
    usage: `import { useState } from 'react';
import { Segmented } from '@kit/ui';

const OPTIONS = [
  { value: 'week', label: 'هفته' },
  { value: 'month', label: 'ماه' },
  { value: 'year', label: 'سال' },
];

export function RangeSwitch() {
  const [range, setRange] = useState('week');
  return (
    <Segmented
      label="بازه‌ی گزارش"
      value={range}
      options={OPTIONS}
      onChange={setRange}
    />
  );
}`,
    props: [
      {
        items: [
          { name: 'label', type: 'string', required: true, desc: 'نام گروه برای صفحه‌خوان (aria-label).' },
          { name: 'value', type: 'T extends string', required: true, desc: 'مقدار گزینه‌ی انتخاب‌شده.' },
          { name: 'options', type: "{ value: T; label: string; tone?: 'ok' | 'busy' | 'bad' }[]", required: true, desc: 'فهرست گزینه‌ها با مقدار و برچسب؛ tone رنگ تیکه‌ی زیر گزینه‌ی انتخاب‌شده است.' },
          { name: 'onChange', type: '(v: T) => void', required: true, desc: 'وقتی گزینه‌ی تازه‌ای انتخاب شد صدا زده می‌شود.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'اندازه؛ sm برای سربرگ و منو، lg برای بالای داشبورد.' },
          { name: 'block', type: 'boolean', default: 'false', desc: 'همه‌ی عرض ردیف را می‌گیرد و گزینه‌ها عرض را تقسیم می‌کنند.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه که کنار seg گذاشته می‌شود.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'ArrowLeft / ArrowRight', action: 'گزینه‌ی بعدی یا قبلی؛ در صفحه‌ی راست‌به‌چپ جهت‌ها برعکس می‌شوند.' },
      { keys: 'ArrowDown / ArrowUp', action: 'گزینه‌ی بعدی یا قبلی.' },
      { keys: 'Home / End', action: 'رفتن به اولین یا آخرین گزینه.' },
    ],
    a11y: [
      'نقش radiogroup دارد و هر گزینه radio است با aria-checked.',
      'فقط گزینه‌ی انتخاب‌شده tabIndex=0 دارد، پس Tab یک بار وارد گروه می‌شود.',
      'کلیدهای جهت‌دار گزینه را انتخاب می‌کنند و فوکوس را هم با آن می‌برند.',
    ],
    related: ['button', 'stepper', 'select'],
  },
  {
    slug: 'meter',
    name: 'Meter',
    title: 'نوار پیشرفت',
    category: 'foundations',
    summary: 'یک نوار باریک که نشان می‌دهد چقدر از یک مقدار پر شده است.',
    origin: 'own',
    file: 'ui/Meter.tsx',
    extraFiles: ['styles/ui.css'],
    importLine: "import { Meter } from '@kit/ui';",
    whenToUse: [
      'برای نشان دادن مصرف در برابر سقف، مثل ۴۰ از ۱۰۰ پیام.',
      'جایی که فقط یک نگاه سریع به میزان پری کافی است.',
      'کنار یک عدد یا برچسب، برای اینکه عدد دقیق هم دیده شود.',
    ],
    whenNot: [
      { text: 'اگر می‌خواهید مصرف چند بخش و سقف‌ها را با جزئیات نشان بدهید، کارت مصرف کامل‌تر است.', see: 'usage-meter' },
      { text: 'برای مراحل یک مسیر، نشانگر مرحله مناسب‌تر است.', see: 'stepper' },
    ],
    usage: `import { Meter } from '@kit/ui';

export function QuotaRow() {
  const used = 38;
  const total = 100;
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <span>{used.toLocaleString('fa-IR')} از {total.toLocaleString('fa-IR')} پیام</span>
      <Meter value={used} max={total} label="پیام‌های مصرف‌شده" />
    </div>
  );
}`,
    props: [
      {
        items: [
          { name: 'value', type: 'number', required: true, desc: 'مقدار فعلی.' },
          { name: 'max', type: 'number', required: true, desc: 'بیشترین مقدار؛ اگر صفر یا کمتر باشد نوار خالی می‌ماند.' },
          { name: 'label', type: 'string', required: true, desc: 'نام نوار برای صفحه‌خوان (aria-label).' },
        ],
      },
    ],
    a11y: [
      'نقش meter دارد با aria-valuemin و aria-valuemax و aria-valuenow.',
      'درصد پری بین صفر و صد گیر می‌کند، پس مقدار بیرون از بازه نوار را خراب نمی‌کند.',
    ],
    related: ['usage-meter', 'stepper', 'status-dot'],
  },
  {
    slug: 'status-dot',
    name: 'StatusDot',
    title: 'نقطه‌ی وضعیت',
    category: 'foundations',
    summary: 'یک نقطه‌ی رنگی کوچک برای نشان دادن حال یک چیز: آماده، در حال کار، هشدار، خطا.',
    origin: 'own',
    file: 'ui/StatusDot.tsx',
    extraFiles: ['styles/ui.css'],
    importLine: "import { StatusDot, type Tone } from '@kit/ui';",
    whenToUse: [
      'کنار نام یک سرویس یا کارگر، برای نشان دادن اینکه سالم است یا نه.',
      'در فهرست‌ها که جا برای برچسب بلند نیست.',
      'حالت busy برای چیزی است که الان در حال اجراست، چون آرام ضربان می‌زند.',
    ],
    whenNot: [
      { text: 'رنگ تنها برای معنی کافی نیست؛ همیشه کنارش متن بنویسید.' },
      { text: 'برای پیام کامل درباره‌ی خطا از اعلان استفاده کنید.', see: 'states' },
    ],
    usage: `import { StatusDot } from '@kit/ui';

export function WorkerStatus() {
  return (
    <ul style={{ display: 'grid', gap: 8, listStyle: 'none', padding: 0 }}>
      <li><StatusDot tone="ok" /> سرور ارسال سالم است</li>
      <li><StatusDot tone="busy" /> در حال همگام‌سازی</li>
      <li><StatusDot tone="bad" /> اتصال قطع شد</li>
    </ul>
  );
}`,
    props: [
      {
        items: [
          { name: 'tone', type: "'ok' | 'busy' | 'warn' | 'bad' | 'info' | 'quiet'", required: true, desc: 'حال نقطه؛ busy ضربان می‌زند و warn همان رنگ است ولی ثابت.' },
        ],
      },
    ],
    a11y: [
      'نقطه aria-hidden است و فقط تزئینی حساب می‌شود؛ معنی را باید در متن کنارش گفت.',
      'ضربان حالت busy یک انیمیشن CSS است.',
    ],
    related: ['meter', 'agent-monitor', 'agent-queue'],
  },
  {
    slug: 'surface',
    name: 'Surface',
    title: 'سطح',
    category: 'foundations',
    summary: 'یک جعبه‌ی نرم با گوشه‌ی گرد و پس‌زمینه‌ی کم‌رنگ، بدون خط دور آن.',
    origin: 'own',
    file: 'ui/Surface.tsx',
    extraFiles: ['styles/ui.css'],
    importLine: "import { Surface } from '@kit/ui';",
    whenToUse: [
      'برای جدا کردن یک تکه از محتوا از پس‌زمینه، بدون خط دور.',
      'به‌عنوان کارت ساده برای متن، آمار یا فرم کوچک.',
      'وقتی تگ معنایی مناسب می‌خواهید: section یا article.',
    ],
    whenNot: [
      { text: 'اگر فقط یک عنوان و محتوای زیرش می‌خواهید، بخش با عنوان کافی است.', see: 'page-title' },
    ],
    usage: `import { Surface } from '@kit/ui';

export function Tip() {
  return (
    <Surface as="article">
      <b>نکته</b>
      <p>پیش‌نویس‌ها هر ده ثانیه خودکار ذخیره می‌شوند.</p>
    </Surface>
  );
}`,
    props: [
      {
        items: [
          { name: 'as', type: "'div' | 'section' | 'article'", default: "'div'", desc: 'تگ HTML که رندر می‌شود.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه که کنار surface گذاشته می‌شود.' },
          { name: 'children', type: 'ReactNode', desc: 'محتوای داخل سطح.' },
        ],
      },
    ],
    a11y: [
      'خودش نقش یا برچسبی اضافه نمی‌کند؛ معنی از تگ انتخاب‌شده (section یا article) می‌آید.',
    ],
    related: ['page-title', 'states', 'button'],
  },
  {
    slug: 'page-title',
    name: 'PageTitle',
    title: 'عنوان صفحه و بخش',
    category: 'foundations',
    summary: 'عنوان اصلی صفحه با توضیح کوتاه، و بخش‌هایی با عنوان که صفحه را مرتب تقسیم می‌کنند.',
    origin: 'own',
    file: 'ui/PageTitle.tsx',
    extraFiles: ['ui/Section.tsx', 'styles/ui.css'],
    importLine: "import { PageTitle, Section } from '@kit/ui';",
    whenToUse: [
      'در بالای هر صفحه یک PageTitle بگذارید و با intro بگویید این صفحه چیست و چه کاری می‌شود در آن کرد.',
      'برای تکه‌تکه کردن صفحه، هر بخش را در یک Section با عنوان بگذارید.',
      'aside کنار عنوان بخش جای مناسبی برای یک توضیح کوتاه یا دکمه است.',
    ],
    whenNot: [
      { text: 'برای جعبه‌ی بدون عنوان، فقط یک سطح کافی است.', see: 'surface' },
    ],
    usage: `import { PageTitle, Section, Surface } from '@kit/ui';

export function ReportsPage() {
  return (
    <>
      <PageTitle
        title="گزارش‌ها"
        summary="آمار هفته‌ی جاری"
        intro="اینجا می‌بینید کدام پست‌ها بازدید بیشتری گرفتند."
      />
      <Section title="پربازدیدها" aside="هفت روز اخیر" hint="پست‌ها بر اساس تعداد بازدید مرتب شده‌اند.">
        <Surface>۱۲ پست منتشر شد.</Surface>
      </Section>
    </>
  );
}`,
    props: [
      {
        component: 'PageTitle',
        items: [
          { name: 'title', type: 'string', required: true, desc: 'عنوان صفحه که در تگ h1 می‌آید.' },
          { name: 'summary', type: 'ReactNode', desc: 'یک خط خلاصه زیر عنوان.' },
          { name: 'intro', type: 'ReactNode', desc: 'یک جمله‌ی ساده در جعبه‌ی کوچک: این صفحه چیست و چه می‌شود کرد.' },
        ],
      },
      {
        component: 'Section',
        items: [
          { name: 'title', type: 'string', required: true, desc: 'عنوان بخش که در تگ h2 می‌آید.' },
          { name: 'aside', type: 'ReactNode', desc: 'متن یا دکمه‌ای کنار عنوان بخش.' },
          { name: 'hint', type: 'ReactNode', desc: 'یک خط توضیح زیر عنوان بخش.' },
          { name: 'children', type: 'ReactNode', desc: 'محتوای بخش.' },
        ],
      },
    ],
    a11y: [
      'PageTitle یک header با h1 است و Section یک section با h2؛ ساختار عنوان‌ها درست می‌ماند.',
      'نماد کنار intro تزئینی است و برای صفحه‌خوان خوانده نمی‌شود.',
      'ورود نرم intro با کاهش حرکت سیستم خاموش می‌شود.',
    ],
    related: ['surface', 'states'],
  },
  {
    slug: 'states',
    name: 'States',
    title: 'حالت‌های بارگذاری، خالی و خطا',
    category: 'foundations',
    summary: 'سه قطعه برای وقتی که داده هنوز نیامده، اصلاً نیست، یا نیامدن آن خطا بوده.',
    origin: 'own',
    file: 'ui/States.tsx',
    extraFiles: ['styles/states.css', 'styles/shimmer.css'],
    importLine: "import { Skeleton, EmptyState, Notice } from '@kit/ui';",
    whenToUse: [
      'Skeleton را هنگام بارگذاری یک فهرست یا صفحه نشان بدهید تا جای محتوا خالی نپرد.',
      'EmptyState را برای وقتی که چیزی ثبت نشده، با یک قدم بعدی در action.',
      'Notice را برای شکست بارگذاری و با onRetry دکمه‌ی «دوباره امتحان کن» بدهید.',
    ],
    whenNot: [
      { text: 'برای یک تکه‌ی کوچک مثل متن یا آواتار، بلوک درخشان انعطاف بیشتری دارد.', see: 'shimmer' },
      { text: 'پیام کوتاه بعد از یک کار (مثل «ذخیره شد») اعلان است، نه حالت صفحه.', see: 'toaster' },
    ],
    usage: `import { Skeleton, EmptyState, Notice, Button } from '@kit/ui';
import { FileText } from 'lucide-react';

type Props = { loading: boolean; failed: boolean; items: string[]; reload: () => void };

export function PostList({ loading, failed, items, reload }: Props) {
  if (loading) return <Skeleton rows={3} height={56} />;
  if (failed) return <Notice message="بارگذاری پست‌ها نشد" onRetry={reload} />;
  if (items.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="هنوز پستی نساخته‌اید"
        hint="اولین پست را بسازید تا اینجا دیده شود."
        action={<Button variant="primary">پست تازه</Button>}
      />
    );
  }
  return <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>;
}`,
    props: [
      {
        component: 'Skeleton',
        items: [
          { name: 'rows', type: 'number', default: '3', desc: 'تعداد بلوک‌های جای‌نگه‌دار.' },
          { name: 'height', type: 'number', default: '64', desc: 'ارتفاع هر بلوک به پیکسل.' },
        ],
      },
      {
        component: 'EmptyState',
        items: [
          { name: 'icon', type: 'LucideIcon', default: 'Inbox', desc: 'نماد بالای پیام؛ هر نماد lucide-react را می‌دهید.' },
          { name: 'title', type: 'string', required: true, desc: 'جمله‌ی اصلی، مثلاً «هنوز چیزی نیست».' },
          { name: 'hint', type: 'string', desc: 'یک خط توضیح زیر جمله‌ی اصلی.' },
          { name: 'action', type: 'ReactNode', desc: 'قدم بعدی، معمولاً یک دکمه.' },
        ],
      },
      {
        component: 'Notice',
        items: [
          { name: 'message', type: 'string', required: true, desc: 'متن خطا.' },
          { name: 'onRetry', type: '() => void', desc: 'اگر بدهید دکمه‌ی «دوباره امتحان کن» نشان داده می‌شود.' },
        ],
      },
    ],
    a11y: [
      'Skeleton نشان aria-busy و برچسب «در حال بارگذاری» دارد.',
      'Notice نقش alert دارد، پس خطا فوراً به صفحه‌خوان گفته می‌شود.',
      'نمادها aria-hidden هستند.',
      'درخشش Skeleton با کاهش حرکت سیستم خاموش می‌شود.',
    ],
    related: ['shimmer', 'button', 'toaster'],
  },
  {
    slug: 'confirm-row',
    name: 'ConfirmRow',
    title: 'ردیف تأیید',
    category: 'foundations',
    summary: 'یک ردیف «مطمئنی؟» با یک پرسش و دو دکمه، به‌جای ساختن تأیید دست‌ساز.',
    origin: 'own',
    file: 'ui/ConfirmRow.tsx',
    extraFiles: ['styles/confirm.css'],
    importLine: "import { ConfirmRow } from '@kit/ui';",
    whenToUse: [
      'پیش از کاری که برگشت ندارد، مثل حذف یا قطع اتصال.',
      'وقتی نمی‌خواهید برای یک پرسش ساده پنجره‌ی جدا باز کنید.',
      'با danger برای حذف‌ها که پرسش قرمز شود.',
    ],
    whenNot: [
      { text: 'برای کار پرخطر که توضیح و بررسی لازم دارد، کارت تأیید جزئیات بیشتری می‌دهد.', see: 'approval-card' },
      { text: 'اگر کار قابل برگشت است، بهتر است اعلان با دکمه‌ی «واگرد» نشان بدهید.', see: 'toaster' },
    ],
    usage: `import { useState } from 'react';
import { Button, ConfirmRow } from '@kit/ui';

export function DeleteRow() {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!asking) return <Button onClick={() => setAsking(true)}>حذف پروژه</Button>;
  return (
    <ConfirmRow
      question="پروژه‌ی «کمپین پاییز» برای همیشه حذف شود؟"
      confirmLabel="بله، حذف کن"
      danger
      busy={busy}
      label="تأیید حذف پروژه"
      onConfirm={() => { setBusy(true); setTimeout(() => setAsking(false), 800); }}
      onCancel={() => setAsking(false)}
    />
  );
}`,
    props: [
      {
        items: [
          { name: 'question', type: 'ReactNode', required: true, desc: 'پرسشی که کنار دکمه‌ها نشان داده می‌شود.' },
          { name: 'confirmLabel', type: 'string', required: true, desc: 'متن دکمه‌ی تأیید.' },
          { name: 'cancelLabel', type: 'string', default: "'بی‌خیال'", desc: 'متن دکمه‌ی انصراف.' },
          { name: 'onConfirm', type: '() => void', required: true, desc: 'با زدن دکمه‌ی تأیید صدا زده می‌شود.' },
          { name: 'onCancel', type: '() => void', required: true, desc: 'با زدن دکمه‌ی انصراف صدا زده می‌شود.' },
          { name: 'busy', type: 'boolean', default: 'false', desc: 'هر دو دکمه را غیرفعال می‌کند، مثلاً تا پایان درخواست.' },
          { name: 'danger', type: 'boolean', default: 'false', desc: 'پرسش را قرمز می‌کند؛ برای حذف.' },
          { name: 'label', type: 'string', desc: 'نام گروه برای صفحه‌خوان (aria-label).' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه که کنار cfr گذاشته می‌شود.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'Tab', action: 'بین دکمه‌ی تأیید و انصراف می‌رود (دکمه‌های native).' },
      { keys: 'Enter / Space', action: 'دکمه‌ی فوکوس‌شده را فعال می‌کند.' },
    ],
    a11y: [
      'ردیف نقش group دارد و با label نام می‌گیرد.',
      'دکمه‌ی تأیید در حالت busy، aria-busy می‌گیرد و هر دو دکمه غیرفعال می‌شوند.',
      'ورود ردیف با کاهش حرکت سیستم بدون انیمیشن است.',
    ],
    related: ['button', 'approval-card', 'toaster'],
  },
];
