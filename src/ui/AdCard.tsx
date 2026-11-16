import type { ElementType, ReactNode } from 'react';
import { BadgeCheck, Clock, MapPin, Users, Wrench } from 'lucide-react';
import { StatusDot } from './StatusDot';
import { Chip } from './Chip';
import { Avatar } from './Avatar';
import { faNum } from './digits';

/**
 * A job ad as a card: kind and urgency on top, title, who posted it, place and time, pay.
 * Urgent ads get a pulsing dot. The whole card is one link. Styles in src/styles/cards.css.
 */
export function AdCard({
  title, kind, urgent, employer, employerHue, place, when, pay, applicants, href = '#', as: Tag = 'a', urgentLabel = 'فوری', action, verified, role, ago, gearNote, status,
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
  /** Employer checked by us: small check next to the name. */
  verified?: boolean;
  /** Role label chip, e.g. «عکاس». */
  role?: string;
  /** Posted time, e.g. «۳ ساعت پیش». */
  ago?: string;
  /** Gear line, e.g. «دوربین با خودت». */
  gearNote?: string;
  /** Filled or closed ads are dimmed, labelled, and show no action. */
  status?: 'filled' | 'closed';
}) {
  return (
    <Tag href={href} className="adc" data-urgent={urgent || undefined} data-status={status}>
      <div className="adc-top">
        {urgent ? <Chip tone="busy" icon={<StatusDot tone="busy" />}>{urgentLabel}</Chip> : null}
        <Chip>{kind}</Chip>
        {role ? <Chip>{role}</Chip> : null}
        {status ? <Chip tone="bad">{status === 'filled' ? 'نفر گرفته شد' : 'بسته شد'}</Chip> : null}
        {ago ? <span className="adc-ago">{ago}</span> : null}
      </div>
      <h3 className="adc-title">{title}</h3>
      <div className="adc-by"><Avatar name={employer} hue={employerHue} size={26} /><span>{employer}</span>{verified ? <BadgeCheck className="adc-ver" size={16} aria-label="تأییدشده" role="img" /> : null}</div>
      <ul className="adc-meta">
        <li><MapPin size={15} aria-hidden="true" />{place}</li>
        <li><Clock size={15} aria-hidden="true" />{when}</li>
        {gearNote ? <li><Wrench size={15} aria-hidden="true" />{gearNote}</li> : null}
      </ul>
      <div className="adc-foot">
        <strong className="adc-pay">{pay}</strong>
        <span className="adc-side">
          {applicants != null ? <span className="adc-n"><Users size={14} aria-hidden="true" />{faNum(applicants)} درخواست</span> : null}
          {action && !status ? <span className="adc-go">{action}</span> : null}
        </span>
      </div>
    </Tag>
  );
}
