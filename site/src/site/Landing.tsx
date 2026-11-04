import { useEffect, useState } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { ApprovalCard, Meter, RollingNumber, Segmented, StatusDot, ThinkingLoader, toast } from '@kit/ui';
import { faNum } from '@kit/ui/digits';
import { CATEGORIES } from '../docs/categories';
import { ENTRIES, entriesOf } from '../docs/registry';
import { Link } from './router';
import { REPO } from './Chrome';

const MODES = [
  { value: 'watch', label: 'فقط ببین' },
  { value: 'ask', label: 'بپرس' },
  { value: 'auto', label: 'خودکار' },
] as const;
type Mode = (typeof MODES)[number]['value'];

const PHASES = ['خواندن صفحه‌ها', 'پیدا کردن مشکل‌ها', 'نوشتن پیشنهاد'];

/** Live mini stage of real kit pieces, the first thing people see. */
function Stage() {
  const [count, setCount] = useState(1284);
  const [used, setUsed] = useState(62);
  const [mode, setMode] = useState<Mode>('ask');
  const [run, setRun] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setCount((n) => n + 3 + Math.floor(Math.random() * 40));
      setUsed((u) => (u >= 92 ? 38 : u + 4));
    }, 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="stage-hero" aria-label="نمونه‌ی زنده">
      <div className="sh-card sh-a">
        <div className="sh-row">
          <span className="sh-k"><StatusDot tone="busy" /> ایجنت سئو</span>
          <ThinkingLoader phases={PHASES} size="sm" loop />
        </div>
        <p className="sh-big"><RollingNumber value={count} /></p>
        <p className="sh-s">صفحه‌ی بررسی‌شده از اول ماه</p>
        <Meter value={used} max={100} label="مصرف این ماه" />
      </div>
      <div className="sh-card sh-b">
        <Segmented label="اختیار ایجنت" value={mode} options={[...MODES]} onChange={setMode} />
        <ApprovalCard
          key={run}
          title="انتشار ۴ مقاله‌ی آماده"
          description="وبلاگ فروشگاه · امروز ساعت ۹"
          risk="medium"
          details={[{ label: 'مقصد', value: 'وردپرس' }]}
          onApprove={() => new Promise<void>((r) => setTimeout(() => { r(); toast.success('منتشر شد', { description: 'چهار مقاله روی سایت رفت.' }); setTimeout(() => setRun((n) => n + 1), 2400); }, 800))}
          onDeny={() => { toast('نگه داشته شد'); setTimeout(() => setRun((n) => n + 1), 2400); }}
        />
      </div>
    </div>
  );
}

export function CategoryGrid({ withIds = false }: { withIds?: boolean }) {
  return (
    <div className="cats">
      {CATEGORIES.map((c) => {
        const list = entriesOf(c.id);
        return (
          <section className="cat" key={c.id} id={withIds ? c.id : undefined} aria-labelledby={`cat-${c.id}`}>
            <div className="cat-head">
              <h2 id={`cat-${c.id}`}>{c.title} <span className="cat-n">{faNum(list.length)}</span></h2>
              <p>{c.blurb}</p>
            </div>
            <div className="tiles">
              {list.map((e) => (
                <Link key={e.slug} to={`/components/${e.slug}`} className="tile">
                  <span className="tile-top">
                    <span className="tile-t">{e.title}</span>
                    <code dir="ltr">{e.name}</code>
                  </span>
                  <span className="tile-s">{e.summary}</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function Landing() {
  useEffect(() => { document.title = 'OpenAffectui — کیت رابط کاربری فارسی'; }, []);
  const mit = ENTRIES.filter((e) => e.origin === 'mit').length;
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{faNum(ENTRIES.length)} جزء · فارسی و راست‌چین · تیره و روشن</p>
          <h1>رابط کاربری آماده برای محصولات هوش مصنوعی، <em>فارسی از روز اول.</em></h1>
          <p className="hero-lead">
            کارت تأیید، صف کارها، ورودی گفت‌وگو، نمودار و تاریخ شمسی. هر جزء یک فایل React با استایل خودش است؛
            جز react و lucide-react به چیزی وابسته نیست. همان چیزی که پنل‌های اکسس و دیددش رویش ساخته شده‌اند.
          </p>
          <div className="hero-cta">
            <Link to="/components" className="cta cta-primary">مرور اجزا <ArrowLeft size={16} aria-hidden="true" /></Link>
            <Link to="/docs/installation" className="cta">نصب</Link>
            <button type="button" className="cta cta-ghost" onClick={() => toast('سلام! این یک اعلان واقعی از کیت است.', { description: 'روی آن نگه دار یا بکشش کنار.' })}>
              <Bell size={15} aria-hidden="true" /> یک اعلان بفرست
            </button>
          </div>
        </div>
        <Stage />
      </section>

      <ul className="facts">
        <li><b>{faNum(ENTRIES.length)}</b><span>جزء با نمونه‌ی زنده</span></li>
        <li><b>{faNum(CATEGORIES.length)}</b><span>دسته</span></li>
        <li><b>{faNum(mit)}</b><span>جزء متن‌باز زیر MIT</span></li>
        <li><b>۰</b><span>وابستگی اضافه</span></li>
      </ul>

      <CategoryGrid />

      <footer className="foot">
        <p>بخش‌های رایگان affectUI با مجوز MIT و با حفظ متن مجوزشان آورده شده‌اند؛ بقیه را خودمان از رفتار عمومی‌شان از نو نوشته‌ایم.</p>
        <p className="muted">ساخته‌ی DragonCuds برای اکسس و دیددش · کد با مجوز MIT در <a className="inline-link" href={REPO} target="_blank" rel="noreferrer">گیت‌هاب</a></p>
      </footer>
    </div>
  );
}

export function ComponentsIndex() {
  useEffect(() => { document.title = 'اجزا — OpenAffectui'; }, []);
  return (
    <div className="landing index">
      <header className="doc-head">
        <h1>اجزا</h1>
        <p className="doc-lead">{faNum(ENTRIES.length)} جزء در {faNum(CATEGORIES.length)} دسته. روی هر کدام بزن تا نمونه‌ی زنده، کد و ویژگی‌هایش را ببینی.</p>
      </header>
      <CategoryGrid withIds />
    </div>
  );
}
