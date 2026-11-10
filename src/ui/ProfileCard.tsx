import type { CSSProperties, ElementType, ReactNode } from 'react';
import { BadgeCheck, Camera, Star } from 'lucide-react';
import { StatusDot } from './StatusDot';
import { Avatar } from './Avatar';
import { Chip } from './Chip';
import { faNum } from './digits';

/**
 * A person offering work: avatar, name and role, rating, a row of sample-work tiles, tags and a link.
 * Tiles are gradients (`hue`) until real images (`src`) exist. Styles in src/styles/cards.css.
 */
export function ProfileCard({
  name, role, hue = 210, rating, jobs, verified, available, availableLabel = 'الان آزاده', gallery = [], tags = [], href = '#', as: Tag = 'a', action,
}: {
  name: string;
  role: string;
  hue?: number;
  rating?: number;
  jobs?: number;
  verified?: boolean;
  available?: boolean;
  availableLabel?: string;
  gallery?: { hue: number; src?: string }[];
  tags?: string[];
  href?: string;
  as?: ElementType;
  action?: ReactNode;
}) {
  return (
    <Tag href={href} className="pfc">
      <div className="pfc-top">
        <div className="pfc-gal" aria-hidden="true">
          {gallery.slice(0, 3).map((g, i) => (
            <span key={i} className="pfc-tile" style={{ '--h': g.hue } as CSSProperties}>
              {g.src ? <img src={g.src} alt="" loading="lazy" /> : <Camera size={18} />}
            </span>
          ))}
        </div>
        {available ? <Chip tone="ok" className="pfc-avail" icon={<StatusDot tone="ok" />}>{availableLabel}</Chip> : null}
      </div>
      <div className="pfc-head">
        <Avatar name={name} hue={hue} size={46} />
        <div className="pfc-who">
          <h3 className="pfc-name">{name}{verified ? <BadgeCheck size={17} className="pfc-ok" aria-label="تأیید شده" /> : null}</h3>
          <span className="pfc-role">{role}</span>
        </div>
      </div>
      <div className="pfc-stats">
        {rating != null ? <span><Star size={15} fill="currentColor" aria-hidden="true" />{faNum(rating)}</span> : null}
        {jobs != null ? <span>{faNum(jobs)} کار انجام‌شده</span> : null}
      </div>
      {tags.length ? <div className="pfc-tags">{tags.map((t) => <Chip key={t}>{t}</Chip>)}</div> : null}
      {action ? <span className="pfc-go">{action}</span> : null}
    </Tag>
  );
}
