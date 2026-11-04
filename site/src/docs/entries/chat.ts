import type { DocEntry } from '../types';

export const chat: DocEntry[] = [
  /* ------------------------------------------------------------------ chat-composer */
  {
    slug: 'chat-composer',
    name: 'ChatComposer',
    title: 'ورودی گفت‌وگو',
    category: 'chat',
    summary: 'جعبه‌ی اصلی نوشتن پیام برای دستیار هوشمند: متن چندخطی، انتخاب مدل، ضبط صدا، درخواست تأیید و اتصال برنامه‌ها.',
    origin: 'own',
    file: 'ui/ChatComposer.tsx',
    extraFiles: ['styles/composer.css'],
    importLine: "import { ChatComposer, defaultModels } from '@kit/ui';\nimport type { ChatModel } from '@kit/ui';",
    whenToUse: [
      'پایین صفحه‌ی گفت‌وگو با یک دستیار که ابزارها را هم صدا می‌زند.',
      'کاربر باید بتواند مدل را انتخاب کند، پیوست بزند یا با صدا بنویسد.',
      'دستیار به برنامه‌ها و پروژه‌ها وصل می‌شود و می‌خواهی این دو کار هم کنار ورودی باشند.',
    ],
    whenNot: [
      { text: 'فقط یک فیلد متن ساده یا جست‌وجو لازم است؛ اینجا خیلی سنگین است.' },
      { text: 'می‌خواهی زیر پیام دستیار کپی، امتیاز یا ساخت دوباره بگذاری.', see: 'message-actions' },
    ],
    usage: `import { ChatComposer, type ChatModel } from '@kit/ui';

const models: ChatModel[] = [
  { id: 'auto', name: 'خودکار', description: 'برای هر پیام بهترین مدل را انتخاب می‌کند' },
  { id: 'fast', name: 'سریع', description: 'پاسخ‌های کوتاه برای کارهای روزمره' },
  { id: 'deep', name: 'دقیق', description: 'فکر عمیق‌تر برای نوشتن و کد' },
];

export function Composer() {
  const [text, setText] = useState('');
  return (
    <ChatComposer
      models={models}
      value={text}
      onValueChange={setText}
      onSend={(message, { model }) => sendToAgent(message, model)}
      onModelChange={(m) => console.log('مدل:', m.name)}
      onAttach={() => openFilePicker()}
      onSelectProject={() => openProjects()}
    />
  );
}`,
    props: [
      {
        items: [
          { name: 'placeholder', type: 'string', desc: 'متن راهنمای فیلد. پیش‌فرض از labels.placeholder می‌آید («از اینجا شروع کن…»).' },
          { name: 'models', type: 'ChatModel[]', default: 'defaultModels', desc: 'مدل‌هایی که در فهرست انتخاب می‌آیند. پیش‌فرض سه مدل «خودکار»، «سریع» و «دقیق» است.' },
          { name: 'loadMs', type: 'number', default: '1300', desc: 'مدت حالت بارگذاری اتصال برنامه‌ها و درخواست تأیید (میلی‌ثانیه).' },
          { name: 'dictation', type: 'string', default: "'یک گزارش کوتاه برای تیم درباره‌ی پیشرفت این هفته بنویس'", desc: 'متن نمونه‌ای که هنگام ضبط کلمه‌به‌کلمه می‌آید. برای کار واقعی جایش را با خروجی گفتار-به-متن عوض کن.' },
          { name: 'labels', type: 'Partial<ChatComposerLabels>', desc: 'متن همه‌ی برچسب‌ها؛ پیش‌فرض فارسی است. هر کلید که ندهی فارسی می‌ماند.' },
          { name: 'value', type: 'string', desc: 'متن کنترل‌شده. اگر ندهی فیلد خودش متن را نگه می‌دارد.' },
          { name: 'onValueChange', type: '(value: string) => void', desc: 'با هر تغییر متن صدا می‌شود.' },
          { name: 'disabled', type: 'boolean', default: 'false', desc: 'فیلد، ارسال، ضبط و دکمه‌ها را غیرفعال می‌کند.' },
          { name: 'onSend', type: '(message: string, details: { model: string }) => void', desc: 'با ارسال صدا می‌شود؛ متن بدون فاصله‌ی اضافی و شناسه‌ی مدل را می‌دهد. بعد از آن فیلد خالی می‌شود.' },
          { name: 'onModelChange', type: '(model: ChatModel) => void', desc: 'با انتخاب مدل دیگر.' },
          { name: 'onAttach', type: '() => void', desc: 'با زدن دکمه‌ی + (افزودن پیوست).' },
          { name: 'onConnectApps', type: '() => void', desc: 'با شروع اتصال برنامه‌ها.' },
          { name: 'onRequestApproval', type: '() => void', desc: 'با شروع درخواست تأیید.' },
          { name: 'onSelectProject', type: '() => void', desc: 'با زدن «انتخاب پروژه» بعد از اتصال برنامه‌ها.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه.' },
        ],
      },
      {
        component: 'ChatModel',
        items: [
          { name: 'id', type: 'string', required: true, desc: 'شناسه‌ای که در onSend برمی‌گردد.' },
          { name: 'name', type: 'string', required: true, desc: 'نام مدل در دکمه و فهرست.' },
          { name: 'description', type: 'string', required: true, desc: 'توضیح یک‌خطی زیر نام مدل.' },
          { name: 'icon', type: 'ReactNode', desc: 'آیکن کنار مدل در فهرست.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'Enter', action: 'ارسال پیام (در حین تایپ با کیبورد فارسی که هنوز ترکیب نشده، ارسال نمی‌شود).' },
      { keys: 'Shift + Enter', action: 'خط تازه.' },
      { keys: '↓ / ↑', action: 'باز کردن فهرست مدل‌ها؛ وقتی باز است، رفتن بین مدل‌ها. در متن چندخطی فقط از دکمه‌ی مدل کار می‌کند.' },
      { keys: 'Home / End', action: 'اولین یا آخرین مدل (فهرست باز).' },
      { keys: 'Enter / Space', action: 'انتخاب مدل مشخص‌شده (Space فقط روی دکمه‌ی مدل).' },
      { keys: 'Esc', action: 'بستن فهرست مدل، یا دور انداختن ضبط در جریان.' },
      { keys: 'Tab', action: 'رفتن بین دکمه‌ها؛ فهرست باز را می‌بندد.' },
    ],
    a11y: [
      'دکمه‌ی مدل role="combobox" با aria-expanded و aria-activedescendant است و فهرست role="listbox" با گزینه‌های aria-selected دارد.',
      'فهرست مدل‌ها در body رندر می‌شود، پس دور از overflow والد گیر نمی‌کند.',
      'همه‌ی دکمه‌های آیکنی برچسب متنی دارند (ارسال پیام، ورودی صوتی، افزودن پیوست …) و حالت‌های بارگذاری aria-busy می‌گیرند.',
      'یک ناحیه‌ی role="status" (aria-live="polite") اتصال، تأیید، ضبط و تغییر مدل را اعلام می‌کند.',
      'با prefers-reduced-motion گذارها و انیمیشن‌ها حذف می‌شوند.',
    ],
    responsive: [
      'کمتر از ۴۳۰ پیکسل (عرض خود کارت) دکمه‌ی درخواست تأیید فقط آیکن می‌ماند و حاشیه‌ی نوار ابزار کم می‌شود.',
      'متن تا حدود شش خط بلند می‌شود، بعد اسکرول می‌خورد.',
    ],
    related: ['message-actions', 'thinking-loader', 'tool-call-card', 'approval-card'],
  },

  /* ------------------------------------------------------------------ message-actions */
  {
    slug: 'message-actions',
    name: 'MessageActions',
    title: 'نوار کار پیام',
    category: 'chat',
    summary: 'نوار زیر پیام دستیار: کپی، ساخت دوباره با نسخه‌ها، پسندیدن یا نپسندیدن با دلیل، و خواندن با صدای بلند.',
    origin: 'mit',
    file: 'ui/MessageActions.tsx',
    extraFiles: ['styles/message-actions.css'],
    importLine: "import { MessageActions, MessageText } from '@kit/ui';",
    whenToUse: [
      'زیر هر پاسخ دستیار در گفت‌وگو.',
      'کاربر باید بتواند پاسخ را دوباره بسازد و بین نسخه‌ها بچرخد.',
      'می‌خواهی بازخورد «نپسندیدم» همراه با دلیل کوتاه جمع شود.',
    ],
    whenNot: [
      { text: 'نوشتن پیام تازه یا ارسال آن.', see: 'chat-composer' },
      { text: 'می‌خواهی تغییرهای متن را یکی‌یکی بپذیری یا رد کنی.', see: 'inline-diff' },
    ],
    usage: `const [versions, setVersions] = useState([
  'عنوان را روی کلیدواژه‌ی اصلی می‌گذارم: «خرید کفش ورزشی مردانه».',
]);
const [version, setVersion] = useState(0);
const [busy, setBusy] = useState(false);

async function regenerate() {
  setBusy(true);
  const next = await askAgentAgain();
  setVersions((v) => [...v, next]);
  setVersion(versions.length);
  setBusy(false);
}

<div data-ui-message>
  <MessageText version={version}>{versions[version]}</MessageText>
  <MessageActions
    text={versions[version]}
    versions={versions}
    version={version}
    onVersionChange={setVersion}
    onRegenerate={regenerate}
    regenerating={busy}
    onFeedback={(kind, reason) => sendFeedback(kind, reason)}
  />
</div>`,
    props: [
      {
        items: [
          { name: 'text', type: 'string', desc: 'متن پیام؛ دکمه‌ی کپی آن را برمی‌دارد و مدت «خواندن» از طول آن حدس زده می‌شود.' },
          { name: 'actions', type: "('copy' | 'regenerate' | 'feedback' | 'speak')[]", default: "['copy', 'regenerate', 'feedback', 'speak']", desc: 'کدام دکمه‌ها و به چه ترتیب. کلید ناشناس یا تکراری حذف می‌شود.' },
          { name: 'versions', type: 'number | string[]', desc: 'همه‌ی نسخه‌ها یا فقط تعدادشان. از دو نسخه به بالا کلید نسخه باز می‌شود.' },
          { name: 'version', type: 'number', desc: 'نسخه‌ی کنترل‌شده (از صفر).' },
          { name: 'defaultVersion', type: 'number', desc: 'نسخه‌ی اولیه وقتی کنترل نمی‌کنی؛ پیش‌فرض تازه‌ترین.' },
          { name: 'onVersionChange', type: '(index: number) => void', desc: 'با انتخاب نسخه‌ی دیگر صدا می‌شود.' },
          { name: 'onCopy', type: '(text?: string) => void', desc: 'بعد از کپی صدا می‌شود.' },
          { name: 'onRegenerate', type: '() => void', desc: 'با زدن ساخت دوباره. نسخه‌ی تازه که اضافه کنی، کلید به آن می‌پرد.' },
          { name: 'regenerating', type: 'boolean', default: 'false', desc: 'تا وقتی نسخه‌ی تازه نوشته می‌شود، پیکان می‌چرخد.' },
          { name: 'onFeedback', type: "(kind: 'up' | 'down' | null, reason?: string) => void", desc: "'up' یا 'down' با زدن انگشت، null با پس‌گرفتن، و 'down' با دلیل وقتی ردیف بازخورد ارسال شد." },
          { name: 'reasons', type: 'string[]', default: "['نادرست بود', 'خیلی طولانی بود', 'دستورم را انجام نداد', 'دیگر']", desc: 'دلیل‌های سریع؛ «دیگر» یک فیلد متن کوچک باز می‌کند.' },
          { name: 'onSpeak', type: '(playing: boolean) => void', desc: 'true با شروع خواندن و false با توقف.' },
          { name: 'speaking', type: 'boolean', desc: 'وضعیت کنترل‌شده‌ی خواندن، مثلاً وصل به پخش‌کننده‌ی خودت.' },
          { name: 'speakDuration', type: 'number', desc: 'مدت خواندن بدون کنترل (میلی‌ثانیه)؛ پیش‌فرض از روی text تخمین زده می‌شود.' },
          { name: 'quiet', type: 'boolean', default: 'true', desc: 'نوار تا رفتن اشاره‌گر روی پیام کم‌رنگ است. برای این کار data-ui-message را روی والد پیام بگذار.' },
          { name: 'label', type: 'string', default: "'کارهای پیام'", desc: 'نام قابل‌خواندن نوار.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه.' },
        ],
      },
      {
        component: 'MessageText',
        items: [
          { name: 'version', type: 'string | number', required: true, desc: 'کلید نسخه؛ با عوض شدنش متن قدیمی محو و متن تازه ظاهر می‌شود.' },
          { name: 'children', type: 'ReactNode', required: true, desc: 'متن پیام.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'Tab', action: 'رفتن بین دکمه‌ها؛ با فوکوس، نوار پررنگ می‌شود و راهنمای هر دکمه دیده می‌شود.' },
      { keys: 'Esc', action: 'بستن ردیف بازخورد.' },
      { keys: 'Enter', action: 'ارسال بازخورد، وقتی فوکوس در فیلد «بیشتر بگو» است.' },
    ],
    a11y: [
      'نوار role="group" با برچسب label است؛ دکمه‌ها aria-label دارند و دکمه‌های دوحالته aria-pressed و aria-expanded.',
      'کلید نسخه برچسب‌هایی مثل «نسخه ۲ از ۳» و دکمه‌های «نسخهٔ قبلی» و «نسخهٔ بعدی» دارد.',
      'ناحیه‌ی aria-live="polite" کپی، نسخه و ارسال بازخورد را اعلام می‌کند.',
      'راهنمای دکمه‌ها هم با hover و هم با فوکوس کیبورد دیده می‌شود. با prefers-reduced-motion انیمیشن‌ها حذف می‌شوند.',
    ],
    responsive: [
      'کمتر از ۳۲۰ پیکسل (عرض خود نوار) دکمه‌ی ارسال بازخورد زیر دلیل‌ها می‌رود.',
      'روی صفحه‌ی لمسی نوار همیشه پررنگ است و دکمه‌ها بزرگ‌تر می‌شوند.',
    ],
    related: ['chat-composer', 'tool-call-card', 'inline-diff', 'thinking-loader'],
  },

  /* ------------------------------------------------------------------ tool-call-card */
  {
    slug: 'tool-call-card',
    name: 'ToolCallCard',
    title: 'کارت فراخوانی ابزار',
    category: 'chat',
    summary: 'یک بار صدا زدن ابزار توسط عامل: نام ابزار، خلاصه، وضعیت و زمان؛ بازش کنی ورودی و خروجی را به‌صورت JSON می‌بینی.',
    origin: 'mit',
    file: 'ui/ToolCallCard.tsx',
    extraFiles: ['styles/toolcall.css'],
    importLine: "import { ToolCallCard, ToolCallGroup } from '@kit/ui';\nimport type { ToolCallStatus } from '@kit/ui';",
    whenToUse: [
      'در میان پاسخ دستیار می‌خواهی نشان دهی کدام ابزار با چه ورودی صدا زده شد و چه برگرداند.',
      'اگر ابزار شکست بخورد، پیام خطا و دکمه‌ی تلاش دوباره باید همان‌جا باشد.',
      'چند ابزار پشت‌سرهم صدا زده شده و باید در یک خط جمع شوند (ToolCallGroup).',
    ],
    whenNot: [
      { text: 'می‌خواهی کل یک اجرا را با نوار زمانی و هزینه نشان دهی.', see: 'agent-monitor' },
      { text: 'عامل باید پیش از اجرای ابزار اجازه بگیرد.', see: 'approval-card' },
    ],
    usage: `import { Globe } from 'lucide-react';

const [status, setStatus] = useState<ToolCallStatus>('running');

<ToolCallGroup defaultOpen>
  <ToolCallCard
    name="read_page"
    icon={<Globe size={16} strokeWidth={1.5} />}
    summary="خواندن صفحه‌ی دسته‌ی کفش"
    status={status}
    startedAt={startedAt}
    duration={status === 'success' ? 3200 : undefined}
    args={{ url: 'https://example.ir/category/shoes', renderJs: false }}
    result={status === 'success' ? { status: 200, title: 'کفش ورزشی' } : undefined}
  />
  <ToolCallCard
    name="save_title"
    summary="ذخیره‌ی عنوان تازه"
    status="error"
    error="سایت این تغییر را نپذیرفت."
    onRetry={() => retrySave()}
  />
</ToolCallGroup>`,
    props: [
      {
        component: 'ToolCallCard',
        items: [
          { name: 'name', type: 'string', required: true, desc: 'نام ابزار همان‌طور که عامل صدا می‌زند؛ با قلم کدنویسی نشان داده می‌شود.' },
          { name: 'summary', type: 'ReactNode', desc: 'خلاصه‌ی انسانی کار، کنار نام.' },
          { name: 'icon', type: 'ReactNode', desc: 'آیکن کاشی. پیش‌فرض یک آچار است.' },
          { name: 'status', type: "'running' | 'success' | 'error'", required: true, desc: 'وضعیت: در حال اجرا (با چرخان و زمان زنده)، موفق (با تیک و مدت) یا ناموفق.' },
          { name: 'args', type: 'unknown', desc: 'ورودی ابزار؛ شیء چاپ مرتب می‌شود و رشته‌ی JSON تجزیه می‌شود. اگر undefined باشد بخش ورودی نیست.' },
          { name: 'result', type: 'unknown', desc: 'خروجی ابزار؛ شیء یا JSON مرتب نشان داده می‌شود و متن ساده همان‌طور.' },
          { name: 'error', type: 'string', desc: 'پیام خطا برای وضعیت error. اگر ندهی «اجرای ابزار ناموفق بود.» می‌آید.' },
          { name: 'startedAt', type: 'number', desc: 'زمان شروع (Date.now()) برای شمارنده‌ی زنده.' },
          { name: 'duration', type: 'number', desc: 'مدت نهایی (میلی‌ثانیه). اگر ندهی، زمانی که کارت در حال اجرا دیده شده اندازه گرفته می‌شود.' },
          { name: 'defaultOpen', type: 'boolean', default: 'false', desc: 'کارت از اول باز باشد (وقتی open را کنترل نمی‌کنی).' },
          { name: 'open', type: 'boolean', desc: 'باز بودن کنترل‌شده.' },
          { name: 'onOpenChange', type: '(open: boolean) => void', desc: 'با باز و بسته شدن صدا می‌شود.' },
          { name: 'openOnError', type: 'boolean', default: 'true', desc: 'با شکست خوردن کارت خودش باز می‌شود و با اجرای بعدی بسته؛ مگر کاربر دستی تغییرش داده باشد.' },
          { name: 'onRetry', type: '() => void', desc: 'اگر بدهی کنار خطا دکمه‌ی «تلاش دوباره» می‌آید.' },
          { name: 'maxCodeHeight', type: 'number', default: '220', desc: 'ارتفاعی (پیکسل) که بعدش ورودی و خروجی با محو شدن بریده و «نمایش همه» اضافه می‌شود.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه.' },
        ],
      },
      {
        component: 'ToolCallGroup',
        items: [
          { name: 'children', type: 'ReactNode', required: true, desc: 'کارت‌های ToolCallCard؛ گروه نام، آیکن، وضعیت و مدتشان را از propها می‌خواند.' },
          { name: 'label', type: 'string', desc: 'عنوان بعد از تمام شدن همه؛ پیش‌فرض «N ابزار استفاده شد».' },
          { name: 'runningLabel', type: 'string', default: "'در حال استفاده از ابزارها…'", desc: 'عنوان وقتی دست‌کم یک کارت در حال اجراست.' },
          { name: 'duration', type: 'number', desc: 'مدت کل (میلی‌ثانیه)؛ پیش‌فرض جمع مدت کارت‌ها یا زمان اندازه‌گیری‌شده.' },
          { name: 'defaultOpen', type: 'boolean', default: 'false', desc: 'گروه باز شروع شود.' },
          { name: 'open', type: 'boolean', desc: 'باز بودن کنترل‌شده.' },
          { name: 'onOpenChange', type: '(open: boolean) => void', desc: 'با باز و بسته شدن گروه صدا می‌شود.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'Enter / Space', action: 'باز و بسته کردن کارت یا گروه (سرِ هر کدام یک دکمه است).' },
      { keys: 'Tab', action: 'رفتن به دکمه‌های کپی، «نمایش همه» و «تلاش دوباره» در کارت باز.' },
    ],
    a11y: [
      'سرِ کارت و گروه دکمه با aria-expanded و aria-controls است؛ بخش بسته inert است.',
      'ناحیه‌ی role="status" (aria-live="polite") می‌گوید «… در حال اجراست»، «… تمام شد» یا «… ناموفق بود» با متن خطا.',
      'گروه در اعلامش تعداد ابزارهای ناموفق را هم می‌گوید.',
      'نام ابزار همیشه چپ‌به‌راست (dir="ltr") است و خلاصه dir="auto" دارد. با prefers-reduced-motion انیمیشن‌ها حذف می‌شوند.',
    ],
    responsive: [
      'نقطه‌ی شکست جداگانه‌ای ندارد: کارت تمام عرض والد را می‌گیرد و خلاصه‌ی بلند با «…» بریده می‌شود.',
      'حالت hover فقط روی دستگاه‌های دارای ماوس اعمال می‌شود.',
    ],
    related: ['agent-monitor', 'message-actions', 'thinking-loader', 'approval-card'],
  },

  /* ------------------------------------------------------------------ inline-diff */
  {
    slug: 'inline-diff',
    name: 'InlineDiff',
    title: 'تفاوت درون‌متنی',
    category: 'chat',
    summary: 'پیشنهادهای ویرایش هوش مصنوعی روی یک متن: هر تغییر در همان جمله علامت می‌خورد و جداگانه پذیرفته یا رد می‌شود.',
    origin: 'own',
    file: 'ui/InlineDiff.tsx',
    extraFiles: ['styles/diff.css'],
    importLine: "import { InlineDiff, diffWords } from '@kit/ui';\nimport type { DiffSegment, InlineDiffHandle } from '@kit/ui';",
    whenToUse: [
      'دستیار متنی را بازنویسی کرده و کاربر باید هر تغییر را خودش تأیید کند.',
      'می‌خواهی تغییر سطح‌کلمه (نه کل متن) نشان دهی و متن نهایی را برگردانی.',
      'تغییرها از سرور آماده می‌آیند و فقط باید نشانشان دهی (readOnly).',
    ],
    whenNot: [
      { text: 'می‌خواهی تغییر عددهای یک شاخص (مثل بازدید) را نشان دهی.', see: 'change-summary' },
      { text: 'می‌خواهی تغییرهای عامل در سامانه‌ها را برگردانی.', see: 'agent-ledger' },
    ],
    usage: `import { useRef, useState } from 'react';
import { InlineDiff, type InlineDiffHandle } from '@kit/ui';

const original = 'سلام به همه، خیلی خوشحالیم که اعلام کنیم داشبورد جدید برای همه موجود است.';
const suggested = 'سلام به همه، داشبورد جدید حالا برای همه فعال است.';

export function RewriteReview() {
  const handle = useRef<InlineDiffHandle>(null);
  const [text, setText] = useState(original);
  return (
    <>
      <InlineDiff
        ref={handle}
        label="پیشنهاد هوش مصنوعی · کوتاه‌ترش کن"
        original={original}
        suggested={suggested}
        onChange={setText}
        onDone={(final) => save(final)}
      />
      <button onClick={() => handle.current?.acceptAll()}>پذیرفتن همه</button>
    </>
  );
}`,
    props: [
      {
        items: [
          { name: 'original', type: 'string', default: "''", desc: 'متن اصلی.' },
          { name: 'suggested', type: 'string', default: "''", desc: 'متن پیشنهادی؛ تفاوت با اصلی کلمه‌به‌کلمه محاسبه می‌شود.' },
          { name: 'changes', type: 'DiffSegment[]', desc: 'تکه‌های آماده، به‌جای original و suggested. هر تکه یا { type: "equal", text } یا { type: "change", remove, insert } است.' },
          { name: 'onChange', type: '(text: string) => void', desc: 'با هر تصمیم، متن فعلی (پذیرفته‌ها اعمال، بقیه همان قدیمی) را می‌دهد.' },
          { name: 'onDone', type: '(text: string) => void', desc: 'وقتی همه‌ی تغییرها تعیین تکلیف شدند، متن نهایی را می‌دهد.' },
          { name: 'label', type: 'string', desc: 'خط کوچک بالای متن، مثل «پیشنهاد هوش مصنوعی».' },
          { name: 'tray', type: 'boolean', default: 'false', desc: 'برچسب را روی سینی خاکستری بالای کارت می‌گذارد، نه داخل آن.' },
          { name: 'readOnly', type: 'boolean', default: 'false', desc: 'فقط متن علامت‌خورده؛ بدون نوار و پنجره‌ی پذیرفتن و رد.' },
          { name: 'lang', type: "'fa' | 'en'", default: "'fa'", desc: 'زبان متن‌های داخلی. جهت نوشتار از خود صفحه می‌آید.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه.' },
          { name: 'ref', type: 'Ref<InlineDiffHandle>', desc: 'برای کنترل از بیرون: highlight، accept، reject، acceptAll، rejectAll، undo و reset.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'Y یا Enter', action: 'پذیرفتن تغییر فوکوس‌شده.' },
      { keys: 'N یا Backspace', action: 'رد تغییر فوکوس‌شده.' },
      { keys: 'Ctrl/⌘ + Z', action: 'بازگرداندن آخرین تصمیم.' },
      { keys: 'Esc', action: 'بستن پنجره‌ی پیشنهاد و برداشتن فوکوس از تغییر.' },
      { keys: 'Tab', action: 'رفتن به تغییر بعدی در متن.' },
    ],
    a11y: [
      'هر تغییر در انتظار role="button" و tabIndex دارد و برچسبش می‌گوید «پیشنهاد ۲ از ۵: جایگزینی … با … . برای پذیرفتن Y و برای رد N را بزنید».',
      'بعد از هر تصمیم، ناحیه‌ی role="status" و aria-live="polite" می‌گوید چند پیشنهاد مانده.',
      'طرف حذف‌شده یا نپذیرفته aria-hidden می‌شود تا صفحه‌خوان فقط متن فعلی را بخواند.',
      'پنجره‌ی پیشنهاد role="group" دارد و در حالت readOnly کل کامپوننت inert است. با prefers-reduced-motion گذارها حذف می‌شوند.',
    ],
    responsive: [
      'کمتر از ۴۰۰ پیکسل (عرض خود کارت) پیکان‌های قبلی و بعدی پنهان می‌شوند.',
      'زیر ۴۲۰ پیکسل حاشیه‌های داخلی کمتر می‌شود؛ روی صفحه‌ی لمسی دکمه‌ها بزرگ‌تر و راهنمای کلیدها پنهان است.',
    ],
    related: ['message-actions', 'change-summary', 'agent-ledger', 'chat-composer'],
  },

  /* ------------------------------------------------------------------ thinking-loader */
  {
    slug: 'thinking-loader',
    name: 'ThinkingLoader',
    title: 'نشانگر در حال فکر',
    category: 'chat',
    summary: 'کپسول کوچک «مدل دارد کار می‌کند» با چرخان و متنی که مرحله به مرحله عوض می‌شود و در پایان به «… فکر کرد» تبدیل می‌شود.',
    origin: 'mit',
    file: 'ui/ThinkingLoader.tsx',
    extraFiles: ['styles/thinking.css'],
    importLine: "import { ThinkingLoader } from '@kit/ui';",
    whenToUse: [
      'بین فرستادن پیام و رسیدن اولین کلمه‌ی پاسخ، یا وقتی دستیار در حال جست‌وجو و خواندن منبع است.',
      'می‌خواهی مرحله‌ها را از رویدادهای واقعی (phase) جلو ببری، یا با زمان‌سنج خودکار.',
      'در پایان باید مدت فکر کردن نمایش داده شود.',
    ],
    whenNot: [
      { text: 'چند کار با مرحله و پیشرفت دقیق دارید.', see: 'agent-monitor' },
      { text: 'می‌خواهی جای یک محتوای در حال بارگذاری را پر کنی.', see: 'shimmer' },
    ],
    usage: `const PHASES = ['در حال فکر کردن', 'جستجو در وب', 'خواندن منابع', 'نوشتن پاسخ'];

export function AnswerStatus({ phase, finished }: { phase: number; finished: boolean }) {
  return (
    <ThinkingLoader
      phases={PHASES}
      phase={phase}
      done={finished}
      doneLabel={(seconds) => 'فکر کردن ' + seconds + ' ثانیه طول کشید'}
    />
  );
}

// بدون کنترل: خودش هر ۲٫۲ ثانیه مرحله را عوض می‌کند و دور می‌زند
<ThinkingLoader loop size="sm" variant="plain" />`,
    props: [
      {
        items: [
          { name: 'phases', type: 'string[]', default: "['در حال فکر کردن', 'جستجو در وب', 'خواندن منابع', 'نوشتن پاسخ']", desc: 'برچسب‌هایی که یکی‌یکی نشان داده می‌شوند.' },
          { name: 'interval', type: 'number', default: '2200', desc: 'مدت هر مرحله (میلی‌ثانیه)؛ کمترین مقدار مجاز ۲۰۰ است.' },
          { name: 'phase', type: 'number', desc: 'شماره‌ی مرحله‌ی کنترل‌شده. با دادنش دیگر زمان‌سنج خودکار کار نمی‌کند.' },
          { name: 'loop', type: 'boolean', default: 'false', desc: 'بعد از آخرین مرحله از اول شروع کند؛ وگرنه روی آخری می‌ماند.' },
          { name: 'done', type: 'boolean', default: 'false', desc: 'تمام شد: چرخان به تیک و متن به doneLabel تبدیل می‌شود.' },
          { name: 'doneLabel', type: 'string | ((seconds: number) => string)', default: "(s) => `${مدت} فکر کرد`", desc: 'متن پایان؛ تابع، ثانیه‌های گذشته از شروع را می‌گیرد. پیش‌فرض مثلاً «۶ ثانیه فکر کرد».' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", desc: 'اندازه.' },
          { name: 'variant', type: "'pill' | 'plain'", default: "'pill'", desc: 'pill کپسول رنگی است و plain فقط چرخان و متن، مثلاً داخل حباب گفت‌وگو.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه.' },
          { name: 'label', type: 'string', desc: 'قدیمی: یک متن ثابت بدون زمان‌سنج (همان phases={[label]}).' },
        ],
      },
    ],
    a11y: [
      'ریشه role="status" و aria-live="polite" دارد، پس تغییر مرحله و پایان کار اعلام می‌شود.',
      'چرخان و تیک تزئینی‌اند (aria-hidden) و متنِ در حال خروج هم aria-hidden است تا دوبار خوانده نشود.',
      'متنی که جا نمی‌شود با «…» بریده می‌شود و متن کامل در title می‌ماند.',
      'با prefers-reduced-motion انیمیشن‌ها تقریباً حذف می‌شوند و پرتوهای چرخان ثابت و کم‌رنگ می‌مانند.',
    ],
    responsive: [
      'در والد باریک، متن با ResizeObserver دوباره اندازه می‌گیرد و اگر جا نشود با «…» تمام می‌شود.',
      'نقطه‌ی شکست media ندارد.',
    ],
    related: ['chat-composer', 'message-actions', 'shimmer', 'tool-call-card'],
  },
];
