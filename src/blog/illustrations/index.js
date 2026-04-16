// Illustration registry per post type. Phase 4b ships 1 per type (3 total).
// Sprint 24+ will expand to 3-4 per type — at that point this becomes an array
// per type and the picker selects via deterministic slug hash.

import CaseStudyArt from './CaseStudyArt';
import ProcessArt from './ProcessArt';
import FieldNotesArt from './FieldNotesArt';

const FAMILIES = {
  'case-study': [CaseStudyArt],
  'process':    [ProcessArt],
  'field-notes':[FieldNotesArt],
};

// Simple deterministic string hash (djb2). Stable across runs so the same slug
// always picks the same illustration once a family has 2+ options.
function hashSlug(slug) {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) h = ((h << 5) + h + slug.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pickIllustration(type, slug) {
  const family = FAMILIES[type];
  if (!family || family.length === 0) return null;
  return family[hashSlug(slug || '') % family.length];
}

export { CaseStudyArt, ProcessArt, FieldNotesArt };
