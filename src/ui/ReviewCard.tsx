import { Star } from 'lucide-react';
import { Avatar } from './Avatar';
import { faNum } from './digits';

/** One review: who wrote it, what job, stars, short text. Styles in src/styles/people.css. */
export function ReviewCard({ name, hue = 210, job, stars, text, ago }: {
  name: string;
  hue?: number;
  /** What the job was, e.g. «عروسی». */
  job?: string;
  /** 1..5 */
  stars: number;
  text: string;
  ago?: string;
}) {
  return (
    <figure className="rev">
      <figcaption className="rev-top">
        <Avatar name={name} hue={hue} size={36} />
        <span className="rev-who">
          <strong>{name}</strong>
          <span>{[job, ago].filter(Boolean).join(' · ')}</span>
        </span>
        <span className="rev-stars" role="img" aria-label={`${faNum(stars)} از ۵`}>
          {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} data-on={i <= stars || undefined} aria-hidden="true" />)}
        </span>
      </figcaption>
      <blockquote className="rev-text">{text}</blockquote>
    </figure>
  );
}
