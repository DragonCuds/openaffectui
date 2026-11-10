import type { ElementType, ReactNode } from 'react';
import { Clock, MapPin, Users } from 'lucide-react';
import { StatusDot } from './StatusDot';
import { Chip } from './Chip';
import { Avatar } from './Avatar';
import { faNum } from './digits';

/**
 * A job ad as a card: kind and urgency on top, title, who posted it, place and time, pay.
 * Urgent ads get a pulsing dot. The whole card is one link. Styles in src/styles/cards.css.
 */
export function AdCard({
  title, kind, urgent, employer, employerHue, place, when, pay, applicants, href = '#', as: Tag = 'a', urgentLabel = 'فوری', action,
}: {
  title: string;
  /** e.g. «یه‌شبه» or «تمام‌وقت» */
  kind: string;
  urgent?: boolean;
  employer: string;
  employerHue?: number;
  place: string;
  when: string;
  pay: ReactNode;
  applicants?: number;
  href?: string;
  as?: ElementType;
  urgentLabel?: string;
  /** Small text on the end of the footer, e.g. «من میام». */
  action?: ReactNode;
}) {
  return (
    <Tag href={href} className="adc" data-urgent={urgent || undefined}>
      <div className="adc-top">
        {urgent ? <Chip tone="busy" icon={<StatusDot tone="busy" />}>{urgentLabel}</Chip> : null}
        <Chip>{kind}</Chip>
      </div>
      <h3 className="adc-title">{title}</h3>
      <div className="adc-by"><Avatar name={employer} hue={employerHue} size={26} /><span>{employer}</span></div>
      <ul className="adc-meta">
        <li><MapPin size={15} aria-hidden="true" />{place}</li>
        <li><Clock size={15} aria-hidden="true" />{when}</li>
      </ul>
      <div className="adc-foot">
        <strong className="adc-pay">{pay}</strong>
        <span className="adc-side">
          {applicants != null ? <span className="adc-n"><Users size={14} aria-hidden="true" />{faNum(applicants)} درخواست</span> : null}
          {action ? <span className="adc-go">{action}</span> : null}
        </span>
      </div>
    </Tag>
  );
}
