import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import rssPlugin from './scripts/vite-plugin-rss';
import readingTimePlugin from './scripts/vite-plugin-reading-time';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    readingTimePlugin(),
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    rssPlugin(),
  ],
});
