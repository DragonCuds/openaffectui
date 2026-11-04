import { useState } from 'react';
import { Button, Section } from '@kit/ui';
import '@kit/showcase/showcase.css';

/** Button: the two looks, disabled, and a click that changes the label. */
export default function DemoButton() {
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <>
      <Section title="دو حالت دکمه" aside="primary و soft">
        <div className="kit-row">
          <Button variant="primary">ذخیره</Button>
          <Button>بی‌خیال</Button>
        </div>
      </Section>

      <Section title="دکمه‌ی غیرفعال" aside="disabled">
        <div className="kit-row">
          <Button variant="primary" disabled>ارسال</Button>
          <Button disabled>ویرایش</Button>
        </div>
      </Section>

      <Section title="کلیک و تغییر برچسب" aside="دکمه‌ها را بزنید">
        <div className="kit-row">
          <Button variant="primary" onClick={() => setSaved((s) => !s)}>
            {saved ? 'ذخیره شد' : 'ذخیره‌ی تغییرها'}
          </Button>
          <Button onClick={() => setCount((c) => c + 1)}>
            پسندیدم ({count.toLocaleString('fa-IR')})
          </Button>
        </div>
      </Section>
    </>
  );
}
