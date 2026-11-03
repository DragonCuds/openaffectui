import { useEffect, useRef, useState } from 'react';
import { Section } from '../ui';
import { ChatComposer } from '../ui/ChatComposer';
import { MessageActions } from '../ui/MessageActions';

type Msg = { id: number; role: 'user' | 'assistant'; text: string };

const REPLIES = [
  'حتماً. یک نسخه‌ی کوتاه‌تر و روان‌تر از متنت نوشتم؛ اگر لحنش را دوست نداشتی بگو تا عوضش کنم.',
  'این کار چند مرحله دارد: اول داده‌ها را مرتب می‌کنم، بعد خلاصه‌اش را می‌نویسم و آخر برایت می‌فرستم.',
  'فکر می‌کنم بهتر است اول عنوان صفحه را ساده‌تر کنیم و بعد سراغ توضیح متا برویم.',
];

const DELAY_MS = 1000;

/** Fake chat: composer sends, assistant replies after a second with message actions underneath. */
export default function DemoChat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, role: 'assistant', text: 'سلام! چه کمکی از من برمی‌آید؟' },
  ]);
  const [sending, setSending] = useState(false);
  const nextId = useRef(1);
  const replyIdx = useRef(0);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const set = timers.current;
    return () => set.forEach(clearTimeout);
  }, []);

  const reply = () =>
    new Promise<void>((resolve) => {
      const t = setTimeout(() => {
        timers.current.delete(t);
        const text = REPLIES[replyIdx.current++ % REPLIES.length];
        setMsgs((l) => [...l, { id: nextId.current++, role: 'assistant', text }]);
        setSending(false);
        resolve();
      }, DELAY_MS);
      timers.current.add(t);
    });

  const send = (text: string) => {
    setMsgs((l) => [...l, { id: nextId.current++, role: 'user', text }]);
    setSending(true);
    return reply();
  };

  const regenerate = (id: number) => {
    if (sending) return;
    setSending(true);
    setMsgs((l) => l.filter((m) => m.id !== id));
    void reply();
  };

  return (
    <Section title="گفت‌وگو">
      <div className="demo-chat">
        <ul className="demo-chat-list" aria-label="پیام‌ها">
          {msgs.map((m) => (
            <li key={m.id} className={`demo-chat-msg demo-chat-${m.role}`}>
              <p className="demo-chat-bubble">{m.text}</p>
              {m.role === 'assistant' ? (
                <MessageActions text={m.text} onRegenerate={() => regenerate(m.id)} />
              ) : null}
            </li>
          ))}
        </ul>
        <ChatComposer onSend={(text) => { if (!sending) void send(text); }} />
      </div>
    </Section>
  );
}
