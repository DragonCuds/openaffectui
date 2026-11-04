import { useState } from 'react';
import { PricingPlans, Section, type PricingPlan } from '@kit/ui';
import '@kit/showcase/showcase.css';

/** PricingPlans: three plans; choose one and it becomes the current plan after a short wait. */
export default function DemoPricingPlans() {
  const [current, setCurrent] = useState('free');
  const [busy, setBusy] = useState<string | null>(null);

  const pick = (id: string) => {
    setBusy(id);
    window.setTimeout(() => { setCurrent(id); setBusy(null); }, 800);
  };

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'رایگان',
      price: 'رایگان',
      note: 'برای شروع',
      features: ['۱۰۰ پیام در ماه', 'یک پروژه'],
      current: current === 'free',
      busy: busy === 'free',
      actionLabel: current === 'free' ? undefined : 'برگشت به رایگان',
      actionSoft: true,
      onAction: () => pick('free'),
    },
    {
      id: 'pro',
      name: 'حرفه‌ای',
      price: '۹۰۰٬۰۰۰ تومان',
      note: 'ماهانه',
      features: ['پیام نامحدود', 'ده پروژه', 'پشتیبانی سریع'],
      featured: true,
      current: current === 'pro',
      busy: busy === 'pro',
      actionLabel: current === 'pro' ? undefined : 'ارتقا بده',
      onAction: () => pick('pro'),
    },
    {
      id: 'team',
      name: 'تیمی',
      price: '۲٬۴۰۰٬۰۰۰ تومان',
      note: 'ماهانه، تا ۱۰ نفر',
      features: ['همه‌ی امکانات حرفه‌ای', 'پروژه‌ی نامحدود', 'گزارش مشترک'],
      current: current === 'team',
      busy: busy === 'team',
      actionLabel: current === 'team' ? undefined : 'انتخاب طرح تیمی',
      onAction: () => pick('team'),
    },
  ];

  return (
    <Section title="انتخاب طرح" aside="طرح پیشنهادی برجسته است؛ یکی را انتخاب کنید">
      <PricingPlans plans={plans} disabled={busy !== null} />
    </Section>
  );
}
