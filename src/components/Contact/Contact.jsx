import styled from 'styled-components';
import { useSpring, animated, config } from '@react-spring/web';
import { SectionWrapper, SectionContent } from '../../styles/Section';
import useInView from '../../hooks/useInView';

const ContactWrapper = styled(SectionWrapper)`
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.sectionTints.projects} 0%,
    ${({ theme }) => theme.sectionTints.contact} 15%,
    ${({ theme }) => theme.sectionTints.contact} 100%
  );
`;

const ContactContent = styled(SectionContent)`
  text-align: center;
`;

const AnimatedContent = styled(animated.div)``;

const Heading = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.h2};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  line-height: ${({ theme }) => theme.lineHeights.h2};
  text-transform: lowercase;
  margin-bottom: ${({ theme }) => theme.spacing.stackGapSmall};
`;

const Body = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  margin-bottom: 40px;
`;

const IconRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
`;

const IconCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ $accent, theme }) => $accent ? theme.colors.secondary : theme.colors.divider};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  box-shadow: ${({ theme }) => theme.shadows.subtle};
  cursor: pointer;
  text-transform: lowercase;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;

  ${({ $accent }) => $accent && `background: rgba(255, 229, 160, 0.1);`}

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: scale(1.05);
  }
`;

const ConstructionIcon = styled(IconCircle)`
  &:hover {
    animation: wiggle 0.4s ease-in-out;
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-3deg); }
    75% { transform: rotate(3deg); }
  }
`;

function Contact() {
  const [ref, inView] = useInView();

  const spring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: config.gentle,
  });

  return (
    <ContactWrapper id="contact">
      <ContactContent>
        <AnimatedContent ref={ref} style={spring}>
          <Heading>say hello</Heading>
          <Body>want to chat, collaborate, or just say hi?</Body>
          <IconRow>
            <IconCircle>chat</IconCircle>
            <IconCircle>in</IconCircle>
            <ConstructionIcon $accent>🚧</ConstructionIcon>
          </IconRow>
        </AnimatedContent>
      </ContactContent>
    </ContactWrapper>
  );
}

export default Contact;
