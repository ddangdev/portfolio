/* A heading rendered as masked words that slide up with the page (CSS keys off html.is-ready).
   Assistive tech reads the aria-label; the word spans are hidden from it. */
import { Fragment } from 'react';
import { useWordReveal } from '../motion/useWordReveal';

export default function WordReveal({ as = 'h1', id, className, text }) {
  const Tag = as;
  const { label, words } = useWordReveal(text);
  return (
    <Tag id={id} className={className} data-words="" aria-label={label}>
      {words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
          <span className="w" aria-hidden="true" style={{ '--i': i }}><span>{word}</span></span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
