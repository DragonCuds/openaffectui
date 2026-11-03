import { Section } from '../ui';
import { ChangeSummary } from '../ui/ChangeSummary';

/** Change summary samples for the showcase. */
export default function DemoChange() {
  return (
    <Section title="خلاصه‌ی تغییرها">
        <ChangeSummary
          period="این هفته"
          changes={[
            { label: 'کلیک از گوگل', change: '۱۷٪ بیشتر شد، رسید به ۴۰۰ کلیک', tone: 'good' },
            { label: 'رتبه‌ی عبارت اصلی', change: 'از ۱۲ آمد به ۷', tone: 'good' },
            { label: 'زمان بارگذاری', change: '۰٫۱ ثانیه کندتر شد، رسید به ۳٫۶ ثانیه', tone: 'bad', direction: 'up' },
            { label: 'صفحه‌های بررسی‌شده', change: 'تغییری نکرد، هنوز ۸۰ صفحه', tone: 'neutral' },
          ]}
        />
        <ChangeSummary changes={[]} />
    </Section>
  );
}
