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
  background: rgba(255, 250, 245, 0.85);
  backdrop-filter: blur(12px);
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

const Logo = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: 1.25rem;
  text-transform: lowercase;
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
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textMuted};
  transition: color 0.2s;
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
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

function Nav() {
  const { scrollDir, atTop } = useScrollDirection();
  const activeId = useScrollSpy(SECTIONS);

  const navSpring = useSpring({
    transform: scrollDir === 'down' && !atTop ? 'translateY(-100%)' : 'translateY(0%)',
    config: { tension: 280, friction: 26 },
  });

  return (
    <>
      <NavOuter style={navSpring}>
        <NavInner>
          <Logo>dean</Logo>
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
