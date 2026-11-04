import { useState } from 'react';
import { Button, Section, Segmented, Toaster, toast } from '@kit/ui';
import type { ToasterPosition, ToastOptions } from '@kit/ui/Toaster';
import '@kit/showcase/showcase.css';

const POSITIONS: { value: ToasterPosition; label: string }[] = [
  { value: 'bottom-center', label: 'پایین وسط' },
  { value: 'bottom-start', label: 'پایین آغاز' },
  { value: 'bottom-end', label: 'پایین پایان' },
  { value: 'top-center', label: 'بالا وسط' },
  { value: 'top-start', label: 'بالا آغاز' },
  { value: 'top-end', label: 'بالا پایان' },
];

/* This demo owns a named toaster, so its toasts never leak into the site's own one. */
const ID = 'docs-demo-toaster';
const o = (x: ToastOptions = {}): ToastOptions => ({ toaster: ID, ...x });

let round = 0;
function updateInPlace() {
  const steps = ['در حال آماده‌سازی…', 'نصف راه رفتیم…', 'تقریباً تمام شد…'];
  const n = round++ % steps.length;
  toast(steps[n], o({ id: 'docs-progress', description: `مرحله ${(n + 1).toLocaleString('fa-IR')} از ${steps.length.toLocaleString('fa-IR')}`, duration: 5000 }));
}

/** Toaster: the variants, one with an undo, promises, updating by id, and the six positions. */
export default function DemoToaster() {
  const [pos, setPos] = useState<ToasterPosition>('bottom-center');

  return (
    <>
      <Toaster id={ID} position={pos} />

      <Section title="انواع اعلان" aside="هر دکمه یک اعلان می‌سازد">
        <div className="kit-row">
          <Button onClick={() => toast.success('ذخیره شد', o())}>موفق</Button>
          <Button onClick={() => toast.error('اتصال برقرار نشد، دوباره تلاش کنید', o())}>خطا</Button>
          <Button onClick={() => toast.info('نسخه‌ی جدید آماده است', o())}>اطلاع</Button>
          <Button onClick={() => toast.loading('در حال ارسال…', o())}>بارگذاری</Button>
          <Button onClick={() => toast('پیش‌نویس ذخیره شد', o({ description: 'همه‌ی تغییرها نگه داشته شد' }))}>با توضیح</Button>
          <Button onClick={() => toast.dismiss()}>بستن همه</Button>
        </div>
      </Section>

      <Section title="دکمه‌ی واگرد" aside="action">
        <div className="kit-row">
          <Button
            onClick={() => toast('فایل به سطل آشغال رفت', o({
              description: 'بودجه-۱۴۰۵.xlsx',
              action: { label: 'واگرد', onClick: () => toast.success('برگشت داده شد', o()) },
            }))}
          >
            حذف فایل
          </Button>
        </div>
      </Section>

      <Section title="وعده و به‌روزرسانی با شناسه" aside="toast.promise و id">
        <div className="kit-row">
          <Button
            onClick={() => toast.promise(
              new Promise<void>((ok) => setTimeout(ok, 2000)),
              { loading: 'در حال ارسال گزارش…', success: { title: 'گزارش ارسال شد', description: 'برای ۴ نفر در بخش مالی فرستاده شد' }, error: 'ارسال نشد' },
              o(),
            )}
          >
            وعده‌ی موفق
          </Button>
          <Button
            onClick={() => toast.promise(
              new Promise<void>((_, no) => setTimeout(() => no(new Error('x')), 2000)),
              { loading: 'در حال همگام‌سازی…', success: 'همگام شد', error: { title: 'همگام‌سازی نشد', description: 'اتصال قطع شد، بعداً دوباره امتحان کنید' } },
              o(),
            )}
          >
            وعده‌ی ناموفق
          </Button>
          <Button onClick={updateInPlace}>به‌روزرسانی با شناسه</Button>
        </div>
      </Section>

      <Section title="جای اعلان" aside="position">
        <Segmented label="جای اعلان" value={pos} options={POSITIONS} onChange={setPos} />
      </Section>
    </>
  );
}
