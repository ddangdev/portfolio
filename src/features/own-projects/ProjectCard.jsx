/* One own project: thumb with its tag, then name, line and status (a ring when not live, a dot when live). */
import { cx } from '../../lib/cx';

const SIZES = '(min-width: 900px) 210px, (min-width: 700px) 45vw, 85vw';

export default function ProjectCard({ project }) {
  const { image } = project;
  return (
    <li className="proj">
      <div className={cx('thumb', project.thumbVariant === 'white' && 'thumb-white')}>
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes={SIZES}
          width={image.width}
          height={image.height}
          alt={image.alt}
          loading="lazy"
          decoding="async"
        />
        {project.tag ? <span className="tag">{project.tag}</span> : null}
      </div>
      <div className="proj-meta">
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <p className={cx('status', project.live && 'status-live')}>
          <span className={project.live ? 'dot' : 'ring'} aria-hidden="true"></span>{project.status}
        </p>
      </div>
    </li>
  );
}
