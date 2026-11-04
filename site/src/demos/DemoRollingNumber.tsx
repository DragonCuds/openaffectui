import { useState } from 'react';
import { Button, RollingNumber, Section } from '@kit/ui';
import '@kit/showcase/showcase.css';

const money = (n: number) => `${n.toLocaleString('fa-IR')} تومان`;
const percent = (n: number) => `${n.toLocaleString('fa-IR')}٪`;

/** RollingNumber: a counter with plus and minus, money with a custom format, and a percent. */
export default function DemoRollingNumber() {
  const [orders, setOrders] = useState(1240);
  const [balance, setBalance] = useState(2_450_000);
  const [pct, setPct] = useState(64);

  return (
    <>
      <Section title="شمارنده" aside="رقم‌ها جدا از هم می‌غلتند">
        <div className="kit-row">
          <span className="kit-big"><RollingNumber value={orders} /></span>
          <Button variant="primary" onClick={() => setOrders((n) => n + 37)}>+ ۳۷ سفارش</Button>
          <Button onClick={() => setOrders((n) => Math.max(0, n - 37))}>− ۳۷</Button>
        </div>
      </Section>

      <Section title="موجودی با قالب دلخواه" aside="format">
        <div className="kit-row">
          <span className="kit-big"><RollingNumber value={balance} format={money} /></span>
          <Button onClick={() => setBalance((n) => n + 500_000)}>شارژ</Button>
          <Button onClick={() => setBalance((n) => Math.max(0, n - 500_000))}>برداشت</Button>
        </div>
      </Section>

      <Section title="درصد" aside="طول عدد که عوض شود، ستون‌ها درست جا می‌گیرند">
        <div className="kit-row">
          <span className="kit-big"><RollingNumber value={pct} format={percent} /></span>
          <Button onClick={() => setPct((n) => Math.min(100, n + 12))}>+ ۱۲</Button>
          <Button onClick={() => setPct((n) => Math.max(0, n - 12))}>− ۱۲</Button>
        </div>
      </Section>
    </>
  );
}
