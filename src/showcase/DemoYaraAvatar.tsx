import { InitialAvatar, LiveDot, Section } from '../ui';

export default function DemoYaraAvatar() {
  return (
    <>
      <Section title="آواتار حرفِ اول" hint="حرفِ اولِ نام روی دایره‌ی رنگی. اندازه‌ی ۴۸ و ۶۴، رنگ از بخشِ بدن یا وضعیت می‌آید، «پر» برای هشدار.">
        <div className="kit-row">
          <InitialAvatar name="مریم" />
          <InitialAvatar name="حسین" size={64} />
          <InitialAvatar name="سارا" area="heart" />
          <InitialAvatar name="رضا" area="sleep" size={40} />
          <InitialAvatar name="حسین" area="attn" solid />
        </div>
      </Section>
      <Section title="نقطه‌ی زنده" hint="خبرِ تازه یعنی نقطه‌ی سبز با تپشِ آرام؛ اگر کاربر انیمیشن نمی‌خواهد، نمی‌تپد.">
        <div className="kit-row">
          <span className="kit-dot"><LiveDot />آخرین خبر ۴ دقیقه پیش</span>
          <span className="kit-dot"><LiveDot tone="attn" />نیاز به چک</span>
          <span className="kit-dot"><LiveDot tone="neutral" pulse={false} />بدون خبر</span>
        </div>
      </Section>
    </>
  );
}
