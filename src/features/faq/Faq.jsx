/* ddanghnl-site: the questions that come up most (notes), each folded to its question with the answer
   under it, opened with a tap (owner's call, 2026-11-02: collapsible). Any number may be open at once;
   the answer unfolds (a grid row growing from nothing, see faq.css) and a small plus turns to a cross.
   An answer given as a list has links to other pages in it (`{ go, text }`), opened with `onGo`.
   Each opening is sent to analytics as faq_open. Rendered by page/PageDialog.jsx for a page with a
   `faq` in its body. */

import { useId, useState } from 'react';
import { track } from '../analytics/analytics.js';

export default function Faq({ items, words, onGo, title }) {
  const id = useId();
  const [open, setOpen] = useState(() => new Set());
  const toggle = (i) => setOpen((o) => {
    const next = new Set(o);
    if (next.has(i)) next.delete(i); else { next.add(i); track('faq_open', { question: items[i].q }); }
    return next;
  });
  return (
    <div className="faq">
      {title && <p className="faq-head">{title}</p>}
      {items.map(({ q, a }, i) => {
        const on = open.has(i), aid = `${id}-${i}`;
        return (
          <div key={q} className={`faq-item${on ? ' is-open' : ''}`}>
            <h3 className="faq-q">
              <button type="button" id={`${aid}-q`} className="faq-btn" aria-expanded={on} aria-controls={aid} onClick={() => toggle(i)}>
                <span className="faq-q-text">{q}</span>
                <span className="faq-mark" aria-hidden="true" />
              </button>
            </h3>
            <div id={aid} className="faq-a" role="region" aria-labelledby={`${aid}-q`}>
              <div className="faq-a-in"><p className="faq-a-p">{words(a, onGo)}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
