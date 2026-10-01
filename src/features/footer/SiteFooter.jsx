/* Footer: legal line, sign-off, back to top. */
import { ANCHORS, STUDIO } from '../../data/site';

export default function SiteFooter() {
  return (
    <footer className="foot wrap">
      <p>{STUDIO.legalName} · {STUDIO.city}</p>
      <p className="foot-line">made in {STUDIO.city}.</p>
      <a className="ulink" href={`#${ANCHORS.top}`}>back to top <span aria-hidden="true">↑</span></a>
    </footer>
  );
}
