import { useState } from 'react';
import { Button, Meter, Section } from '@kit/ui';
import '@kit/showcase/showcase.css';

const fa = (n: number) => n.toLocaleString('fa-IR');

/** Meter: fixed values, and one you can fill and empty. */
export default function DemoMeter() {
  const [used, setUsed] = useState(38);

  return (
    <>
      <Section title="چند مقدار" aside="خالی، نیمه و تقریباً پر">
        <div className="kit-stack">
          <Meter value={0} max={100} label="هنوز شروع نشده" />
          <Meter value={50} max={100} label="نیمه" />
          <Meter value={92} max={100} label="تقریباً پر" />
        </div>
      </Section>

      <Section title="مصرف پیام" aside="دکمه‌ها را بزنید">
        <div className="kit-stack">
          <span>{fa(used)} از {fa(100)} پیام</span>
          <Meter value={used} max={100} label="پیام‌های مصرف‌شده" />
          <div className="kit-row">
            <Button onClick={() => setUsed((u) => Math.min(100, u + 15))}>۱۵ پیام بیشتر</Button>
            <Button onClick={() => setUsed((u) => Math.max(0, u - 15))}>۱۵ پیام کمتر</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
