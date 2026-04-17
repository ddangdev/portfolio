import styled from 'styled-components';

const NOTES = [
  { date: 'apr 14', title: 'the best pho in honolulu is a 10-minute walk from my desk.' },
  { date: 'apr 10', title: 'a thought lives here.', placeholder: true },
  { date: 'apr 02', title: 'why every restaurant menu needs exactly 3 fonts.' },
  { date: 'mar 28', title: 'a thought lives here.', placeholder: true },
  { date: 'mar 20', title: 'mise en place applies to code too.' },
];

const Aside = styled.aside`
  position: sticky;
  top: 96px;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    position: static;
    top: auto;
  }
`;

const ColHead = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.blogRule};
  padding-bottom: 14px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const Note = styled.div`
  padding: 14px 0;
  border-bottom: 1px dotted ${({ theme }) => theme.colors.blogRule};
  &:last-child { border-bottom: none; }
`;

const Date = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 5px;
`;

const Title = styled.div`
  font-family: ${({ theme }) => theme.fonts.blog};
  font-weight: 500;
  font-size: 15px;
  line-height: 1.3;
  color: ${({ $placeholder, theme }) => ($placeholder ? theme.colors.textMuted : theme.colors.text)};
  font-style: ${({ $placeholder }) => ($placeholder ? 'italic' : 'normal')};
  opacity: ${({ $placeholder }) => ($placeholder ? 0.55 : 1)};
`;

export default function QuickNotes() {
  return (
    <Aside>
      <ColHead>
        <span>quick notes</span>
        <span>{NOTES.length}</span>
      </ColHead>
      {NOTES.map((n, i) => (
        <Note key={i}>
          <Date>{n.date}</Date>
          <Title $placeholder={n.placeholder}>{n.title}</Title>
        </Note>
      ))}
    </Aside>
  );
}
