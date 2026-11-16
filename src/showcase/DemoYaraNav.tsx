import { useState } from 'react';
import { BottomNav, InitialAvatar, RoundIconButton, Section, TopBar, YaraIcon } from '../ui';

export default function DemoYaraNav() {
  const [sel, setSel] = useState('home');
  return (
    <>
      <Section title="نوارِ بالا" hint="بی‌رنگ. آواتار یا دکمه‌ی برگشت، عنوان با توضیحِ کوچک، و یک دکمه‌ی گردِ ۴۴ پیکسلی با نقطه‌ی کهربایی برای خبرِ تازه.">
        <TopBar leading={<InitialAvatar name="مریم" size={44} />} overline="سلام مریم" title="خانواده‌ی احمدی" large={false} endIcon={<YaraIcon name="bell" />} endLabel="اعلان‌ها" endBadge />
        <TopBar leading={<RoundIconButton icon={<YaraIcon name="arrow" />} label="بازگشت" href="#" />} title="حسین احمدی" caption="حالش خوب است" />
      </Section>
      <Section title="نوارِ پایین (فقط گوشی)" hint="روی صفحه‌ی عریض پنهان می‌شود؛ اینجا برای نمایش به صورتِ ثابت نیست.">
        <div className="kit-card-demo" style={{ padding: 0, overflow: 'hidden' }}>
          <BottomNav
            fixed={false} phoneOnly={false} selected={sel} onSelect={setSel}
            items={[
              { key: 'home', label: 'خانه', icon: <YaraIcon name="home" filled={sel === 'home'} /> },
              { key: 'alerts', label: 'هشدارها', icon: <YaraIcon name="bell" filled={sel === 'alerts'} />, badge: true },
              { key: 'family', label: 'خانواده', icon: <YaraIcon name="group" /> },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
