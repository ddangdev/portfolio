/* 5. the studio: who you deal with and how fast they answer. No clock, no availability claim. */
import Card from '../../components/Card';
import Facts from '../../components/Facts';
import TileHeading from '../../components/TileHeading';
import { studioFacts } from '../../data/studio';

export default function StudioTile({ revealIndex }) {
  return (
    <Card className="b-studio" labelledBy="studio-h" reveal="load" revealIndex={revealIndex}>
      <TileHeading kicker="the studio" title="direct, from first chat to launch." id="studio-h" />
      <p className="note studio-n">plain-english updates at every step, and real replies, not tickets.</p>
      <Facts rows={studioFacts} />
    </Card>
  );
}
