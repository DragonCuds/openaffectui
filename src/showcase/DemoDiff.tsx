import { useRef, useState } from 'react';
import { Button, Section } from '../ui';
import { InlineDiff, diffWords } from '../ui/InlineDiff';
import type { DiffSegment, InlineDiffHandle } from '../ui/InlineDiff';
import { faNum } from '../ui/digits';

const ORIGINAL =
  'سلام به همه، خیلی خوشحالیم که اعلام کنیم داشبورد جدید حالا برای همه‌ی کاربران موجود است. این داشبورد خیلی سریع‌تر از قبل بارگذاری می‌شود و حالا می‌توانید هر گزارش را فقط با یک کلیک به CSV خروجی بگیرید. نظرتان را برایمان بنویسید!';
const SUGGESTED =
  'سلام به همه، داشبورد جدید حالا برای همه‌ی کاربران فعال است. این داشبورد دو برابر سریع بارگذاری می‌شود و حالا می‌توانید هر گزارش را در یک کلیک به CSV خروجی بگیرید. نظرتان را برایمان بنویسید!';

const TONE_ORIGINAL = 'سلام، متأسفانه سفارش شما دیر رسید. ما واقعاً عذر می‌خواهیم و سعی می‌کنیم دفعه‌ی بعد سریع‌تر ارسال کنیم.';
const TONE_SUGGESTED = 'سلام، سفارش شما با تأخیر رسید و بابتش از شما عذرخواهی می‌کنیم. دفعه‌ی بعد سریع‌تر ارسال می‌کنیم.';

const EN_ORIGINAL =
  'Hi everyone, we are very excited to announce that the new dashboard is now available for all users. It loads a lot faster than before, and you can now export any report to CSV with just a single click. Let us know what you think!';
const EN_SUGGESTED =
  'Hi everyone, the new dashboard is now live for all users. It loads twice as fast, and you can now export any report to CSV in one click. Let us know what you think!';

/** Segments built by hand, as a server would send them. */
const SEGMENTS: DiffSegment[] = [
  { type: 'equal', text: 'برای ' },
  { type: 'change', remove: 'ورود به حساب ', insert: 'ورود ' },
  { type: 'equal', text: 'کافی است ' },
  { type: 'change', remove: '', insert: 'فقط ' },
  { type: 'equal', text: 'شماره‌ی موبایل را وارد کنید. ' },
  { type: 'change', remove: 'کد تأیید را برایتان می‌فرستیم', insert: 'کد تأیید پیامک می‌شود' },
  { type: 'equal', text: '.' },
];

export default function DemoDiff() {
  const handle = useRef<InlineDiffHandle>(null);
  const [run, setRun] = useState(0);
  const [result, setResult] = useState('');
  const [finished, setFinished] = useState(false);
  const [tone, setTone] = useState('');
  const count = diffWords(ORIGINAL, SUGGESTED).filter((s) => s.type === 'change').length;

  return (
    <>
      <Section
        title="تفاوت درون‌متنی"
        aside={<Button onClick={() => { setRun((n) => n + 1); setResult(''); setFinished(false); }}>از اول</Button>}
      >
        <div className="kit-stack">
          <InlineDiff
            key={`a-${run}`}
            ref={handle}
            label="پیشنهاد هوش مصنوعی · کوتاه‌ترش کن"
            original={ORIGINAL}
            suggested={SUGGESTED}
            onChange={(t) => { setResult(t); setFinished(false); }}
            onDone={(t) => { setResult(t); setFinished(true); }}
          />
          <div className="kit-row">
            <Button onClick={() => handle.current?.highlight(0)}>نشان‌دادن اولی</Button>
            <Button onClick={() => handle.current?.highlight(null)}>برداشتن نشان</Button>
            <Button onClick={() => handle.current?.accept(1)}>پذیرفتن دومی</Button>
            <Button onClick={() => handle.current?.reject(2)}>ردکردن سومی</Button>
            <Button onClick={() => handle.current?.undo()}>بازگردانی</Button>
            <Button onClick={() => handle.current?.reset()}>همه از اول</Button>
          </div>
          <p className="muted" role="status">
            {faNum(count)} پیشنهاد · {finished ? 'متن نهایی' : result ? 'متن تا اینجا' : 'هنوز تصمیمی گرفته نشده'}
            {result ? `: ${result}` : ''}
          </p>
          <p className="muted">کلیدها: Y یا Enter می‌پذیرد، N یا Backspace رد می‌کند، Tab بین پیشنهادها می‌رود، Esc بیرون می‌آید.</p>
        </div>
      </Section>

      <Section title="با سینی خاکستری">
        <div className="kit-stack">
          <InlineDiff
            key={`b-${run}`}
            tray
            label="پیشنهاد هوش مصنوعی · لحن مؤدبانه"
            original={TONE_ORIGINAL}
            suggested={TONE_SUGGESTED}
            onDone={setTone}
          />
          {tone ? <p className="muted" role="status">متن نهایی: {tone}</p> : null}
        </div>
      </Section>

      <Section title="تکه‌های آماده">
        <InlineDiff key={`c-${run}`} label="ویرایش پیام ورود" changes={SEGMENTS} />
      </Section>

      <Section title="متن انگلیسی (چپ‌به‌راست)">
        <div dir="ltr">
          <InlineDiff key={`d-${run}`} lang="en" label="Suggested by AI · Make it shorter" original={EN_ORIGINAL} suggested={EN_SUGGESTED} />
        </div>
      </Section>
    </>
  );
}
