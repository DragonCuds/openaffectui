import { useEffect, useRef, useState } from 'react';
import { Search, Wrench } from 'lucide-react';
import { Button, Section } from '../ui';
import { AgentInbox, type InboxItem, type InboxStat, type InboxStep } from '../ui/AgentInbox';
import { DecisionInbox, type Decision } from '../ui/DecisionInbox';
import { faNum } from '../ui/digits';

/** A running clock, m:ss */
const clock = (s: number) => `${faNum(Math.floor(s / 60))}:${faNum(s % 60).padStart(2, '۰')}`;

type Row = {
  id: string; group: 'need' | 'running' | 'done'; tone: 'warn' | 'busy' | 'ok' | 'bad';
  title: string; summary: string; meta: string; sec?: number; live?: boolean;
  searches: number; tools: number; model: string; steps: InboxStep[];
  kind: 'approve' | 'retry' | 'none';
};

const START: Row[] = [
  {
    id: 'mig', group: 'need', tone: 'warn', kind: 'approve', live: true, sec: 373,
    title: 'مهاجرت جدول کاربران', meta: 'منتظر شماست', searches: 9, tools: 14, model: 'Opus 5.5',
    summary: 'کاربران به دو جدول «حساب» و «پروفایل» روی Postgres 17 تقسیم می‌شوند. اجرای آزمایشی روی استیجینگ بدون خطا تمام شد.',
    steps: [
      { text: 'اسکیما و ۱۴ مهاجرت خوانده شد', time: '۶ دقیقه پیش' },
      { text: 'مهاجرت \u20680042_split_users\u2069 نوشته شد', time: '۴ دقیقه پیش' },
      { text: 'اجرای آزمایشی روی استیجینگ – بدون خطا', time: '۲ دقیقه پیش' },
      { text: 'اجازه‌ی اجرا روی سرور اصلی را می‌خواهد', time: '۱ دقیقه پیش' },
    ],
  },
  {
    id: 'crm', group: 'need', tone: 'bad', kind: 'retry', sec: 0,
    title: 'پاک‌سازی مخاطبان CRM', meta: 'ناموفق', searches: 2, tools: 6, model: 'Haiku 5.5',
    summary: '۱٬۳۱۲ مخاطب تکراری پیدا شد، ولی ادغام به سقف تعداد درخواست API خورد و متوقف شد.',
    steps: [
      { text: '۱۸٬۲۴۰ مخاطب بارگذاری شد', time: '۹ دقیقه پیش' },
      { text: '۱٬۳۱۲ مورد تکراری پیدا شد', time: '۸ دقیقه پیش' },
      { text: 'ادغام متوقف شد – سقف درخواست (۴۲۹)', time: '۷ دقیقه پیش' },
    ],
  },
  {
    id: 'pr', group: 'running', tone: 'busy', kind: 'none', live: true, sec: 222,
    title: 'بررسی PR شماره‌ی ۴۸۲', meta: 'در حال اجرا', searches: 12, tools: 21, model: 'Sonnet 5.5',
    summary: 'وب‌هوک‌های صورتحساب: خواندن تغییرات و خروجی تست‌ها و نوشتن کامنت‌های بازبینی روی کد.',
    steps: [
      { text: 'تغییرات فایل‌ها خوانده شد', time: '۳ دقیقه پیش' },
      { text: 'تست‌ها اجرا شد', time: '۱ دقیقه پیش' },
      { text: 'کامنت‌ها را می‌نویسد', time: 'همین حالا' },
    ],
  },
  {
    id: 'rel', group: 'running', tone: 'busy', kind: 'none', live: true, sec: 80,
    title: 'یادداشت‌های انتشار نسخه‌ی ۲٫۴', meta: 'در حال اجرا', searches: 23, tools: 5, model: 'Sonnet 5.5',
    summary: '۲۳ پول‌ریکوئست ادغام‌شده را به دسته‌های ویژگی و رفع اشکال تقسیم می‌کند.',
    steps: [
      { text: '۲۳ پول‌ریکوئست جمع شد', time: '۱ دقیقه پیش' },
      { text: 'نکته‌های مهم را می‌نویسد', time: 'همین حالا' },
    ],
  },
  {
    id: 'met', group: 'done', tone: 'ok', kind: 'none', sec: 252,
    title: 'خلاصه‌ی هفتگی شاخص‌ها', meta: 'انجام شد', searches: 3, tools: 8, model: 'Haiku 5.5',
    summary: 'اعداد از سه داشبورد جمع شد و خلاصه در کانال #metrics فرستاده شد.',
    steps: [
      { text: 'اعداد سه داشبورد جمع شد', time: '۲۲ دقیقه پیش' },
      { text: 'در #metrics ارسال شد', time: '۱۸ دقیقه پیش' },
    ],
  },
];

const DECISIONS: Decision[] = [
  { id: 'onb', title: 'مسیر شروعِ جدید برای همه فعال شود؟', detail: 'در آزمایش، فعال‌سازی ۸٪ بیشتر شد · دو هفته داده', primary: 'فعال کن', secondary: 'آزمایش ادامه پیدا کند' },
  { id: 'fig', title: 'اشتراک فیگما برای تیم طراحی تمدید شود؟', detail: '۱۲ صندلی · ۱٬۸۰۰ دلار در سال · پنج روز دیگر تمدید می‌شود', primary: 'تمدید کن', secondary: 'تعداد صندلی را تغییر بده' },
  { id: 'cur', title: 'دسته‌ی «پرفروش‌ترین‌ها» اول بازنویسی شود؟', detail: 'برای شروعِ برنامه‌ی هفتگی', primary: 'بله', secondary: 'نه، بعداً', collapsed: true },
  { id: 'dom', title: 'دامنه‌ی جدید را به سایت وصل کنیم؟', primary: 'وصل کن', secondary: 'فعلاً نه', collapsed: true },
];

/** Agent inbox and decision inbox demos. */
export default function DemoInbox() {
  const [rows, setRows] = useState<Row[]>(START);
  const [none, setNone] = useState(false);
  const [round, setRound] = useState(0);
  const timers = useRef<number[]>([]);

  // The clocks of waiting and running work
  useEffect(() => {
    const id = window.setInterval(() => setRows((rs) => rs.map((r) => (r.live ? { ...r, sec: (r.sec ?? 0) + 1 } : r))), 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const move = (id: string, next: Partial<Row>, step?: InboxStep) =>
    setRows((rs) => {
      const r = rs.find((x) => x.id === id);
      if (!r) return rs;
      const upd = { ...r, ...next, steps: step ? [...r.steps, step] : r.steps };
      return [upd, ...rs.filter((x) => x.id !== id)]; // lands on top of its new column
    });

  const finish = (id: string, after: number) => {
    timers.current.push(window.setTimeout(() => move(id, { group: 'done', tone: 'ok', meta: 'انجام شد', live: false, kind: 'none' }, { text: '۴۸٬۲۱۰ ردیف منتقل شد', time: 'همین حالا' }), after));
  };

  const approve = (id: string) => {
    move(id, { group: 'running', tone: 'busy', meta: 'در حال اجرا', kind: 'none' }, { text: 'تأیید شد – روی سرور اصلی اجرا می‌شود', time: 'همین حالا' });
    finish(id, 5000);
  };
  const reject = (id: string) => move(id, { group: 'done', tone: 'ok', meta: 'رد شد', live: false, kind: 'none' }, { text: 'رد شد – اجرا نمی‌شود', time: 'همین حالا' });
  const retry = (id: string) => {
    move(id, { group: 'running', tone: 'busy', meta: 'در حال اجرا', live: true, sec: 0, kind: 'none' }, { text: 'دوباره شروع شد', time: 'همین حالا' });
    finish(id, 5000);
  };

  const items: InboxItem[] = rows.map((r) => {
    const stats: InboxStat[] = [
      { icon: <Search size={13} strokeWidth={1.8} aria-hidden="true" />, value: faNum(r.searches), label: 'جست‌وجو' },
      { icon: <Wrench size={13} strokeWidth={1.8} aria-hidden="true" />, value: faNum(r.tools), label: 'ابزار' },
    ];
    const open = { id: 'open', label: 'باز کن' };
    return {
      id: r.id, group: r.group, tone: r.tone, title: r.title, summary: r.summary, meta: r.meta,
      time: r.tone === 'bad' ? undefined : r.sec !== undefined ? clock(r.sec) : undefined,
      stats, model: r.model, steps: r.steps,
      actions:
        r.kind === 'approve' ? [{ id: 'rej', label: 'رد کن', onClick: () => reject(r.id) }, { id: 'ok', label: 'تأیید', primary: true, onClick: () => approve(r.id) }]
        : r.kind === 'retry' ? [{ id: 'retry', label: 'دوباره', primary: true, onClick: () => retry(r.id) }]
        : [open],
    };
  });

  const reset = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; setRows(START); setRound((n) => n + 1); };

  return (
    <>
      <Section
        title="صندوق کارها"
        aside={
          <span className="kit-row">
            <Button onClick={() => setNone((v) => !v)}>{none ? 'نمایش کارها' : 'خالی'}</Button>
            <Button onClick={reset}>از اول</Button>
          </span>
        }
      >
        <AgentInbox key={round} items={none ? [] : items} defaultSelectedId="mig" crumbs={['عامل‌ها', 'صندوق کارها']} />
      </Section>
      <Section title="صندوق تصمیم‌ها">
        <DecisionInbox decisions={DECISIONS} />
      </Section>
    </>
  );
}
