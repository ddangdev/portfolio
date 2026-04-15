import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useSpring, animated, config } from '@react-spring/web';
import { SectionWrapper, SectionContent, SectionNumber } from '../../styles/Section';
import useInView from '../../hooks/useInView';
import { ContactDoodles } from '../Doodles/Doodles';
import ContactFormPopup from './ContactFormPopup';

const ContactWrapper = styled(SectionWrapper)`
  background: ${({ theme }) => `linear-gradient(to bottom, ${theme.colors.projectsBg} 0%, ${theme.colors.contactBg} 6%, ${theme.colors.contactBg} 100%)`};
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
  gap: 28px;
  margin-bottom: 32px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: 18px;
  }
`;

const IconItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const IconLabel = styled.span`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  letter-spacing: 0.08em;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const ResponseNote = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  font-style: italic;
  margin-top: 32px;
  opacity: 0.8;
`;

const IconCircle = styled.a`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.cardBg};
  border: 2px solid ${({ $accent, theme }) => $accent ? theme.colors.accentPink : theme.colors.divider};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  box-shadow: ${({ theme }) => theme.shadows.subtle};
  cursor: pointer;
  text-transform: lowercase;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-decoration: none;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;

  ${({ $accent }) => $accent && `background: rgba(217, 139, 168, 0.08);`}

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentPink};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
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
  const [formOpen, setFormOpen] = useState(false);
  const openForm = useCallback((e) => { e?.preventDefault(); setFormOpen(true); }, []);
  const closeForm = useCallback(() => setFormOpen(false), []);

  const spring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: config.gentle,
  });

  return (
    <ContactWrapper id="contact">
      <SectionNumber>04 / contact</SectionNumber>
      <ContactDoodles />
      <ContactContent>
        <AnimatedContent ref={ref} style={spring}>
          <Heading>say hello</Heading>
          <Body>want to chat, collaborate, or just say hi?</Body>
          <IconRow>
            <IconItem>
              <IconCircle
                href="#"
                onClick={openForm}
                aria-label="open contact form"
              >
                chat
              </IconCircle>
              <IconLabel>message</IconLabel>
            </IconItem>

            <IconItem>
              <IconCircle
                href="https://www.linkedin.com/in/duong-dang-68802a201/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="linkedin profile"
              >
                in
              </IconCircle>
              <IconLabel>linkedin</IconLabel>
            </IconItem>

            <IconItem>
              <IconCircle
                href="https://github.com/ddangdev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="github profile"
              >
                gh
              </IconCircle>
              <IconLabel>github</IconLabel>
            </IconItem>

            <IconItem>
              <ConstructionIcon
                as="a"
                href="#"
                $accent
                aria-label="more coming soon"
              >
                🚧
              </ConstructionIcon>
              <IconLabel>more soon</IconLabel>
            </IconItem>
          </IconRow>

          <ResponseNote>
            typical response time: within a day or two · based in honolulu (hst)
          </ResponseNote>
        </AnimatedContent>
      </ContactContent>

      <ContactFormPopup open={formOpen} onClose={closeForm} />
    </ContactWrapper>
  );
}

export default Contact;
