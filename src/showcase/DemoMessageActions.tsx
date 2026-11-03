import { useEffect, useRef, useState } from 'react';
import { Section } from '../ui';
import { MessageActions, MessageText } from '../ui/MessageActions';

const VERSIONS = [
  'برای شروع، عنوان صفحه را کوتاه‌تر و روشن‌تر می‌نویسم: «کفش ورزشی مردانه، ارسال رایگان». توضیح متا هم یک جمله با دعوت به خرید می‌شود.',
];
const NEXT = [
  'عنوان را روی کلیدواژه‌ی اصلی می‌گذارم: «خرید کفش ورزشی مردانه اصل». توضیح متا هم دو جمله است؛ یکی برای مزیت و یکی برای دعوت به خرید.',
  'پیشنهاد من این است که اول عنوان‌های ضعیف را درست کنیم و بعد سراغ توضیح متا برویم. هر دو تغییر را قبل از ذخیره نشانت می‌دهم.',
];

/** A chat message with the full action bar: copy, regenerate with versions, rating with reasons, read aloud. */
function Message({ actions }: { actions?: ('copy' | 'regenerate' | 'feedback' | 'speak')[] }) {
  const [versions, setVersions] = useState(VERSIONS);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const regenerate = () => {
    setBusy(true);
    timer.current = setTimeout(() => {
      setVersions((v) => [...v, NEXT[(v.length - 1) % NEXT.length]]);
      setVersion(versions.length);
      setBusy(false);
    }, 1400);
  };

  return (
    <div data-ui-message style={{ maxWidth: 520 }}>
      <MessageText version={version}>{versions[version]}</MessageText>
      <MessageActions
        text={versions[version]}
        actions={actions}
        versions={versions}
        version={version}
        onVersionChange={setVersion}
        onRegenerate={regenerate}
        regenerating={busy}
      />
    </div>
  );
}

export default function DemoMessageActions() {
  return (
    <>
      <Section title="نوار زیر پیام">
        <Message />
      </Section>
      <Section title="فقط کپی و امتیاز">
        <Message actions={['copy', 'feedback']} />
      </Section>
    </>
  );
}
