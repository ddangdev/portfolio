/* ddanghnl-site: the nav. A slim row of words, top left under the world clock and as tall as it
   (owner's call, 2026-11-01; its box and border since taken away), naming the main pages so the visitor can jump between them. Always there,
   over an open pop-up too: with one open, the pop-up changes over to the page picked; otherwise the
   wheel turns to it. The page on show is marked - work, for one of its projects. Placed by the wheel
   (see Wheel.jsx), which does the going. */

import { track } from '../analytics/analytics.js';

export default function Nav({ items, current, onGo, shown }) {
  return (
    <nav className={`nav${shown ? ' is-shown' : ''}`} aria-label="Pages">
      <ul className="nav-list">
        {items.map((name) => (
          <li key={name}>
            <a className="nav-item" href={`#${name}`} aria-current={name === current ? 'page' : undefined}
               tabIndex={shown ? 0 : -1}
               onClick={(e) => {
                 e.preventDefault();
                 // clicked, not pressed with Enter: let go of focus, or the next key (the arrows) lit its ring
                 if (e.detail > 0) e.currentTarget.blur();
                 track('nav_click', { page: name });
                 onGo(name);
               }}>{name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
