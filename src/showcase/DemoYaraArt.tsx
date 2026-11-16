import { Section, YaraArt } from '../ui';

export default function DemoYaraArt() {
  return (
    <Section title="نقاشیِ بالای صفحه" hint="برای در ورود و صفحه‌ی خالی: حلقه، یا خانه با دو نفر.">
      <div className="kit-stack" style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
        <YaraArt kind="ring" size={200} />
        <YaraArt kind="home" size={200} />
      </div>
    </Section>
  );
}
