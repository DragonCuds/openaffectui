import { Section, Surface } from '@kit/ui';
import '@kit/showcase/showcase.css';

/** Surface: a plain box, and the same box as article and section. */
export default function DemoSurface() {
  return (
    <>
      <Section title="سطح ساده" aside="پس‌زمینه‌ی نرم، بدون خط دور">
        <Surface>پیش‌نویس‌ها هر ده ثانیه خودکار ذخیره می‌شوند.</Surface>
      </Section>

      <Section title="با تگ معنادار" aside="as=&quot;article&quot; و as=&quot;section&quot;">
        <div className="kit-stack">
          <Surface as="article">
            <b>نکته</b>
            <p>پست‌های زمان‌بندی‌شده تا قبل از انتشار قابل ویرایش‌اند.</p>
          </Surface>
          <Surface as="section">
            <b>آمار امروز</b>
            <p>سه پست منتشر شد و همه بدون خطا رفتند.</p>
          </Surface>
        </div>
      </Section>
    </>
  );
}
