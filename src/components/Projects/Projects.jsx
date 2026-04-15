import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useSpring, animated, config, useTransition } from '@react-spring/web';
import { SectionWrapper, SectionContent, SectionNumber } from '../../styles/Section';
import useInView from '../../hooks/useInView';
import { ProjectsDoodles } from '../Doodles/Doodles';
import projectList from './projects/projectList.jsx';
import { trackEvent } from '../../utils/analytics';

const ProjectsWrapper = styled(SectionWrapper)`
  background: ${({ theme }) => `linear-gradient(to bottom, ${theme.colors.aboutBg} 0%, ${theme.colors.projectsBg} 6%, ${theme.colors.projectsBg} 100%)`};
  /* Lift the whole section above neighboring sections so cards dragged
     off-edge paint over Contact/About instead of disappearing behind them. */
  z-index: 2;
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

// Section-level project switcher: arrows anchored to the far edges,
// project content stage in the middle.
const SwitcherShell = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 440px;
  padding: 0 100px;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    padding: 0 60px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 0;
    min-height: 400px;
  }
`;

const ArrowGroup = styled.div`
  position: absolute;
  top: 50%;
  ${({ $side }) => ($side === 'left' ? 'left: 0;' : 'right: 0;')}
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 5;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

const MobileControls = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
  }
`;

const DesktopDotsWrap = styled.div`
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

const MobileArrow = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.accentLavender};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.125rem;
  line-height: 1;
  font-family: inherit;
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: background 0.2s, transform 0.15s;

  &:active {
    transform: scale(0.94);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const SectionArrow = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.accentLavender};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.75rem;
  line-height: 1;
  font-family: inherit;
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.accentLavenderHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
`;

const ArrowLabel = styled.span`
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.accentLavender};
  text-transform: lowercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
`;

const Stage = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 880px;
  position: relative;
  min-height: 440px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    /* Grid single-cell stacking so all SlideLayers share one cell and
       Stage auto-sizes to the tallest project. Prevents tall projects
       from overflowing and rendering behind dots/label/description. */
    display: grid;
    grid-template-areas: "stack";
    min-height: 0;
  }
`;

// All layers absolutely positioned so entering + leaving layers
// never push each other out of center during rapid transitions.
// On mobile we switch to grid-area stacking (see Stage) so the container
// grows with the currently mounted project.
const SlideLayer = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  will-change: transform, opacity;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    position: relative;
    grid-area: stack;
  }
`;

const ProjectDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-top: 0;
  }
`;

const ProjectDot = styled.button`
  width: ${({ $active }) => ($active ? '32px' : '10px')};
  height: 10px;
  border-radius: 5px;
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.accentLavender : theme.colors.divider};
  padding: 0;
  cursor: pointer;
  transition: width 0.25s, background 0.25s;
  font-family: inherit;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }
`;

const ProjectLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  margin-top: 24px;
`;

const ProjectDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  max-width: 560px;
  margin: 20px auto 0;
  line-height: 1.6;
`;

const TechRow = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
`;

const TechPill = styled.span`
  font-family: ${({ theme }) => theme.fonts.code};
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.accentLavender};
  background: rgba(155, 138, 217, 0.1);
  border: 1px solid rgba(155, 138, 217, 0.2);
  padding: 4px 10px;
  border-radius: 9999px;
  text-transform: lowercase;
  letter-spacing: 0.04em;
`;

function Projects() {
  const [ref, inView] = useInView();
  const [projectIndex, setProjectIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const sectionSpring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: config.gentle,
  });

  const goProject = useCallback((delta) => {
    setDirection(delta);
    setProjectIndex((i) => {
      const next = (i + delta + projectList.length) % projectList.length;
      trackEvent('feature_switch', { to: projectList[next]?.id ?? next, method: 'arrow' });
      return next;
    });
  }, []);

  const goToProject = useCallback((target) => {
    setDirection(target > projectIndex ? 1 : -1);
    setProjectIndex(target);
    trackEvent('feature_switch', { to: projectList[target]?.id ?? target, method: 'dot' });
  }, [projectIndex]);

  const projectTransitions = useTransition(projectIndex, {
    from: { transform: `translateX(${direction * 120}px)`, opacity: 0 },
    enter: { transform: 'translateX(0px)', opacity: 1 },
    leave: { transform: `translateX(${direction * -120}px)`, opacity: 0 },
    config: { tension: 240, friction: 28 },
    keys: (i) => i,
  });

  const currentProject = projectList[projectIndex];

  return (
    <ProjectsWrapper id="projects">
      <SectionNumber>03 / features</SectionNumber>
      <ProjectsDoodles />
      <ProjectsContent>
        <AnimatedContent ref={ref} style={sectionSpring}>
          <Heading>features</Heading>
          <Subtext>interactive things i've been building</Subtext>

          <SwitcherShell>
            <ArrowGroup $side="left">
              <SectionArrow
                onClick={() => goProject(-1)}
                aria-label="previous feature"
                disabled={projectList.length <= 1}
              >
                ←
              </SectionArrow>
              <ArrowLabel>prev feature</ArrowLabel>
            </ArrowGroup>

            <Stage>
              {projectTransitions((style, i) => {
                const Component = projectList[i].component;
                return (
                  <SlideLayer style={style}>
                    <Component />
                  </SlideLayer>
                );
              })}
            </Stage>

            <ArrowGroup $side="right">
              <SectionArrow
                onClick={() => goProject(1)}
                aria-label="next feature"
                disabled={projectList.length <= 1}
              >
                →
              </SectionArrow>
              <ArrowLabel>next feature</ArrowLabel>
            </ArrowGroup>
          </SwitcherShell>

          <MobileControls>
            <MobileArrow
              onClick={() => goProject(-1)}
              aria-label="previous feature"
              disabled={projectList.length <= 1}
            >
              ←
            </MobileArrow>
            <ProjectDots role="tablist" aria-label="feature position">
              {projectList.map((p, i) => (
                <ProjectDot
                  key={p.id}
                  $active={i === projectIndex}
                  onClick={() => goToProject(i)}
                  aria-label={`go to ${p.name}`}
                  aria-selected={i === projectIndex}
                />
              ))}
            </ProjectDots>
            <MobileArrow
              onClick={() => goProject(1)}
              aria-label="next feature"
              disabled={projectList.length <= 1}
            >
              →
            </MobileArrow>
          </MobileControls>

          <DesktopDotsWrap>
            <ProjectDots role="tablist" aria-label="feature position">
              {projectList.map((p, i) => (
                <ProjectDot
                  key={`d-${p.id}`}
                  $active={i === projectIndex}
                  onClick={() => goToProject(i)}
                  aria-label={`go to ${p.name}`}
                  aria-selected={i === projectIndex}
                />
              ))}
            </ProjectDots>
          </DesktopDotsWrap>

          <ProjectLabel>{currentProject.label}</ProjectLabel>

          {currentProject.description && (
            <ProjectDescription>{currentProject.description}</ProjectDescription>
          )}

          {currentProject.tech && currentProject.tech.length > 0 && (
            <TechRow aria-label="technologies used">
              {currentProject.tech.map((t) => (
                <TechPill key={t}>{t}</TechPill>
              ))}
            </TechRow>
          )}
        </AnimatedContent>
      </ProjectsContent>
    </ProjectsWrapper>
  );
}

export default Projects;
