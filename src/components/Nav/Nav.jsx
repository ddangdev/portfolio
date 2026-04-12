import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSpring, animated } from '@react-spring/web';
import useScrollDirection from '../../hooks/useScrollDirection';
import useScrollSpy from '../../hooks/useScrollSpy';

const NavOuter = styled(animated.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(251, 245, 238, 0.72);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  box-shadow: ${({ theme }) => theme.shadows.nav};
`;

const NavInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${({ theme }) => theme.layout.navHeight};
  padding: 0 ${({ theme }) => theme.spacing.contentPadding};
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 0 20px;
    height: 56px;
  }
`;

const Links = styled.div`
  display: flex;
  gap: 32px;
  font-size: ${({ theme }) => theme.fontSizes.nav};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-transform: lowercase;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textMuted};
  font-weight: ${({ $active, theme }) => $active ? theme.fontWeights.semibold : theme.fontWeights.medium};
  transition: color 0.2s, font-weight 0.2s;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 1px;
    transform: scaleX(${({ $active }) => $active ? 1 : 0});
    transform-origin: left;
    transition: transform 0.25s ease;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    &::after { transform: scaleX(1); }
  }
`;

const LocationTime = styled.div`
  font-family: ${({ theme }) => theme.fonts.code};
  font-size: 0.8125rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 0.6875rem;
  }
`;

const Hamburger = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
  }
`;

const NavSpacer = styled.div`
  height: ${({ theme }) => theme.layout.navHeight};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    height: 56px;
  }
`;

const SECTIONS = ['about', 'projects', 'contact'];

function formatHonoluluTime(date) {
  // Honolulu is UTC-10, no DST
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Pacific/Honolulu',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value || '';
  return `${get('hour')}:${get('minute')}:${get('second')} ${get('dayPeriod').toLowerCase()}`;
}

function Nav() {
  const { scrollDir, atTop } = useScrollDirection();
  const activeId = useScrollSpy(SECTIONS);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const navSpring = useSpring({
    transform: scrollDir === 'down' && !atTop ? 'translateY(-100%)' : 'translateY(0%)',
    config: { tension: 280, friction: 26 },
  });

  return (
    <>
      <NavOuter style={navSpring}>
        <NavInner>
          <LocationTime>honolulu, hi — {formatHonoluluTime(now)}</LocationTime>
          <Links>
            {SECTIONS.map((id) => (
              <NavLink key={id} href={`#${id}`} $active={activeId === id}>
                {id}
              </NavLink>
            ))}
          </Links>
          <Hamburger aria-label="menu">☰</Hamburger>
        </NavInner>
      </NavOuter>
      <NavSpacer />
    </>
  );
}

export default Nav;
