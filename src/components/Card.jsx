/* The .card tile shell every bento tile is built on.
   reveal="load": fades up with the page, in the order Bento gives (revealIndex -> --i).
   reveal="scroll": fades up when scrolled into view (useScrollReveal owns `is-in` and --i). */
import { useRef } from 'react';
import { cx } from '../lib/cx';
import { useScrollReveal } from '../motion/useScrollReveal';

export default function Card({ as = 'section', className, labelledBy, id, reveal, revealIndex = 0, children }) {
  const Tag = as;
  const ref = useRef(null);
  const onScroll = reveal === 'scroll';
  const { isIn, index } = useScrollReveal(ref, onScroll);

  let revealAttr;
  let style;
  if (reveal === 'load') {
    revealAttr = 'load';
    style = { '--i': revealIndex };
  } else if (onScroll) {
    revealAttr = '';
    style = { '--i': index };
  }

  return (
    <Tag
      ref={ref}
      id={id}
      className={cx('card', className, onScroll && isIn && 'is-in')}
      aria-labelledby={labelledBy}
      data-reveal={revealAttr}
      style={style}
    >
      {children}
    </Tag>
  );
}
