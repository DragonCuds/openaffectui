import { Accordion, FeatureCard, FeatureGrid, Hero, ScreenshotFrame, Section, SiteFooter, SiteHeader, StepFlow } from '../ui';

const shot = "data:image/svg+xml;utf8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='800' height='450' fill='#e9eef2'/><rect x='40' y='40' width='720' height='60' rx='16' fill='#d5dde4'/><rect x='40' y='130' width='340' height='280' rx='20' fill='#d5dde4'/><rect x='420' y='130' width='340' height='280' rx='20' fill='#d5dde4'/></svg>");

/** Landing-page pieces: header, two-door hero, steps, feature cards, screenshot, FAQ, footer. */
export default function DemoLanding() {
  return (
    <Section title="صفحه‌ی فرود">
      <SiteHeader
        brand="حلقه‌ی خانواده"
        links={[{ label: 'چطور کار می‌کند', href: '#steps' }, { label: 'امکانات', href: '#features' }, { label: 'سؤالات', href: '#faq' }]}
        cta={{ label: 'ثبت‌نام', href: '#join' }}
      />
      <Hero
        eyebrow="سلامت خانواده، آرام و بی‌دغدغه"
        title="حلقه‌ای که حال عزیزانتان را می‌پرسد"
        lead="با یک حلقه‌ی هوشمند، حال پدر و مادرتان را بدون مزاحمت و بدون تماس‌های مکرر ببینید."
        doors={[
          { title: 'من نگران پدر و مادرم', text: 'ببینید خوابیده‌اند، تکان خورده‌اند و حالشان خوب است.', cta: { label: 'برای خانواده‌ام', href: '#join' }, tone: 'calm' },
          { title: 'خودم حلقه را می‌بندم', text: 'گزارش روزانه‌ی ساده از خواب و ضربان قلب خودتان.', cta: { label: 'برای خودم', href: '#join' }, tone: 'warm' },
        ]}
        media={<ScreenshotFrame src={shot} alt="نمونه‌ی داشبورد خانواده" width={800} height={450} caption="نمونه‌ی داشبورد" />}
      />
      <div id="steps">
        <StepFlow
          steps={[
            { title: 'حلقه را ببندید', text: 'حلقه را روی انگشت می‌گذارند و فراموشش می‌کنند.' },
            { title: 'داده خوانده می‌شود', text: 'خواب و ضربان قلب آرام‌آرام ثبت می‌شود.' },
            { title: 'شما خبردار می‌شوید', text: 'اگر چیزی عادی نبود، پیام می‌گیرید.' },
          ]}
          note="این سرویس جایگزین پزشک نیست."
        />
      </div>
      <div id="features">
        <FeatureGrid>
          <FeatureCard title="خواب" text="کیفیت خواب هر شب، به زبان ساده." />
          <FeatureCard title="ضربان قلب" text="تغییرهای غیرعادی را زود می‌بینید." />
          <FeatureCard title="حریم خصوصی" text="هر عضو خودش تعیین می‌کند چه چیزی دیده شود." />
        </FeatureGrid>
      </div>
      <div id="faq">
        <Accordion items={[
          { id: 'a', title: 'آیا حلقه سنگین است؟', body: 'خیر، سبک است و شب هم می‌شود با آن خوابید.' },
          { id: 'b', title: 'باتری چقدر می‌ماند؟', body: 'چند روز بدون شارژ مجدد.' },
        ]} />
      </div>
      <SiteFooter
        brand="حلقه‌ی خانواده"
        groups={[
          { title: 'محصول', links: [{ label: 'امکانات', href: '#features' }, { label: 'سؤالات', href: '#faq' }] },
          { title: 'شرکت', links: [{ label: 'تماس با ما', href: '#' }, { label: 'حریم خصوصی', href: '#' }] },
        ]}
        note="این محصول ابزار پزشکی نیست و برای تشخیص یا درمان بیماری استفاده نمی‌شود."
      />
    </Section>
  );
}
