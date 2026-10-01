/* 3. services: the three things the studio does, numbered by CSS. */
import Card from '../../components/Card';
import TileHeading from '../../components/TileHeading';
import { services } from '../../data/services';

export default function ServicesTile({ revealIndex }) {
  return (
    <Card className="b-svc" labelledBy="svc-h" reveal="load" revealIndex={revealIndex}>
      <TileHeading kicker="what i do" title="everything you need, nothing you don't." id="svc-h" />
      <ol className="svc svc-rows">
        {services.map((service) => (
          <li key={service.key}>
            <span className="svc-n">{service.name}</span>
            <span className="svc-d">{service.description}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
