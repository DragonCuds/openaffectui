import { useState } from 'react';
import { Button, Section, Stepper } from '@kit/ui';
import '@kit/showcase/showcase.css';

const SIGNUP = ['شماره', 'کد پیامک', 'پایان'];
const QUIZ = ['', '', '', '', ''];

/** Stepper: dots for a sign-up flow and a bar for questions, each with back and next buttons. */
export default function DemoStepper() {
  const [step, setStep] = useState(1);
  const [q, setQ] = useState(1);

  return (
    <>
      <Section title="مراحل ثبت‌نام" aside="dots">
        <div className="kit-stack">
          <Stepper steps={SIGNUP} current={step} label="مراحل ثبت‌نام" />
          <div className="kit-row">
            <Button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>قبلی</Button>
            <Button variant="primary" onClick={() => setStep((s) => Math.min(SIGNUP.length, s + 1))} disabled={step === SIGNUP.length}>بعدی</Button>
          </div>
        </div>
      </Section>

      <Section title="سؤال‌های پرسشنامه" aside="bar">
        <div className="kit-stack">
          <Stepper variant="bar" steps={QUIZ} current={q} label="پیشرفت پرسشنامه" />
          <div className="kit-row">
            <Button onClick={() => setQ((s) => Math.max(0, s - 1))} disabled={q === 0}>قبلی</Button>
            <Button variant="primary" onClick={() => setQ((s) => Math.min(QUIZ.length, s + 1))} disabled={q === QUIZ.length}>بعدی</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
