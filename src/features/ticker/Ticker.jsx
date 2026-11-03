/* ddanghnl-site: the world clock. A thin white strip along the top of the page (owner's call,
   2026-10-30) with the time now in a ring of cities, Honolulu first, sliding past without stopping.
   It fades in with the wheel. The times tick over each minute; the cities are in ZONES below. */

import { useEffect, useState } from 'react';

const ZONES = [
  ['honolulu', 'Pacific/Honolulu'],
  ['los angeles', 'America/Los_Angeles'],
  ['new york', 'America/New_York'],
  ['london', 'Europe/London'],
  ['paris', 'Europe/Paris'],
  ['seoul', 'Asia/Seoul'],
  ['tokyo', 'Asia/Tokyo'],
  ['sydney', 'Australia/Sydney'],
];

const clock = (zone, now) =>
  new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' })
    .format(now).toLowerCase().replace(' ', ' ');   // "4:12 pm", a thin space before am/pm

export default function Ticker({ shown }) {
  const [now, setNow] = useState(() => new Date());

  // tick over on the minute
  useEffect(() => {
    let t = 0;
    const next = () => {
      setNow(new Date());
      t = setTimeout(next, 60000 - (Date.now() % 60000) + 50);
    };
    t = setTimeout(next, 60000 - (Date.now() % 60000) + 50);
    return () => clearTimeout(t);
  }, []);

  // the ring three times over in each copy, so one copy is always wider than the widest screen
  const items = [0, 1, 2].flatMap((k) => ZONES.map(([city, zone]) => (
    <li key={`${k}-${city}`} className="ticker-item"><span className="ticker-city">{city}</span> {clock(zone, now)}</li>
  )));

  return (
    <div className={`ticker${shown ? ' is-shown' : ''}`} aria-label="The time around the world">
      {/* the list twice over, so the strip loops without a seam; the copy is hidden from screen readers */}
      <div className="ticker-track">
        <ul className="ticker-list">{items}</ul>
        <ul className="ticker-list" aria-hidden="true">{items}</ul>
      </div>
    </div>
  );
}
