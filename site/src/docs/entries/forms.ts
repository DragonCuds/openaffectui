import type { DocEntry } from '../types';

export const forms: DocEntry[] = [
  {
    slug: 'select',
    name: 'Select',
    title: 'فهرست کشویی',
    category: 'forms',
    summary: 'یک گزینه از یک فهرست: دکمه مقدار را نشان می‌دهد و فهرست در یک لایه‌ی نرم باز می‌شود، با کیبورد کامل و راست‌به‌چپ.',
    origin: 'own',
    file: 'ui/Fields.tsx',
    extraFiles: ['styles/forms.css'],
    importLine: "import { Select } from '@kit/ui';",
    whenToUse: [
      'برای انتخاب یکی از چند گزینه‌ی ثابت، مثل شهر، محله یا مرتب‌سازی.',
      'وقتی گزینه‌ها زیادند (بیشتر از پنج تا) و جا برای نشان دادن همه‌شان نیست.',
      'در فیلترها: placeholder همان گزینه‌ی «همه» با مقدار خالی است.',
    ],
    whenNot: [
      { text: 'برای دو تا پنج گزینه که باید همه دیده شوند، انتخاب قرصی بهتر است.', see: 'segmented' },
      { text: 'برای چند انتخاب هم‌زمان، از چیپ‌های انتخابی استفاده کنید.' },
    ],
    usage: `import { useState } from 'react';
import { Select } from '@kit/ui';

const CITIES = [
  { value: 'tehran', label: 'تهران' },
  { value: 'shiraz', label: 'شیراز' },
];

export function CityField() {
  const [city, setCity] = useState<'tehran' | 'shiraz' | ''>('');
  return (
    <Select
      label="شهر"
      value={city}
      onChange={setCity}
      options={CITIES}
      placeholder="یکی را انتخاب کنید"
    />
  );
}`,
    props: [
      {
        items: [
          { name: 'label', type: 'string', required: true, desc: 'برچسب بالای فیلد؛ نام دکمه و فهرست هم همین است.' },
          { name: 'value', type: "V | ''", required: true, desc: "مقدار انتخاب‌شده؛ '' یعنی گزینه‌ی خالی." },
          { name: 'onChange', type: "(v: V | '') => void", required: true, desc: 'فقط وقتی گزینه‌ی دیگری انتخاب شد صدا زده می‌شود.' },
          { name: 'options', type: '{ value: V; label: string }[]', required: true, desc: 'گزینه‌ها به‌ترتیب.' },
          { name: 'placeholder', type: 'string', desc: "گزینه‌ی خالی (مقدار '') در اول فهرست؛ وقتی چیزی انتخاب نشده کم‌رنگ روی دکمه می‌آید." },
          { name: 'hint', type: 'ReactNode', desc: 'یک خط توضیح زیر فیلد.' },
          { name: 'disabled', type: 'boolean', default: 'false', desc: 'دکمه را غیرفعال می‌کند.' },
          { name: 'id', type: 'string', desc: 'شناسه‌ی دکمه، برای فوکوس روی خطا.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه که کنار fld گذاشته می‌شود.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'Enter / Space / ArrowDown', action: 'فهرست را باز می‌کند و روی گزینه‌ی فعلی می‌رود.' },
      { keys: 'ArrowDown / ArrowUp', action: 'گزینه‌ی بعدی یا قبلی.' },
      { keys: 'Home / End / PageUp / PageDown', action: 'اولین، آخرین، یا هشت گزینه جلوتر و عقب‌تر.' },
      { keys: 'Enter / Space', action: 'گزینه را انتخاب می‌کند و فهرست را می‌بندد.' },
      { keys: 'Esc', action: 'فهرست را می‌بندد؛ داخل پنجره، خود پنجره بسته نمی‌شود.' },
      { keys: 'حروف', action: 'به اولین گزینه‌ای که با آن حروف شروع می‌شود می‌پرد؛ تکرار یک حرف بین گزینه‌ها می‌چرخد.' },
    ],
    a11y: [
      'دکمه نقش combobox دارد با aria-haspopup=listbox، aria-expanded و aria-activedescendant.',
      'فهرست نقش listbox دارد و هر گزینه option است با aria-selected؛ گزینه‌ی انتخاب‌شده تیک هم دارد.',
      'فوکوس همیشه روی دکمه می‌ماند، پس قفل فوکوس پنجره‌ها به هم نمی‌ریزد.',
      'کلیک بیرون فهرست را می‌بندد؛ انیمیشن با کاهش حرکت سیستم خاموش می‌شود.',
    ],
    responsive: [
      'فهرست در لایه‌ی بالای صفحه باز می‌شود، پس پنجره یا کارت آن را نمی‌بُرد.',
      'وقتی پایین جا نیست، رو به بالا باز می‌شود؛ ارتفاعش به جای خالی محدود است و داخل خودش اسکرول می‌خورد.',
      'در حالت تیره رنگ لایه و سایه عوض می‌شود.',
    ],
    related: ['segmented', 'otp-input'],
  },
  {
    slug: 'otp-input',
    name: 'OtpInput',
    title: 'ورودی کد یک‌بارمصرف',
    category: 'forms',
    summary: 'کد پیامکی که هر رقم در یک خانه‌ی جدا تایپ می‌شود؛ ارقام فارسی نشان داده می‌شوند ولی مقدار برگشتی لاتین است.',
    origin: 'own',
    file: 'ui/OtpInput.tsx',
    extraFiles: ['styles/otp.css'],
    importLine: "import { OtpInput } from '@kit/ui';",
    whenToUse: [
      'برای تأیید شماره‌ی موبایل یا ورود با کد پیامکی.',
      'وقتی می‌خواهید کاربر کد را پیست کند یا پیشنهاد «از پیامک» گوشی کار کند.',
      'با onComplete، همین‌که همه‌ی خانه‌ها پر شد کد را بدون دکمه‌ی اضافه بفرستید.',
    ],
    whenNot: [
      { text: 'برای متن آزاد یا عدد بلند که طول ثابت ندارد، از input معمولی استفاده کنید.' },
      { text: 'برای نشان دادن اینکه کاربر کدام مرحله‌ی ثبت‌نام است، نشانگر مرحله لازم است.', see: 'stepper' },
    ],
    usage: `import { useState } from 'react';
import { OtpInput } from '@kit/ui';

export function VerifyPhone() {
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p>کد ۶ رقمی به ۰۹۱۲۳۴۵۶۷۸۹ فرستاده شد.</p>
      <OtpInput
        value={code}
        onChange={(v) => { setCode(v); setWrong(false); }}
        onComplete={(v) => setWrong(v !== '123456')}
        invalid={wrong}
        autoFocus
      />
      {wrong ? <small>کد درست نیست، دوباره امتحان کنید.</small> : null}
    </div>
  );
}`,
    props: [
      {
        items: [
          { name: 'value', type: 'string', required: true, desc: 'کد فعلی به‌صورت رشته‌ی ارقام ۰ تا ۹ لاتین.' },
          { name: 'onChange', type: '(v: string) => void', required: true, desc: 'با هر تغییر کد صدا زده می‌شود.' },
          { name: 'onComplete', type: '(v: string) => void', desc: 'یک بار، وقتی همه‌ی خانه‌ها پر شدند.' },
          { name: 'length', type: 'number', default: '6', desc: 'تعداد خانه‌ها.' },
          { name: 'label', type: 'string', default: "'کد پیامک'", desc: 'نام گروه و پیشوند نام هر خانه برای صفحه‌خوان.' },
          { name: 'disabled', type: 'boolean', default: 'false', desc: 'همه‌ی خانه‌ها را غیرفعال می‌کند.' },
          { name: 'invalid', type: 'boolean', default: 'false', desc: 'حالت خطا را نشان می‌دهد و خانه‌ها را تکان می‌دهد.' },
          { name: 'autoFocus', type: 'boolean', default: 'false', desc: 'فوکوس را از ابتدا روی خانه‌ی اول می‌گذارد.' },
          { name: 'id', type: 'string', desc: 'شناسه‌ی خانه‌ی اول، برای وصل کردن label.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه که کنار otp گذاشته می‌شود.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'Backspace', action: 'رقم همان خانه را پاک می‌کند؛ اگر خالی بود، به خانه‌ی قبل می‌رود و رقم آن را پاک می‌کند.' },
      { keys: 'ArrowLeft', action: 'به خانه‌ی سمت چپ می‌رود (خانه‌ها همیشه چپ‌به‌راست هستند).' },
      { keys: 'ArrowRight', action: 'به خانه‌ی سمت راست می‌رود.' },
      { keys: 'Ctrl/Cmd + V', action: 'کد پیست‌شده را در همه‌ی خانه‌ها پخش می‌کند؛ ارقام فارسی و عربی هم پذیرفته می‌شوند.' },
    ],
    a11y: [
      'خانه‌ها داخل group با نام label هستند و هر خانه نام «کد پیامک، رقم n» دارد.',
      'خانه‌ی اول autoComplete=one-time-code دارد تا گوشی کد پیامک را پیشنهاد بدهد.',
      'inputMode=numeric کیبورد عددی را باز می‌کند.',
      'در حالت invalid، aria-invalid روی خانه‌ها می‌نشیند.',
      'تکان خطا با کاهش حرکت سیستم خاموش می‌شود.',
    ],
    responsive: [
      'روی صفحه‌ی لمسی ارتفاع هر خانه ۵۶ پیکسل می‌شود.',
    ],
    related: ['stepper', 'button', 'toaster'],
  },
  {
    slug: 'stepper',
    name: 'Stepper',
    title: 'نشانگر مرحله',
    category: 'forms',
    summary: 'نشان می‌دهد کاربر در کدام مرحله‌ی یک مسیر کوتاه است، با دایره‌های شماره‌دار یا نوار قطعه‌قطعه.',
    origin: 'own',
    file: 'ui/Stepper.tsx',
    extraFiles: ['styles/stepper.css'],
    importLine: "import { Stepper } from '@kit/ui';",
    whenToUse: [
      'برای مسیر ثبت‌نام کوتاه، مثل شماره، کد، پایان (حالت dots).',
      'برای پرسشنامه که فقط «سؤال ۲ از ۵» لازم است (حالت bar).',
      'وقتی می‌خواهید مرحله‌های گذشته با تیک مشخص شوند.',
    ],
    whenNot: [
      { text: 'برای مقدار پیوسته مثل مصرف، نوار پیشرفت مناسب است.', see: 'meter' },
      { text: 'برای عوض کردن آزادانه بین نماها، انتخاب قرصی بهتر است.', see: 'segmented' },
    ],
    usage: `import { useState } from 'react';
import { Button, Stepper } from '@kit/ui';

const STEPS = ['شماره', 'کد پیامک', 'پایان'];

export function SignupFlow() {
  const [step, setStep] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Stepper steps={STEPS} current={step} label="مراحل ثبت‌نام" />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>قبلی</Button>
        <Button variant="primary" onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}>بعدی</Button>
      </div>
    </div>
  );
}`,
    props: [
      {
        items: [
          { name: 'steps', type: 'string[]', required: true, desc: 'نام مرحله‌ها؛ در حالت bar می‌توانند رشته‌ی خالی باشند.' },
          { name: 'current', type: 'number', required: true, desc: 'شماره‌ی مرحله‌ی فعلی از صفر؛ برابر طول steps یعنی همه انجام شده.' },
          { name: 'variant', type: "'dots' | 'bar'", default: "'dots'", desc: 'dots دایره‌های شماره‌دار است و bar قطعه‌های نوار.' },
          { name: 'label', type: 'string', default: "'مرحله‌ها'", desc: 'نام فهرست برای صفحه‌خوان.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه که کنار stp گذاشته می‌شود.' },
        ],
      },
    ],
    a11y: [
      'حالت dots یک فهرست ol با aria-label است و مرحله‌ی فعلی aria-current=step دارد.',
      'متن پنهان مخصوص صفحه‌خوان می‌گوید هر مرحله «انجام شد» است یا «مرحله‌ی فعلی».',
      'حالت bar یک group است و متن پنهانش می‌گوید «مرحله‌ی ۲ از ۵».',
      'شماره‌ها فارسی هستند و تیک و قطعه‌ها aria-hidden هستند.',
      'انیمیشن‌ها با کاهش حرکت سیستم خاموش می‌شوند.',
    ],
    related: ['otp-input', 'meter', 'button'],
  },
  {
    slug: 'pricing-plans',
    name: 'PricingPlans',
    title: 'جدول قیمت',
    category: 'forms',
    summary: 'کارت‌های طرح کنار هم: نام، قیمت، ویژگی‌ها با تیک و یک دکمه؛ طرح فعلی و طرح پیشنهادی مشخص می‌شوند.',
    origin: 'own',
    file: 'ui/PricingPlans.tsx',
    extraFiles: ['styles/pricing.css'],
    importLine: "import { PricingPlans, type PricingPlan } from '@kit/ui';",
    whenToUse: [
      'برای صفحه‌ی خرید یا ارتقای اشتراک با دو تا چهار طرح.',
      'وقتی می‌خواهید طرح فعلی کاربر با برچسب «طرح فعلی» مشخص شود.',
      'با featured یک طرح را برجسته کنید تا چشم اول به آن برسد.',
    ],
    whenNot: [
      { text: 'برای نشان دادن مصرف فعلی در برابر سقف طرح، کارت مصرف مناسب است.', see: 'usage-meter' },
      { text: 'برای انتخاب یکی از دو گزینه‌ی ساده (مثل ماهانه / سالانه)، انتخاب قرصی کافی است.', see: 'segmented' },
    ],
    usage: `import { useState } from 'react';
import { PricingPlans, type PricingPlan } from '@kit/ui';

export function Plans() {
  const [current, setCurrent] = useState('free');
  const [busy, setBusy] = useState<string | null>(null);

  const pick = (id: string) => {
    setBusy(id);
    setTimeout(() => { setCurrent(id); setBusy(null); }, 800);
  };

  const plans: PricingPlan[] = [
    {
      id: 'free', name: 'رایگان', price: 'رایگان', note: 'برای شروع',
      features: ['۱۰۰ پیام در ماه', 'یک پروژه'],
      current: current === 'free',
      actionLabel: 'برگشت به رایگان', actionSoft: true, onAction: () => pick('free'),
    },
    {
      id: 'pro', name: 'حرفه‌ای', price: '۹۰۰٬۰۰۰ تومان', note: 'ماهانه', featured: true,
      features: ['پیام نامحدود', 'ده پروژه', 'پشتیبانی سریع'],
      current: current === 'pro',
      busy: busy === 'pro',
      actionLabel: 'ارتقا بده', onAction: () => pick('pro'),
    },
  ];

  return <PricingPlans plans={plans} disabled={busy !== null} />;
}`,
    props: [
      {
        component: 'PricingPlans',
        items: [
          { name: 'plans', type: 'PricingPlan[]', required: true, desc: 'طرح‌هایی که به‌ترتیب کنار هم می‌آیند.' },
          { name: 'disabled', type: 'boolean', default: 'false', desc: 'همه‌ی دکمه‌ها را غیرفعال می‌کند، مثلاً تا پایان یک درخواست.' },
          { name: 'currentLabel', type: 'string', default: "'طرح فعلی'", desc: 'متن برچسب طرح فعلی.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه که کنار prc گذاشته می‌شود.' },
        ],
      },
      {
        component: 'PricingPlan',
        items: [
          { name: 'id', type: 'string | number', required: true, desc: 'شناسه‌ی یکتای طرح.' },
          { name: 'name', type: 'string', required: true, desc: 'نام طرح.' },
          { name: 'price', type: 'ReactNode', required: true, desc: 'خط قیمت که از قبل قالب‌بندی شده، مثل «۹۰۰٬۰۰۰ تومان».' },
          { name: 'note', type: 'ReactNode', desc: 'خط کوچک زیر قیمت، مثل دوره یا شرح ارتقا.' },
          { name: 'features', type: 'ReactNode[]', required: true, desc: 'ویژگی‌ها؛ هر کدام با یک تیک می‌آید.' },
          { name: 'current', type: 'boolean', desc: 'طرحی که کاربر الان دارد؛ برچسب و پس‌زمینه‌ی ملایم می‌گیرد.' },
          { name: 'featured', type: 'boolean', desc: 'طرح پیشنهادی که کمی برجسته می‌شود.' },
          { name: 'actionLabel', type: 'string', desc: 'متن دکمه؛ بدون آن (یا بدون onAction) دکمه نمی‌آید.' },
          { name: 'actionIcon', type: 'ReactNode', desc: 'نماد پیش از متن دکمه.' },
          { name: 'actionSoft', type: 'boolean', desc: 'دکمه‌ی کم‌رنگ به‌جای دکمه‌ی اصلی؛ برای کاهش طرح.' },
          { name: 'onAction', type: '() => void', desc: 'با زدن دکمه صدا زده می‌شود.' },
          { name: 'busy', type: 'boolean', desc: 'دکمه‌ی همین طرح را غیرفعال می‌کند و aria-busy می‌گذارد.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'Tab', action: 'بین دکمه‌های طرح‌ها می‌رود (دکمه‌های native).' },
    ],
    a11y: [
      'ریشه یک فهرست ul است و هر طرح یک li.',
      'دکمه‌ی طرحی که busy است aria-busy می‌گیرد.',
      'نماد تیک ویژگی‌ها aria-hidden است.',
      'ورود کارت‌ها و بالا آمدن با ماوس با کاهش حرکت سیستم خاموش می‌شود.',
    ],
    responsive: [
      'کارت‌ها در شبکه‌ی auto-fit با حداقل ۲۴۰ پیکسل می‌چینند؛ روی صفحه‌ی باریک زیر هم می‌آیند.',
      'روی صفحه‌ی لمسی ارتفاع دکمه حداقل ۴۴ پیکسل است.',
    ],
    related: ['usage-meter', 'button', 'stepper'],
  },
];
