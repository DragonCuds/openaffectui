import { Section, Surface } from '../ui';
import { Skeleton } from '../ui/States';
import { ShimmerBlock, ShimmerText } from '../ui/Shimmer';

/** Shimmer samples: a profile card, a list of rows, and a shimmering label. */
export default function DemoShimmer() {
  return (
    <>
      <Section title="کارت در حال بارگذاری">
        <Surface>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShimmerBlock circle width={44} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ShimmerBlock width="40%" height={14} />
              <ShimmerBlock width="70%" height={10} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBlockStart: 16 }}>
            <ShimmerBlock height={10} />
            <ShimmerBlock height={10} />
            <ShimmerBlock width="55%" height={10} />
          </div>
        </Surface>
      </Section>

      <Section title="فهرست در حال بارگذاری">
        <Skeleton rows={3} height={56} />
      </Section>

      <Section title="متن درخشان">
        <ShimmerText>در حال تحلیل سایت…</ShimmerText>
      </Section>
    </>
  );
}
