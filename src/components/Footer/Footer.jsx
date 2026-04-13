import styled from 'styled-components';

const FooterOuter = styled.footer`
  width: 100%;
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
  background: rgba(251, 245, 238, 0.4);
`;

const FooterInner = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
  padding: 28px ${({ theme }) => theme.spacing.contentPadding};
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 14px;
    padding: 24px 20px;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    justify-content: center;
  }
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    justify-content: center;
  }
`;

const SocialLink = styled.a`
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  transition: color 0.15s, transform 0.12s;
  display: inline-flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

const BackToTop = styled.button`
  background: transparent;
  border: 1.5px solid ${({ theme }) => theme.colors.divider};
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: inherit;
  font-size: 0.75rem;
  text-transform: lowercase;
  letter-spacing: 0.04em;
  padding: 8px 16px;
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentLavender};
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }
`;

const Copy = styled.span`
  white-space: nowrap;
`;

// Simple inline SVG icons (original line-art, match portfolio aesthetic)
const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.11.78-.25.78-.55v-1.94c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.97 10.97 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.27 2.38 4.27 5.47v6.27zM5.34 7.43a2.06 2.06 0 0 1-2.06-2.07 2.07 2.07 0 1 1 2.06 2.07zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

function Footer() {
  return (
    <FooterOuter>
      <FooterInner>
        <Left>
          <Copy>© 2026 dean</Copy>
        </Left>

        <Center>
          <BackToTop
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="back to top"
          >
            ↑ back to top
          </BackToTop>
        </Center>

        <Right>
          <SocialLink
            href="https://github.com/ddangdev"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="github"
          >
            <GitHubIcon />
          </SocialLink>
          <SocialLink
            href="https://www.linkedin.com/in/duong-dang-68802a201/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="linkedin"
          >
            <LinkedInIcon />
          </SocialLink>
        </Right>
      </FooterInner>
    </FooterOuter>
  );
}

export default Footer;
