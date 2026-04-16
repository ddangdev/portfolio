// Loads all MDX posts under src/posts/ at build time.
// Each post exports its frontmatter as a named export and its body as default.
// readingTime is injected by scripts/vite-plugin-reading-time into the
// frontmatter YAML before the MDX plugin runs, so it appears as fm.readingTime.

const modules = import.meta.glob('../posts/*.mdx', { eager: true });

function slugFromPath(p) {
  return p.match(/\/([^/]+)\.mdx$/)[1];
}

export const posts = Object.entries(modules)
  .map(([path, mod]) => {
    const slug = slugFromPath(path);
    const fm = mod.frontmatter || {};
    return {
      slug,
      href: `/blog/${slug}`,
      Component: mod.default,
      ...fm,
    };
  })
  .filter((p) => !p.draft)
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug);
}

// prev = older (further down the sorted array)
// next = newer (further up the sorted array)
export function getAdjacent(slug) {
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: posts[i + 1] || null,
    next: posts[i - 1] || null,
  };
}
