/* cx('a', cond && 'b', null) -> 'a b': joins truthy class names. */
export function cx(...names) {
  return names.filter(Boolean).join(' ');
}
