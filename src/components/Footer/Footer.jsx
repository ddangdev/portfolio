import styled from 'styled-components';

const FooterOuter = styled.footer`
  width: 100%;
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
`;

const FooterInner = styled.div`
  text-align: center;
  padding: 24px ${({ theme }) => theme.spacing.contentPadding};
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
`;

function Footer() {
  return (
    <FooterOuter>
      <FooterInner>© 2026 dean</FooterInner>
    </FooterOuter>
  );
}

export default Footer;
