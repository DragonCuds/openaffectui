import DemoYaraAvatar from './DemoYaraAvatar';
import DemoYaraHero from './DemoYaraHero';
import DemoYaraMetric from './DemoYaraMetric';
import DemoYaraPerson from './DemoYaraPerson';
import DemoYaraAlert from './DemoYaraAlert';
import DemoYaraRows from './DemoYaraRows';
import DemoYaraNav from './DemoYaraNav';
import DemoYaraArt from './DemoYaraArt';
import './yara-demo.css';

/** The v2 health pieces (avatar, live dot, hero, tiles, person and alert cards, rows, nav). */
export default function DemoYara() {
  return (
    <>
      <DemoYaraAvatar />
      <DemoYaraHero />
      <DemoYaraMetric />
      <DemoYaraPerson />
      <DemoYaraAlert />
      <DemoYaraRows />
      <DemoYaraNav />
      <DemoYaraArt />
    </>
  );
}
