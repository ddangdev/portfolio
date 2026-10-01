/* "live since ..." chip with the live dot and a rolling date. */
import Ticker from './Ticker';

export default function StatusChip({ since }) {
  return (
    <p className="status status-chip status-live">
      <span className="dot" aria-hidden="true"></span>live since <Ticker text={since} />
    </p>
  );
}
