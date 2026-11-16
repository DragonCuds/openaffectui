import type { ReactNode } from 'react';
import { Gauge, type GaugeProps } from './Gauge';
import { autoLevel, levelTone } from './v3';
import { cx, toFaDigits } from './yv';

export type SensorPageSection = {
  id?: string;
  /** Small grey title above the card, e.g. «امروز». */
  title: string;
  /** Quiet text at the far end of the title line, e.g. «کمترین ۵۶ · بیشترین ۸۰». */
  aside?: string;
  /** Goes inside the white card (BandChart, WeekBars, MetricRows ...). */
  children: ReactNode;
};

/**
 * Full page of one sensor, in the order of the approved heart page: header (back button, title, «؟» button), a big Gauge,
 * one line with the state word and the time («خوب · ۷ دقیقه پیش»), one plain sentence, an optional primary button (or any
 * `actionSlot`, e.g. a LivePill), then sections of title + card. Centred, at most 560px wide, fine at 360px.
 * Latin digits in texts become Persian. Styles: src/styles/v3-sensorpage.css.
 */
export function SensorPage({ title, onBack, onHelp, backLabel = 'بازگشت', helpLabel = 'راهنما', gauge, stateText, time, sentence, action, actionSlot, sections = [], children, className }: {
  title: string;
  /** Shows the back button (arrow towards the start edge). */
  onBack?: () => void;
  /** Shows the «؟» button. */
  onHelp?: () => void;
  backLabel?: string;
  helpLabel?: string;
  /** The big gauge (always large). */
  gauge: Omit<GaugeProps, 'size'>;
  /** The state word, coloured like the gauge dot, e.g. «خوب». */
  stateText?: string;
  /** Muted time after the state word, e.g. «۷ دقیقه پیش». */
  time?: string;
  /** One sentence under the gauge. */
  sentence?: string;
  /** Primary dark button, e.g. «اندازه بگیر». */
  action?: { label: string; onClick?: () => void; disabled?: boolean };
  /** Replaces `action`. */
  actionSlot?: ReactNode;
  sections?: SensorPageSection[];
  /** Extra content after the sections. */
  children?: ReactNode;
  className?: string;
}) {
  const level = gauge.level ?? autoLevel(gauge.value, gauge.bandLow, gauge.bandHigh);
  const tone = gauge.value == null ? 'neutral' : levelTone(level, gauge.late);
  return (
    <div className={cx('v3', 'v3-page', className)}>
      <header className="v3-page-top">
        {onBack ? (
          <button type="button" className="v3-page-ib" onClick={onBack} aria-label={backLabel}>
            <svg className="v3-page-arrow" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        ) : null}
        <h1 className="v3-page-title">{title}</h1>
        {onHelp ? <button type="button" className="v3-page-ib v3-page-q" onClick={onHelp} aria-label={`${helpLabel} ${title}`}>؟</button> : null}
      </header>
      <div className="v3-page-hero"><Gauge {...gauge} size="lg" label={gauge.label ?? title} /></div>
      {stateText || time ? (
        <p className="v3-page-state">
          {stateText ? <b data-tone={tone}>{stateText}</b> : null}
          {stateText && time ? ' · ' : null}
          {time ? toFaDigits(time) : null}
        </p>
      ) : null}
      {sentence ? <p className="v3-page-sentence">{toFaDigits(sentence)}</p> : null}
      {actionSlot ? <div className="v3-page-act">{actionSlot}</div> : action ? (
        <div className="v3-page-act">
          <button type="button" className="v3-page-btn" onClick={action.onClick} disabled={action.disabled}>{action.label}</button>
        </div>
      ) : null}
      {sections.map((s, i) => (
        <section key={s.id ?? i} className="v3-page-sec">
          <div className="v3-page-sh">
            <h2>{s.title}</h2>
            {s.aside ? <span>{toFaDigits(s.aside)}</span> : null}
          </div>
          <div className="v3-card">{s.children}</div>
        </section>
      ))}
      {children}
    </div>
  );
}
