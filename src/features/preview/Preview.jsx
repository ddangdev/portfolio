/* ddanghnl-site: the preview. A screen above and to the left of the wheel's selector, after the
   owner's sketch (2026-10-30), showing the page the wheel has selected; it changes as the wheel
   turns. It plays the page's video muted and looping, or shows its image, with nothing over it (the
   name is on the wheel already - owner's call). A page with words of its own (`body`) shows them: the
   lead as a headline top left, the paragraphs under it, scrolling inside the screen if they run long
   (owner's call), the screen only as tall as they are; it is white with black words if the page is `light`. Any other page shows its name. Placed by the wheel (see Wheel.jsx), which
   knows where the selector stands; what each page shows is in wheel/categories.js. Clicking it opens
   the page (see page/PageDialog.jsx). */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
// how long a new screen takes to fade in over the old one (owner's call: just change, a very quick fade)
const SWAP_MS = 140;

// one page's screen: its film, its image, its words, or its name - on its own ground, so a screen fading
// in over another never lets the one beneath show through
function Screen({ page, measure }) {
  const { name, preview, body, article, light } = page;
  return (
    <div className={`preview-screen${light ? ' is-light' : ''}`}>
      {preview?.video && (
        <video className="preview-media" src={asset(preview.video)} poster={asset(preview.poster)}
               autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
      )}
      {preview?.image && <img className="preview-media" src={asset(preview.image)} alt="" />}
      {!preview && article && (
        // a note: its title and standfirst
        <span className="preview-copy" ref={measure}>
          <span className="preview-copy-in">
            <span className="preview-lead is-note">{name}</span>
            <span className="preview-p">{article.dek}</span>
          </span>
        </span>
      )}
      {!preview && body && (
        <span className="preview-copy" ref={measure}>
          <span className="preview-copy-in">
          {/* a paragraph with links is a way on, for the pop-up; the small screen leaves it out */}
          {body.filter((b) => !b.service && !b.email && !b.links && !b.faq && !Array.isArray(b.p)).map((b, i) => (b.lead
            ? <span key={i} className="preview-lead">{b.lead}</span>
            : <span key={i} className="preview-p">{b.p}</span>))}
          {/* the services themselves are the pop-up's: the small screen gives only the page's words (owner's call, 2026-11-01) */}
          </span>
        </span>
      )}
      {!preview && !body && !article && <p className="preview-name">{name}</p>}
    </div>
  );
}

export default function Preview({ page, box, onOpen }) {
  const { name, light } = page;
  // the screens on show: the new page's on top, fading in over the last one, which stays put beneath it
  // until it is covered - so a change never flashes the empty ground between them
  const [screens, setScreens] = useState([page]);
  const timer = useRef(0);
  useEffect(() => {
    setScreens((s) => (s[s.length - 1].name === name ? s : [s[s.length - 1], page]));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setScreens([page]), SWAP_MS + 40);
    return () => clearTimeout(timer.current);
  }, [name]);   // keyed on the page's name, not its object
  // a page of words is only as tall as its words (owner's call, 2026-11-01: no empty white under them),
  // up to the film's height, past which they scroll; its bottom edge stays put
  const copy = useRef(null);
  const [fit, setFit] = useState(null);
  useLayoutEffect(() => {
    const el = copy.current;
    if (!el) { setFit(null); return undefined; }
    const measure = () => {
      const cs = getComputedStyle(el);
      setFit(Math.ceil(el.firstChild.offsetHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)));
    };
    measure();
    // and again whenever the words change size: the typeface arriving late, a resize
    const watch = new ResizeObserver(measure);
    watch.observe(el.firstChild);
    return () => watch.disconnect();
  }, [screens, box.width]);   // the screen on top, once it is in - not the page, which arrives a render early
  const height = fit ? Math.min(fit, box.height) : box.height;
  return (
    <button type="button" className={`preview${light ? ' is-light' : ''}`} onClick={onOpen} aria-label={`Open ${name}`}
            style={{ left: box.left, top: box.bottom - height, width: box.width, height, '--swap': `${SWAP_MS}ms` }}>
      {screens.map((p, i) => <Screen key={p.name} page={p} measure={i === screens.length - 1 ? copy : undefined} />)}
    </button>
  );
}
