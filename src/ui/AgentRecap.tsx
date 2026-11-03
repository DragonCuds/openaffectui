import { RollingNumber } from './RollingNumber';

export type RecapStat = {
  label: string;
  value: number;
  tone?: 'ok' | 'warn' | 'bad';
};

export type RecapEvent = {
  id: string;
  /** Ready-made text such as «۱۴:۳۰». */
  when: string;
  text: string;
};

/** «وقتی نبودی چی شد»: a few numbers and a short event list; the parent hides it after «دیدم». */
export function AgentRecap({ period, stats, events, onDismiss }: {
  /** Ready-made text such as «۸ ساعت گذشته». */
  period: string;
  stats: RecapStat[];
  events: RecapEvent[];
  onDismiss: () => void;
}) {
  return (
    <section className="recap" aria-label="خلاصه‌ی زمانی که نبودی">
      <header className="recap-head">
        <h3 className="recap-title">وقتی نبودی چی شد</h3>
        <span className="recap-period">{period}</span>
      </header>
      {stats.length > 0 ? (
        <div className="recap-stats">
          {stats.map((s) => (
            <div key={s.label} className={`recap-stat${s.tone ? ` recap-stat-${s.tone}` : ''}`}>
              <span className="recap-value"><RollingNumber value={s.value} /></span>
              <span className="recap-label">{s.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      {events.length > 0 ? (
        <ul className="recap-events">
          {events.map((e) => (
            <li key={e.id} className="recap-event">
              <span className="recap-when">{e.when}</span>
              <span className="recap-text">{e.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <button type="button" className="recap-dismiss" onClick={onDismiss}>دیدم</button>
    </section>
  );
}
