import { useState } from 'react';
import { Button, Section, Segmented, Surface } from '../ui';
import { Toaster, toast, type ToasterPosition, type ToastOptions } from '../ui/Toaster';
import { BlurSwap } from '../ui/BlurSwap';

const TABS = [
  { value: 'a', label: 'امروز' },
  { value: 'b', label: 'هفته' },
  { value: 'c', label: 'ماه' },
];

const BODY: Record<string, string> = {
  a: 'امروز سه پست منتشر شد و همه بدون خطا رفتند.',
  b: 'این هفته چهارده پست زمان‌بندی شده و دو مورد منتظر تأییدند.',
  c: 'در این ماه شصت و دو پست منتشر شد و رشد دنبال‌کننده‌ها پایدار بود.',
};

const POSITIONS: { value: ToasterPosition; label: string }[] = [
  { value: 'bottom-center', label: 'پایین وسط' },
  { value: 'bottom-start', label: 'پایین آغاز' },
  { value: 'bottom-end', label: 'پایین پایان' },
  { value: 'top-center', label: 'بالا وسط' },
  { value: 'top-start', label: 'بالا آغاز' },
  { value: 'top-end', label: 'بالا پایان' },
];

const o = (x: ToastOptions = {}): ToastOptions => ({ toaster: 'kit-demo', ...x });

let round = 0;
function updateInPlace() {
  const steps = ['در حال آماده‌سازی…', 'نصف راه رفتیم…', 'تقریباً تمام شد…'];
  const n = round++ % steps.length;
  toast(steps[n], o({ id: 'kit-progress', description: `مرحله ${n + 1} از ${steps.length}`, duration: 5000 }));
}

/** Toast buttons plus a tab switch whose content blurs in. */
export default function DemoToastSwap() {
  const [tab, setTab] = useState('a');
  const [pos, setPos] = useState<ToasterPosition>('bottom-center');
  return (
    <>
      <Toaster id="kit-demo" position={pos} />
      <Section title="اعلان">
        <Segmented label="جای اعلان" value={pos} options={POSITIONS} onChange={setPos} />
        <div className="kit-row">
          <Button onClick={() => toast.success('ذخیره شد', o())}>موفق</Button>
          <Button onClick={() => toast.error('اتصال برقرار نشد، دوباره تلاش کن', o())}>خطا</Button>
          <Button onClick={() => toast.info('نسخه‌ی جدید آماده است', o())}>اطلاع</Button>
          <Button onClick={() => toast.loading('در حال ارسال…', o())}>بارگذاری</Button>
          <Button onClick={() => toast('پیش‌نویس ذخیره شد', o({ description: 'همه‌ی تغییرات نگه داشته شد' }))}>با توضیح</Button>
          <Button onClick={() => toast('فایل به سطل آشغال رفت', o({
            description: 'بودجه-۱۴۰۵.xlsx',
            action: { label: 'واگرد', onClick: () => toast.success('برگشت داده شد', o()) },
          }))}>
            با «واگرد»
          </Button>
        </div>
        <div className="kit-row">
          <Button onClick={() => toast.promise(
            new Promise<void>((ok) => setTimeout(ok, 2000)),
            { loading: 'در حال ارسال گزارش…', success: { title: 'گزارش ارسال شد', description: 'با ۴ نفر در بخش مالی به اشتراک رفت' }, error: 'ارسال نشد' },
            o(),
          )}>
            وعده: موفق
          </Button>
          <Button onClick={() => toast.promise(
            new Promise<void>((_, no) => setTimeout(() => no(new Error('x')), 2000)),
            { loading: 'در حال همگام‌سازی…', success: 'همگام شد', error: { title: 'همگام‌سازی نشد', description: 'اتصال قطع شد، بعداً دوباره امتحان کن' } },
            o(),
          )}>
            وعده: خطا
          </Button>
          <Button onClick={updateInPlace}>به‌روزرسانی با شناسه</Button>
          <Button onClick={() => toast.dismiss()}>بستن همه</Button>
        </div>
      </Section>

      <Section title="تعویض نرم محتوا">
        <Segmented label="بازه" value={tab} options={TABS} onChange={setTab} />
        <BlurSwap id={tab}>
          <Surface>{BODY[tab]}</Surface>
        </BlurSwap>
      </Section>
    </>
  );
}
