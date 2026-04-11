import styled from 'styled-components';

// Full-width outer wrapper for section backgrounds
export const SectionWrapper = styled.section`
  width: 100%;
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
