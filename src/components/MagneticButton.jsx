/* .btn that leans toward a mouse pointer (useMagnetic). Renders a link when given `href`, else a button.
   The data-magnetic attribute stays on the element: neighbouring buttons measure each other by it. */
import { useRef } from 'react';
import { cx } from '../lib/cx';
import { useMagnetic } from '../motion/useMagnetic';

export default function MagneticButton({ href, type = 'button', className, onClick, ariaDisabled, children }) {
  const ref = useRef(null);
  const { isMag } = useMagnetic(ref);
  const shared = {
    ref,
    className: cx('btn', className, isMag && 'is-mag'),
    'data-magnetic': '',
    onClick,
  };
  const inner = <span className="mag-in">{children}</span>;

  if (href) return <a href={href} {...shared}>{inner}</a>;
  return <button type={type} aria-disabled={ariaDisabled ? 'true' : undefined} {...shared}>{inner}</button>;
}
