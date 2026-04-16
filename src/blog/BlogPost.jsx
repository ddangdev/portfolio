import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';
import { getPostBySlug, getAdjacent } from './posts';
import { pickIllustration } from './illustrations';
import { useDocumentMeta, SITE_URL } from './useDocumentMeta';

// ── helpers ─────────────────────────────────────────────────
function renderTitle(title) {
  if (!title) return null;
  const parts = title.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) =>
    part.startsWith('*') && part.endsWith('*')
      ? <em key={i}>{part.slice(1, -1)}</em>
      : part
  );
}

function formatDateLong(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase();
}

// ── styled ───────────────────────────────────────────────────
const Page = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 56px 64px 96px;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    padding: 48px 40px 80px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 32px 24px 64px;
  }
`;

const Article = styled.article`
  max-width: 720px;
  margin: 0 auto;
`;

const Breadcrumb = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 32px;

  a {
    color: ${({ theme }) => theme.colors.textMuted};
    text-decoration: none;
    transition: color 0.15s;
  }
  a:hover { color: ${({ theme }) => theme.colors.primary}; }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-bottom: 24px;
    font-size: 11px;
  }
`;

const PostMeta = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 18px;
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
`;

const TypeTag = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  letter-spacing: 0.12em;
`;

const Dot = styled.span`
  color: ${({ theme }) => theme.colors.blogRule};
`;

const PostTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.blog};
  font-weight: 400;
  font-size: 64px;
  line-height: 1.04;
  letter-spacing: -0.025em;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 22px;

  em { font-style: italic; font-weight: 500; color: #B05A3F; }

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    font-size: 52px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 36px;
    line-height: 1.1;
  }
`;

const PostLede = styled.p`
  font-family: ${({ theme }) => theme.fonts.blog};
  font-weight: 400;
  font-size: 22px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 56px;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    font-size: 20px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 18px;
    margin-bottom: 36px;
  }
`;

const Illo = styled.div`
  margin: 0 auto 72px;
  display: flex;
  justify-content: center;
  color: ${({ theme }) => theme.colors.blogIlloStroke};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-bottom: 48px;
  }
`;

const Body = styled.div`
  font-family: ${({ theme }) => theme.fonts.blog};
  font-weight: 400;
  font-size: 19px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.text};

  p { margin: 0 0 28px; }

  /* drop cap on first paragraph */
  > p:first-of-type::first-letter {
    font-family: ${({ theme }) => theme.fonts.blog};
    font-weight: 700;
    font-size: 78px;
    line-height: 0.8;
    float: left;
    padding: 8px 12px 0 0;
    color: ${({ theme }) => theme.colors.primary};
  }

  h2 {
    font-family: ${({ theme }) => theme.fonts.blog};
    font-weight: 500;
    font-size: 30px;
    line-height: 1.2;
    letter-spacing: -0.015em;
    margin: 56px 0 18px;
    color: ${({ theme }) => theme.colors.text};
  }

  a {
    color: ${({ theme }) => theme.colors.text};
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.colors.primary};
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
    transition: text-decoration-color 0.15s;
  }
  a:hover { text-decoration-color: ${({ theme }) => theme.colors.text}; }

  em { font-style: italic; }
  strong { font-weight: 500; color: ${({ theme }) => theme.colors.text}; }

  /* MDX renders > as blockquote — style as pull-quote */
  blockquote {
    font-family: ${({ theme }) => theme.fonts.blog};
    font-weight: 400;
    font-style: italic;
    font-size: 28px;
    line-height: 1.35;
    color: ${({ theme }) => theme.colors.text};
    margin: 56px 0;
    padding: 0 32px;
    border-left: 3px solid ${({ theme }) => theme.colors.primary};
    letter-spacing: -0.012em;
  }
  blockquote p { margin: 0; }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 17px;
    line-height: 1.65;
    p { margin-bottom: 22px; }
    > p:first-of-type::first-letter { font-size: 60px; padding: 6px 10px 0 0; }
    h2 { font-size: 24px; margin: 40px 0 14px; }
    blockquote { font-size: 22px; padding: 0 20px; margin: 40px 0; }
  }
`;

const EndMark = styled.div`
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.blog};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 22px;
  margin: 56px 0 80px;
  letter-spacing: 0.5em;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin: 40px 0 56px;
  }
`;

const PostNav = styled.nav`
  max-width: 920px;
  margin: 0 auto;
  border-top: 1px solid ${({ theme }) => theme.colors.blogRule};
  padding-top: 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: 14px;
    padding-top: 32px;
  }
`;

const NavCard = styled(Link)`
  display: block;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.blogRule};
  border-radius: 12px;
  padding: 22px 24px;
  background: ${({ theme }) => theme.colors.cardBg};
  transition: border-color 0.2s;

  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }

  ${({ $align }) => $align === 'right' && `
    text-align: right;
    @media (max-width: 768px) { text-align: left; }
  `}
`;

const NavCardLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;

  ${({ $align }) => $align === 'right' && `
    justify-content: flex-end;
    @media (max-width: 768px) { justify-content: flex-start; }
  `}
`;

const NavCardTitle = styled.div`
  font-family: ${({ theme }) => theme.fonts.blog};
  font-weight: 500;
  font-size: 18px;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.text};
`;

const BackLink = styled(Link)`
  display: block;
  margin: 56px auto 0;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: color 0.15s;

  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

const NotFound = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 120px 40px;
  text-align: center;

  h1 {
    font-family: ${({ theme }) => theme.fonts.blog};
    font-weight: 500;
    font-size: 36px;
    margin-bottom: 16px;
    color: ${({ theme }) => theme.colors.text};
  }
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
`;

// ── component ────────────────────────────────────────────────
export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  // SEO must be called unconditionally (rules of hooks); pass safe values when missing.
  const url = `${SITE_URL}/blog/${slug || ''}`;
  useDocumentMeta({
    title: post?.title || 'post not found',
    description: post?.excerpt || 'this post does not exist.',
    url,
    type: post ? 'article' : 'website',
    date: post?.date,
  });

  if (!post) {
    return (
      <Page>
        <NotFound>
          <h1>post not found</h1>
          <Link to="/blog">← all writing</Link>
        </NotFound>
      </Page>
    );
  }

  const Body_ = post.Component;
  const Art = pickIllustration(post.type, post.slug);
  const { prev, next } = getAdjacent(post.slug);

  return (
    <Page>
      <Article>
        <Breadcrumb>
          <Link to="/blog">← all writing</Link>
        </Breadcrumb>

        <PostMeta>
          {post.featured && <><TypeTag>★ {post.type}</TypeTag><Dot>·</Dot></>}
          {!post.featured && <><span>{post.type}</span><Dot>·</Dot></>}
          <span>{formatDateLong(post.date)}</span>
          <Dot>·</Dot>
          <span>{post.readingTime} min read</span>
        </PostMeta>

        <PostTitle>{renderTitle(post.title)}</PostTitle>

        {post.excerpt && <PostLede>{post.excerpt}</PostLede>}

        {Art && <Illo><Art size={220} /></Illo>}

        <Body><Body_ /></Body>

        <EndMark>· · ·</EndMark>
      </Article>

      {(prev || next) && (
        <PostNav>
          {prev ? (
            <NavCard to={prev.href}>
              <NavCardLabel><span>←</span> previous</NavCardLabel>
              <NavCardTitle>{renderTitle(prev.title)}</NavCardTitle>
            </NavCard>
          ) : <div />}
          {next ? (
            <NavCard to={next.href} $align="right">
              <NavCardLabel $align="right">next <span>→</span></NavCardLabel>
              <NavCardTitle>{renderTitle(next.title)}</NavCardTitle>
            </NavCard>
          ) : <div />}
        </PostNav>
      )}

      <BackLink to="/blog">← all writing</BackLink>
    </Page>
  );
}
