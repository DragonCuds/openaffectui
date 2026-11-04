import { useState } from 'react';
import { Button, OtpInput, Section } from '@kit/ui';
import '@kit/showcase/showcase.css';

const RIGHT = '123456';

/** OtpInput: type or paste a code (the right one is 123456), and a short four-box code. */
export default function DemoOtpInput() {
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'ok' | 'wrong'>('idle');
  const [pin, setPin] = useState('');

  return (
    <>
      <Section title="کد پیامک شش‌رقمی" aside="کد درست ۱۲۳۴۵۶ است؛ می‌توانید پیست هم بکنید">
        <div className="kit-stack">
          <OtpInput
            value={code}
            onChange={(v) => { setCode(v); setState('idle'); }}
            onComplete={(v) => setState(v === RIGHT ? 'ok' : 'wrong')}
            invalid={state === 'wrong'}
          />
          <span aria-live="polite">
            {state === 'ok' ? 'کد تأیید شد.' : state === 'wrong' ? 'کد درست نیست، دوباره امتحان کنید.' : 'منتظر کد هستیم…'}
          </span>
          <div className="kit-row">
            <Button onClick={() => { setCode(''); setState('idle'); }}>پاک کردن</Button>
          </div>
        </div>
      </Section>

      <Section title="رمز چهاررقمی" aside="length=4">
        <div className="kit-stack">
          <OtpInput value={pin} onChange={setPin} length={4} label="رمز کوتاه" />
          <span>مقدار: {pin ? pin : 'هنوز چیزی وارد نشده'}</span>
        </div>
      </Section>
    </>
  );
}
