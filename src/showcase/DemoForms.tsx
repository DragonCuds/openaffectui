import { useState } from 'react';
import { Button, Checkbox, CopyBox, Modal, Section, Select, Tabs, TextField, TimeField } from '../ui';

type Tab = 'info' | 'times' | 'key';

/** Form controls, tabs, dialog and the copy box with Persian sample data. */
export default function DemoForms() {
  const [name, setName] = useState('');
  const [city, setCity] = useState<'tehran' | 'shiraz' | ''>('');
  const [sms, setSms] = useState(true);
  const [from, setFrom] = useState('22:30');
  const [tab, setTab] = useState<Tab>('info');
  const [open, setOpen] = useState(false);
  return (
    <>
      <Section title="فیلدها">
        <div className="kit-stack">
          <TextField label="اسم" value={name} onChange={setName} hint="همان اسمی که در گروه دیده می‌شود." />
          <TextField label="شماره‌ی موبایل" value="0912" onChange={() => undefined} ltr error="شماره‌ی موبایل درست نیست." />
          <Select label="شهر" value={city} onChange={setCity} placeholder="یکی را انتخاب کنید"
            options={[{ value: 'tehran', label: 'تهران' }, { value: 'shiraz', label: 'شیراز' }]} />
          <Checkbox label="هشدار را پیامک هم بفرست" checked={sms} onChange={setSms} />
          <TimeField label="از ساعت" value={from} onChange={setFrom} hint="ساعت ۲۴ساعته؛ مثلاً ۲۲:۳۰ یا ۹۳۰." />
        </div>
      </Section>
      <Section title="زبانه‌ها و پنجره">
        <Tabs<Tab> label="بخش‌ها" value={tab} onChange={setTab}
          items={[{ value: 'info', label: 'اطلاعات' }, { value: 'times', label: 'ساعت‌ها', badge: '۲' }, { value: 'key', label: 'کلید' }]}>
          {tab === 'key' ? <CopyBox label="کلید ارسال" value="9f2c41a7d0b35e68c1f4a92b7e0d3c58a6b19f4e2d7c0a83b5e16f9d4c2a7b01" /> : <p className="section-aside">محتوای زبانه‌ی «{tab === 'info' ? 'اطلاعات' : 'ساعت‌ها'}».</p>}
        </Tabs>
        <div className="kit-row"><Button onClick={() => setOpen(true)}>باز کردن پنجره</Button></div>
        <Modal open={open} onClose={() => setOpen(false)} title="کلید تازه ساخته شد"
          footer={<Button variant="primary" onClick={() => setOpen(false)}>نوشتم، ببند</Button>}>
          <p>کلید قبلی دیگر کار نمی‌کند. این کلید فقط همین یک بار نشان داده می‌شود.</p>
          <CopyBox value="9f2c41a7d0b35e68c1f4a92b7e0d3c58a6b19f4e2d7c0a83b5e16f9d4c2a7b01" />
        </Modal>
      </Section>
    </>
  );
}
