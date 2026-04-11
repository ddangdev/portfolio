import { useState } from 'react';
import styled from 'styled-components';
import { useSpring, animated, config } from '@react-spring/web';
import { SectionWrapper, SectionContent } from '../../styles/Section';
import useInView from '../../hooks/useInView';
import useCardDeck from './CardDeck';
import { ProjectsDoodles } from '../Doodles/Doodles';
// CardDeck also exports DeckContainer styled component

const ProjectsWrapper = styled(SectionWrapper)`
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.sectionTints.about} 0%,
    ${({ theme }) => theme.sectionTints.projects} 15%,
    ${({ theme }) => theme.sectionTints.projects} 85%,
    ${({ theme }) => theme.sectionTints.contact} 100%
  );
`;

const ProjectsContent = styled(SectionContent)`
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

const Subtext = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.small};
  text-transform: lowercase;
  margin-bottom: 48px;
`;

const SwipeHint = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  margin-bottom: 32px;
`;

const DealButton = styled(animated.button)`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -24px;
  margin-left: -70px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px 32px;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.button};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.04em;
  text-transform: lowercase;
  border: none;
  box-shadow: ${({ theme }) => theme.shadows.subtle};
  z-index: 30;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const RestaurantLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
`;

function Projects() {
  const [ref, inView] = useInView();

  const sectionSpring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: config.gentle,
  });

  const { cards, deckEmpty, dealAgain, DeckContainer } = useCardDeck();

  const dealSpring = useSpring({
    opacity: deckEmpty ? 1 : 0,
    transform: deckEmpty ? 'scale(1)' : 'scale(0.5)',
    config: { tension: 160, friction: 14 },
  });

  return (
    <ProjectsWrapper id="projects">
      <ProjectsDoodles />
      <ProjectsContent>
        <AnimatedContent ref={ref} style={sectionSpring}>
          <Heading>projects</Heading>
          <Subtext>things i've been working on</Subtext>

          <DeckContainer>
            {cards}
            {deckEmpty && (
              <DealButton style={dealSpring} onClick={dealAgain}>
                deal again
              </DealButton>
            )}
          </DeckContainer>

          {!deckEmpty && <SwipeHint>drag to discover next dish</SwipeHint>}

          <RestaurantLabel>luca's — a tarot card menu</RestaurantLabel>
        </AnimatedContent>
      </ProjectsContent>
    </ProjectsWrapper>
  );
}

export default Projects;
