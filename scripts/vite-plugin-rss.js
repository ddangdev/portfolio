// Generates dist/rss.xml at build time from src/posts/*.mdx frontmatter.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const DEFAULTS = {
  siteUrl: 'https://ddanghnl.com',
  title: 'dean dang — writing',
  description: "essays, case studies, and quiet observations from building things people enjoy using.",
  language: 'en-us',
  postsDir: 'src/posts',
  outFile: 'rss.xml',
};

function escape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripEmphasis(s) {
  return (s || '').replace(/\*([^*]+)\*/g, '$1');
}

export default function rssPlugin(opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };
  return {
    name: 'vite-plugin-rss',
    apply: 'build',
    closeBundle() {
      const postsDir = path.resolve(cfg.postsDir);
      if (!fs.existsSync(postsDir)) return;

      const items = fs
        .readdirSync(postsDir)
        .filter((f) => f.endsWith('.mdx'))
        .map((f) => {
          const src = fs.readFileSync(path.join(postsDir, f), 'utf-8');
          const { data } = matter(src);
          const slug = f.replace('.mdx', '');
          return { ...data, slug };
        })
        .filter((p) => !p.draft && p.title && p.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const xmlItems = items
        .map(
          (p) => `    <item>
      <title>${escape(stripEmphasis(p.title))}</title>
      <link>${cfg.siteUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${cfg.siteUrl}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escape(p.excerpt || '')}</description>
    </item>`
        )
        .join('\n');

      const lastBuild = items[0]?.date ? new Date(items[0].date).toUTCString() : new Date().toUTCString();
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(cfg.title)}</title>
    <link>${cfg.siteUrl}/blog</link>
    <description>${escape(cfg.description)}</description>
    <language>${cfg.language}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${cfg.siteUrl}/${cfg.outFile}" rel="self" type="application/rss+xml" />
${xmlItems}
  </channel>
</rss>`;

      const outPath = path.resolve('dist', cfg.outFile);
      fs.writeFileSync(outPath, xml, 'utf-8');
      console.log(`[vite-plugin-rss] wrote ${cfg.outFile} with ${items.length} item${items.length === 1 ? '' : 's'}`);
    },
  };
}
