/* 7. email, the secondary way in. */
import { trackEmail } from '../../analytics/events';
import ArrowLink from '../../components/ArrowLink';
import Card from '../../components/Card';
import { MAILTO, STUDIO } from '../../data/site';

/* on a narrow tile the address breaks after the @, never mid-word */
const [emailUser, emailDomain] = STUDIO.email.split('@');

export default function MailTile() {
  return (
    <Card className="b-mail" labelledBy="mail-h" reveal="scroll">
      <p className="label card-k" id="mail-h">rather email?</p>
      <div className="mail-body">
        <ArrowLink className="mail-link" href={MAILTO} onClick={() => trackEmail('mail_tile')}>
          {emailUser}@<wbr />{emailDomain}
        </ArrowLink>
        <p className="note">prefer your own inbox? that works too.</p>
      </div>
    </Card>
  );
}
