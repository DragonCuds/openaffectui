import type { DocEntry } from '../types';

export const data: DocEntry[] = [
  {
    slug: 'change-summary',
    name: 'ChangeSummary',
    title: 'خلاصه‌ی تغییرها',
    category: 'data',
    summary: 'فهرست کوتاه از اینکه از دفعه‌ی قبل چه چیزهایی عوض شده، هر شاخص در یک ردیف با فلش رنگی.',
    origin: 'mit',
    file: 'ui/ChangeSummary.tsx',
    extraFiles: ['styles/change.css'],
    importLine: "import { ChangeSummary, type MetricChange } from '@kit/ui';",
    whenToUse: [
      'در بالای گزارش هفتگی یا ماهانه، برای گفتن «چه چیزی تکان خورد» با زبان ساده.',
      'وقتی چند شاخص دارید و برای هر کدام یک جمله‌ی آماده کافی است.',
      'برای نشان دادن خوب یا بد بودن تغییر با رنگ، مستقل از بالا یا پایین رفتن عدد.',
    ],
    whenNot: [
      { text: 'اگر روند در طول زمان مهم است، نمودار شاخص بهتر است.', see: 'kpi-chart' },
      { text: 'برای تفکیک یک عدد کل به بخش‌ها، تفکیک فشرده مناسب‌تر است.', see: 'compact-breakdown' },
    ],
    usage: `import { ChangeSummary } from '@kit/ui';

export function WeeklyChanges() {
  return (
    <ChangeSummary
      period="این هفته"
      changes={[
        { label: 'کلیک از گوگل', change: '۱۷٪ بیشتر شد، رسید به ۴۰۰ کلیک', tone: 'good' },
        { label: 'رتبه‌ی عبارت اصلی', change: 'از ۱۲ آمد به ۷', tone: 'good' },
        { label: 'زمان بارگذاری', change: '۰٫۱ ثانیه کندتر شد', tone: 'bad', direction: 'up' },
        { label: 'صفحه‌های بررسی‌شده', change: 'تغییری نکرد', tone: 'neutral' },
      ]}
    />
  );
}`,
    props: [
      {
        component: 'ChangeSummary',
        items: [
          { name: 'changes', type: 'MetricChange[]', required: true, desc: 'ردیف‌ها؛ اگر خالی باشد پیام «هنوز تغییری ثبت نشده است.» می‌آید.' },
          { name: 'title', type: 'string', default: "'چه چیزی عوض شد'", desc: 'عنوان بالای کارت.' },
          { name: 'period', type: 'string', desc: 'متن کوچک آخر عنوان، مثل «این هفته».' },
          { name: 'icon', type: 'ReactNode', desc: 'نماد کنار عنوان؛ پیش‌فرض یک نماد داخلی است.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه روی ریشه.' },
        ],
      },
      {
        component: 'MetricChange',
        items: [
          { name: 'label', type: 'string', required: true, desc: 'نام شاخص.' },
          { name: 'change', type: 'string', required: true, desc: 'آنچه رخ داده، به‌صورت یک جمله‌ی آماده.' },
          { name: 'tone', type: "'good' | 'bad' | 'neutral'", default: "'neutral'", desc: 'رنگ فلش: سبز، قرمز یا خاکستری؛ هر مقدار دیگر خنثی حساب می‌شود.' },
          { name: 'direction', type: "'up' | 'down'", desc: 'جهت فلش؛ اگر ندهید برای good بالا و برای bad پایین است.' },
        ],
      },
    ],
    a11y: [
      'ریشه یک section با aria-label برابر عنوان است.',
      'ردیف‌ها در فهرست توصیفی dl با dt و dd هستند، پس صفحه‌خوان برچسب و تغییر را جفت می‌خواند.',
      'فلش‌ها aria-hidden هستند؛ معنی در متن change گفته می‌شود.',
      'ورود پلکانی ردیف‌ها با کاهش حرکت سیستم خاموش می‌شود.',
    ],
    related: ['kpi-chart', 'compact-breakdown', 'agent-recap'],
  },
  {
    slug: 'kpi-chart',
    name: 'KpiChart',
    title: 'نمودار شاخص',
    category: 'data',
    summary: 'یک عدد اصلی با تغییرش، و زیر آن نمودار خطی یک یا چند سری که با ماوس یا کیبورد خوانده می‌شود.',
    origin: 'own',
    file: 'ui/KpiChart.tsx',
    extraFiles: ['styles/kpi.css'],
    importLine: "import { KpiChart, type KpiSeries } from '@kit/ui';",
    whenToUse: [
      'برای نشان دادن روند یک شاخص در چند روز یا هفته، مثل بازدید یا فروش.',
      'وقتی چند کانال را باید روی یک نمودار مقایسه کرد.',
      'اگر مقدار دقیق هر نقطه مهم است؛ با رفتن روی نقطه، راهنما و برچسب نشان داده می‌شود.',
    ],
    whenNot: [
      { text: 'اگر فقط تغییر نسبت به قبل را می‌خواهید، خلاصه‌ی تغییرها کوتاه‌تر است.', see: 'change-summary' },
      { text: 'برای سهم هر بخش از یک کل، تفکیک فشرده را بگذارید.', see: 'compact-breakdown' },
    ],
    usage: `import { KpiChart } from '@kit/ui';

const LABELS = ['۱ آبان', '۲ آبان', '۳ آبان', '۴ آبان', '۵ آبان', '۶ آبان', '۷ آبان'];

export function VisitsChart() {
  return (
    <KpiChart
      title="بازدید روزانه"
      value="۲۱٫۴ هزار"
      delta={8.2}
      labels={LABELS}
      series={[
        { label: 'جست‌وجوی گوگل', color: '#2f6bff', values: [320, 410, 380, 450, 520, 490, 610] },
        { label: 'شبکه‌های اجتماعی', color: '#ec4899', values: [210, 230, 290, 260, 340, 380, 360] },
      ]}
      defaultIndex={6}
      footer="هفت روز گذشته"
    />
  );
}`,
    props: [
      {
        component: 'KpiChart',
        items: [
          { name: 'labels', type: 'string[]', required: true, desc: 'یک برچسب برای هر نقطه؛ اولی، وسطی و آخری روی محور دیده می‌شوند.' },
          { name: 'series', type: 'KpiSeries[]', required: true, desc: 'خط‌ها؛ هر کدام نام، رنگ و یک مقدار برای هر برچسب دارد.' },
          { name: 'title', type: 'string', desc: 'برچسب بالای عدد.' },
          { name: 'value', type: 'string', desc: 'عدد اصلی که از قبل قالب‌بندی شده است.' },
          { name: 'delta', type: 'number', desc: 'تغییر نسبت به دوره‌ی قبل؛ مثبت سبز و منفی قرمز است.' },
          { name: 'tooltipLabels', type: 'string[]', desc: 'برچسب‌های بلندتر برای بالای راهنما؛ اگر ندهید از labels می‌آید.' },
          { name: 'format', type: '(n: number) => string', default: 'فشرده با ارقام فارسی', desc: 'قالب اعداد محور، راهنما و تغییر.' },
          { name: 'footer', type: 'string', desc: 'یک خط زیر نمودار.' },
          { name: 'defaultIndex', type: 'number', desc: 'نقطه‌ای که تا وقتی ماوس روی نمودار نیست روشن می‌ماند.' },
          { name: 'emptyText', type: 'string', default: "'هنوز داده‌ای نیست'", desc: 'متن کم‌رنگ وقتی داده نیست یا همه صفر هستند.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه روی ریشه.' },
        ],
      },
      {
        component: 'KpiSeries',
        items: [
          { name: 'label', type: 'string', required: true, desc: 'نام خط در راهنما.' },
          { name: 'color', type: 'string', required: true, desc: 'رنگ خط؛ اگر خالی باشد از رنگ‌های پیش‌فرض می‌آید.' },
          { name: 'values', type: 'number[]', required: true, desc: 'یک مقدار برای هر برچسب؛ مقدار نادرست صفر حساب می‌شود.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'ArrowLeft / ArrowRight', action: 'نقطه‌ی بعدی یا قبلی را روشن می‌کند؛ جهت با راست‌به‌چپ بودن صفحه هماهنگ است.' },
      { keys: 'Home / End', action: 'رفتن به اولین یا آخرین نقطه.' },
      { keys: 'Escape', action: 'راهنما را می‌بندد.' },
    ],
    a11y: [
      'ناحیه‌ی نمودار نقش group دارد و برچسبش می‌گوید با کلیدهای چپ و راست بین نقطه‌ها بروید.',
      'متن راهنما در ناحیه‌ای با aria-live=polite است، پس با جابه‌جایی نقطه خوانده می‌شود.',
      'خود SVG برای صفحه‌خوان پنهان است و اطلاعات از راهنما می‌آید.',
      'انیمیشن‌ها با کاهش حرکت سیستم خاموش می‌شوند.',
    ],
    responsive: [
      'عرض نمودار با ResizeObserver از اندازه‌ی جعبه خوانده می‌شود، پس هر عرضی را پر می‌کند.',
      'روی صفحه‌ی لمسی ارتفاع ناحیه‌ی لمس حداقل ۴۰ پیکسل است.',
    ],
    related: ['change-summary', 'compact-breakdown', 'date-range-picker'],
  },
  {
    slug: 'compact-breakdown',
    name: 'CompactBreakdown',
    title: 'تفکیک فشرده',
    category: 'data',
    summary: 'عدد کل با یک نوار رنگی و فهرست بخش‌ها که بر اساس مقدار مرتب می‌شوند و با عوض شدن بازه جابه‌جا می‌شوند.',
    origin: 'own',
    file: 'ui/CompactBreakdown.tsx',
    extraFiles: ['styles/breakdown.css'],
    importLine: "import { CompactBreakdown, type BreakdownItem } from '@kit/ui';",
    whenToUse: [
      'برای نشان دادن اینکه یک کل (مصرف، فروش، بازدید) از چه بخش‌هایی ساخته شده.',
      'وقتی می‌خواهید کاربر بازه را عوض کند و ببیند ردیف‌ها چطور جابه‌جا می‌شوند.',
      'در جای کم؛ کارت تا عرض حدود ۲۵۰ پیکسل هم می‌خواند.',
    ],
    whenNot: [
      { text: 'برای روند در زمان، نمودار شاخص را بگذارید.', see: 'kpi-chart' },
      { text: 'برای مصرف در برابر سقف، کارت مصرف مناسب است.', see: 'usage-meter' },
    ],
    usage: `import { useState } from 'react';
import { CompactBreakdown } from '@kit/ui';

const PERIODS = [
  { id: '7d', label: '۷ روز' },
  { id: '30d', label: '۳۰ روز' },
];

const DATA = {
  '7d': [
    { id: 'chat', label: 'گفت‌وگو', value: 4820 },
    { id: 'search', label: 'جست‌وجوی وب', value: 3910 },
    { id: 'image', label: 'ساخت تصویر', value: 2240 },
  ],
  '30d': [
    { id: 'chat', label: 'گفت‌وگو', value: 16900 },
    { id: 'search', label: 'جست‌وجوی وب', value: 18400 },
    { id: 'image', label: 'ساخت تصویر', value: 7300 },
  ],
};

export function UsageBreakdown() {
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');
  return (
    <CompactBreakdown
      title="مصرف بر اساس بخش"
      items={DATA[period]}
      periods={PERIODS}
      period={period}
      onPeriodChange={(id) => setPeriod(id as '7d' | '30d')}
      delta={12.4}
    />
  );
}`,
    props: [
      {
        component: 'CompactBreakdown',
        items: [
          { name: 'items', type: 'BreakdownItem[]', required: true, desc: 'بخش‌های بازه‌ی نشان‌داده‌شده؛ فهرست بر اساس مقدار مرتب می‌شود.' },
          { name: 'title', type: 'string', default: "'تفکیک'", desc: 'عنوان کارت.' },
          { name: 'periods', type: 'BreakdownPeriod[]', desc: 'گزینه‌های سوییچ بازه؛ اگر ندهید سوییچ نمی‌آید.' },
          { name: 'period', type: 'string', desc: 'بازه‌ی انتخاب‌شده در حالت کنترل‌شده.' },
          { name: 'defaultPeriod', type: 'string', desc: 'بازه‌ی شروع در حالت کنترل‌نشده؛ پیش‌فرض اولین بازه.' },
          { name: 'onPeriodChange', type: '(id: string) => void', desc: 'وقتی کاربر بازه را عوض کرد.' },
          { name: 'delta', type: 'number', desc: 'تغییر نسبت به دوره‌ی قبل به درصد، مثل 12.4 یا -3.' },
          { name: 'format', type: '(value: number) => string', default: 'گرد کردن و ارقام فارسی', desc: 'قالب همه‌ی مقدارها؛ هنگام غلتیدن عدد اعشاری می‌گیرد، پس گرد کنید.' },
          { name: 'totalLabel', type: 'string', default: "'جمع'", desc: 'متن زیر عدد بزرگ وقتی ماوس روی بخشی نیست.' },
          { name: 'footer', type: 'ReactNode | null', desc: 'جای خط پایین کارت را می‌گیرد؛ null آن را پنهان می‌کند.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه روی ریشه.' },
        ],
      },
      {
        component: 'BreakdownItem',
        items: [
          { name: 'label', type: 'string', required: true, desc: 'نام بخش.' },
          { name: 'value', type: 'number', required: true, desc: 'مقدار بخش.' },
          { name: 'id', type: 'string', desc: 'شناسه‌ی پایدار؛ اگر برچسب‌ها عوض می‌شوند حتماً بدهید.' },
          { name: 'color', type: 'string', desc: 'رنگ بخش؛ پیش‌فرض از رنگ‌های داخلی می‌آید.' },
        ],
      },
      {
        component: 'BreakdownPeriod',
        items: [
          { name: 'id', type: 'string', required: true, desc: 'شناسه‌ی بازه.' },
          { name: 'label', type: 'string', required: true, desc: 'متن گزینه.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'ArrowLeft / ArrowRight', action: 'در سوییچ بازه، گزینه‌ی بعدی یا قبلی؛ در راست‌به‌چپ جهت‌ها برعکس است.' },
      { keys: 'ArrowDown / ArrowUp', action: 'در سوییچ بازه، گزینه‌ی بعدی یا قبلی.' },
      { keys: 'Home / End', action: 'در سوییچ بازه، اولین یا آخرین گزینه.' },
      { keys: 'Tab', action: 'هر ردیف فوکوس می‌گیرد و بخش مربوط در نوار روشن می‌شود.' },
      { keys: 'Escape', action: 'روشن‌بودن بخش را برمی‌دارد.' },
    ],
    a11y: [
      'ریشه یک section است که با عنوان کارت نام می‌گیرد.',
      'جمع و تغییر در یک متن پنهان با aria-live=polite خوانده می‌شود.',
      'هر ردیف برچسبی با نام، مقدار و درصد دارد.',
      'سوییچ بازه radiogroup است و با کاهش حرکت سیستم، غلتیدن و جابه‌جایی ردیف‌ها بی‌انیمیشن می‌شود.',
    ],
    responsive: [
      'با container query: زیر ۲۵۰ پیکسل عرض، ستون درصد پنهان و سوییچ تمام‌عرض می‌شود.',
      'روی صفحه‌ی لمسی ردیف‌ها و گزینه‌ها بزرگ‌تر می‌شوند.',
    ],
    related: ['kpi-chart', 'change-summary', 'usage-meter', 'rolling-number'],
  },
  {
    slug: 'date-range-picker',
    name: 'DateRangePicker',
    title: 'انتخاب بازه‌ی تاریخ',
    category: 'data',
    summary: 'انتخاب بازه‌ی تاریخ با تقویم شمسی، فهرست بازه‌های آماده و مقایسه با دوره‌ی قبل یا سال قبل.',
    origin: 'own',
    file: 'ui/DateRangePicker.tsx',
    extraFiles: ['styles/daterange.css', 'ui/jalali.ts'],
    importLine: "import { DateRangePicker, compareRangeOf, formatRangeFa, DEFAULT_PRESETS, type DateRange } from '@kit/ui';",
    whenToUse: [
      'در بالای گزارش و داشبورد، برای انتخاب بازه‌ای که نمودارها از آن می‌خوانند.',
      'وقتی کاربر باید دو تاریخ را مستقیم روی تقویم شمسی بزند.',
      'با گزینه‌ی مقایسه، برای دیدن تغییر نسبت به دوره‌ی قبل یا سال قبل.',
      'برای کار با تاریخ شمسی بیرون از تقویم، همین کیت toJalali و toGregorian و jalaliMonthLength و formatJalali را هم از @kit/ui می‌دهد.',
    ],
    whenNot: [
      { text: 'برای چند بازه‌ی ثابت مثل «هفته / ماه»، سوییچ ساده کافی است.', see: 'segmented' },
      { text: 'اگر فقط یک تاریخ لازم است، این قطعه بیش از حد است.' },
    ],
    usage: `import { useState } from 'react';
import { DateRangePicker, compareRangeOf, formatRangeFa, type DateRange } from '@kit/ui';

export function ReportRange() {
  const [range, setRange] = useState<DateRange | undefined>();
  const [prev, setPrev] = useState<DateRange | null>(null);

  return (
    <div style={{ minBlockSize: 480 }}>
      <DateRangePicker
        label="بازه‌ی گزارش"
        onChange={(r, compare, mode) => {
          setRange(r);
          setPrev(compare ?? compareRangeOf(r, mode));
        }}
      />
      {range ? <p>بازه: {formatRangeFa(range)}</p> : null}
      {prev ? <p>مقایسه: {formatRangeFa(prev)}</p> : null}
    </div>
  );
}`,
    props: [
      {
        component: 'DateRangePicker',
        items: [
          { name: 'value', type: 'DateRange', desc: 'بازه در حالت کنترل‌شده؛ تاریخ‌ها نیمه‌شب محلی هستند.' },
          { name: 'defaultValue', type: 'DateRange', desc: 'بازه‌ی شروع در حالت کنترل‌نشده؛ پیش‌فرض ۳۰ روز اخیر.' },
          { name: 'onChange', type: '(range: DateRange, compare: DateRange | null, mode: CompareMode) => void', desc: 'با زدن «اعمال» صدا زده می‌شود: بازه، بازه‌ی مقایسه و نوع مقایسه.' },
          { name: 'presets', type: 'DateRangePreset[]', default: 'DEFAULT_PRESETS', desc: 'فهرست بازه‌های آماده؛ روی موبایل به‌شکل چیپ می‌آید.' },
          { name: 'compare', type: 'boolean', default: 'true', desc: 'گزینه‌های مقایسه (خاموش، دوره‌ی قبل، سال قبل) را نشان می‌دهد.' },
          { name: 'defaultCompare', type: "'off' | 'previous' | 'year'", default: "'previous'", desc: 'مقایسه‌ی انتخاب‌شده در شروع.' },
          { name: 'weekStartsOn', type: '0 | 1 | 6', default: '6', desc: 'روز اول هفته: ۶ شنبه، ۰ یکشنبه، ۱ دوشنبه.' },
          { name: 'min', type: 'Date', desc: 'روزهای قبل از آن قابل انتخاب نیستند.' },
          { name: 'max', type: 'Date', desc: 'روزهای بعد از آن قابل انتخاب نیستند؛ پیش‌فرض امروز.' },
          { name: 'defaultOpen', type: 'boolean', default: 'false', desc: 'پنل را از ابتدا باز نشان می‌دهد.' },
          { name: 'today', type: 'Date', desc: 'روز مرجع برای بازه‌های آماده، برای تست و تصویربرداری.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه روی ریشه.' },
          { name: 'label', type: 'string', default: "'بازه‌ی تاریخ'", desc: 'نام دکمه‌ی باز کردن برای صفحه‌خوان.' },
        ],
      },
      {
        component: 'DateRange',
        items: [
          { name: 'start', type: 'Date', required: true, desc: 'روز شروع.' },
          { name: 'end', type: 'Date', required: true, desc: 'روز پایان.' },
        ],
      },
      {
        component: 'DateRangePreset',
        items: [
          { name: 'id', type: 'string', required: true, desc: 'شناسه‌ی بازه‌ی آماده.' },
          { name: 'label', type: 'string', required: true, desc: 'متن نمایش‌داده‌شده.' },
          { name: 'range', type: '(today: Date) => DateRange', required: true, desc: 'بازه را از روی امروز حساب می‌کند.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'ArrowLeft / ArrowRight', action: 'در تقویم یک روز جلو یا عقب؛ جهت با راست‌به‌چپ بودن صفحه هماهنگ است.' },
      { keys: 'ArrowDown / ArrowUp', action: 'یک هفته جلو یا عقب.' },
      { keys: 'Home / End', action: 'اولین یا آخرین روز همان هفته.' },
      { keys: 'PageUp / PageDown', action: 'یک ماه عقب یا جلو؛ با Shift یک سال.' },
      { keys: 'Escape', action: 'پنل را می‌بندد.' },
    ],
    a11y: [
      'دکمه‌ی باز کردن aria-haspopup=dialog و aria-expanded دارد.',
      'پنل نقش dialog دارد و تقویم نقش grid با ردیف و سلول است.',
      'هر روز برچسب کامل دارد (روز هفته، روز، ماه شمسی و سال) و امروز با aria-current مشخص است.',
      'متن انتخاب و اعلان جابه‌جایی ماه در ناحیه‌های aria-live خوانده می‌شود.',
      'انیمیشن‌ها با کاهش حرکت سیستم خاموش می‌شوند.',
    ],
    responsive: [
      'تا عرض ۶۰۰ پیکسل: بازه‌های آماده بالای تقویم به‌شکل چیپ افقی، پنل تک‌ستونی و دکمه‌ها بزرگ‌تر می‌شوند.',
      'روی صفحه‌ی لمسی دکمه‌ها و روزها حداقل ۴۰ پیکسل ارتفاع دارند.',
    ],
    related: ['kpi-chart', 'segmented', 'compact-breakdown'],
  },
  {
    slug: 'sleep-bar',
    name: 'SleepBar',
    title: 'نوار خواب',
    category: 'data',
    summary: 'یک شب خواب به‌شکل نوارِ افقی از مرحله‌ها، با ساعت شروع و پایان و راهنمای مرحله‌هایی که واقعاً هستند.',
    origin: 'own',
    file: 'ui/SleepBar.tsx',
    extraFiles: ['styles/sleepbar.css'],
    importLine: "import { SleepBar, type SleepBarSegment } from '@kit/ui';",
    whenToUse: [
      'برای نشان دادن یک شب خواب (بیدار، سبک، عمیق، رؤیا) در یک نگاه، زیر جمله‌ای که خلاصه‌اش را می‌گوید.',
      'کنار نمودار ضربان: زمان در هر دو از لبه‌ی راست شروع می‌شود، پس زیر هم خوانده می‌شوند.',
      'وقتی داده بریده بریده است: جاهای بدون داده خالی می‌مانند و پر نمی‌شوند.',
    ],
    whenNot: [
      { text: 'برای ضربان یا هر عدد پیوسته در طول روز، نمودار ضربان مناسب‌تر است.' },
      { text: 'برای چند عدد کنار هم، ردیف‌های روز کوتاه‌تر است.', see: 'day-rows' },
    ],
    usage: `import { SleepBar, type SleepBarSegment } from '@kit/ui';

const night: SleepBarSegment[] = [
  { start: '2026-11-08T23:10:00+03:30', end: '2026-11-09T01:40:00+03:30', stage: 'deep' },
  { start: '2026-11-09T01:40:00+03:30', end: '2026-11-09T01:50:00+03:30', stage: 'awake' },
  { start: '2026-11-09T01:50:00+03:30', end: '2026-11-09T06:40:00+03:30', stage: 'light' },
];

export function LastNight() {
  return (
    <SleepBar
      segments={night}
      labels={{ awake: 'بیدار', light: 'خوابِ سبک', deep: 'خوابِ عمیق', rem: 'خوابِ رؤیا' }}
      ariaLabel="خواب از ۲۳:۱۰ تا ۶:۴۰، یک بار بیدار شد"
      empty={<p>از دیشب داده‌ی خواب نرسیده.</p>}
    />
  );
}`,
    props: [
      {
        component: 'SleepBar',
        items: [
          { name: 'segments', type: 'SleepBarSegment[]', required: true, desc: 'تکه‌های خواب با start و end (زمان ISO با اختلاف ساعت) و stage. تکه‌ی بدون پهنا یا با مرحله‌ی ناشناخته کشیده نمی‌شود.' },
          { name: 'labels', type: 'Record<SleepStage, string>', required: true, desc: 'واژه‌ی راهنما برای هر مرحله؛ کیت زبان خودش را ندارد.' },
          { name: 'ariaLabel', type: 'string', required: true, desc: 'توضیح کل نوار برای صفحه‌خوان.' },
          { name: 'from', type: 'string', desc: 'شروع بازه؛ اگر ندهید از اولین تکه می‌آید.' },
          { name: 'to', type: 'string', desc: 'پایان بازه؛ اگر ندهید از آخرین تکه می‌آید. تکه‌ها به این بازه بریده می‌شوند.' },
          { name: 'notes', type: 'Partial<Record<SleepStage, string>>', desc: 'متن کوچک بعد از واژه‌ی راهنما، مثلاً مدت هر مرحله.' },
          { name: 'formatTime', type: '(iso: string) => string', default: 'ساعت تهران با ارقام فارسی', desc: 'متن دو برچسب ساعت در دو سر نوار.' },
          { name: 'empty', type: 'ReactNode', desc: 'چیزی که به‌جای نوار نشان داده می‌شود وقتی تکه‌ای برای کشیدن نیست؛ پیش‌فرض هیچ.' },
          { name: 'rtl', type: 'boolean', default: 'true', desc: 'زمان از لبه‌ی راست شروع شود (مثل نمودار ضربان). نوار جهت خودش را می‌گذارد و به جهت صفحه بستگی ندارد.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه روی ریشه.' },
        ],
      },
      {
        component: 'SleepBarSegment',
        items: [
          { name: 'start', type: 'string', required: true, desc: 'شروع تکه (ISO).' },
          { name: 'end', type: 'string', required: true, desc: 'پایان تکه (ISO).' },
          { name: 'stage', type: "'awake' | 'light' | 'deep' | 'rem'", required: true, desc: 'مرحله‌ی خواب.' },
        ],
      },
    ],
    a11y: [
      'نوار و برچسب‌های ساعتش یک تصویر با role=img هستند و متنش همان ariaLabel است.',
      'راهنما یک فهرست واقعی بیرون از تصویر است، پس صفحه‌خوان مرحله‌ها را جدا می‌خواند.',
      'مرحله‌ها فقط با رنگ جدا نمی‌شوند: راهنما هر رنگ را با واژه می‌گوید.',
    ],
    responsive: [
      'نوار همه‌ی عرض را پر می‌کند و راهنما در چند خط می‌شکند، پس اسکرول افقی نداریم.',
    ],
    related: ['day-rows', 'kpi-chart'],
  },
  {
    slug: 'day-rows',
    name: 'DayRows',
    title: 'ردیف‌های روز',
    category: 'data',
    summary: 'فهرستی از روزها، هر روز یک ردیف با چند مقدارِ برچسب‌دار، یک نشانه‌ی ملایم و حالت کم‌رنگ برای روزِ بی‌داده.',
    origin: 'own',
    file: 'ui/DayRows.tsx',
    extraFiles: ['styles/dayrows.css'],
    importLine: "import { DayRows, type DayRowItem } from '@kit/ui';",
    whenToUse: [
      'برای خلاصه‌ی هفته: هر روز اسمش، چند عدد و در صورت لزوم یک نشانه مثل «هشدار داشت».',
      'وقتی چند عدد کنار هم باید روی گوشی بدون اسکرول افقی خوانده شوند؛ مقدارها می‌شکنند و زیر هم می‌آیند.',
      'برای نشان دادن مقداری که از بقیه فرق دارد، با رنگ ملایم و بدون هشدار بلند.',
    ],
    whenNot: [
      { text: 'برای مقایسه‌ی دقیق چند ستون با عنوان ثابت، جدول لازم است؛ این قطعه جدول نیست.' },
      { text: 'برای روند یک عدد در طول زمان، نمودار شاخص بهتر است.', see: 'kpi-chart' },
    ],
    usage: `import { DayRows, type DayRowItem } from '@kit/ui';

const rows: DayRowItem[] = [
  {
    id: '2026-11-09', label: 'دوشنبه', sub: '۱۸ آبان',
    cells: [
      { label: 'ضربانِ آرام', value: '۵۶' },
      { label: 'خواب', value: '۷ ساعت', tone: 'flag', hint: 'با بقیه‌ی هفته فرق دارد' },
    ],
  },
  { id: '2026-11-08', label: 'یکشنبه', sub: '۱۷ آبان', muted: true, note: 'داده‌ای نرسید', cells: [] },
];

export function Week() {
  return <DayRows rows={rows} label="هفت روز گذشته" />;
}`,
    props: [
      {
        component: 'DayRows',
        items: [
          { name: 'rows', type: 'DayRowItem[]', required: true, desc: 'ردیف‌ها به همان ترتیبی که می‌دهید نشان داده می‌شوند.' },
          { name: 'label', type: 'string', required: true, desc: 'نام فهرست برای صفحه‌خوان.' },
          { name: 'empty', type: 'ReactNode', desc: 'چیزی که به‌جای فهرست نشان داده می‌شود وقتی ردیفی نیست؛ پیش‌فرض هیچ.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه روی ریشه.' },
        ],
      },
      {
        component: 'DayRowItem',
        items: [
          { name: 'id', type: 'string', required: true, desc: 'کلید یکتای ردیف.' },
          { name: 'label', type: 'ReactNode', required: true, desc: 'برچسب اصلی ردیف، مثلاً روز هفته.' },
          { name: 'cells', type: 'DayRowCell[]', required: true, desc: 'مقدارهای ردیف؛ هرکدام برچسب و مقدار دارد.' },
          { name: 'sub', type: 'ReactNode', desc: 'متن کوچک کنار برچسب، مثلاً تاریخ.' },
          { name: 'tag', type: 'ReactNode', desc: 'نشانه‌ی ملایم در انتهای سطر بالای ردیف.' },
          { name: 'muted', type: 'boolean', desc: 'ردیف کم‌رنگ، برای روزِ بی‌داده.' },
          { name: 'note', type: 'ReactNode', desc: 'اگر muted باشد، این متن جای مقدارها را می‌گیرد.' },
        ],
      },
      {
        component: 'DayRowCell',
        items: [
          { name: 'label', type: 'string', required: true, desc: 'نام مقدار.' },
          { name: 'value', type: 'ReactNode', required: true, desc: 'خود مقدار، از قبل قالب‌بندی‌شده.' },
          { name: 'tone', type: "'flag'", desc: 'مقدار را ملایم رنگ می‌کند.' },
          { name: 'hint', type: 'string', desc: 'جمله‌ای فقط برای صفحه‌خوان که بعد از مقدار خوانده می‌شود، مثلاً چرا نشانه خورده.' },
        ],
      },
    ],
    a11y: [
      'فهرست واقعی ul با aria-label است و هر ردیف li؛ مقدارها در dl با dt و dd جفت می‌شوند.',
      'رنگ ملایمِ نشانه تنها حامل معنی نیست؛ hint همان را برای صفحه‌خوان می‌گوید.',
    ],
    responsive: [
      'مقدارهای هر ردیف می‌شکنند و زیر هم می‌آیند؛ هیچ‌وقت اسکرول افقی نداریم.',
    ],
    related: ['sleep-bar', 'kpi-chart', 'change-summary'],
  },
];
