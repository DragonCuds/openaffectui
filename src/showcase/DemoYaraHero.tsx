import { BigButton, Section, StatusHero, YaraIcon, InitialAvatar } from '../ui';

export default function DemoYaraHero() {
  return (
    <Section title="کارتِ وضعیت" hint="بالای صفحه‌ی یک نفر: یک جمله‌ی کوتاه با کلمه‌های رنگی. آرام سبز است، «لطفاً چک کنید» کهربایی.">
      <div className="kit-stack">
        <StatusHero state="حالِ حسین" accent="خوب است" caption="آخرین خبر ۴ دقیقه پیش" visual={<InitialAvatar name="حسین" size={64} />} trailing={<span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', color: 'var(--muted)' }}><YaraIcon name="battery" size={20} />۷۸٪</span>} />
        <StatusHero tone="attn" state="ضربانِ حسین" accent="لطفاً چک کنید" caption="حدودِ نیم ساعت بالاتر از همیشه">
          <BigButton variant="soft" block icon={<YaraIcon name="call" size={22} />}>تماس با حسین</BigButton>
        </StatusHero>
      </div>
    </Section>
  );
}
