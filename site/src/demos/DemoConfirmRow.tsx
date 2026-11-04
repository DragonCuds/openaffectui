import { useState } from 'react';
import { Button, ConfirmRow, Section } from '@kit/ui';
import '@kit/showcase/showcase.css';

/** ConfirmRow: a delete that asks first and shows a busy state, and a calm confirm. */
export default function DemoConfirmRow() {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [sent, setSent] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const remove = () => {
    setBusy(true);
    window.setTimeout(() => { setBusy(false); setAsking(false); setDeleted(true); }, 900);
  };

  return (
    <>
      <Section title="حذف با پرسش" aside="danger و حالت busy">
        <div className="kit-stack">
          {deleted ? (
            <div className="kit-row">
              <span>پروژه حذف شد.</span>
              <Button onClick={() => setDeleted(false)}>برگردان (نمایشی)</Button>
            </div>
          ) : asking ? (
            <ConfirmRow
              question="پروژه‌ی «کمپین پاییز» برای همیشه حذف شود؟"
              confirmLabel="بله، حذف کن"
              danger
              busy={busy}
              label="تأیید حذف پروژه"
              onConfirm={remove}
              onCancel={() => setAsking(false)}
            />
          ) : (
            <Button onClick={() => setAsking(true)}>حذف پروژه</Button>
          )}
        </div>
      </Section>

      <Section title="تأیید معمولی" aside="با متن دلخواه برای هر دو دکمه">
        <div className="kit-stack">
          {sent ? (
            <span>گزارش ارسال شد.</span>
          ) : confirm ? (
            <ConfirmRow
              question="گزارش برای ۴ نفر فرستاده شود؟"
              confirmLabel="بفرست"
              cancelLabel="هنوز نه"
              onConfirm={() => { setSent(true); setConfirm(false); }}
              onCancel={() => setConfirm(false)}
            />
          ) : (
            <Button variant="primary" onClick={() => { setSent(false); setConfirm(true); }}>ارسال گزارش</Button>
          )}
        </div>
      </Section>
    </>
  );
}
