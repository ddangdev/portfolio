import styled from 'styled-components';
import { useSpring, animated, config } from '@react-spring/web';
import { SectionWrapper, SectionContent, SectionNumber } from '../../styles/Section';
import useInView from '../../hooks/useInView';
import { AboutDoodles } from '../Doodles/Doodles';

const AboutWrapper = styled(SectionWrapper)`
  background: ${({ theme }) => `linear-gradient(to bottom, ${theme.colors.heroBg} 0%, ${theme.colors.aboutBg} 6%, ${theme.colors.aboutBg} 100%)`};
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

// ── "what to expect" strip ────────────────────────────────────
const Strip = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 40px;
  max-width: 760px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StripItem = styled.div`
  padding: 18px 20px;
  border-radius: 14px;
  border: 1px solid rgba(74, 144, 136, 0.2);
  background: ${({ theme }) => theme.colors.stripBg};
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
`;

const StripIcon = styled.div`
  color: ${({ theme }) => theme.colors.accentSeafoam};
  margin-bottom: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const StripTitle = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
  margin-bottom: 4px;
`;

const StripBody = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  line-height: 1.5;
  margin: 0;
`;

// Simple original line-art icons for the strip
const BrushIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 3l7 7-11 11H3v-7z" />
    <path d="M14 3l4 4" />
  </svg>
);

const HandshakeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12l4-4 5 5 4-4 3 3" />
    <path d="M9 17l3-3 3 3" />
    <path d="M2 10h3" />
    <path d="M19 10h3" />
  </svg>
);

const RocketIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4.5 16.5c-1 1.5-1 4 0 6 2-0 4.5-1 6-2.5" />
    <path d="M12 15l-3-3a10 10 0 0 1 9-9 10 10 0 0 1-9 9z" />
    <path d="M9 12h-3.5l3-3h3" />
    <path d="M12 15v3.5l3-3v-3" />
  </svg>
);

function About() {
  const [ref, inView] = useInView();

  const spring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: config.gentle,
  });

  return (
    <AboutWrapper id="about">
      <SectionNumber>02 / about</SectionNumber>
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

          <Strip>
            <StripItem>
              <StripIcon><BrushIcon /></StripIcon>
              <StripTitle>custom design</StripTitle>
              <StripBody>every site feels like yours — no templates, no cookie cutter.</StripBody>
            </StripItem>
            <StripItem>
              <StripIcon><HandshakeIcon /></StripIcon>
              <StripTitle>collaborative</StripTitle>
              <StripBody>we figure it out together, iterate fast, and keep it light.</StripBody>
            </StripItem>
            <StripItem>
              <StripIcon><RocketIcon /></StripIcon>
              <StripTitle>shipped quickly</StripTitle>
              <StripBody>prototype in days, live in weeks — no dragging things out.</StripBody>
            </StripItem>
          </Strip>
        </AnimatedContent>
      </SectionContent>
    </AboutWrapper>
  );
}

export default About;
