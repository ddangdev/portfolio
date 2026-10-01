/* 6. own projects: a sideways scroller on phones (focusable, so keyboards can scroll it), rows from lg. */
import Card from '../../components/Card';
import TileHeading from '../../components/TileHeading';
import { ownProjects } from '../../data/ownProjects';
import ProjectCard from './ProjectCard';

export default function OwnProjectsTile() {
  return (
    <Card className="b-own" labelledBy="own-h" reveal="scroll">
      <TileHeading kicker="own projects" title="things i'm making for myself." id="own-h" />
      <p className="note own-note">shown as they really are.</p>
      <div className="own-scroll" role="region" aria-label="own projects" tabIndex={0}>
        <ul className="own-list">
          {ownProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </ul>
      </div>
    </Card>
  );
}
