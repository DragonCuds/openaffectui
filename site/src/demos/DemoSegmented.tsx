import { useState } from 'react';
import { Section, Segmented, Surface } from '@kit/ui';
import '@kit/showcase/showcase.css';

const RANGES = [
  { value: 'week', label: 'هفته' },
  { value: 'month', label: 'ماه' },
  { value: 'year', label: 'سال' },
];

const TEXT: Record<string, string> = {
  week: 'این هفته ۱۴ پست منتشر شد.',
  month: 'این ماه ۶۲ پست منتشر شد.',
  year: 'امسال ۷۴۰ پست منتشر شده است.',
};

const THEMES = [
  { value: 'light', label: 'روشن' },
  { value: 'dark', label: 'تیره' },
  { value: 'auto', label: 'خودکار' },
  { value: 'sepia', label: 'کاغذی' },
];

/** Segmented: three options that change a text, and four options with the arrow keys. */
export default function DemoSegmented() {
  const [range, setRange] = useState('week');
  const [theme, setTheme] = useState('auto');

  return (
    <>
      <Section title="انتخاب بازه" aside="متن زیر با انتخاب عوض می‌شود">
        <div className="kit-stack">
          <Segmented label="بازه‌ی گزارش" value={range} options={RANGES} onChange={setRange} />
          <Surface>{TEXT[range]}</Surface>
        </div>
      </Section>

      <Section title="چهار گزینه با کیبورد" aside="روی گزینه فوکوس کنید و کلیدهای جهت‌دار را بزنید">
        <Segmented label="پوسته" value={theme} options={THEMES} onChange={setTheme} />
      </Section>
    </>
  );
}
