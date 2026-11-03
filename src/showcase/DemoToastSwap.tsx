import { useState } from 'react';
import { Button, Section, Segmented, Surface } from '../ui';
import { toast } from '../ui/Toaster';
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

/** Toast buttons plus a tab switch whose content blurs in. */
export default function DemoToastSwap() {
  const [tab, setTab] = useState('a');
  return (
    <>
      <Section title="اعلان">
        <div className="kit-row">
          <Button onClick={() => toast.success('ذخیره شد')}>موفق</Button>
          <Button onClick={() => toast.error('اتصال برقرار نشد، دوباره تلاش کن')}>خطا</Button>
          <Button onClick={() => toast.info('نسخه‌ی جدید آماده است')}>اطلاع</Button>
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
