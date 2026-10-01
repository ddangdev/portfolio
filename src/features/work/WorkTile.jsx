/* 2. one live client site: name and category, the live-since chip, the linked stage, a line and the url.
   Rendered once per record in data/work.js. */
import { cx } from '../../lib/cx';
import { trackWorkVisit } from '../../analytics/events';
import ArrowLink from '../../components/ArrowLink';
import Card from '../../components/Card';
import DeviceStage from '../../components/DeviceStage';
import StatusChip from '../../components/StatusChip';

export default function WorkTile({ project, id, revealIndex }) {
  const visit = () => trackWorkVisit(project.url);
  return (
    <Card
      as="article"
      className={cx('card-work', project.tileClass)}
      id={id}
      labelledBy={project.headingId}
      reveal="load"
      revealIndex={revealIndex}
    >
      <div className="work-head">
        <div>
          <p className="label card-k">live work · {project.number}</p>
          <h2 className="card-t" id={project.headingId}>{project.name}</h2>
          <p className="cat">{project.category}</p>
        </div>
        <StatusChip since={project.liveSince} />
      </div>
      <DeviceStage
        url={project.url}
        domain={project.domain}
        desktop={project.desktop}
        phone={project.phone}
        eager={project.eager}
        onVisit={visit}
      />
      <div className="work-foot">
        <p className="work-d">{project.description}</p>
        <ArrowLink className="url" href={project.url} external onClick={visit}>{project.domain}</ArrowLink>
      </div>
    </Card>
  );
}
