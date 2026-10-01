/* Digits that roll up odometer-style the first time they are seen. Screen readers get the plain text once;
   the rolling copy is hidden from them. Reduced motion: plain text. */
import { useRef } from 'react';
import { cx } from '../lib/cx';
import { useTicker } from '../motion/useTicker';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const STAGGER_MS = 40;

export default function Ticker({ text }) {
  const ref = useRef(null);
  const phase = useTicker(ref);

  if (phase === 'static') return <span ref={ref}>{text}</span>;

  const rolling = phase === 'rolling';
  let strip = 0;
  const cells = text.split('').map((ch, i) => {
    if (!/\d/.test(ch)) return ch;
    const digit = Number(ch);
    const order = strip++;
    const style = {
      transform: `translateY(${phase === 'reset' ? 0 : -digit * 10}%)`,
      transitionDelay: rolling ? `${order * STAGGER_MS}ms` : undefined,
    };
    return (
      <span className="tick-d" key={i}>
        <span className="tick-ghost">{ch}</span>
        <span className={cx('tick-strip', rolling && 'is-rolling')} style={style}>
          {DIGITS.map((d) => <span key={d}>{d}</span>)}
        </span>
      </span>
    );
  });

  return (
    <span ref={ref} className="tick">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{cells}</span>
    </span>
  );
}
