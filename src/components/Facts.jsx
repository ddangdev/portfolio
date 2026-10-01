/* dl.facts from [{ term, detail }]: a mono term beside its value, on hairlines. */
export default function Facts({ rows }) {
  return (
    <dl className="facts">
      {rows.map(({ term, detail }) => (
        <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>
      ))}
    </dl>
  );
}
