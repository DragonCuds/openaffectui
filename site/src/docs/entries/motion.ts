import type { DocEntry } from '../types';

export const motion: DocEntry[] = [
  {
    slug: 'toaster',
    name: 'Toaster',
    title: 'اعلان',
    category: 'motion',
    summary: 'پشته‌ی اعلان‌های کوتاه که با تابع toast() از هر جای برنامه ساخته می‌شوند و با ماوس یا فوکوس باز می‌شوند.',
    origin: 'own',
    file: 'ui/Toaster.tsx',
    extraFiles: ['styles/toast.css'],
    importLine: "import { Toaster, toast } from '@kit/ui';",
    whenToUse: [
      'برای بازخورد کوتاه بعد از یک کار: «ذخیره شد»، «ارسال نشد».',
      'برای کار طولانی با toast.promise که خودش از «در حال انجام» به «موفق» یا «خطا» می‌رود.',
      'برای کار برگشت‌پذیر با دکمه‌ی «واگرد» داخل اعلان.',
      'با دادن id، یک اعلان را در جا به‌روز کنید (مثلاً پیشرفت مرحله‌ای).',
    ],
    whenNot: [
      { text: 'برای خطای ماندگار در همان صفحه، پیام خطا با دکمه‌ی تلاش دوباره بهتر است.', see: 'states' },
      { text: 'برای پرسش «مطمئنی؟» اعلان نگذارید.', see: 'confirm-row' },
    ],
    usage: `import { Toaster, toast, Button } from '@kit/ui';

// یک بار در ریشه‌ی برنامه
export function Root() {
  return (
    <>
      <Toaster position="bottom-center" />
      <App />
    </>
  );
}

function App() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button onClick={() => toast.success('ذخیره شد')}>ذخیره</Button>
      <Button
        onClick={() => toast('فایل به سطل آشغال رفت', {
          description: 'بودجه-۱۴۰۵.xlsx',
          action: { label: 'واگرد', onClick: () => toast.success('برگشت داده شد') },
        })}
      >
        حذف
      </Button>
      <Button
        onClick={() => toast.promise(
          new Promise<void>((ok) => setTimeout(ok, 2000)),
          { loading: 'در حال ارسال گزارش…', success: 'گزارش ارسال شد', error: 'ارسال نشد' },
        )}
      >
        ارسال
      </Button>
    </div>
  );
}`,
    props: [
      {
        component: 'Toaster',
        items: [
          { name: 'position', type: "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'", default: "'bottom-center'", desc: 'گوشه یا لبه‌ای که پشته آنجاست؛ start و end جهت صفحه را رعایت می‌کنند.' },
          { name: 'expand', type: 'boolean', default: 'false', desc: 'پشته را همیشه باز نگه می‌دارد، نه فقط با ماوس و فوکوس.' },
          { name: 'visibleToasts', type: 'number', default: '3', desc: 'تعداد اعلانی که هم‌زمان دیده می‌شود؛ بقیه منتظر می‌مانند.' },
          { name: 'gap', type: 'number', default: '10', desc: 'فاصله‌ی اعلان‌ها هنگام باز بودن پشته، به پیکسل.' },
          { name: 'offset', type: 'number', desc: 'فاصله از لبه‌ها به پیکسل؛ پیش‌فرض ۲۴ و در حالت inline برابر ۲۰.' },
          { name: 'inline', type: 'boolean', default: 'false', desc: 'به‌جای صفحه، داخل نزدیک‌ترین والد دارای position قرار می‌گیرد.' },
          { name: 'duration', type: 'number', default: '4000', desc: 'زمان پیش‌فرض ماندن اعلان به میلی‌ثانیه.' },
          { name: 'hairline', type: 'boolean', default: 'true', desc: 'خط باریک پایین اعلان که با زمان کم می‌شود.' },
          { name: 'closeButton', type: 'boolean', default: 'true', desc: 'دکمه‌ی بستن را نشان می‌دهد.' },
          { name: 'label', type: 'string', default: "'اعلان‌ها'", desc: 'نام ناحیه برای صفحه‌خوان؛ کلید میان‌بر به آن اضافه می‌شود.' },
          { name: 'hotkey', type: 'string | null', default: "'F8'", desc: 'کلیدی که فوکوس را روی جدیدترین اعلان می‌برد؛ null آن را خاموش می‌کند.' },
          { name: 'id', type: 'string', desc: 'فقط اعلان‌هایی را نشان می‌دهد که با { toaster: id } فرستاده شده‌اند؛ بدون id، اعلان‌های بدون toaster را.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه روی ناحیه.' },
          { name: 'closeLabel', type: 'string', default: "'بستن'", desc: 'نام دکمه‌ی بستن برای صفحه‌خوان.' },
          { name: 'dir', type: "'rtl' | 'ltr'", default: "'rtl'", desc: 'جهت نوشتار پشته.' },
        ],
      },
      {
        component: 'toast() options',
        items: [
          { name: 'id', type: 'string | number', desc: 'استفاده‌ی دوباره از id همان اعلان را در جا به‌روز می‌کند؛ زمان از نو شروع می‌شود.' },
          { name: 'description', type: 'ReactNode', desc: 'متن توضیح زیر عنوان.' },
          { name: 'action', type: '{ label: ReactNode; onClick?: (event) => void }', desc: 'دکمه‌ی داخل اعلان؛ بعد از زدن اعلان بسته می‌شود مگر event.preventDefault() صدا زده شود.' },
          { name: 'duration', type: 'number', desc: 'زمان ماندن به میلی‌ثانیه؛ Infinity آن را باز نگه می‌دارد.' },
          { name: 'icon', type: 'ReactNode | false', desc: 'نماد دلخواه؛ false نماد را پنهان می‌کند.' },
          { name: 'toaster', type: 'string', desc: 'اعلان را به Toaster با همین id می‌فرستد.' },
          { name: 'onDismiss', type: '(id: string | number) => void', desc: 'وقتی اعلان بسته شد صدا زده می‌شود.' },
        ],
      },
      {
        component: 'toast.promise() messages',
        items: [
          { name: 'loading', type: 'ReactNode', required: true, desc: 'عنوان تا وقتی وعده تمام نشده.' },
          { name: 'success', type: 'ReactNode | { title; description? } | (value) => ...', desc: 'پیام موفقیت؛ می‌تواند تابعی از نتیجه باشد.' },
          { name: 'error', type: 'ReactNode | { title; description? } | (error) => ...', desc: 'پیام خطا؛ اگر ندهید از متن خود خطا استفاده می‌شود.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'F8', action: 'فوکوس را روی جدیدترین اعلان می‌برد (با hotkey قابل تغییر است).' },
      { keys: 'Escape', action: 'از اعلان بیرون می‌آید و فوکوس را به جای قبلی برمی‌گرداند.' },
    ],
    a11y: [
      'ناحیه aria-live=polite دارد و تازه‌ها و تغییر متن خوانده می‌شود.',
      'اعلان خطا نقش alert دارد و دیرتر بسته می‌شود (دست‌کم ۶ ثانیه).',
      'تا وقتی ماوس یا فوکوس روی پشته است، یا زبانه پنهان است، زمان اعلان‌ها می‌ایستد.',
      'دکمه‌ی بستن برچسب دارد؛ اعلان‌های پشت سر inert هستند.',
      'انیمیشن‌ها با کاهش حرکت سیستم خاموش می‌شوند.',
    ],
    responsive: [
      'زیر ۶۰۰ پیکسل، پشته تمام‌عرض می‌شود با فاصله‌ی ۱۲ پیکسل از لبه‌ها.',
      'روی صفحه‌ی لمسی با یک ضربه باز می‌شود و دکمه‌ی بستن همیشه دیده می‌شود.',
    ],
    related: ['states', 'confirm-row', 'blur-swap'],
  },
  {
    slug: 'blur-swap',
    name: 'BlurSwap',
    title: 'تعویض نرم محتوا',
    category: 'motion',
    summary: 'وقتی محتوا عوض می‌شود، قدیمی محو می‌شود، تازه واضح می‌شود و جعبه نرم به اندازه‌ی جدید می‌رسد.',
    origin: 'own',
    file: 'ui/BlurSwap.tsx',
    extraFiles: ['styles/blurswap.css'],
    importLine: "import { BlurSwap, BlurCrossfade } from '@kit/ui';",
    whenToUse: [
      'برای عوض کردن متن یا کارت با تب، که ارتفاع آن‌ها فرق دارد.',
      'برای یک کلمه‌ی وسط جمله (با as و morph).',
      'برای مرحله‌به‌مرحله که هر مرحله متن دیگری دارد.',
    ],
    whenNot: [
      { text: 'برای عدد که رقم‌به‌رقم می‌چرخد، عدد غلتان طبیعی‌تر است.', see: 'rolling-number' },
      { text: 'برای حالت بارگذاری، درخشش بهتر است.', see: 'shimmer' },
    ],
    usage: `import { useState } from 'react';
import { BlurSwap, Segmented, Surface } from '@kit/ui';

const TABS = [
  { value: 'a', label: 'امروز' },
  { value: 'b', label: 'هفته' },
];

const BODY: Record<string, string> = {
  a: 'امروز سه پست منتشر شد.',
  b: 'این هفته چهارده پست زمان‌بندی شده و دو مورد منتظر تأییدند.',
};

export function Tabs() {
  const [tab, setTab] = useState('a');
  return (
    <>
      <Segmented label="بازه" value={tab} options={TABS} onChange={setTab} />
      <BlurSwap id={tab}>
        <Surface>{BODY[tab]}</Surface>
      </BlurSwap>
    </>
  );
}`,
    props: [
      {
        component: 'BlurSwap',
        items: [
          { name: 'id', type: 'string | number', required: true, desc: 'کلید محتوای فعلی؛ عوض شدنش تعویض را شروع می‌کند.' },
          { name: 'children', type: 'ReactNode', desc: 'محتوایی که نشان داده می‌شود.' },
          { name: 'morph', type: "'height' | 'both' | 'none'", default: "'height'", desc: 'کدام بعد جعبه به اندازه‌ی جدید می‌لغزد؛ both عرض را هم می‌گیرد.' },
          { name: 'blur', type: 'number', default: '10', desc: 'میزان تاری در دو سر محو شدن، به پیکسل.' },
          { name: 'duration', type: 'number', default: '420', desc: 'طول تعویض و تغییر اندازه، به میلی‌ثانیه.' },
          { name: 'as', type: "'div' | 'span'", default: "'div'", desc: 'تگ ریشه؛ برای محتوای درون‌خطی span بگذارید.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه که کنار blurswap گذاشته می‌شود.' },
        ],
      },
      {
        component: 'BlurCrossfade',
        items: [
          { name: '(همان props)', type: 'BlurSwapProps', desc: 'همان BlurSwap است با نام دیگر؛ هر دو یکی هستند.' },
        ],
      },
    ],
    a11y: [
      'نسخه‌ی در حال رفتن aria-hidden و inert است، پس صفحه‌خوان و کیبورد فقط محتوای جدید را می‌بینند.',
      'با کاهش حرکت سیستم، محتوا بدون انیمیشن عوض می‌شود.',
      'برای تغییر وضعیتی که باید اعلام شود، خودتان aria-live بگذارید.',
    ],
    related: ['rolling-number', 'shimmer', 'segmented'],
  },
  {
    slug: 'shimmer',
    name: 'Shimmer',
    title: 'درخشش بارگذاری',
    category: 'motion',
    summary: 'بلوک‌های جای‌نگه‌دار با یک موج روشن که روی همه‌ی آن‌ها هم‌زمان می‌گذرد، و متنی که نور از میان حرف‌هایش رد می‌شود.',
    origin: 'mit',
    file: 'ui/Shimmer.tsx',
    extraFiles: ['styles/shimmer.css'],
    importLine: "import { ShimmerBlock, ShimmerText } from '@kit/ui';",
    whenToUse: [
      'ShimmerBlock برای شکل محتوایی که هنوز نیامده: متن، عکس، آواتار.',
      'ShimmerText برای برچسب «در حال فکر کردن…» یا هر متن وضعیت.',
      'همه‌ی بلوک‌های صفحه یک موج مشترک دارند، پس کنار هم هماهنگ می‌مانند.',
    ],
    whenNot: [
      { text: 'برای یک فهرست آماده از چند بلوک هم‌اندازه، اسکلت بارگذاری خودش را دارد.', see: 'states' },
      { text: 'برای مرحله‌های یک کار هوش مصنوعی، لودر فکر کردن آماده است.', see: 'thinking-loader' },
    ],
    usage: `import { ShimmerBlock, ShimmerText } from '@kit/ui';

export function ProfileLoading() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ShimmerBlock circle width={44} />
        <div style={{ flex: 1, display: 'grid', gap: 8 }}>
          <ShimmerBlock width="40%" height={14} />
          <ShimmerBlock width="70%" height={10} />
        </div>
      </div>
      <ShimmerBlock height={10} />
      <ShimmerBlock width="55%" height={10} />
      <ShimmerText duration={2.4}>در حال خواندن گزارش…</ShimmerText>
    </div>
  );
}`,
    props: [
      {
        component: 'ShimmerBlock',
        items: [
          { name: 'width', type: 'number | string', desc: 'عرض؛ عدد یعنی پیکسل. پیش‌فرض ۱۰۰٪ است.' },
          { name: 'height', type: 'number | string', desc: 'ارتفاع؛ عدد یعنی پیکسل. پیش‌فرض ۱۲ پیکسل است.' },
          { name: 'radius', type: 'number | string', desc: 'گردی گوشه‌ها. پیش‌فرض ۶ پیکسل است.' },
          { name: 'circle', type: 'boolean', desc: 'شکل دایره، مثلاً برای آواتار؛ ارتفاع برابر width می‌شود.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه کنار ui-shm.' },
          { name: 'style', type: 'CSSProperties', desc: 'استایل اضافه.' },
        ],
      },
      {
        component: 'ShimmerText',
        items: [
          { name: 'children', type: 'ReactNode', required: true, desc: 'متنی که درخشش از آن رد می‌شود.' },
          { name: 'duration', type: 'number', default: '2', desc: 'مدت یک بار رد شدن نور، به ثانیه.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه کنار ui-shm-text.' },
        ],
      },
    ],
    a11y: [
      'ShimmerBlock تزئینی و aria-hidden است؛ اگر بارگذاری را باید اعلام کرد، خودتان aria-busy یا متن وضعیت بگذارید.',
      'ShimmerText متن واقعی است و صفحه‌خوان آن را می‌خواند.',
      'با کاهش حرکت سیستم، موج خاموش می‌شود و متن رنگ عادی می‌گیرد.',
    ],
    related: ['states', 'thinking-loader', 'blur-swap'],
  },
  {
    slug: 'rolling-number',
    name: 'RollingNumber',
    title: 'عدد غلتان',
    category: 'motion',
    summary: 'عددی که وقتی مقدارش عوض می‌شود، هر رقم جداگانه مثل کیلومتر‌شمار می‌غلتد.',
    origin: 'own',
    file: 'ui/RollingNumber.tsx',
    extraFiles: ['styles/ui.css'],
    importLine: "import { RollingNumber } from '@kit/ui';",
    whenToUse: [
      'برای آمار زنده که عوض می‌شود، مثل تعداد بازدید یا موجودی.',
      'در عنوان کارت که می‌خواهید تغییر عدد دیده شود.',
      'با format دلخواه، برای پول، درصد یا واحد.',
    ],
    whenNot: [
      { text: 'برای عوض کردن متن یا جمله، تعویض نرم مناسب است.', see: 'blur-swap' },
      { text: 'برای نمودار یا سهم بخش‌ها از کل، تفکیک فشرده خودش اعداد را می‌غلتاند.', see: 'compact-breakdown' },
    ],
    usage: `import { useState } from 'react';
import { Button, RollingNumber } from '@kit/ui';

export function Counter() {
  const [n, setN] = useState(1240);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <b style={{ fontSize: 32 }}>
        <RollingNumber value={n} />
      </b>
      <Button onClick={() => setN((v) => v + 37)}>سفارش تازه</Button>
      <Button onClick={() => setN((v) => Math.max(0, v - 37))}>برگشت</Button>
    </div>
  );
}`,
    props: [
      {
        items: [
          { name: 'value', type: 'number', required: true, desc: 'عددی که نشان داده می‌شود.' },
          { name: 'format', type: '(n: number) => string', default: 'faNum', desc: 'قالب متن؛ پیش‌فرض ارقام فارسی با جداکننده‌ی هزارگان است. ارقام لاتین هم می‌غلتند.' },
        ],
      },
    ],
    a11y: [
      'ریشه نقش img دارد و aria-label آن کل عدد قالب‌بندی‌شده است، پس صفحه‌خوان یک عدد کامل می‌خواند.',
      'ستون رقم‌ها aria-hidden هستند.',
      'عدد همیشه چپ‌به‌راست چیده می‌شود تا ترتیب ارقام در صفحه‌ی راست‌به‌چپ بهم نخورد.',
    ],
    related: ['blur-swap', 'compact-breakdown', 'kpi-chart'],
  },
];
