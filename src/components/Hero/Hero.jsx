import styled from 'styled-components';
import { useSpring, animated, config } from '@react-spring/web';
import { SectionWrapper, SectionContent } from '../../styles/Section';
import { HeroDoodles } from '../Doodles/Doodles';

const HeroWrapper = styled(SectionWrapper)`
  background: linear-gradient(180deg, ${({ theme }) => theme.sectionTints.hero} 0%, ${({ theme }) => theme.colors.bg} 100%);
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

const IllustrationPlaceholder = styled(animated.div)`
  width: 400px;
  height: 350px;
  background: linear-gradient(135deg, rgba(255, 205, 178, 0.2), rgba(255, 229, 160, 0.15));
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.nav};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-transform: lowercase;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 100%;
    height: 220px;
    margin-top: 40px;
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
      <HeroDoodles />
      <HeroContent>
        <HeroText style={textSpring}>
          <Headline>hi, i'm dean.</Headline>
          <Tagline>i make things people enjoy using.</Tagline>
          <Subtitle>building software, games, and whatever sounds fun.</Subtitle>
          <ButtonGroup>
            <PrimaryButton href="#projects">see my work</PrimaryButton>
            <SecondaryButton href="#contact">say hello</SecondaryButton>
          </ButtonGroup>
        </HeroText>
        <IllustrationPlaceholder style={illustrationSpring}>
          illustration placeholder
        </IllustrationPlaceholder>
      </HeroContent>
    </HeroWrapper>
  );
}

export default Hero;
