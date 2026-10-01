/* A tile's opening pair: the mono corner label, then the tile title. */
export default function TileHeading({ kicker, title, id }) {
  return (
    <>
      <p className="label card-k">{kicker}</p>
      <h2 className="card-t" id={id}>{title}</h2>
    </>
  );
}
