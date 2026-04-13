import styled from 'styled-components';
import { useSpring, animated, config } from '@react-spring/web';
import { SectionWrapper, SectionContent, SectionNumber } from '../../styles/Section';
import { HeroDoodles } from '../Doodles/Doodles';
import HeroIllustration from './HeroIllustration';

const HeroWrapper = styled(SectionWrapper)`
  background: #FFF3E0;
`;

const HeroContent = styled(SectionContent)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 700px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    text-align: center;
    min-height: auto;
  }
`;

const HeroText = styled(animated.div)`
  max-width: 520px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    max-width: 100%;
  }
`;

const Headline = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.h1};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: ${({ theme }) => theme.lineHeights.h1};
  letter-spacing: -0.02em;
  text-transform: lowercase;
  margin-bottom: 8px;
`;

const Tagline = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.h2};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  line-height: ${({ theme }) => theme.lineHeights.h2};
  text-transform: lowercase;
  margin-bottom: ${({ theme }) => theme.spacing.stackGapSmall};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.body};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  margin-bottom: 40px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: 12px;
  }
`;

const PrimaryButton = styled.a`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px 32px;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.button};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.04em;
  text-transform: lowercase;
  box-shadow: ${({ theme }) => theme.shadows.subtle};
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
  text-align: center;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: scale(1.02);
  }
`;

const SecondaryButton = styled.a`
  display: inline-block;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  padding: 12px 32px;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.button};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.04em;
  text-transform: lowercase;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  text-align: center;

  &:hover {
    background: rgba(255, 205, 178, 0.15);
    border-color: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(1.02);
  }
`;

const IllustrationWrapper = styled(animated.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Small pill shown above the headline: a pulsing green dot + "open for projects"
const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  margin-bottom: 20px;
  background: rgba(74, 144, 136, 0.1);
  border: 1px solid rgba(74, 144, 136, 0.3);
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.accentSeafoam};
  text-transform: lowercase;
  letter-spacing: 0.08em;
  width: fit-content;
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentSeafoam};
  box-shadow: 0 0 0 0 rgba(74, 144, 136, 0.5);
  animation: pulse 2s ease-out infinite;

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(74, 144, 136, 0.5); }
    70% { box-shadow: 0 0 0 8px rgba(74, 144, 136, 0); }
    100% { box-shadow: 0 0 0 0 rgba(74, 144, 136, 0); }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// "Scroll to explore" cue below the CTAs — subtle, with a bouncing arrow
const ScrollCue = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 56px;
  font-family: ${({ theme }) => theme.fonts.code};
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  letter-spacing: 0.12em;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-top: 40px;
    justify-content: center;
  }
`;

const ScrollArrow = styled.span`
  display: inline-block;
  animation: bob 2s ease-in-out infinite;

  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(4px); }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

function Hero() {
  const textSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: 200,
    config: config.gentle,
  });

  const illustrationSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: 400,
    config: config.gentle,
  });

  return (
    <HeroWrapper>
      <SectionNumber>01 / intro</SectionNumber>
      <HeroDoodles />
      <HeroContent>
        <HeroText style={textSpring}>
          <StatusBadge>
            <StatusDot aria-hidden="true" />
            open for projects
          </StatusBadge>
          <Headline>hi, i'm dean.</Headline>
          <Tagline>i make things people enjoy using.</Tagline>
          <Subtitle>building software, games, and whatever sounds fun.</Subtitle>
          <ButtonGroup>
            <PrimaryButton href="#projects">see my work</PrimaryButton>
            <SecondaryButton href="#contact">say hello</SecondaryButton>
          </ButtonGroup>
          <ScrollCue aria-hidden="true">
            scroll to explore
            <ScrollArrow>↓</ScrollArrow>
          </ScrollCue>
        </HeroText>
        <IllustrationWrapper style={illustrationSpring}>
          <HeroIllustration />
        </IllustrationWrapper>
      </HeroContent>
    </HeroWrapper>
  );
}

export default Hero;
