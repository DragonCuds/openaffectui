import type { DocPage } from './types';

export const pages: DocPage[] = [
  {
    slug: 'introduction',
    title: 'معرفی',
    summary: 'کیت مشترکِ کامپوننت‌های پنل‌های accsess و Diddash، فارسی و راست‌چین از پایه.',
    blocks: [
      {
        h: 'این کیت چیست؟',
        p: 'یک مجموعه کامپوننت React که دو پنل ما، یعنی accsess و Diddash، با هم استفاده می‌کنند. هر چیزی که در هر دو پنل لازم شد، یک بار اینجا ساخته می‌شود و دیگر کپی نمی‌شود.',
      },
      {
        p: 'اصل‌های کیت:',
        list: [
          'فارسی و راست‌چین اول؛ متن، عدد و تاریخ شمسی از همان ابتدا درست کار می‌کنند.',
          'هم تیره و هم روشن؛ رنگ‌ها از توکن‌های خود پنل می‌آیند.',
          'بدون کادر یک‌پیکسلی؛ جدا کردن بخش‌ها با سطح، سایه و فاصله انجام می‌شود.',
          'هر کامپوننت یک فایل tsx و یک فایل css دارد؛ جز react و lucide-react به هیچ بسته‌ی دیگری وابسته نیست.',
          'حرکت‌ها با تنظیم «کاهش حرکت» سیستم آرام می‌شوند و همه‌چیز با صفحه‌کلید قابل استفاده است.',
        ],
      },
      {
        h: 'دسته‌بندی کامپوننت‌ها',
        p: 'کامپوننت‌ها در شش دسته چیده شده‌اند:',
        list: [
          'پایه: دکمه، سطح، نوار پیشرفت و حالت‌های خالی و بارگذاری.',
          'ایجنت‌ها: تأیید، صف، پایش، سابقه و خلاصه‌ی کارهای یک عامل هوشمند.',
          'گفت‌وگو و پاسخ: ورودی گفت‌وگو، ابزارهای زیر پیام، کارت ابزار و نمایش تغییر متن.',
          'داده و نمودار: نمودار شاخص، تفکیک مصرف، خلاصه‌ی تغییرها و بازه‌ی تاریخ شمسی.',
          'فرم و فروش: کد یک‌بارمصرف، مراحل ثبت‌نام و جدول قیمت.',
          'حرکت و بازخورد: اعلان، تعویض نرم محتوا، درخشش بارگذاری و عدد غلتان.',
        ],
      },
      {
        h: 'صفحه‌ی هر کامپوننت را چطور بخوانیم؟',
        p: 'همه‌ی صفحه‌های کامپوننت یک ترتیب دارند، پس جای هر چیز را زود یاد می‌گیرید:',
        list: [
          'پیش‌نمایش: کامپوننت زنده، همان‌طور که در پنل دیده می‌شود.',
          'کد: یک نمونه‌ی کوتاه که می‌شود کپی کرد و اجرا کرد.',
          'نصب: خط import دقیقی که پنل می‌نویسد، و فایل‌های منبع.',
          'کِی استفاده کنیم: کارهایی که کامپوننت برایشان ساخته شده، و جایی که بهتر است سراغ چیز دیگری بروید.',
          'ویژگی‌ها (props): نام، نوع، مقدار پیش‌فرض و یک جمله توضیح.',
          'صفحه‌کلید: کلیدهایی که کامپوننت می‌شناسد.',
          'دسترس‌پذیری: نقش‌ها و اعلان‌هایی که برای صفحه‌خوان‌ها گذاشته‌ایم.',
        ],
      },
      {
        h: 'مجوز',
        p: 'کامپوننت‌های رایگانِ affectUI با مجوز MIT و با همان نوشته‌ی مجوزشان به این کیت آمده‌اند. بقیه را خودمان از صفر نوشته‌ایم و فقط رفتارِ عمومی و دیدنیِ آن‌ها را الگو گرفته‌ایم. در صفحه‌ی هر کامپوننت پیداست که از کدام دسته است.',
      },
    ],
  },
  {
    slug: 'installation',
    title: 'نصب',
    summary: 'کیت را کنار برنامه می‌گذاریم و با یک alias در Vite و TypeScript وصلش می‌کنیم.',
    blocks: [
      {
        h: '۱. جای پوشه',
        p: 'کیت بسته‌ی npm نیست. ریپو را کنار پوشه‌ی برنامه clone کنید تا مسیر نسبی ../openaffectui/src از برنامه به آن برسد: git clone https://github.com/DragonCuds/openaffectui',
        code: `projects/
  openaffectui/
    src/
      ui/        # components (.tsx)
      styles/    # css, ui.css imports all
  my-panel/
    src/
    vite.config.ts
    tsconfig.json`,
        lang: 'bash',
      },
      {
        h: '۲. alias در Vite',
        p: 'نام @kit را به پوشه‌ی src کیت وصل کنید. بخش dedupe مهم است: کیت نباید نسخه‌ی خودش از react و lucide-react را بیاورد، چون دو نسخه‌ی React در یک صفحه خطا می‌دهد.',
        code: `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@kit': new URL('../openaffectui/src', import.meta.url).pathname },
    dedupe: ['react', 'react-dom', 'lucide-react'],
  },
});`,
        lang: 'ts',
      },
      {
        h: '۳. مسیرها در tsconfig',
        p: 'همان alias را به TypeScript هم بگویید و پوشه‌ی کیت را در include بیاورید. چون فایل‌های کیت بیرون از برنامه‌اند، react و lucide-react را هم به node_modules خود برنامه اشاره دهید تا تایپ‌ها از همان‌جا خوانده شوند.',
        code: `// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@kit/*": ["../openaffectui/src/*"],
      "lucide-react": ["./node_modules/lucide-react/dist/lucide-react.d.ts"],
      "react": ["./node_modules/@types/react"],
      "react/*": ["./node_modules/@types/react/*"],
      "react-dom": ["./node_modules/@types/react-dom"],
      "react-dom/*": ["./node_modules/@types/react-dom/*"]
    }
  },
  "include": ["src", "../openaffectui/src"]
}`,
        lang: 'json',
      },
      {
        h: '۴. بسته‌ها و فونت',
        p: 'کیت وابستگی خودش را ندارد. react و lucide-react را خود برنامه نصب می‌کند، و فونت وزیرمتن را هم همین‌جا.',
        code: `npm install react react-dom lucide-react
npm install @fontsource-variable/vazirmatn`,
        lang: 'bash',
      },
      {
        h: '۵. استایل و توکن‌ها',
        p: 'کیت رنگ ندارد؛ رنگ‌ها را از توکن‌های پنل می‌گیرد. پس هر پنل فایل tokens.css خودش را می‌آورد (راهنمای «تم و رنگ»). فایل ui.css کیت را بعد از توکن‌ها import کنید. اگر پنل یک base.css دارد، آن را هم پیش از ui.css بیاورید.',
        code: `// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/vazirmatn/index.css';
import './styles/tokens.css';
import './styles/base.css';
import '@kit/styles/ui.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);`,
        lang: 'tsx',
      },
      {
        p: 'برای راست‌چین شدن، روی تگ html بنویسید:',
        code: `<html lang="fa" dir="rtl">`,
        lang: 'html',
      },
      {
        h: '۶. اولین import',
        p: 'همه‌ی کامپوننت‌ها از یک نقطه‌ی ورود می‌آیند.',
        code: `import { Button, Surface, PageTitle } from '@kit/ui';

export function Hello() {
  return (
    <Surface>
      <PageTitle title="سلام" />
      <Button variant="primary">شروع</Button>
    </Surface>
  );
}`,
        lang: 'tsx',
      },
    ],
  },
  {
    slug: 'theming',
    title: 'تم و رنگ',
    summary: 'رنگ و اندازه‌ها از توکن‌های css پنل می‌آیند؛ با عوض کردن آن‌ها همه‌ی کامپوننت‌ها هماهنگ عوض می‌شوند.',
    blocks: [
      {
        h: 'توکن‌ها از کجا می‌آیند؟',
        p: 'کیت هیچ رنگ ثابتی ندارد. هر کامپوننت فقط به متغیرهای css اشاره می‌کند و مقدارشان را فایل tokens.css پنل می‌دهد. توکن‌های زیر را هر پنل باید تعریف کند.',
      },
      {
        h: 'رنگ‌ها',
        list: [
          '--bg: پس‌زمینه‌ی کل صفحه.',
          '--panel: سطح اصلی؛ کارت‌ها و پنجره‌ها روی آن می‌نشینند.',
          '--soft: سطح ملایم‌تر برای دکمه‌ی ساده، کارت تو در تو و جاهای فشرده.',
          '--soft-2: یک پله پررنگ‌تر از soft؛ حالت hover و ردِ نوار پیشرفت.',
          '--text: رنگ متن اصلی.',
          '--muted: متن کم‌اهمیت‌تر، مثل توضیح و برچسب.',
          '--primary: رنگ دکمه‌ی اصلی و تأکید.',
          '--on-primary: رنگ متن روی primary.',
          '--ok: وضعیت موفق.',
          '--busy: وضعیت در حال انجام یا هشدار.',
          '--bad: وضعیت خطا یا کار خطرناک.',
          '--ring: رنگ حلقه‌ی فوکوس صفحه‌کلید.',
          '--shadow-sm: سایه‌ی کوچک زیر سطح‌های بالاآمده؛ در تم تیره می‌تواند none باشد.',
        ],
      },
      {
        h: 'اندازه، فونت و حرکت',
        list: [
          '--radius-card: گردی گوشه‌ی کارت و سطح.',
          '--radius-panel: گردی گوشه‌ی پنل‌های بزرگ‌تر.',
          '--font: خانواده‌ی فونت؛ پیش‌فرض Vazirmatn Variable است.',
          '--s1 تا --s6: فاصله‌ها از ۴ تا ۳۲ پیکسل.',
          '--fs-sm، --fs-md، --fs-lg، --fs-xl: اندازه‌ی متن، از ریز تا عنوان صفحه.',
          '--ease: منحنی نرم حرکت که همه‌ی انیمیشن‌ها از آن استفاده می‌کنند.',
        ],
      },
      {
        h: 'تیره و روشن',
        p: 'تم روشن مقدار پیش‌فرض روی :root است. برای تیره کردن، ویژگی data-theme را روی تگ html بگذارید. فایل tokens.css یک بلوک جدا برای این حالت دارد و فقط مقدارهای رنگ را عوض می‌کند.',
        code: `// toggle the theme
document.documentElement.dataset.theme = 'dark';   // dark
delete document.documentElement.dataset.theme;     // back to light`,
        lang: 'ts',
      },
      {
        h: 'تنظیم‌های اختیاری هر پنل',
        p: 'سه متغیر دیگر هست که لازم نیست تعریف شود. اگر نباشند، کیت از مقدار پیش‌فرض‌اش استفاده می‌کند.',
        list: [
          '--meter-fill: رنگ پرشدگی نوار پیشرفت. پیش‌فرض: var(--text).',
          '--meter-opacity: شفافیت همان پرشدگی. پیش‌فرض: 0.8.',
          '--info: رنگ نقطه‌ی «اطلاع». پیش‌فرض: var(--muted).',
        ],
      },
      {
        h: 'نمونه: رنگ برند و تم تیره',
        p: 'این مثال یک پنل را آبی می‌کند. نوار پیشرفت هم همین رنگ را می‌گیرد و رنگ اطلاع جدا می‌شود. نکته: بعد از عوض کردن رنگ‌ها، تضاد متن و پس‌زمینه را خودتان یک بار بسنجید.',
        code: `/* tokens.css */
:root {
  --primary: #2459d6;
  --on-primary: #ffffff;
  --meter-fill: var(--primary);
  --meter-opacity: 1;
  --info: #3b82c4;
}

:root[data-theme='dark'] {
  --primary: #7aa2ff;
  --on-primary: #0c0c0d;
}`,
        lang: 'css',
      },
    ],
  },
  {
    slug: 'accessibility',
    title: 'دسترس‌پذیری',
    summary: 'صفحه‌کلید، حلقه‌ی فوکوس، اعلان برای صفحه‌خوان و حرکت آرام؛ فقط چیزهایی که در کد هست.',
    blocks: [
      {
        h: 'صفحه‌کلید',
        p: 'هر چیزی که با ماوس کار می‌کند باید با صفحه‌کلید هم کار کند. دکمه‌ها دکمه‌ی واقعی‌اند. کامپوننت‌های پیچیده‌تر هم کلیدهای خودشان را دارند و در بخش «صفحه‌کلید» صفحه‌ی همان کامپوننت نوشته شده‌اند. برای نمونه ChatComposer یک combobox با listbox دارد و DateRangePicker یک grid با سطر و سلول.',
      },
      {
        h: 'حلقه‌ی فوکوس',
        p: 'فوکوس فقط وقتی دیده می‌شود که با صفحه‌کلید آمده باشد؛ با کلیک ماوس حلقه‌ای نمی‌پرد. این کار با :focus-visible انجام می‌شود، و رنگ حلقه از توکن --ring می‌آید. بیشتر فایل‌های css کیت برای کنترل‌های خودشان همین سلکتور را دارند.',
        code: `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
:focus:not(:focus-visible) { outline: none; }`,
        lang: 'css',
      },
      {
        h: 'اعلان برای صفحه‌خوان',
        p: 'جاهایی که چیزی بدون عوض شدن فوکوس تغییر می‌کند، یک ناحیه‌ی aria-live دارند تا صفحه‌خوان آن را بخواند:',
        list: [
          'ThinkingLoader با role="status" و aria-live="polite".',
          'AgentQueue، AgentRecap، DateRangePicker، CompactBreakdown و MessageActions یک متن مخفیِ aria-live="polite" دارند.',
          'AgentMonitor و KpiChart در بخش وضعیت و مقدار انتخاب‌شده aria-live="polite" دارند.',
          'AutonomyDial فهرست کارهای خودکار را در یک متن مخفی اعلام می‌کند.',
        ],
      },
      {
        h: 'نقش‌ها',
        p: 'کنترل‌های سفارشی نقش درست دارند، پس نیازی نیست خودتان چیزی اضافه کنید:',
        list: [
          'Meter نقش meter و مقدار کمینه، بیشینه و فعلی را دارد.',
          'RollingNumber نقش img دارد و عدد کامل در aria-label می‌آید، نه تک‌تک رقم‌ها.',
          'AutonomyDial و بخش جابه‌جایی CompactBreakdown نقش radiogroup و radio دارند.',
          'DateRangePicker پنجره‌ی خودش را با role="dialog" و برچسب فارسی باز می‌کند.',
          'نمودارها و نشانه‌های تصویری، مثل صف و هزینه‌ی پایش، با role="img" و یک aria-label خلاصه می‌آیند.',
        ],
      },
      {
        h: 'کاهش حرکت',
        p: 'اگر کاربر در سیستم «کاهش حرکت» را روشن کرده باشد، انیمیشن‌ها باید کم یا حذف شوند. دو لایه برای این هست: اول قاعده‌ی کلی در base.css پنل که زمان همه‌ی انیمیشن و transition را تقریباً صفر می‌کند؛ دوم خود کامپوننت‌ها که در css شان @media (prefers-reduced-motion: reduce) دارند و بعضی در جاوااسکریپت هم این تنظیم را می‌خوانند.',
        code: `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    transition-delay: 0s !important;
  }
}`,
        lang: 'css',
      },
      {
        h: 'تضاد رنگ',
        p: 'کیت رنگ خودش را ندارد، پس تضاد هم به توکن‌های شما بستگی دارد. متن اصلی (--text) و متن کم‌اهمیت (--muted) روی سطح‌های --panel و --soft نشسته‌اند. وقتی توکن‌ها را عوض می‌کنید، هر دو تم را بسنجید و --muted را آن‌قدر کمرنگ نکنید که خواندنش سخت شود.',
      },
    ],
  },
  {
    slug: 'rtl',
    title: 'فارسی و راست‌چین',
    summary: 'ویژگی‌های منطقی css، رقم و تاریخ فارسی، و متن انگلیسی لابه‌لای فارسی.',
    blocks: [
      {
        h: 'ویژگی‌های منطقی css',
        p: 'کیت به جای left و right از ویژگی‌های منطقی استفاده می‌کند: inline برای جهت نوشتن و block برای بالا و پایین. با این کار همان css هم در راست‌چین و هم در چپ‌چین درست می‌چیند و برای هر جهت کد جدا لازم نیست.',
        list: [
          'padding-inline، margin-inline و margin-block به جای padding چپ و راست.',
          'inset-inline-start به جای left یا right؛ مثلاً دستگیره‌ی Segmented همین‌طور جابه‌جا می‌شود.',
          'max-inline-size و margin-block-end به جای max-width و margin-bottom.',
        ],
        code: `.my-card {
  padding-inline: var(--s4);
  margin-block-end: var(--s5);
  max-inline-size: 62ch;
}`,
        lang: 'css',
      },
      {
        h: 'رقم فارسی',
        p: 'فایل digits.ts تابع faNum را دارد که عدد را با رقم و جداکننده‌ی فارسی می‌نویسد. کامپوننت‌های کیت همه عددهایشان را همین‌طور نشان می‌دهند. این فایل از نقطه‌ی ورود اصلی بیرون نیامده و از مسیر خودش import می‌شود.',
        code: `import { faNum } from '@kit/ui/digits';

faNum(1250000); // "۱٬۲۵۰٬۰۰۰"`,
        lang: 'ts',
      },
      {
        h: 'تاریخ شمسی',
        p: 'فایل jalali.ts تبدیل شمسی و میلادی را بدون هیچ بسته‌ای انجام می‌کند. تابع‌های زیر که با Date کار می‌کنند از نقطه‌ی ورود اصلی هم در دسترس‌اند. هفته از شنبه شروع می‌شود.',
        list: [
          'toJalali(date): یک Date را به سال، ماه و روز شمسی تبدیل می‌کند.',
          'toGregorian(jy, jm, jd): برعکس، یک Date می‌دهد.',
          'jalaliMonthLength(jy, jm): تعداد روزهای یک ماه شمسی.',
          'formatJalali(date): تاریخ را به شکل «۱۴۰۵/۰۸/۱۲» می‌نویسد.',
          'از مسیر @kit/ui/jalali این‌ها را هم می‌گیرید: JALALI_MONTHS، WEEKDAYS_LONG، WEEKDAYS_SHORT، isJalaliLeap و faPlain.',
        ],
        code: `import { formatJalali, toJalali } from '@kit/ui';
import { JALALI_MONTHS } from '@kit/ui/jalali';

const d = new Date();
formatJalali(d);                         // e.g. "۱۴۰۵/۰۸/۱۲"
const { jy, jm, jd } = toJalali(d);
const label = jd + ' ' + JALALI_MONTHS[jm - 1] + ' ' + jy;`,
        lang: 'ts',
      },
      {
        h: 'متن انگلیسی لابه‌لای فارسی',
        p: 'کد، آدرس و عدد ساعت باید همیشه چپ‌به‌راست بمانند، حتی در صفحه‌ی راست‌چین. کیت برای هر مورد از یک راه استفاده می‌کند:',
        list: [
          'متن‌هایی که کاربر می‌نویسد و زبانشان معلوم نیست (عنوان‌ها، خلاصه‌ها، متن InlineDiff) dir="auto" دارند؛ مرورگر از اولین حرف جهت را می‌فهمد.',
          'فرمان‌ها و ساعت در AgentMonitor با dir="ltr" می‌آیند.',
          'RollingNumber با direction: ltr و unicode-bidi: isolate عدد غلتان را از متن اطراف جدا می‌کند.',
          'ChatComposer جهت صفحه را از css می‌خواند (getComputedStyle) و با آن، جهت منوی مدل و فلش ارسال را می‌چیند.',
        ],
      },
      {
        h: 'فونت',
        p: 'فونت پیش‌فرض وزیرمتن است. بسته‌ی @fontsource-variable/vazirmatn را import کنید و توکن --font را به همان نام بدهید. وزیرمتن متغیر است، پس یک فایل همه‌ی وزن‌ها را پوشش می‌دهد. برای هماهنگی عددها، body را با font-variant-numeric: tabular-nums بگذارید تا رقم‌ها هم‌عرض باشند.',
        code: `:root {
  --font: 'Vazirmatn Variable', system-ui, sans-serif;
}
body {
  font-family: var(--font);
  font-variant-numeric: tabular-nums;
}`,
        lang: 'css',
      },
    ],
  },
];
