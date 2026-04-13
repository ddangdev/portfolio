import styled from 'styled-components';

// Full-width outer wrapper for section backgrounds
export const SectionWrapper = styled.section`
  width: 100%;
  position: relative;
  overflow: visible;
`;

// Centered inner container for content
export const SectionContent = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.sectionPadding} ${({ theme }) => theme.spacing.contentPadding};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 80px 20px;
  }
`;

// Small corner marker for each section — e.g. "01 / hero", "02 / about".
// Positioned absolutely in the top-left of its parent SectionWrapper.
export const SectionNumber = styled.div`
  position: absolute;
  top: 32px;
  left: ${({ theme }) => theme.spacing.contentPadding};
  font-family: ${({ theme }) => theme.fonts.code};
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  letter-spacing: 0.12em;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 3;

  &::before {
    content: '';
    width: 20px;
    height: 1px;
    background: currentColor;
    opacity: 0.5;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    top: 20px;
    left: 20px;
    font-size: 0.625rem;

    &::before {
      width: 14px;
    }
  }
`;
