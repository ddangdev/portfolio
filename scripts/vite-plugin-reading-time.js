// Computes reading time per MDX post and injects it into the YAML frontmatter
// BEFORE the MDX plugin processes the file, so it lands in the standard
// frontmatter export. Runs with enforce: 'pre' before @mdx-js/rollup.

const WORDS_PER_MINUTE = 200;

export default function readingTimePlugin() {
  return {
    name: 'vite-plugin-reading-time',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.mdx')) return null;
      const fmMatch = code.match(/^(---\n[\s\S]*?\n)(---)/);
      if (!fmMatch) return null;

      const body = code.slice(fmMatch[0].length);
      const wordCount = body.split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));

      // Skip if already present (avoids double-inject on hot reload)
      if (/^\s*readingTime\s*:/m.test(fmMatch[1])) return null;

      const injected = `${fmMatch[1]}readingTime: ${readingTime}\n${fmMatch[2]}`;
      return injected + code.slice(fmMatch[0].length);
    },
  };
}
