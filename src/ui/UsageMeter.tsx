import { Meter } from './Meter';
import { StatusDot, type Tone } from './StatusDot';
import { faNum } from './digits';

/** How much of a limit is used, with a bar, percent and remaining; warns at 80%, danger at 95% (dot and text). */
export function UsageMeter({ label, used, limit, unit = 'اعتبار', period = 'این ماه' }: {
  label: string;
  used: number;
  limit: number;
  unit?: string;
  period?: string;
}) {
  const valid = limit > 0;
  const safeUsed = Math.max(0, used);
  const pct = valid ? Math.min(100, Math.round((safeUsed / limit) * 100)) : 0;
  const remaining = valid ? Math.max(0, limit - safeUsed) : 0;
  const level: 'ok' | 'warn' | 'bad' = pct >= 95 ? 'bad' : pct >= 80 ? 'warn' : 'ok';
  const tone: Tone = level === 'ok' ? 'quiet' : level;
  const note = level === 'bad' ? 'تقریباً تمام شده' : level === 'warn' ? 'نزدیک سقف' : '';

  return (
    <div className={`usage usage-${level}`}>
      <div className="usage-head">
        <span className="usage-label">{label}</span>
        <span className="usage-period">{period}</span>
      </div>

      {valid ? (
        <>
          <p className="usage-figures">
            <span className="usage-used">{faNum(safeUsed)}</span>
            <span className="usage-limit"> از {faNum(limit)} {unit}</span>
          </p>
          <Meter value={Math.min(safeUsed, limit)} max={limit} label={`مصرف ${label}`} />
          <div className="usage-foot">
            <span className="usage-percent">{faNum(pct)}٪ مصرف شده</span>
            <span className="usage-remaining">{faNum(remaining)} {unit} مانده</span>
          </div>
          {note ? (
            <p className="usage-note" role="status">
              <StatusDot tone={tone} />
              {note}
            </p>
          ) : null}
        </>
      ) : (
        <p className="usage-note usage-empty">سقفی تعیین نشده است</p>
      )}
    </div>
  );
}
