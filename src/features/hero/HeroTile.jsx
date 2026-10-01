/* 1. hero statement: the headline, the lede, and the way in (the form). */
import { trackStartProject } from '../../analytics/events';
import Card from '../../components/Card';
import MagneticButton from '../../components/MagneticButton';
import WordReveal from '../../components/WordReveal';
import { ANCHORS } from '../../data/site';

/* U+00A0 keeps "enjoy using." together in one mask */
const HEADLINE = 'websites people enjoy using.';

export default function HeroTile({ revealIndex }) {
  return (
    <Card className="b-hero" labelledBy="hero-h" reveal="load" revealIndex={revealIndex}>
      <p className="eyebrow">web design &amp; development <span className="sep" aria-hidden="true">/</span> Honolulu</p>
      <WordReveal as="h1" id="hero-h" className="headline" text={HEADLINE} />
      <div className="hero-foot">
        <p className="lede">a web studio for small businesses. custom sites, designed and built from scratch, then made easy to find.</p>
        <div className="btn-row">
          <MagneticButton href={`#${ANCHORS.start}`} className="btn-ink" onClick={() => trackStartProject('hero')}>
            start a project <span className="arr arr-down" aria-hidden="true">↓</span>
          </MagneticButton>
        </div>
      </div>
    </Card>
  );
}
