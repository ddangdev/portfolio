/* The bento: the ONLY place tile order lives. DOM order = phone order (hero, work, services, form,
   studio, own projects, email); bento.css places the tiles on the 12-column grid from 900px.
   Load reveals run hero 0, nori 1, mani 2, services 3, studio 4; the rest reveal on scroll. */
import { ANCHORS } from '../../data/site';
import { work } from '../../data/work';
import HeroTile from '../hero/HeroTile';
import LeadFormTile from '../lead-form/LeadFormTile';
import MailTile from '../mail/MailTile';
import OwnProjectsTile from '../own-projects/OwnProjectsTile';
import ServicesTile from '../services/ServicesTile';
import StudioTile from '../studio/StudioTile';
import WorkTile from '../work/WorkTile';

export default function Bento() {
  return (
    <main className="bento wrap">
      <HeroTile revealIndex={0} />
      {work.map((project, i) => (
        <WorkTile
          key={project.id}
          project={project}
          id={i === 0 ? ANCHORS.work : undefined}
          revealIndex={1 + i}
        />
      ))}
      {/* testimonial: none yet, leave empty */}
      <ServicesTile revealIndex={3} />
      <LeadFormTile />
      <StudioTile revealIndex={4} />
      <OwnProjectsTile />
      <MailTile />
    </main>
  );
}
