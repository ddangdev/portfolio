import styled from 'styled-components';
import { useSpring, animated, config } from '@react-spring/web';
import { SectionWrapper, SectionContent } from '../../styles/Section';
import useInView from '../../hooks/useInView';
import { AboutDoodles } from '../Doodles/Doodles';

const AboutWrapper = styled(SectionWrapper)`
  background: linear-gradient(to bottom, #FFF3E0 0%, #E8F5EC 6%, #E8F5EC 100%);
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

  & + & {
    margin-top: 20px;
  }
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
      <AboutDoodles />
      <SectionContent>
        <AnimatedContent ref={ref} style={spring}>
          <Heading>about me</Heading>
          <Bio>
            i'm <Keyword>dean</Keyword>, based in <Keyword>honolulu</Keyword>.
            i build <Keyword>websites</Keyword> that are fun to use and easy
            to make your own — every project gets its own <Keyword>personality</Keyword>,
            not a stamped-out template.
          </Bio>
          <Bio>
            if you've got an idea — a <Keyword>small business site</Keyword>,
            a <Keyword>portfolio</Keyword>, a <Keyword>landing page</Keyword>,
            a <Keyword>passion project</Keyword> — i'd love to help you get it
            off the ground. my process is <Keyword>collaborative</Keyword>:
            we start with what matters to you, i prototype fast, and we iterate
            until it feels right. i work with <Keyword>ai</Keyword> to design
            and ship quickly, and i care about making things that feel
            <Keyword> good to use</Keyword>.
          </Bio>
          <Bio>
            i also tinker with <Keyword>games</Keyword>, <Keyword>apps</Keyword>,
            and <Keyword>tools</Keyword> on the side, mostly for the joy of it.
            reach out any time — i'm always down to chat about a new project.
          </Bio>
        </AnimatedContent>
      </SectionContent>
    </AboutWrapper>
  );
}

export default About;
