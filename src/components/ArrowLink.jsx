/* .ulink text link with a trailing arrow. External links open in a new tab with rel="noopener" and say so to
   screen readers (the arrow is decorative). */
import { cx } from '../lib/cx';

export default function ArrowLink({ href, className, external = false, arrow = '↗', onClick, children }) {
  return (
    <a
      className={cx('ulink', className)}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener' : undefined}
      onClick={onClick}
    >
      {children} <span className="arr" aria-hidden="true">{arrow}</span>
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}
