// Per-post SEO updates: title, description, og tags, canonical, JSON-LD.
// CSR-only — works for users + Google's headless crawler. True OG previews
// for non-JS crawlers would need prerendering (future sprint).
import { useEffect } from 'react';

const SITE_URL = 'https://ddanghnl.com';
const SITE_NAME = 'dean dang';

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [_, prop] = selector.match(/\[(?:name|property)="([^"]+)"\]/) || [];
    if (selector.startsWith('meta[name=')) el.setAttribute('name', prop);
    else if (selector.startsWith('meta[property=')) el.setAttribute('property', prop);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id, data) {
  let el = document.head.querySelector(`script[data-jsonld="${id}"]`);
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-jsonld', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function stripEmphasis(s) {
  return (s || '').replace(/\*([^*]+)\*/g, '$1');
}

export function useDocumentMeta({ title, description, url, type = 'article', date }) {
  useEffect(() => {
    const cleanTitle = stripEmphasis(title);
    const fullTitle = `${cleanTitle} — ${SITE_NAME}`;

    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setLink('canonical', url);

    if (type === 'article') {
      setJsonLd('blog-article', {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: cleanTitle,
        datePublished: date,
        author: { '@type': 'Person', name: SITE_NAME },
        url,
        mainEntityOfPage: url,
      });
    }
  }, [title, description, url, type, date]);
}

export { SITE_URL };
