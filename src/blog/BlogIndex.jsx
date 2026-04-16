import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { posts } from './posts';
import { pickIllustration } from './illustrations';
import QuickNotes from './QuickNotes';

// ── helpers ─────────────────────────────────────────────────
// Authors mark italic emphasis in frontmatter titles with *asterisks*.
// e.g. "the poke bar: how a *small ordering flow* earned its keep."
function renderTitle(title) {
  if (!title) return null;
  const parts = title.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) =>
    part.startsWith('*') && part.endsWith('*')
      ? <em key={i}>{part.slice(1, -1)}</em>
      : part
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toLowerCase();
}

function readingTime(post) {
  if (typeof post.readingTime === 'number') return post.readingTime;
  return 3; // Phase 4c will compute this from MDX body word count
}

function pickFeatured(all) {
  const flagged = all.filter((p) => p.featured);
  if (flagged.length === 0) return { featured: null, rest: all };
  // Newest wins if multiple flagged
  flagged.sort((a, b) => new Date(b.date) - new Date(a.date));
  const featured = flagged[0];
  const rest = all.filter((p) => p !== featured);
  return { featured, rest };
}

// ── styled components ────────────────────────────────────────
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

const Intro = styled.section`
  margin-bottom: 72px;
  max-width: 760px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-bottom: 48px;
  }
`;

const IntroLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 14px;
`;

const IntroH1 = styled.h1`
  font-family: ${({ theme }) => theme.fonts.blog};
  font-weight: 400;
  font-size: 56px;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 18px;

  em {
    font-style: italic;
    color: #B05A3F;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    font-size: 46px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 34px;
    line-height: 1.08;
  }
`;

const IntroLede = styled.p`
  font-family: ${({ theme }) => theme.fonts.blog};
  font-size: 19px;
  font-weight: 400;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 16px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 80px;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
    gap: 64px;
  }
`;

const ColHead = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-bottom: 20px;
    font-size: 10px;
  }
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px 28px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

// .illo wraps each illustration; sets color so SVG currentColor adapts to theme.
const Illo = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  color: ${({ theme }) => theme.colors.blogIlloStroke};
`;

const FeaturedCard = styled(Link)`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: row;
  gap: 56px;
  align-items: center;
  text-decoration: none;
  color: inherit;
  border: 1px solid ${({ theme }) => theme.colors.blogRule};
  border-radius: 12px;
  padding: 36px 40px;
  margin-bottom: 8px;
  background: ${({ theme }) => theme.colors.cardBg};
  transition: border-color 0.2s ease;

  ${Illo} { width: 340px; flex-shrink: 0; height: 240px; }

  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
    padding: 24px 24px 32px 24px;
    margin-bottom: 8px;

    ${Illo} { width: 100%; height: 180px; margin-bottom: 0; }
  }
`;

const FeaturedTextCol = styled.div`
  flex: 1;
`;

const FeaturedTag = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.14em;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

const FeaturedTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.blog};
  font-weight: 500;
  font-size: 36px;
  line-height: 1.05;
  letter-spacing: -0.018em;
  margin: 0 0 14px;
  color: ${({ theme }) => theme.colors.text};

  em { font-style: italic; font-weight: 400; }

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    font-size: 32px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 26px;
  }
`;

const FeaturedExcerpt = styled.p`
  font-family: ${({ theme }) => theme.fonts.blog};
  font-size: 18px;
  font-weight: 400;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 16px;
  }
`;

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.blogRule};
  border-radius: 12px;
  padding: 28px 28px 32px;
  background: ${({ theme }) => theme.colors.cardBg};
  transition: border-color 0.2s ease;

  ${Illo} { height: 180px; margin-bottom: 22px; }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 20px 20px 24px;
    ${Illo} { height: 140px; margin-bottom: 16px; }
  }
`;

const Meta = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
`;

const Dot = styled.span`
  color: ${({ theme }) => theme.colors.blogRule};
`;

const CardTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.blog};
  font-weight: 500;
  font-size: 26px;
  line-height: 1.15;
  letter-spacing: -0.012em;
  margin: 0 0 10px;
  color: ${({ theme }) => theme.colors.text};

  em { font-style: italic; font-weight: 400; }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 22px;
  }
`;

const CardExcerpt = styled.p`
  font-family: ${({ theme }) => theme.fonts.blog};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 15px;
  }
`;

// ── component ────────────────────────────────────────────────
function CardEntry({ post }) {
  const Art = pickIllustration(post.type, post.slug);
  return (
    <Card to={post.href}>
      <Illo>{Art && <Art size={140} />}</Illo>
      <Meta>
        <span>{post.type}</span>
        <Dot>·</Dot>
        <span>{formatDate(post.date)}</span>
        <Dot>·</Dot>
        <span>{readingTime(post)} min</span>
      </Meta>
      <CardTitle>{renderTitle(post.title)}</CardTitle>
      <CardExcerpt>{post.excerpt}</CardExcerpt>
    </Card>
  );
}

function FeaturedEntry({ post }) {
  const Art = pickIllustration(post.type, post.slug);
  return (
    <FeaturedCard to={post.href}>
      <Illo>{Art && <Art size={220} />}</Illo>
      <FeaturedTextCol>
        <FeaturedTag>★ featured · {post.type}</FeaturedTag>
        <FeaturedTitle>{renderTitle(post.title)}</FeaturedTitle>
        <FeaturedExcerpt>{post.excerpt}</FeaturedExcerpt>
      </FeaturedTextCol>
    </FeaturedCard>
  );
}

export default function BlogIndex() {
  const { featured, rest } = pickFeatured(posts);
  const total = posts.length;

  return (
    <Page>
      <Intro>
        <IntroLabel>writing</IntroLabel>
        <IntroH1>
          essays, case studies, and <em>quiet observations</em> from building things people enjoy using.
        </IntroH1>
        <IntroLede>
          a small garden of writing about craft, client work, and the corners of the web i think about more than i should.
        </IntroLede>
      </Intro>

      <Grid>
        <section>
          <ColHead>
            <span>essays</span>
            <span>{total} published</span>
          </ColHead>
          <Cards>
            {featured && <FeaturedEntry post={featured} />}
            {rest.map((p) => <CardEntry key={p.slug} post={p} />)}
          </Cards>
        </section>

        <QuickNotes />
      </Grid>
    </Page>
  );
}
