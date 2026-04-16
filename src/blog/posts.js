// Loads all MDX posts under src/posts/ at build time.
// Each post exports its frontmatter as a named export and its body as default.

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
