/* ddanghnl-site: a note, read in the pop-up (owner's call, 2026-11-02: notes under the notes page the
   way projects sit under work, three samples with filler words to settle the look first). The page's
   title is the pop-up's heading already; under it the date and how long it reads, the standfirst
   (`dek`) a size up, then the paragraphs at a reading measure. A paragraph given as a list has links
   to other pages in it (`{ go, text }`), opened with `onGo`. Rendered by page/PageDialog.jsx for a page
   with an `article`. */

const WORDS_A_MINUTE = 220;

// "14 oct 2026", from an ISO date, in the site's lowercase
export const dayOf = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase();

export default function Note({ article, words, onGo }) {
  const { date, dek, paras } = article;
  const count = paras.reduce((n, p) => n + (Array.isArray(p) ? p.map((x) => (typeof x === 'string' ? x : x.text)).join('') : p).split(/\s+/).length, 0);
  const mins = Math.max(1, Math.round(count / WORDS_A_MINUTE));
  return (
    <article className="note">
      <p className="note-meta"><time dateTime={date}>{dayOf(date)}</time><span className="note-meta-dot" aria-hidden="true" /><span>{mins} min read</span></p>
      <p className="note-dek">{dek}</p>
      <div className="note-body">
        {paras.map((p, i) => <p key={i} className="note-p">{words(p, onGo)}</p>)}
      </div>
    </article>
  );
}

// the notes listed on a page: date, title and standfirst, each a row opening the note, under a
// small heading if given one (`title`), and with a last row on to another page (`more`, its name)
export function NoteList({ items, title, more, onGo }) {
  return (
    <ol className="notes" aria-label={title}>
      {title && <li className="notes-head" aria-hidden="true">{title}</li>}
      {items.map((n) => (
        <li key={n.name} className="notes-item">
          <a className="notes-link" href={`#${n.name}`} onClick={(e) => { e.preventDefault(); onGo(n.name); }}>
            <span className="notes-date"><time dateTime={n.date}>{dayOf(n.date)}</time></span>
            <span className="notes-text">
              <span className="notes-title">{n.name}</span>
              <span className="notes-dek">{n.dek}</span>
            </span>
            <span className="notes-arrow" aria-hidden="true">→</span>
          </a>
        </li>
      ))}
      {more && (
        <li className="notes-item notes-more">
          <a className="notes-link" href={`#${more}`} onClick={(e) => { e.preventDefault(); onGo(more); }}>
            <span className="notes-date" />
            <span className="notes-text"><span className="notes-title">{more}</span></span>
            <span className="notes-arrow" aria-hidden="true">→</span>
          </a>
        </li>
      )}
    </ol>
  );
}
