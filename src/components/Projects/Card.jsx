import styled from 'styled-components';

const CardWrapper = styled.div`
  position: absolute;
  width: ${({ theme }) => theme.layout.cardWidth};
  height: ${({ theme }) => theme.layout.cardHeight};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.divider};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  cursor: ${({ $isBack }) => $isBack ? 'default' : 'grab'};
  user-select: none;
  transition: transform 0.2s, box-shadow 0.2s;

  top: ${({ $offset }) => $offset * 4}px;
  left: ${({ $offset }) => $offset * 4}px;

  background: ${({ $isBack, theme }) =>
    $isBack
      ? `repeating-linear-gradient(45deg, ${theme.colors.accentLavender}, ${theme.colors.accentLavender} 2px, #d8d5ff 2px, #d8d5ff 8px)`
      : theme.colors.white};

  box-shadow: ${({ $offset, theme }) =>
    $offset === 0 ? theme.shadows.md : `0 2px ${4 + $offset * 2}px rgba(45,52,54,${0.04 + $offset * 0.01})`};

  ${({ $isBack }) => !$isBack && `
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(45, 52, 54, 0.12);
    }
    &:active {
      cursor: grabbing;
      transform: scale(0.98);
    }
  `}

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 200px;
    height: 300px;
    padding: 24px;
  }
`;

const DishIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(195, 191, 255, 0.15);
  border-radius: ${({ theme }) => theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 64px;
    height: 64px;
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
`;

const DishName = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.125rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: lowercase;
  margin-bottom: 8px;
`;

const DishDesc = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  text-align: center;
`;

function Card({ item, offset = 0, isBack = false }) {
  if (isBack) {
    return <CardWrapper $offset={offset} $isBack />;
  }

  return (
    <CardWrapper $offset={offset} $isBack={false}>
      <DishIcon>{item.emoji}</DishIcon>
      <DishName>{item.name}</DishName>
      <DishDesc>{item.desc}</DishDesc>
    </CardWrapper>
  );
}

export default Card;
