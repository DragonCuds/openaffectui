import type { DocEntry } from '../types';

export const agents: DocEntry[] = [
  /* ------------------------------------------------------------------ approval-card */
  {
    slug: 'approval-card',
    name: 'ApprovalCard',
    title: 'کارت تأیید',
    category: 'agents',
    summary: 'عامل پیش از انجام یک کار حساس اینجا اجازه می‌گیرد: کارت پیش‌نمایش، دکمه‌ی تأیید و رد، شمارش معکوس اختیاری و تبدیل نرم به یک ردیف خلاصه.',
    origin: 'own',
    file: 'ui/ApprovalCard.tsx',
    extraFiles: ['styles/approval.css'],
    importLine: "import { ApprovalCard } from '@kit/ui';\nimport { ApprovalPeople } from '@kit/ui/ApprovalCard';",
    whenToUse: [
      'عامل می‌خواهد کاری بکند که برگشتش سخت است (ارسال ایمیل، انتشار، حذف) و باید اول از کاربر بپرسد.',
      'می‌خواهی کاربر پیش از تأیید ببیند دقیقاً چه چیزی تغییر می‌کند (جزئیات، گیرندگان، تفاوت).',
      'درخواست مهلت دارد و اگر کسی جواب ندهد باید خودش رد شود.',
      'می‌خواهی بعد از جواب، کارت جمع شود و فقط یک ردیف کوچک «تأیید شد / رد شد» بماند.',
    ],
    whenNot: [
      { text: 'چند تصمیم کوتاه پشت‌سرهم دارید و فقط دو دکمه‌ی ساده کافی است.', see: 'decision-inbox' },
      { text: 'فقط یک سؤال «مطمئنی؟» روی یک دکمه‌ی معمولی لازم است.', see: 'confirm-row' },
      { text: 'می‌خواهی حد کلی اختیار عامل را تنظیم کنی، نه یک درخواست تکی.', see: 'autonomy-dial' },
    ],
    usage: `import { Mail } from 'lucide-react';

export function CampaignApproval() {
  return (
    <ApprovalCard
      title="ارسال ایمیل کمپین"
      description="به‌روزرسانی مهر · خبرنامه"
      risk="medium"
      icon={<Mail size={16} strokeWidth={1.75} />}
      preview={<ApprovalPeople names={['مریم', 'یونس', 'سارا']} more={38} />}
      details={[
        { label: 'موضوع', value: 'تازه‌های مهر' },
        { label: 'ارسال', value: 'امروز، ۹:۰۰ صبح' },
      ]}
      expiresIn={60}
      onApprove={async ({ always }) => {
        await fetch('/api/campaign/send', { method: 'POST', body: JSON.stringify({ always }) });
      }}
      onDeny={({ reason }) => console.log('رد شد', reason)}
    />
  );
}`,
    props: [
      {
        items: [
          { name: 'title', type: 'string', required: true, desc: 'نام کاری که عامل می‌خواهد انجام دهد؛ نام قابل‌خواندن کارت هم همین است.' },
          { name: 'description', type: 'ReactNode', desc: 'یک خط توضیح زیر عنوان که اگر بلند باشد با «…» بریده می‌شود.' },
          { name: 'risk', type: "'low' | 'medium' | 'high'", desc: 'سطح ریسک؛ نشانی رنگی در بالای کارت نشان می‌دهد. اگر ندهی نشانی دیده نمی‌شود.' },
          { name: 'icon', type: 'ReactNode', desc: 'آیکن کاشی کوچک بالای کارت. پیش‌فرض یک سپر است.' },
          { name: 'details', type: '{ label: string; value: ReactNode }[]', desc: 'ردیف‌های «نام و مقدار» در بخش پیش‌نمایش.' },
          { name: 'preview', type: 'ReactNode', desc: 'محتوای دلخواه بالای جزئیات، مثل فهرست گیرندگان یا تفاوت متن.' },
          { name: 'children', type: 'ReactNode', desc: 'همان کار preview را می‌کند.' },
          { name: 'status', type: "'pending' | 'approved' | 'denied'", desc: 'وضعیت کنترل‌شده. اگر دوباره pending شود، درخواست تازه‌ای شروع می‌شود.' },
          { name: 'defaultStatus', type: "'pending' | 'approved' | 'denied'", default: "'pending'", desc: 'وضعیت اولیه وقتی خودت status را کنترل نمی‌کنی.' },
          { name: 'onApprove', type: '(info: { always: boolean }) => void | Promise<unknown>', desc: 'با زدن تأیید صدا می‌شود. اگر Promise برگردانی، چرخان نشان داده می‌شود و کارت قفل می‌ماند؛ با رد شدن Promise کارت منتظر می‌ماند.' },
          { name: 'onDeny', type: "(info: { reason: 'user' | 'timeout' }) => void", desc: 'با رد کردن یا تمام شدن مهلت صدا می‌شود.' },
          { name: 'onEdit', type: '() => void', desc: 'اگر بدهی، دکمه‌ی «ویرایش» پیش از «رد» می‌آید.' },
          { name: 'onUndo', type: '() => void', desc: 'اگر بدهی، روی ردیف نتیجه دکمه‌ی کم‌رنگ «لغو» دیده می‌شود.' },
          { name: 'expiresIn', type: 'number', desc: 'مهلت درخواست به ثانیه. وقتی اشاره‌گر یا فوکوس روی کارت است شمارش می‌ایستد.' },
          { name: 'onExpire', type: '() => void', desc: 'وقتی مهلت تمام شد، درست پیش از رد خودکار صدا می‌شود.' },
          { name: 'allowAlways', type: 'boolean', default: 'true', desc: 'گزینه‌ی «همیشه اجازه بده» را نشان می‌دهد.' },
          { name: 'alwaysLabel', type: 'string', default: "'همیشه اجازه بده'", desc: 'متن گزینه‌ی همیشه.' },
          { name: 'approveLabel', type: 'string', default: "'تأیید'", desc: 'متن دکمه‌ی تأیید.' },
          { name: 'denyLabel', type: 'string', default: "'رد'", desc: 'متن دکمه‌ی رد.' },
          { name: 'editLabel', type: 'string', default: "'ویرایش'", desc: 'متن دکمه‌ی ویرایش.' },
          { name: 'undoLabel', type: 'string', default: "'لغو'", desc: 'متن دکمه‌ی بازگردانی.' },
          { name: 'pendingLabel', type: 'string', default: "'در حال انجام…'", desc: 'متنی که صفحه‌خوان‌ها هنگام انجام کار می‌خوانند.' },
          { name: 'approvedLabel', type: 'string', default: "'تأیید شد'", desc: 'متن ردیف نتیجه بعد از تأیید.' },
          { name: 'deniedLabel', type: 'string', default: "'رد شد'", desc: 'متن ردیف نتیجه بعد از رد.' },
          { name: 'expiredLabel', type: 'string', default: "'منقضی شد'", desc: 'متن ردیف نتیجه وقتی مهلت تمام شده.' },
          { name: 'alwaysWord', type: 'string', default: "'همیشه'", desc: 'کلمه‌ای که کنار نتیجه می‌آید اگر «همیشه» انتخاب شده باشد.' },
          { name: 'justNowLabel', type: 'string', default: "'همین الان'", desc: 'متن زمان در ردیف نتیجه.' },
          { name: 'expiresLabel', type: 'string', default: "'مهلت'", desc: 'برچسب کنار شمارنده‌ی مهلت.' },
          { name: 'shortcuts', type: 'boolean', default: 'true', desc: 'راهنمای Ctrl+Enter و Esc را روی دکمه‌ها نشان می‌دهد؛ خود میانبرها در هر حال کار می‌کنند.' },
          { name: 'keys', type: 'boolean', default: 'true', desc: 'اگر false باشد میانبرهای صفحه‌کلید کاملاً خاموش می‌شوند؛ برای کارت‌هایی که روی سایت زنده می‌نویسند.' },
          { name: 'wrap', type: 'boolean', default: 'false', desc: 'عنوان و توضیح بلند را به‌جای بریدن، در چند خط می‌شکند.' },
          { name: 'label', type: 'ReactNode', desc: 'برچسب کوچک روی سینی خاکستری بالای کارت؛ فقط با actions="tray" دیده می‌شود.' },
          { name: 'actions', type: "'card' | 'tray'", default: "'card'", desc: 'جای دکمه‌ها: ردیف آخر خود کارت، یا سینی خاکستری زیر آن.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه‌ی کارت.' },
        ],
      },
      {
        component: 'ApprovalPeople',
        items: [
          { name: 'names', type: 'string[]', required: true, desc: 'نام افراد؛ از چهار نفر اول حرف اول نشان داده می‌شود.' },
          { name: 'more', type: 'number', desc: 'تعداد بقیه که در فهرست نیستند؛ به شکل «+۳۸ نفر دیگر» می‌آید.' },
          { name: 'moreLabel', type: 'string', desc: 'متن دلخواه به‌جای «+N نفر دیگر».' },
        ],
      },
    ],
    keyboard: [
      { keys: 'Ctrl/⌘ + Enter', action: 'تأیید درخواست (وقتی فوکوس داخل کارت است).' },
      { keys: 'Esc', action: 'رد درخواست (وقتی فوکوس داخل کارت است).' },
      { keys: 'Tab', action: 'رفتن بین گزینه‌ی همیشه و دکمه‌ها.' },
    ],
    a11y: [
      'ریشه role="group" است و نامش از عنوان و توضیحش گرفته می‌شود.',
      'ناحیه‌ی aria-live="polite" نتیجه را اعلام می‌کند، مثل «تأیید شد: ارسال ایمیل کمپین».',
      'دکمه‌ها aria-keyshortcuts دارند و در حال انجام کار aria-busy می‌گیرند.',
      'اگر مهلت داشته باشی، توضیح پنهانی برای صفحه‌خوان می‌آید که می‌گوید شمارش با اشاره‌گر یا فوکوس می‌ایستد.',
      'وقتی فوکوس داخل کارت بود و کارت به ردیف نتیجه تبدیل شد، فوکوس به همان ردیف می‌رود. با prefers-reduced-motion تبدیل بدون انیمیشن انجام می‌شود.',
    ],
    responsive: [
      'روی کارت‌های باریک‌تر از ۴۰۰ پیکسل، دکمه‌ها تمام‌عرض می‌شوند و راهنمای کلیدها پنهان می‌شود.',
      'زیر ۳۴۰ پیکسل کلمه‌ی «ریسک» و زمان ردیف نتیجه هم حذف می‌شوند.',
      'در دستگاه‌های بدون hover (لمسی) راهنمای کلیدها نشان داده نمی‌شود.',
    ],
    related: ['decision-inbox', 'agent-ledger', 'autonomy-dial', 'confirm-row'],
  },

  /* ------------------------------------------------------------------ agent-inbox */
  {
    slug: 'agent-inbox',
    name: 'AgentInbox',
    title: 'صندوق کارها',
    category: 'agents',
    summary: 'کارهای پس‌زمینه‌ی عامل‌ها را در یک برد ستونی (یا فهرست) نشان می‌دهد؛ هر کارت باز می‌شود و آخرین مرحله‌ها و دکمه‌هایش را نشان می‌دهد.',
    origin: 'own',
    file: 'ui/AgentInbox.tsx',
    extraFiles: ['styles/inbox.css'],
    importLine: "import { AgentInbox } from '@kit/ui';\nimport type { InboxItem } from '@kit/ui';",
    whenToUse: [
      'چند کار هم‌زمان در حال اجراست و کاربر باید ببیند کدام منتظر خودش است، کدام دارد اجرا می‌شود و کدام تمام شده.',
      'می‌خواهی کاربر بدون رفتن به صفحه‌ی دیگر، مرحله‌های آخر یک کار را ببیند و رویش اقدام کند.',
      'حرکت کارت‌ها بین ستون‌ها باید نرم باشد، وقتی وضعیت کار عوض می‌شود.',
    ],
    whenNot: [
      { text: 'فقط یک عامل را می‌خواهی با نوار زمانی و کنترل‌هایش ببینی.', see: 'agent-monitor' },
      { text: 'فقط چند تصمیم بله/نه دارید.', see: 'decision-inbox' },
      { text: 'می‌خواهی صفی را با کارگرها و محدودیت نرخ نشان دهی.', see: 'agent-queue' },
    ],
    usage: `const [items, setItems] = useState<InboxItem[]>([
  {
    id: 'mig',
    group: 'need',
    tone: 'warn',
    title: 'مهاجرت جدول کاربران',
    summary: 'اجرای آزمایشی روی استیجینگ بدون خطا تمام شد.',
    meta: 'منتظر شماست',
    time: '۶:۱۳',
    model: 'Opus 5.5',
    steps: [
      { text: 'اسکیما خوانده شد', time: '۶ دقیقه پیش' },
      { text: 'اجازه‌ی اجرا روی سرور اصلی را می‌خواهد', time: '۱ دقیقه پیش' },
    ],
    actions: [
      { id: 'ok', label: 'اجرا کن', primary: true, onClick: () => approve('mig') },
      { id: 'no', label: 'فعلاً نه', onClick: () => hold('mig') },
    ],
  },
  { id: 'pr', group: 'running', tone: 'busy', title: 'بررسی PR شماره‌ی ۴۸۲', meta: 'در حال اجرا', time: '۳:۴۲' },
]);

<AgentInbox items={items} crumbs={['عامل‌ها', 'صندوق کارها']} defaultSelectedId="mig" />`,
    props: [
      {
        items: [
          { name: 'items', type: 'InboxItem[]', required: true, desc: 'فهرست کارها. اگر خالی باشد حالت خالی نشان داده می‌شود.' },
          { name: 'groups', type: '{ key: string; label: string; tone: Tone }[]', default: "need / running / done", desc: 'ستون‌ها. پیش‌فرض سه ستون «منتظر تو»، «در حال اجرا» و «انجام شد» است.' },
          { name: 'view', type: "'board' | 'list'", desc: 'نمای کنترل‌شده: برد یا فهرست.' },
          { name: 'defaultView', type: "'board' | 'list'", default: "'board'", desc: 'نمای اولیه وقتی view را کنترل نمی‌کنی.' },
          { name: 'onViewChange', type: "(v: 'board' | 'list') => void", desc: 'وقتی کاربر نما را عوض می‌کند.' },
          { name: 'selectedId', type: 'string | null', desc: 'شناسه‌ی کارتِ باز (کنترل‌شده). null یعنی همه بسته.' },
          { name: 'defaultSelectedId', type: 'string | null', desc: 'کارتی که از اول باز باشد.' },
          { name: 'onSelect', type: '(id: string | null) => void', desc: 'با باز و بسته شدن کارت‌ها صدا می‌شود.' },
          { name: 'crumbs', type: 'string[]', desc: 'مسیر بالای برد؛ آخری صفحه‌ی فعلی است. اگر ندهی نوشته‌ای دیده نمی‌شود.' },
          { name: 'maxSteps', type: 'number', default: '4', desc: 'از هر کارت فقط این تعداد مرحله‌ی آخر نشان داده می‌شود.' },
          { name: 'viewLabels', type: '{ board: string; list: string }', default: "{ board: 'برد', list: 'فهرست' }", desc: 'متن دکمه‌های تعویض نما.' },
          { name: 'empty', type: 'string', default: "'فعلاً کاری در صف نیست'", desc: 'پیام وقتی items خالی است.' },
          { name: 'label', type: 'string', default: "'صندوق کارها'", desc: 'نام قابل‌خواندن ناحیه برای صفحه‌خوان.' },
        ],
      },
      {
        component: 'InboxItem',
        items: [
          { name: 'id', type: 'string', required: true, desc: 'شناسه‌ی یکتای کار.' },
          { name: 'group', type: 'string', required: true, desc: 'کلید ستونی که کار در آن می‌نشیند. با عوض شدنش کارت به ستون تازه می‌لغزد.' },
          { name: 'title', type: 'string', required: true, desc: 'عنوان کار.' },
          { name: 'summary', type: 'string', desc: 'توضیح کوتاه؛ بسته دو خط، باز کامل نشان داده می‌شود.' },
          { name: 'meta', type: 'string', desc: 'متن وضعیت، مثل «منتظر شماست».' },
          { name: 'time', type: 'string', desc: 'ساعت یا مدت، بعد از وضعیت، مثل «۳:۴۲».' },
          { name: 'tone', type: "'ok' | 'busy' | 'warn' | 'bad' | 'info' | 'quiet'", desc: 'رنگ ستاره و آیکن وضعیت. اگر ندهی از رنگ ستون گرفته می‌شود.' },
          { name: 'stats', type: '{ icon?: ReactNode; value: ReactNode; label?: string }[]', desc: 'شمارنده‌های کوچک آخر خط وضعیت.' },
          { name: 'model', type: 'string', desc: 'نام مدل یا عامل بالای مرحله‌ها.' },
          { name: 'steps', type: '{ text: string; time?: string }[]', desc: 'مرحله‌ها از قدیم به جدید.' },
          { name: 'actions', type: '{ id: string; label: string; primary?: boolean; onClick?: () => void }[]', desc: 'دکمه‌های پایین کارت باز.' },
        ],
      },
    ],
    keyboard: [
      { keys: '↓ / ↑', action: 'رفتن به کارت بعدی یا قبلی.' },
      { keys: 'Enter / Space', action: 'باز و بسته کردن کارت فوکوس‌شده.' },
      { keys: 'Tab', action: 'رفتن به دکمه‌های داخل کارت باز.' },
    ],
    a11y: [
      'ریشه role="region" با نام label است و هر ستون با عنوانش برچسب‌گذاری شده.',
      'سرِ هر کارت یک دکمه با aria-expanded و aria-controls است.',
      'بخش بسته‌ی کارت inert است، پس Tab به آن نمی‌رود.',
      'مسیر بالای برد با aria-current="page" صفحه‌ی فعلی را نشان می‌دهد؛ دکمه‌های نما با aria-pressed کار می‌کنند.',
      'با prefers-reduced-motion لغزیدن کارت‌ها و انیمیشن ورود حذف می‌شود.',
    ],
    responsive: [
      'از ۶۰۱ پیکسل عرض به بالا ستون‌ها کنار هم (برد) و دکمه‌ی تعویض نما دیده می‌شود.',
      'تا ۶۰۰ پیکسل ستون‌های خالی پنهان می‌شوند و کارت‌ها زیر هم می‌آیند.',
    ],
    related: ['agent-monitor', 'decision-inbox', 'agent-queue', 'status-dot'],
  },

  /* ------------------------------------------------------------------ decision-inbox */
  {
    slug: 'decision-inbox',
    name: 'DecisionInbox',
    title: 'صندوق تصمیم‌ها',
    category: 'agents',
    summary: 'چند تصمیم کوتاه را زیر هم می‌گذارد؛ هر کدام دو دکمه دارد و بعد از جواب جمع می‌شود و بعدی باز می‌شود.',
    origin: 'mit',
    file: 'ui/DecisionInbox.tsx',
    extraFiles: ['styles/decision.css'],
    importLine: "import { DecisionInbox } from '@kit/ui';\nimport type { Decision } from '@kit/ui';",
    whenToUse: [
      'عامل چند سؤال دوگزینه‌ای دارد و می‌خواهی کاربر با چند کلیک همه را جواب دهد.',
      'می‌خواهی بالای فهرست بنویسد «چند مورد منتظر نظر شماست» و در پایان بگوید «همه چیز بررسی شد».',
      'سؤال‌های کم‌اهمیت‌تر باید جمع‌شده بمانند تا نوبتشان برسد.',
    ],
    whenNot: [
      { text: 'درخواست خطرناک است و کاربر باید پیش‌نمایش و جزئیات ببیند.', see: 'approval-card' },
      { text: 'کارها طولانی‌اند و مرحله و وضعیت دارند.', see: 'agent-inbox' },
    ],
    usage: `const decisions: Decision[] = [
  {
    id: 'title',
    title: 'عنوان صفحه‌ی «کفش» کوتاه شود؟',
    detail: 'عنوان فعلی ۶۸ نویسه است و در گوگل بریده می‌شود.',
    primary: 'کوتاه کن',
    secondary: 'همین بماند',
  },
  {
    id: 'redirect',
    title: 'ریدایرکت صفحه‌ی قدیمی ساخته شود؟',
    primary: 'بساز',
    secondary: 'نه',
    collapsed: true,
  },
];

<DecisionInbox
  decisions={decisions}
  onDecide={(d, answer) => save(d.id, answer)}
/>`,
    props: [
      {
        items: [
          { name: 'decisions', type: 'Decision[]', required: true, desc: 'فهرست تصمیم‌ها. تصمیم تازه که اضافه کنی باز نشان داده می‌شود؛ ولی collapsed فقط هنگام اولین رندر خوانده می‌شود.' },
          { name: 'onDecide', type: "(decision: Decision, answer: 'primary' | 'secondary') => void", desc: 'با زدن یکی از دو دکمه صدا می‌شود.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه.' },
        ],
      },
      {
        component: 'Decision',
        items: [
          { name: 'id', type: 'string', required: true, desc: 'شناسه‌ی یکتای تصمیم.' },
          { name: 'title', type: 'string', required: true, desc: 'خود سؤال.' },
          { name: 'detail', type: 'string', desc: 'توضیح کوتاه زیر عنوان.' },
          { name: 'primary', type: 'string', required: true, desc: 'متن پاسخ اصلی؛ دکمه‌ی تیره.' },
          { name: 'secondary', type: 'string', required: true, desc: 'متن پاسخ دیگر؛ دکمه‌ی روشن.' },
          { name: 'collapsed', type: 'boolean', desc: 'اگر true باشد، تصمیم به شکل یک خط کم‌رنگ شروع می‌شود و با کلیک باز می‌شود.' },
        ],
      },
    ],
    a11y: [
      'سرِ فهرست aria-live="polite" است و شمار موارد باقی‌مانده را اعلام می‌کند.',
      'بعد از جواب، دکمه با یک پیام تأیید (role="status") عوض می‌شود و فوکوس کیبورد روی آن می‌ماند.',
      'پس از چند لحظه که ردیف جمع شد، فوکوس به دکمه‌ی تصمیم باز بعدی می‌رود، یا به سرِ فهرست اگر چیزی نمانده.',
      'ردیف‌های جمع‌شده inert می‌شوند و در ترتیب Tab نمی‌آیند. با prefers-reduced-motion حرکت‌ها حذف می‌شود.',
    ],
    responsive: ['عرض ثابتی ندارد و تمام عرض والد را می‌گیرد؛ نقطه‌ی شکست جداگانه‌ای ندارد.'],
    related: ['approval-card', 'agent-inbox', 'confirm-row'],
  },

  /* ------------------------------------------------------------------ autonomy-dial */
  {
    slug: 'autonomy-dial',
    name: 'AutonomyDial',
    title: 'کلید اختیار عامل',
    category: 'agents',
    summary: 'کاربر با یک کلید چندحالته تعیین می‌کند عامل چه کارهایی را خودش بکند و چه کارهایی را اول بپرسد؛ هر کار هم می‌تواند قفل شود.',
    origin: 'own',
    file: 'ui/AutonomyDial.tsx',
    extraFiles: ['styles/dial.css'],
    importLine: "import { AutonomyDial, DEFAULT_DIAL_LEVELS } from '@kit/ui';\nimport type { DialAction, DialLevel } from '@kit/ui';",
    whenToUse: [
      'می‌خواهی کاربر یک‌جا و ساده تعیین کند عامل چقدر مستقل باشد.',
      'هر کار عامل سطح خودکارشدن خودش را دارد و کاربر باید ببیند با هر سطح کدام کارها خودکار می‌شوند.',
      'بعضی کارها (مثل حذف) باید همیشه بپرسند، هر سطحی که انتخاب شود.',
    ],
    whenNot: [
      { text: 'می‌خواهی درباره‌ی یک درخواست مشخص تصمیم بگیری.', see: 'approval-card' },
      { text: 'فقط یک انتخاب ساده بین چند گزینه لازم است.', see: 'segmented' },
    ],
    usage: `import { Mail, Trash2 } from 'lucide-react';

const actions: DialAction[] = [
  { id: 'tag', label: 'برچسب‌زدن به تیکت‌ها' },
  { id: 'reply', label: 'پاسخ به پرسش‌های ساده', autoAt: 2, icon: <Mail size={18} strokeWidth={1.8} /> },
  { id: 'refund', label: 'بازگرداندن وجه', risk: 'destructive', locked: true, icon: <Trash2 size={18} strokeWidth={1.8} /> },
];

export function SupportAutonomy() {
  const [level, setLevel] = useState(1);
  return (
    <AutonomyDial
      title="دستیار پشتیبانی"
      subtitle="کارهایی که بدون پرسیدن از تو انجام می‌دهد"
      value={level}
      onChange={setLevel}
      actions={actions}
      onLockedChange={(ids) => console.log('قفل‌شده‌ها', ids)}
    />
  );
}`,
    props: [
      {
        items: [
          { name: 'title', type: 'string', required: true, desc: 'عنوان کارت.' },
          { name: 'subtitle', type: 'string', desc: 'توضیح کوتاه زیر عنوان.' },
          { name: 'icon', type: 'ReactNode', desc: 'آیکن کنار عنوان. پیش‌فرض یک جرقه است.' },
          { name: 'value', type: 'number', required: true, desc: 'شماره‌ی ایستگاه انتخاب‌شده، از صفر.' },
          { name: 'onChange', type: '(n: number) => void', required: true, desc: 'با انتخاب ایستگاه تازه صدا می‌شود.' },
          { name: 'levels', type: 'DialLevel[]', default: 'DEFAULT_DIAL_LEVELS', desc: 'ایستگاه‌ها. هر تعدادی ممکن است؛ پیش‌فرض سه سطح «همیشه بپرس»، «اگر ریسکی بود»، «کاملاً خودکار».' },
          { name: 'actions', type: 'DialAction[]', required: true, desc: 'کارهای واقعی عامل که زیر کلید می‌لغزند.' },
          { name: 'locked', type: 'string[]', desc: 'شناسه‌ی کارهای قفل‌شده (کنترل‌شده). اگر ندهی خود کلید نگهشان می‌دارد.' },
          { name: 'defaultLocked', type: 'string[]', desc: 'قفل‌های اولیه؛ پیش‌فرض همان کارهایی است که locked: true دارند.' },
          { name: 'onLockedChange', type: '(ids: string[]) => void', desc: 'با قفل کردن یا باز کردن یک کار صدا می‌شود.' },
          { name: 'labels', type: 'Partial<DialLabels>', desc: 'متن‌های داخلی (عنوان دو گروه، پیام خالی، برچسب ریسک، متن دکمه‌ی قفل و …).' },
          { name: 'disabled', type: 'boolean', default: 'false', desc: 'کل کلید و قفل‌ها را غیرفعال می‌کند.' },
          { name: 'lockable', type: 'boolean', default: 'true', desc: 'اگر false باشد دکمه‌ی قفل نیست و فقط کارهای قفل‌شده آیکن قفل ثابت دارند.' },
          { name: 'label', type: 'string', desc: 'نام قابل‌خواندن ایستگاه‌ها؛ پیش‌فرض همان title.' },
        ],
      },
      {
        component: 'DialAction',
        items: [
          { name: 'id', type: 'string', required: true, desc: 'شناسه‌ی یکتای کار.' },
          { name: 'label', type: 'string', required: true, desc: 'نام کار.' },
          { name: 'icon', type: 'ReactNode', desc: 'آیکن کنار نام.' },
          { name: 'risk', type: "'risky' | 'destructive'", desc: 'نشانی «ریسکی» یا «مخرب» می‌گذارد. بدون آن کار بی‌خطر حساب می‌شود.' },
          { name: 'autoAt', type: 'number', desc: 'پایین‌ترین ایستگاهی که کار در آن خودکار می‌شود. پیش‌فرض: ۱ برای کار بی‌خطر و آخرین ایستگاه منهای یک برای کار پرریسک.' },
          { name: 'locked', type: 'boolean', desc: 'از اول قفل باشد: همیشه می‌پرسد.' },
        ],
      },
      {
        component: 'DialLevel',
        items: [
          { name: 'label', type: 'string', required: true, desc: 'نام ایستگاه.' },
          { name: 'hint', type: 'string', desc: 'توضیح بلندتر که صفحه‌خوان می‌خواند.' },
        ],
      },
    ],
    keyboard: [
      { keys: '← / →', action: 'رفتن به ایستگاه بعدی یا قبلی (در راست‌به‌چپ، ← یعنی بعدی).' },
      { keys: '↑ / ↓', action: 'رفتن به ایستگاه قبلی یا بعدی.' },
      { keys: 'Home / End', action: 'پریدن به اولین یا آخرین ایستگاه.' },
      { keys: 'Tab', action: 'رفتن به دکمه‌های قفل کارها.' },
    ],
    a11y: [
      'ایستگاه‌ها یک radiogroup‌اند؛ هر کدام role="radio" و aria-checked دارند و فقط ایستگاه انتخاب‌شده در ترتیب Tab است.',
      'توضیح بلند هر سطح با aria-description به صفحه‌خوان می‌رسد.',
      'دکمه‌ی قفل aria-pressed و برچسب روشن «همیشه قبل از … بپرس» دارد.',
      'متن پنهانی با aria-live="polite" فهرست کارهای خودکار را بعد از هر تغییر می‌خواند.',
      'با prefers-reduced-motion لغزیدن ردیف‌ها حذف می‌شود.',
    ],
    responsive: [
      'زیر ۴۰۰ پیکسل اندازه‌ی فونت ایستگاه‌ها و نام کارها کمی کوچک می‌شود.',
      'در دستگاه‌های بدون hover دکمه‌ی قفل کم‌رنگ ولی همیشه دیده می‌شود؛ قفل فعال کاملاً پررنگ است.',
    ],
    related: ['approval-card', 'segmented', 'agent-monitor'],
  },

  /* ------------------------------------------------------------------ agent-monitor */
  {
    slug: 'agent-monitor',
    name: 'AgentMonitor',
    title: 'پایشگر عامل',
    category: 'agents',
    summary: 'یک عامل را وقتی کار می‌کند نشان می‌دهد: مرحله‌ی فعلی، ساعت و هزینه، نوار زمانی مرحله‌ها و دکمه‌های مکث، لغو و اجازه.',
    origin: 'own',
    file: 'ui/AgentMonitor.tsx',
    extraFiles: ['styles/monitor.css'],
    importLine: "import { AgentMonitor } from '@kit/ui';\nimport type { AgentRunStep } from '@kit/ui';",
    whenToUse: [
      'می‌خواهی یک اجرای مشخص از یک عامل را زنده نشان دهی، با مرحله‌ها و هزینه.',
      'عامل ممکن است وسط کار منتظر اجازه بماند و باید دقیقاً فرمان را نشان دهی و «اجازه / رد» بگیری.',
      'کاربر باید بتواند اجرا را مکث، ادامه، لغو یا دوباره امتحان کند.',
    ],
    whenNot: [
      { text: 'چند عامل یا چند کار را کنار هم می‌خواهی.', see: 'agent-inbox' },
      { text: 'می‌خواهی کارهای انجام‌شده را بعداً مرور و برگردانی.', see: 'agent-ledger' },
    ],
    usage: `const steps: AgentRunStep[] = [
  { id: 'read', label: 'خواندن صفحه‌ی دسته‌ی کفش', kind: 'read', state: 'done', took: 1700, tool: 'مرورگر', detail: 'عنوان و توضیح متا خوانده شد.' },
  { id: 'edit', label: 'نوشتن عنوان تازه', kind: 'edit', state: 'done', took: 2300 },
  { id: 'build', label: 'ساخت پیش‌نمایش', kind: 'run', state: 'running', since: Date.now() - 4000 },
];

<AgentMonitor
  state="running"
  agent={{ name: 'Claude Opus 5.5', role: 'عامل سئو' }}
  steps={steps}
  since={Date.now() - 12000}
  cost={0.047}
  onPause={() => agent.pause()}
  onCancel={() => agent.cancel()}
  onOpenLog={() => openLog()}
/>`,
    props: [
      {
        items: [
          { name: 'state', type: "'idle' | 'running' | 'waiting' | 'paused' | 'finished' | 'failed' | 'cancelled'", default: "'idle'", desc: 'وضعیت اجرا. شکل کارت و دکمه‌های پایین آن با همین عوض می‌شود.' },
          { name: 'agent', type: '{ name: string; role?: string; mark?: ReactNode }', default: "{ name: 'Agent' }", desc: 'نام و نقش عامل و نشان کوچکش.' },
          { name: 'steps', type: 'AgentRunStep[]', default: '[]', desc: 'مرحله‌های اجرا؛ هر کدام یک میله در نوار زمانی و یک ردیف در فهرست می‌شود.' },
          { name: 'current', type: '{ label: string; kind?: StepKind; icon?: ReactNode }', desc: 'متنی که در قاب اصلی هنگام اجرا نشان داده می‌شود؛ پیش‌فرض همان مرحله‌ی در حال اجراست.' },
          { name: 'since', type: 'number', desc: 'زمان شروع اجرا (میلی‌ثانیه). ساعت از اینجا می‌شمارد.' },
          { name: 'until', type: 'number', desc: 'زمان پایان؛ در حالت مکث، لحظه‌ی مکث.' },
          { name: 'pausedFor', type: 'number', default: '0', desc: 'مدتی که اجرا مکث بوده (میلی‌ثانیه)؛ از ساعت کم می‌شود.' },
          { name: 'cost', type: 'number', desc: 'هزینه‌ی تا اینجا به دلار؛ تا وقتی عامل مشغول است درخشش دارد.' },
          { name: 'ask', type: '{ title: string; command?: string; icon?: ReactNode }', desc: 'در حالت waiting: عنوان کوتاه و فرمان دقیقی که عامل می‌خواهد اجرا کند.' },
          { name: 'outcome', type: '{ added?: number; removed?: number; files?: number; note?: string }', desc: 'خلاصه‌ی نتیجه بعد از پایان.' },
          { name: 'error', type: 'string', desc: 'در حالت failed: خطا در چند کلمه.' },
          { name: 'onAllow', type: '() => void', desc: 'دکمه‌ی «اجازه» در حالت waiting.' },
          { name: 'onDecline', type: '() => void', desc: 'دکمه‌ی «رد» در حالت waiting.' },
          { name: 'onPause', type: '() => void', desc: 'دکمه‌ی مکث در حالت running.' },
          { name: 'onResume', type: '() => void', desc: 'دکمه‌ی ادامه در حالت paused.' },
          { name: 'onCancel', type: '() => void', desc: 'دکمه‌ی لغو در حالت running و paused.' },
          { name: 'onRetry', type: '() => void', desc: 'دکمه‌ی «تلاش دوباره» در حالت failed.' },
          { name: 'onOpenLog', type: '() => void', desc: 'اگر بدهی دکمه‌ی «گزارش» اضافه می‌شود.' },
          { name: 'defaultFolded', type: 'boolean', default: 'false', desc: 'کارت جمع‌شده (نوار کوچک با ابزارهای استفاده‌شده) شروع شود.' },
          { name: 'clock', type: 'boolean', default: 'true', desc: 'اگر زمان شروع را نمی‌دانی false بگذار تا ساعت دیده نشود.' },
          { name: 'defaultOpenId', type: 'string', desc: 'شناسه‌ی مرحله‌ای که کارت اطلاعاتش از اول باز باشد.' },
          { name: 'labels', type: 'Partial<Labels>', desc: 'جایگزین برای هر متن فارسی داخلی (مثل allow، decline، pause).' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه.' },
        ],
      },
      {
        component: 'AgentRunStep',
        items: [
          { name: 'id', type: 'string', required: true, desc: 'شناسه‌ی یکتای مرحله.' },
          { name: 'label', type: 'string', required: true, desc: 'متن مرحله.' },
          { name: 'kind', type: "'read' | 'search' | 'edit' | 'run' | 'think' | 'web'", desc: 'آیکن ساده برای مرحله‌هایی که لوگو ندارند.' },
          { name: 'icon', type: 'ReactNode', desc: 'لوگوی ابزاری که مرحله استفاده کرده.' },
          { name: 'state', type: "'queued' | 'running' | 'done' | 'failed'", required: true, desc: 'وضعیت مرحله.' },
          { name: 'since', type: 'number', desc: 'زمان شروع مرحله؛ میله‌ی مرحله‌ی در حال اجرا از اینجا رشد می‌کند.' },
          { name: 'took', type: 'number', desc: 'مدت انجام مرحله (میلی‌ثانیه).' },
          { name: 'tool', type: 'string', desc: 'نام ابزار در کارت اطلاعات.' },
          { name: 'detail', type: 'string', desc: 'توضیح اینکه چه شد، در کارت اطلاعات.' },
          { name: 'output', type: 'string', desc: 'فرمان یا مکانی که مرحله به آن دست زده.' },
        ],
      },
    ],
    keyboard: [
      { keys: 'Enter', action: 'در حالت «نیاز به شما»: اجازه (اگر فوکوس روی دکمه یا لینک نباشد).' },
      { keys: 'Esc', action: 'بستن کارت اطلاعات مرحله؛ اگر بسته باشد، در حالت «نیاز به شما» رد.' },
      { keys: 'Tab', action: 'رفتن بین دکمه‌ها و مرحله‌ها.' },
    ],
    a11y: [
      'ریشه role="region" با نام قابل‌خواندن «پایشگر عامل» است؛ نوار جمع‌شده هم برچسب «باز کردن» دارد.',
      'قاب مرحله‌ی فعلی aria-live="polite" است و تغییر مرحله را اعلام می‌کند.',
      'هزینه با role="img" و برچسب «هزینه تا اینجا» و نوار زمانی با برچسب «خط زمانی مرحله‌ها» خوانده می‌شود.',
      'کارت اطلاعات role="dialog" است، فوکوس را می‌گیرد و با Esc فوکوس را به مرحله برمی‌گرداند.',
      'با prefers-reduced-motion انیمیشن‌ها حذف می‌شوند.',
    ],
    responsive: ['زیر ۴۰۰ پیکسل حاشیه‌های کارت کمتر می‌شود و نقش عامل تمام‌عرض می‌گیرد.'],
    related: ['agent-inbox', 'agent-queue', 'agent-ledger', 'approval-card'],
  },

  /* ------------------------------------------------------------------ agent-queue */
  {
    slug: 'agent-queue',
    name: 'AgentQueue',
    title: 'صف کارها',
    category: 'agents',
    summary: 'صف کارهای منتظر، کارگرهای در حال اجرا، شمار انجام‌شده و ناموفق، و نمودار عمق صف را زنده نشان می‌دهد، با محدودیت نرخ و کنترل هم‌زمانی.',
    origin: 'own',
    file: 'ui/AgentQueue.tsx',
    extraFiles: ['styles/queue.css'],
    importLine: "import { AgentQueue } from '@kit/ui';\nimport type { QueueJob, QueueWorker } from '@kit/ui';",
    whenToUse: [
      'عامل‌ها یا ابزارها کارهای زیادی دارند که در صف می‌ایستند و می‌خواهی ببینی صف چقدر پر شده.',
      'می‌خواهی کاربر بتواند صف را مکث کند، تعداد کارگرها را کم و زیاد کند یا کاری را جلو بیندازد و لغو کند.',
      'محدودیت نرخ (rate limit) دارید و باید نشان دهی کارگرها چرا ایستاده‌اند.',
    ],
    whenNot: [
      { text: 'فقط یک اجرا را با مرحله‌هایش می‌خواهی دنبال کنی.', see: 'agent-monitor' },
      { text: 'چند کار کم‌تعداد را در ستون‌های «منتظر / در حال اجرا / انجام شد» می‌خواهی.', see: 'agent-inbox' },
    ],
    usage: `const now = Date.now();

const jobs: QueueJob[] = [
  { id: 'j1', name: 'خلاصه‌ی تیکت ۴۸۲۱', kind: 'llm', status: 'running', enqueuedAt: now - 9000, startedAt: now - 4000, worker: 'w1', estimate: 8000 },
  { id: 'j2', name: 'خواندن صفحه‌ی قیمت‌ها', kind: 'tool', status: 'queued', enqueuedAt: now - 3000 },
  { id: 'j3', name: 'بازبینی عنوان‌ها', kind: 'human', status: 'queued', priority: 'high', enqueuedAt: now - 1000 },
];

const workers: QueueWorker[] = [
  { id: 'w1', name: 'Sonnet 5.5', detail: 'مدل اصلی' },
  { id: 'w2', name: 'Haiku 5', detail: 'ارزان' },
];

<AgentQueue
  jobs={jobs}
  workers={workers}
  backpressure={12}
  onPausedChange={(p) => setPaused(p)}
  onConcurrencyChange={(n) => setWorkerCount(n)}
  onPromote={(job) => moveToFront(job.id)}
  onCancel={(job) => cancel(job.id)}
  name="agent-jobs"
/>`,
    props: [
      {
        items: [
          { name: 'jobs', type: 'QueueJob[]', required: true, desc: 'همه‌ی کارها با وضعیتشان؛ کارت‌ها و کارگرها از روی این ساخته می‌شوند.' },
          { name: 'workers', type: 'QueueWorker[]', required: true, desc: 'جای‌های کارگر. کارِ در حال اجرا بدون worker به اولین جای خالی می‌رود.' },
          { name: 'now', type: 'number', desc: 'ساعت قرارداد (میلی‌ثانیه). اگر ندهی، خود کامپوننت با ساعت سیستم می‌شمارد و فقط وقتی کار هست و روی صفحه دیده می‌شود.' },
          { name: 'rateLimits', type: 'QueueRateLimit[]', default: '[]', desc: 'بازه‌های محدودیت نرخ که کارگرها در آن می‌ایستند و زمانشان از مدت اجرا کم می‌شود.' },
          { name: 'paused', type: 'boolean', desc: 'صف مکث شده است.' },
          { name: 'onPausedChange', type: '(paused: boolean) => void', desc: 'اگر بدهی دکمه‌ی «مکث / ادامه» دیده می‌شود.' },
          { name: 'onConcurrencyChange', type: '(workers: number) => void', desc: 'اگر بدهی دکمه‌های + و − برای تعداد کارگر دیده می‌شود.' },
          { name: 'minConcurrency', type: 'number', default: '1', desc: 'کمترین تعداد کارگر.' },
          { name: 'maxConcurrency', type: 'number', default: '8', desc: 'بیشترین تعداد کارگر.' },
          { name: 'backpressure', type: 'number', desc: 'عمقی که یعنی صف مشکل دارد؛ روی نمودار خط‌چین می‌شود و بالای آن «در انتظار» زرد می‌شود.' },
          { name: 'window', type: 'number', default: '120000', desc: 'نمودار عمق چقدر به عقب نگاه کند (میلی‌ثانیه).' },
          { name: 'totals', type: '{ done?: number; failed?: number }', desc: 'شمار کارهای انجام‌شده و ناموفقِ قدیمی که دیگر در jobs نیستند؛ به شمار کارهای موجود اضافه می‌شود.' },
          { name: 'openId', type: 'string | null', desc: 'شناسه‌ی کارِ باز (کنترل‌شده).' },
          { name: 'defaultOpenId', type: 'string | null', default: 'null', desc: 'کاری که کارت جزئیاتش از اول باز باشد.' },
          { name: 'onOpenChange', type: '(id: string | null, job?: QueueJob) => void', desc: 'با باز و بسته شدن کارت جزئیات صدا می‌شود.' },
          { name: 'onPromote', type: '(job: QueueJob) => void', desc: 'دکمه‌ی «بردن به ابتدا» برای کار منتظر در کارت جزئیات.' },
          { name: 'onCancel', type: '(job: QueueJob) => void', desc: 'دکمه‌ی لغو برای کار منتظر یا در حال اجرا.' },
          { name: 'title', type: 'string', default: "'صف'", desc: 'عنوان بالای کارت.' },
          { name: 'name', type: 'string', desc: 'نام صف، کنار عنوان.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه.' },
        ],
      },
      {
        component: 'QueueJob',
        items: [
          { name: 'id', type: 'string', required: true, desc: 'شناسه‌ی یکتای کار.' },
          { name: 'name', type: 'string', required: true, desc: 'نام کار.' },
          { name: 'kind', type: "'llm' | 'tool' | 'agent' | 'human'", required: true, desc: 'نوع کار؛ آیکن و برچسب آن را می‌سازد.' },
          { name: 'status', type: "'queued' | 'running' | 'done' | 'failed'", required: true, desc: 'وضعیت کار.' },
          { name: 'enqueuedAt', type: 'number', required: true, desc: 'زمان ورود به صف؛ با همان ساعت now.' },
          { name: 'priority', type: "'high' | 'normal' | 'low'", desc: 'اولویت. کار مهم اول ته صف می‌افتد و بعد از بقیه جلو می‌لغزد.' },
          { name: 'startedAt', type: 'number', desc: 'زمان شروع اجرا.' },
          { name: 'endedAt', type: 'number', desc: 'زمان پایان.' },
          { name: 'worker', type: 'string', desc: 'شناسه‌ی کارگری که کار روی آن است.' },
          { name: 'progress', type: 'number', desc: 'پیشرفت بین ۰ و ۱ هنگام اجرا.' },
          { name: 'estimate', type: 'number', desc: 'زمان تخمینی اجرا (میلی‌ثانیه)، برای حدس پیشرفت وقتی progress نیست.' },
          { name: 'attempt', type: 'number', desc: 'شماره‌ی تلاش فعلی.' },
          { name: 'maxAttempts', type: 'number', desc: 'بیشترین تعداد تلاش.' },
          { name: 'detail', type: 'string', desc: 'توضیح کوتاه در کارت جزئیات.' },
          { name: 'icon', type: 'ReactNode', desc: 'آیکن دلخواه به‌جای آیکن نوع کار.' },
          { name: 'error', type: 'string', desc: 'پیام خطا برای کار ناموفق.' },
        ],
      },
      {
        component: 'QueueWorker و QueueRateLimit',
        items: [
          { name: 'id', type: 'string', required: true, desc: 'QueueWorker: شناسه‌ی کارگر.' },
          { name: 'name', type: 'string', required: true, desc: 'QueueWorker: نام کارگر، مثلاً نام مدل.' },
          { name: 'detail', type: 'string', desc: 'QueueWorker: توضیح کوتاه.' },
          { name: 'icon', type: 'ReactNode', desc: 'QueueWorker: آیکن کارگر.' },
          { name: 'from', type: 'number', required: true, desc: 'QueueRateLimit: شروع محدودیت (با ساعت now).' },
          { name: 'until', type: 'number', required: true, desc: 'QueueRateLimit: پایان محدودیت.' },
          { name: 'label', type: 'string', desc: 'QueueRateLimit: متنی که روی نشانگر می‌آید؛ پیش‌فرض «محدودیت نرخ».' },
        ],
      },
    ],
    keyboard: [
      { keys: '↓ / ↑', action: 'رفتن به کار بعدی یا قبلی.' },
      { keys: '← / →', action: 'همین کار؛ در راست‌به‌چپ → قبلی و ← بعدی است.' },
      { keys: 'Home / End', action: 'پریدن به اولین یا آخرین کار.' },
      { keys: 'Esc', action: 'بستن کارت جزئیات سنجاق‌شده.' },
    ],
    a11y: [
      'ناحیه‌ی آخر با role="status" و aria-live="polite" تغییرهای مهم را اعلام می‌کند.',
      'کارها با فوکوس چرخشی (roving) جابه‌جا می‌شوند و هر کدام برچسب قابل‌خواندن دارد.',
      'کارت جزئیات سنجاق‌شده role="dialog" است و بستنش فوکوس را به همان کار برمی‌گرداند.',
      'نمودار عمق با role="img" و خلاصه‌ی متنی، و شمار کارگرها با <output> و aria-live خوانده می‌شود.',
      'با prefers-reduced-motion همه‌ی انیمیشن‌ها حذف می‌شوند.',
    ],
    responsive: [
      'کمتر از ۶۰۰ پیکسل (عرض خود کارت) ستون‌ها روی هم می‌نشینند: صف بالا، کارگرها زیر آن و «انجام شد / ناموفق» کنار هم.',
      'کمتر از ۴۴۰ پیکسل کنترل‌های بالا تمام‌عرض می‌شوند.',
    ],
    related: ['agent-monitor', 'agent-inbox', 'meter', 'status-dot'],
  },

  /* ------------------------------------------------------------------ agent-ledger */
  {
    slug: 'agent-ledger',
    name: 'AgentLedger',
    title: 'سابقه‌ی کارهای عامل',
    category: 'agents',
    summary: 'فهرست تغییرهایی که عامل داده، با دکمه‌ی «برگردان» که تغییرهای وابسته را هم نشان می‌دهد و با هم برمی‌گرداند.',
    origin: 'own',
    file: 'ui/AgentLedger.tsx',
    extraFiles: ['styles/ledger.css'],
    importLine: "import { AgentLedger } from '@kit/ui';\nimport type { LedgerEntry } from '@kit/ui';",
    whenToUse: [
      'می‌خواهی کاربر هر کاری را که عامل کرده ببیند و بتواند برگرداند.',
      'بعضی تغییرها روی هم بنا شده‌اند و برگرداندن یکی باید بقیه را هم برگرداند.',
      'بعضی کارها (ایمیلِ رفته) برگشت‌پذیر نیستند و باید همین را روشن بگویی.',
    ],
    whenNot: [
      { text: 'می‌خواهی پیش از انجام کار اجازه بگیری.', see: 'approval-card' },
      { text: 'می‌خواهی خلاصه‌ی «وقتی نبودی» را با نمودار زمانی ببینی.', see: 'agent-recap' },
    ],
    usage: `const [entries, setEntries] = useState<LedgerEntry[]>([
  { id: 'e3', when: 'همین الان', title: 'ایمیل فرستاده شد', target: '۳٬۸۱۲ مشترک', system: 'ایمیل', state: 'done', irreversible: true, dependsOn: ['e1'] },
  { id: 'e2', when: '۱ دقیقه پیش', title: 'پیام در کانال', target: 'قیمت جدید فعال شد', state: 'done', dependsOn: ['e1'] },
  { id: 'e1', when: '۲ دقیقه پیش', title: 'قیمت تغییر کرد', target: 'پلن حرفه‌ای', change: ['۲۹ / ماه', '۳۴ / ماه'], system: 'پرداخت', state: 'done' },
]);

const setState = (ids: string[], state: LedgerEntry['state']) =>
  setEntries((list) => list.map((e) => (ids.includes(e.id) ? { ...e, state } : e)));

<AgentLedger
  entries={entries}
  agent="Claude"
  onUndo={async (id, ids) => { await api.undo(ids); setState(ids, 'undone'); }}
  onRedo={async (id, ids) => { await api.redo(ids); setState(ids, 'done'); }}
/>`,
    props: [
      {
        items: [
          { name: 'entries', type: 'LedgerEntry[]', required: true, desc: 'تغییرها، تازه‌ترین بالا (به همان ترتیبی که می‌دهی).' },
          { name: 'onUndo', type: '(id: string, ids: string[]) => void | Promise<void>', desc: 'id ردیف کلیک‌شده و ids همان ردیف به‌علاوه‌ی هر تغییر برگشت‌پذیر وابسته است. اگر Promise رد شود، ردیف پیام «برگرداندن نشد» نشان می‌دهد.' },
          { name: 'onRedo', type: '(id: string, ids: string[]) => void | Promise<void>', desc: 'اگر بدهی، ردیف‌های برگردانده‌شده دکمه‌ی «دوباره» می‌گیرند.' },
          { name: 'title', type: 'string', default: "'سابقه'", desc: 'عنوان بالای فهرست.' },
          { name: 'agent', type: 'string', desc: 'نام عامل کنار عنوان.' },
          { name: 'pointAt', type: 'string | null', desc: 'مثل اینکه نشانگر روی «برگردان» آن تغییر باشد، آن و وابسته‌هایش را روشن می‌کند. null یعنی هیچ.' },
          { name: 'empty', type: 'string', default: "'هنوز کاری انجام نشده'", desc: 'پیام وقتی فهرست خالی است.' },
          { name: 'countLabel', type: 'string', default: "'تغییر'", desc: 'کلمه‌ی بعد از شمار در سرِ فهرست.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه.' },
        ],
      },
      {
        component: 'LedgerEntry',
        items: [
          { name: 'id', type: 'string', required: true, desc: 'شناسه‌ی یکتای تغییر.' },
          { name: 'when', type: 'string', required: true, desc: 'متن آماده‌ی زمان، مثل «۲ دقیقه پیش».' },
          { name: 'title', type: 'string', required: true, desc: 'کاری که عامل کرده.' },
          { name: 'target', type: 'string', desc: 'چیزی که تغییر کرده، کنار عنوان.' },
          { name: 'detail', type: 'string', desc: 'یک خط زیر عنوان؛ با وجود change نادیده گرفته می‌شود.' },
          { name: 'change', type: '[string, string]', desc: 'مقدار قبل و بعد؛ قبل خط می‌خورد، بعد پیکان و مقدار تازه می‌آید.' },
          { name: 'system', type: 'string', desc: 'سامانه‌ای که تغییر در آن رخ داده، بعد از زمان.' },
          { name: 'icon', type: 'ReactNode', desc: 'آیکن کاشی؛ پیش‌فرض آیکن وضعیت است.' },
          { name: 'state', type: "'done' | 'failed' | 'undone' | 'pending'", required: true, desc: 'pending یعنی همین حالا برگرداندنش در جریان است؛ failed یعنی خود کار عامل شکست خورده.' },
          { name: 'irreversible', type: 'boolean', desc: 'برگشت‌ناپذیر (مثل ایمیلِ رفته): دکمه‌ی برگردان ندارد.' },
          { name: 'dependsOn', type: 'string[]', desc: 'شناسه‌ی تغییرهایی که این یکی روی آن‌ها بنا شده؛ با برگشتن آن‌ها این هم برمی‌گردد.' },
        ],
      },
    ],
    a11y: [
      'فهرست یک <ol> با برچسب عنوانش است و هر ردیف در حال کار aria-busy می‌گیرد.',
      'دکمه‌ها برچسب کامل دارند، مثل «برگرداندن: قیمت تغییر کرد (۲ تغییر وابسته هم برگردانده می‌شود)».',
      'برای ردیف برگردانده‌شده یک متن پنهان «برگردانده شد» برای صفحه‌خوان هست و فلش بین مقدار قبل و بعد با «به» جایگزین می‌شود.',
      'روشن‌شدن ردیف‌های وابسته با فوکوس کیبورد هم کار می‌کند، نه فقط با ماوس. با prefers-reduced-motion انیمیشن‌ها حذف می‌شوند.',
    ],
    responsive: [
      'کمتر از ۴۸۰ پیکسل (عرض خود کارت) نام سامانه حذف و دکمه‌های برگردان و دوباره به آیکن گرد کوچک تبدیل می‌شوند.',
      'در دستگاه‌های بدون hover دکمه‌ی برگردان همیشه دیده می‌شود، به‌جای زمان.',
    ],
    related: ['approval-card', 'agent-recap', 'agent-monitor'],
  },

  /* ------------------------------------------------------------------ agent-recap */
  {
    slug: 'agent-recap',
    name: 'AgentRecap',
    title: 'خلاصه‌ی «وقتی نبودی»',
    category: 'agents',
    summary: 'نمودار زمانی شبی که کاربر نبوده و سه ستون «منتظر توست / ناموفق / انجام‌شده» که کارت‌هایشان همان‌جا قابل اقدام‌اند.',
    origin: 'own',
    file: 'ui/AgentRecap.tsx',
    extraFiles: ['styles/recap.css'],
    importLine: "import { AgentRecap } from '@kit/ui';\nimport type { RecapEvent } from '@kit/ui';",
    whenToUse: [
      'کاربر چند ساعت یا یک شب نبوده و می‌خواهی در یک نگاه ببیند چه شد و چه چیزی منتظر اوست.',
      'می‌خواهی کارت‌ها مستقیم اقدام بپذیرند (تأیید، تلاش دوباره) و واگرد داشته باشند.',
      'فقط می‌خواهی گزارش را نشان دهی، بدون دکمه (readOnly).',
    ],
    whenNot: [
      { text: 'می‌خواهی همه‌ی تغییرها را یکی‌یکی برگردانی.', see: 'agent-ledger' },
      { text: 'کارها هنوز در حال اجرا هستند و باید زنده دنبال شوند.', see: 'agent-inbox' },
    ],
    usage: `const since = new Date('2026-11-03T22:00:00');
const until = new Date('2026-11-04T08:10:00');

const events: RecapEvent[] = [
  { id: 'refund', kind: 'needs', at: '2026-11-04T05:34:00', title: 'بازپرداخت ۲۴۰ دلار', detail: 'بیشتر از سقف تأیید خودکار', action: 'تأیید', doneLabel: 'تأیید شد' },
  { id: 'sync', kind: 'failed', at: '2026-11-04T06:22:00', title: 'همگام‌سازی مخاطبان', detail: 'توکن منقضی شد', action: 'تلاش دوباره', doneLabel: 'رفع شد' },
  { id: 'tickets', kind: 'done', at: '2026-11-03T22:25:00', title: 'پاسخ به تیکت‌های پشتیبانی', count: 38 },
];

<AgentRecap
  events={events}
  since={since}
  until={until}
  onAction={async (event, action) => { await api.run(event.id, action); }}
  onUndo={(event) => api.undo(event.id)}
/>`,
    props: [
      {
        items: [
          { name: 'events', type: 'RecapEvent[]', required: true, desc: 'رویدادهای شب. رویدادی که زمانش خوانده نشود کنار گذاشته می‌شود.' },
          { name: 'since', type: 'Date | string | number', desc: 'لحظه‌ای که کاربر رفت. پیش‌فرض کمی قبل از اولین رویداد است.' },
          { name: 'until', type: 'Date | string | number', desc: 'لحظه‌ی «اکنون». پیش‌فرض زمان اولین رندر.' },
          { name: 'onAction', type: "(event: RecapEvent, action: 'primary' | 'review') => void | Promise<unknown>", desc: 'اقدام اصلی یا «بررسی». اگر Promise بدهی کارت در حال کار نشان داده می‌شود و با خطا به حالت اول برمی‌گردد.' },
          { name: 'onUndo', type: '(event: RecapEvent) => void', desc: 'دکمه‌ی واگرد بعد از اقدام.' },
          { name: 'onRedo', type: '(event: RecapEvent) => void', desc: 'دکمه‌ی «دوباره» بعد از واگرد.' },
          { name: 'limit', type: 'number', default: '3', desc: 'بیشترین کارت در هر ستون؛ هر ستون جای همین تعداد را نگه می‌دارد.' },
          { name: 'replay', type: 'number', default: '1800', desc: 'مدت بازپخش شب هنگام باز شدن (میلی‌ثانیه). ۰ یعنی همه‌چیز یک‌جا.' },
          { name: 'title', type: 'string', default: "'وقتی نبودی'", desc: 'عنوان.' },
          { name: 'locale', type: 'string', default: "'fa-IR'", desc: 'زبان و رقم‌ها و ساعت‌ها.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه.' },
          { name: 'readOnly', type: 'boolean', default: 'false', desc: 'فقط گزارش؛ کارت‌ها دکمه‌ی اقدام و واگرد ندارند.' },
          { name: 'onOpen', type: '(event: RecapEvent) => void', desc: 'با readOnly: دکمه‌ی «دیدن» روی هر کارت.' },
          { name: 'openLabel', type: 'string', default: "'دیدن'", desc: 'متن دکمه‌ی onOpen.' },
          { name: 'lanes', type: "('needs' | 'failed' | 'done')[]", desc: 'ستون‌هایی که نشان داده شوند، به ترتیب. پیش‌فرض هر سه.' },
          { name: 'laneLabels', type: "Partial<Record<'needs' | 'failed' | 'done', string>>", desc: 'نام دیگر برای ستون‌ها و شمارنده‌های بالا.' },
          { name: 'laneEmpty', type: "Partial<Record<'needs' | 'failed' | 'done', string>>", desc: 'پیام ستون خالی.' },
        ],
      },
      {
        component: 'RecapEvent',
        items: [
          { name: 'id', type: 'string', required: true, desc: 'شناسه‌ی یکتای رویداد.' },
          { name: 'at', type: 'Date | string | number', required: true, desc: 'زمان رخ دادن.' },
          { name: 'kind', type: "'needs' | 'failed' | 'done'", required: true, desc: 'ستونی که رویداد در آن می‌نشیند.' },
          { name: 'title', type: 'string', required: true, desc: 'عنوان کارت.' },
          { name: 'detail', type: 'string', desc: 'توضیح کوتاه.' },
          { name: 'logo', type: 'ReactNode', desc: 'نشان کوچک کارت.' },
          { name: 'count', type: 'number', desc: 'تعداد رویدادهای ادغام‌شده (مثل «۳۸ تیکت»)؛ قله‌ی نمودار را هم بلندتر می‌کند.' },
          { name: 'action', type: 'string', desc: 'اقدام اصلی کارت‌های «منتظر» و «ناموفق»، مثل «تأیید».' },
          { name: 'doneLabel', type: 'string', desc: 'زمان گذشته‌ی اقدام که بعد از انجام نشان داده می‌شود.' },
        ],
      },
    ],
    a11y: [
      'ریشه یک <section> است که با عنوانش برچسب‌گذاری شده و هر ستون هم با عنوان خودش.',
      'نمودار فقط تزئینی است (aria-hidden)؛ همه‌ی اطلاعات در کارت‌ها و شمارنده‌ها می‌آید.',
      'دکمه‌ها نام کامل دارند، مثل «تأیید: بازپرداخت ۲۴۰ دلار»، و در حال کار aria-disabled می‌گیرند.',
      'ناحیه‌ی role="status" نتیجه‌ی اقدام‌ها را اعلام می‌کند.',
      'با prefers-reduced-motion بازپخش شب انجام نمی‌شود و انیمیشن‌ها حذف می‌شوند.',
    ],
    responsive: [
      'تا ۶۴۰ پیکسل (عرض خود کامپوننت) ستون‌ها زیر هم می‌آیند.',
      'زیر ۴۲۰ پیکسل حاشیه‌ی داخلی کمتر می‌شود.',
    ],
    related: ['agent-ledger', 'approval-card', 'agent-inbox', 'kpi-chart'],
  },

  /* ------------------------------------------------------------------ usage-meter */
  {
    slug: 'usage-meter',
    name: 'UsageMeter',
    title: 'نوار مصرف',
    category: 'agents',
    summary: 'مصرف اعتبار یک پلن را با نوار رنگی بخش‌بخش، نمودار روزانه، مترهای باریک سقف‌دار و دکمه‌ای که به وضعیت واکنش نشان می‌دهد.',
    origin: 'own',
    file: 'ui/UsageMeter.tsx',
    extraFiles: ['styles/usage.css'],
    importLine: "import { UsageMeter } from '@kit/ui';\nimport type { UsagePart, UsageLimit, UsageDay } from '@kit/ui';",
    whenToUse: [
      'کاربر پلنی با اعتبار ماهانه دارد و می‌خواهی ببیند اعتبار کجا خرج شده.',
      'چند سقف دیگر هم هست (صندلی، فضا، پروژه) و باید زیر نوار اصلی بیایند.',
      'می‌خواهی با نزدیک شدن به سقف، دکمه از «ارتقا» به «افزودن اعتبار» عوض شود.',
    ],
    whenNot: [
      { text: 'فقط یک نوار ساده‌ی درصد می‌خواهی.', see: 'meter' },
      { text: 'می‌خواهی سهم چند بخش را در یک بازه با مقایسه نشان دهی.', see: 'compact-breakdown' },
    ],
    usage: `const used: UsagePart[] = [
  { label: 'گفت‌وگو', value: 4200 },
  { label: 'ترجمه', value: 2100 },
  { label: 'تحلیل صفحه', value: 1300 },
];

const limits: UsageLimit[] = [
  { label: 'صندلی', used: 4, total: 5 },
  { label: 'فضا', used: 2.4, total: 10, unit: 'گیگ', decimals: 1 },
  { label: 'پروژه', used: 12, total: null },
];

<UsageMeter
  title="هوش آکمه"
  plan="پلن حرفه‌ای"
  total={10000}
  used={used}
  limits={limits}
  resetAt={Date.now() + 9 * 24 * 3600 * 1000}
  periods={[{ id: 'month', label: 'ماه' }, { id: 'week', label: 'هفته' }]}
  onUpgrade={(state) => openBilling(state)}
/>`,
    props: [
      {
        items: [
          { name: 'total', type: 'number', desc: 'اعتبار پلن، یعنی تمام عرض نوار. اگر ندهی فقط مترهای باریک نشان داده می‌شوند.' },
          { name: 'used', type: 'UsagePart[]', default: '[]', desc: 'اعتبار در بازه‌ی انتخاب‌شده به کجا رفته؛ هر بخش یک تکه‌ی رنگی از نوار است.' },
          { name: 'limits', type: 'UsageLimit[]', default: '[]', desc: 'مترهای باریک زیر نوار (صندلی، فضا، …). بدون total (یا null) نامحدود است.' },
          { name: 'periods', type: '{ id: string; label: string }[]', desc: 'گزینه‌های کلید بازه. اگر ندهی کلید نشان داده نمی‌شود.' },
          { name: 'period', type: 'string', desc: 'بازه‌ی انتخاب‌شده (کنترل‌شده).' },
          { name: 'defaultPeriod', type: 'string', desc: 'بازه‌ی اولیه؛ پیش‌فرض اولین گزینه.' },
          { name: 'onPeriodChange', type: '(id: string) => void', desc: 'با انتخاب بازه‌ی دیگر صدا می‌شود.' },
          { name: 'resetAt', type: 'Date | string | number', desc: 'زمان بازنشانی اعتبار؛ به شکل «N روز تا بازنشانی» و تاریخ شمسی در راهنمای ابزار.' },
          { name: 'daily', type: 'UsageDay[]', desc: 'مصرف هر روز. value: null یعنی روز هنوز نرسیده (میله‌ی تخت).' },
          { name: 'onUpgrade', type: "(state: 'ok' | 'warn' | 'limit') => void", desc: 'دکمه‌ی پایین کارت؛ وضعیت فعلی را می‌دهد تا بدانی باید پلن یا افزودن اعتبار را باز کنی.' },
          { name: 'title', type: 'string', default: "'مصرف'", desc: 'عنوان کارت.' },
          { name: 'plan', type: 'string', desc: 'نام پلن کنار زمان بازنشانی.' },
          { name: 'unit', type: 'string', default: "'اعتبار'", desc: 'واحد اعتبار.' },
          { name: 'warnAt', type: 'number', default: '0.8', desc: 'سهمی (۰ تا ۱) که از آن به بعد نوار و مترها هشدار می‌دهند.' },
          { name: 'upgradeLabel', type: 'string', default: "'ارتقا'", desc: 'متن دکمه در حالت عادی.' },
          { name: 'topUpLabel', type: 'string', default: "'افزودن اعتبار'", desc: 'متن دکمه در حالت هشدار و سقف.' },
          { name: 'className', type: 'string', desc: 'کلاس اضافه برای ریشه.' },
          { name: 'now', type: 'number', desc: 'ساعت قراردادی برای شمردن روزهای مانده تا resetAt؛ بیشتر برای آزمون و دمو.' },
        ],
      },
      {
        component: 'UsagePart، UsageLimit و UsageDay',
        items: [
          { name: 'label', type: 'string', required: true, desc: 'نام بخش، سقف یا روز.' },
          { name: 'value', type: 'number', required: true, desc: 'UsagePart: مقدار بخش. UsageDay: مصرف آن روز یا null.' },
          { name: 'color', type: 'string', desc: 'UsagePart: رنگ دلخواه؛ پیش‌فرض هفت سایه‌ی خودکار.' },
          { name: 'used', type: 'number', required: true, desc: 'UsageLimit: مقدار مصرف‌شده.' },
          { name: 'total', type: 'number | null', desc: 'UsageLimit: سقف. null یا نبودن یعنی نامحدود.' },
          { name: 'unit', type: 'string', desc: 'UsageLimit: واحد کنار عدد.' },
          { name: 'decimals', type: 'number', desc: 'UsageLimit: تعداد رقم اعشار.' },
        ],
      },
    ],
    keyboard: [
      { keys: '← / →', action: 'رفتن بین بخش‌های نوار، یا بین روزهای نمودار، یا بین گزینه‌های بازه (در راست‌به‌چپ جهت‌ها جابه‌جاست).' },
      { keys: '↑ / ↓', action: 'تعویض گزینه‌ی بازه.' },
      { keys: 'Home / End', action: 'اولین یا آخرین گزینه‌ی بازه.' },
      { keys: 'Esc', action: 'بستن راهنمای شناور بخش یا روز.' },
    ],
    a11y: [
      'نوار اصلی و مترهای باریک role="meter" با aria-valuenow و aria-valuetext خوانا دارند، مثل «۷٬۶۰۰ از ۱۰٬۰۰۰ اعتبار».',
      'کلید بازه یک radiogroup است و فقط گزینه‌ی انتخاب‌شده در ترتیب Tab می‌آید.',
      'وضعیت (عادی، هشدار، سقف) در یک پاراگراف role="status" و aria-live="polite" گفته می‌شود.',
      'بخش‌های نوار و روزهای نمودار با کیبورد هم قابل مرورند، نه فقط با ماوس. با prefers-reduced-motion عددها و عرض‌ها بدون جریان‌یافتن عوض می‌شوند.',
    ],
    responsive: [
      'کمتر از ۴۰۰ پیکسل (عرض خود کارت) سرِ کارت چند خطی می‌شود، کلید بازه تمام‌عرض می‌گیرد و مترهای باریک ستونی می‌شوند.',
      'روی صفحه‌ی لمسی (pointer: coarse) دکمه‌ها و ردیف‌ها بلندتر می‌شوند.',
    ],
    related: ['meter', 'compact-breakdown', 'kpi-chart', 'pricing-plans'],
  },
];
