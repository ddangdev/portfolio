import styled from 'styled-components';
import { useSpring, animated } from '@react-spring/web';
import useCardDeck from '../../CardDeck';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DealButton = styled(animated.button)`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -24px;
  margin-left: -70px;
  background: ${({ theme }) => theme.colors.accentLavender};
  color: ${({ theme }) => theme.colors.white};
  padding: 12px 32px;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.button};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.04em;
  text-transform: lowercase;
  border: none;
  box-shadow: ${({ theme }) => theme.shadows.subtle};
  z-index: 30;
  font-family: inherit;
  cursor: pointer;

  &:hover {
    background: #8879C9;
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const Hint = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  margin-top: 24px;
`;

function LucasExperience() {
  const { cards, deckEmpty, dealAgain, DeckContainer } = useCardDeck();

  const dealSpring = useSpring({
    opacity: deckEmpty ? 1 : 0,
    transform: deckEmpty ? 'scale(1)' : 'scale(0.5)',
    config: { tension: 160, friction: 14 },
  });

  return (
    <Wrapper>
      <DeckContainer>
        {cards}
        {deckEmpty && (
          <DealButton style={dealSpring} onClick={dealAgain}>
            deal again
          </DealButton>
        )}
      </DeckContainer>
      <Hint style={{ opacity: deckEmpty ? 0 : 1 }}>
        drag to discover next dish
      </Hint>
    </Wrapper>
  );
}

export default LucasExperience;
