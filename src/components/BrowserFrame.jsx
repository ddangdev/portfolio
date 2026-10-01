/* A desktop screenshot in a browser frame with a url bar. */
const SIZES = '(min-width: 1100px) 380px, (min-width: 900px) 30vw, (min-width: 700px) 42vw, 80vw';

export default function BrowserFrame({ domain, image, eager }) {
  return (
    <figure className="frame-browser">
      <div className="frame-bar" aria-hidden="true"><i></i><i></i><i></i><span>{domain}</span></div>
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes={SIZES}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading={eager ? undefined : 'lazy'}
        decoding="async"
      />
    </figure>
  );
}
