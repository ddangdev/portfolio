import styled from 'styled-components';
import { useSpring, animated, config } from '@react-spring/web';
import { SectionWrapper, SectionContent } from '../../styles/Section';
import useInView from '../../hooks/useInView';

const AboutWrapper = styled(SectionWrapper)`
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.sectionTints.hero} 0%,
    ${({ theme }) => theme.sectionTints.about} 15%,
    ${({ theme }) => theme.sectionTints.about} 85%,
    ${({ theme }) => theme.sectionTints.projects} 100%
  );
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

const Bio = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.body};
  line-height: ${({ theme }) => theme.lineHeights.body};
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 640px;
  text-transform: lowercase;
`;

const Keyword = styled.strong`
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

function About() {
  const [ref, inView] = useInView();

  const spring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: config.gentle,
  });

  return (
    <AboutWrapper id="about">
      <SectionContent>
        <AnimatedContent ref={ref} style={spring}>
          <Heading>about me</Heading>
          <Bio>
            i'm <Keyword>dean</Keyword>, a developer and maker based in{' '}
            <Keyword>honolulu</Keyword>. i build <Keyword>games</Keyword>,{' '}
            <Keyword>apps</Keyword>, and <Keyword>tools</Keyword> — mostly driven
            by whatever sounds fun at the time. i work with <Keyword>ai</Keyword> to
            design and create, and i care about making things that feel good to use.
          </Bio>
        </AnimatedContent>
      </SectionContent>
    </AboutWrapper>
  );
}

export default About;
