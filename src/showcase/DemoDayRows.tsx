import { Section } from '../ui';
import { DayRows, type DayRowItem } from '../ui/DayRows';

const ROWS: DayRowItem[] = [
  { id: '1', label: 'دوشنبه', sub: '۱۸ آبان · امروز', cells: [{ label: 'ضربانِ آرام', value: '۵۶' }, { label: 'خواب', value: '۷ ساعت و ۱۰ دقیقه' }, { label: 'قدم', value: '۷۳۵' }] },
  { id: '2', label: 'یکشنبه', sub: '۱۷ آبان', tag: 'هشدار داشت', cells: [{ label: 'ضربانِ آرام', value: '۵۵' }, { label: 'خواب', value: '۶ ساعت و ۳۰ دقیقه' }, { label: 'قدم', value: '۵٬۱۰۴' }] },
  { id: '3', label: 'شنبه', sub: '۱۶ آبان', cells: [{ label: 'ضربانِ آرام', value: '۶۸', tone: 'flag', hint: 'با بقیه‌ی هفته فرق دارد' }, { label: 'خواب', value: '۴ ساعت', tone: 'flag', hint: 'با بقیه‌ی هفته فرق دارد' }, { label: 'قدم', value: '۴٬۹۰۰' }] },
  { id: '4', label: 'جمعه', sub: '۱۵ آبان', muted: true, note: 'داده‌ای نرسید', cells: [] },
];

export default function DemoDayRows() {
  return (
    <Section title="ردیف‌های روز" hint="هر روز یک ردیف با چند مقدار. مقدارِ متفاوت کم‌رنگ نشانه می‌خورد، روزِ بی‌داده کم‌رنگ است. روی گوشی مقدارها زیر هم می‌آیند.">
      <DayRows rows={ROWS} label="هفت روز گذشته" />
    </Section>
  );
}
