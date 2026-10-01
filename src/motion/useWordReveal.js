/* Word reveal: splits a heading into words on ORDINARY spaces only, so a non-breaking space keeps two
   words in one mask ("enjoy&nbsp;using."). `label` is the whole text for assistive tech. */
import { useMemo } from 'react';

export function useWordReveal(text) {
  return useMemo(() => {
    const label = String(text).replace(/[ \t\r\n]+/g, ' ').trim();
    return { label, words: label.split(' ') };
  }, [text]);
}
