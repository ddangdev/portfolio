// Illustration registry per post type.
// Sprint 25: food blog pivot — recipe / behind-the-counter / bites
// Sprint 24+ can expand to 3-4 per type. Hash picker selects deterministically.

import RecipeArt from './RecipeArt';
import BehindTheCounterArt from './BehindTheCounterArt';
import BitesArt from './BitesArt';

// Legacy — kept so old type slugs don't crash if any MDX still references them.
import CaseStudyArt from './CaseStudyArt';
import ProcessArt from './ProcessArt';
import FieldNotesArt from './FieldNotesArt';

const FAMILIES = {
  'recipe':              [RecipeArt],
  'behind-the-counter':  [BehindTheCounterArt],
  'bites':               [BitesArt],
  // legacy Sprint 23 types
  'case-study':          [CaseStudyArt],
  'process':             [ProcessArt],
  'field-notes':         [FieldNotesArt],
};

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

export { RecipeArt, BehindTheCounterArt, BitesArt, CaseStudyArt, ProcessArt, FieldNotesArt };
