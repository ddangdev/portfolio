/* One form field: label (with its required/optional tag), the ruled input or textarea, an optional hint and
   an optional error line, all wired with aria-describedby and aria-invalid. */
import { cx } from '../../lib/cx';

export default function Field({
  id, name, label, tag, tagKind = 'req', hint, hintId, errorId, error = '',
  multiline = false, value, onChange, onBlur, inputRef, inputProps,
}) {
  const describedBy = [hint ? hintId : null, errorId].filter(Boolean).join(' ') || undefined;
  const control = {
    id,
    name,
    value,
    onChange,
    onBlur,
    ref: inputRef,
    'aria-describedby': describedBy,
    'aria-invalid': errorId ? (error ? 'true' : undefined) : undefined,
    ...inputProps,
  };

  return (
    <div className={cx('field', error && 'is-bad')}>
      <label htmlFor={id}>{label} <span className={tagKind === 'opt' ? 'tag-opt' : 'tag-req'}>{tag}</span></label>
      <span className="line">{multiline ? <textarea {...control} /> : <input type="text" {...control} />}</span>
      {hint ? <p className="hint" id={hintId}>{hint}</p> : null}
      {errorId ? <p className="err" id={errorId}>{error}</p> : null}
    </div>
  );
}
