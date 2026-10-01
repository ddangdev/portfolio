/* A phone screenshot in a thin bezel. */
const SIZES = '(min-width: 900px) 84px, (min-width: 700px) 14vw, 30vw';

export default function PhoneFrame({ image, eager }) {
  return (
    <figure className="frame-phone">
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
