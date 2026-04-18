// Bites illustration — chopsticks holding a dumpling.
// autoPlay: gentle ambient loop (dumpling lifts and lowers, steam drifts).

export default function BitesArt({ size = 200, autoPlay = false }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="chopsticks and dumpling illustration"
    >
      {autoPlay && (
        <style>{`
          @keyframes bites-lift {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes bites-steam {
            0%, 100% { transform: translateY(0); opacity: 1; }
            50% { transform: translateY(-4px); opacity: 0.5; }
          }
        `}</style>
      )}
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <g className="illo-grab" style={{
          transition: 'transform 0.4s ease-out',
          ...(autoPlay && { animation: 'bites-lift 3.5s ease-in-out infinite' }),
        }}>
          <line x1="55" y1="30" x2="105" y2="110" strokeWidth="3" />
          <line x1="75" y1="25" x2="115" y2="108" strokeWidth="3" />
          <ellipse cx="110" cy="115" rx="28" ry="18" fill="#FFE5A0" />
          <path d="M84 110 q13 -8 26 0 q13 -8 26 0" strokeWidth="1.5" />
          <path d="M92 108 q4 -3 8 0" strokeWidth="1" />
          <path d="M104 106 q4 -3 8 0" strokeWidth="1" />
          <path d="M116 108 q4 -3 8 0" strokeWidth="1" />
        </g>
        <ellipse cx="110" cy="165" rx="50" ry="10" fill="#F4A27D" />
        <ellipse cx="110" cy="162" rx="45" ry="8" fill="#FBF5EE" />
        <ellipse cx="95" cy="158" rx="16" ry="10" fill="#FFE5A0" />
        <ellipse cx="125" cy="158" rx="16" ry="10" fill="#FFE5A0" />
        <g className="illo-steam" style={{
          transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
          ...(autoPlay && { animation: 'bites-steam 3s ease-in-out infinite' }),
        }}>
          <path d="M95 142 q-2 -8 2 -14" stroke="#D67452" strokeWidth="1" />
          <path d="M125 140 q2 -7 -1 -13" stroke="#D67452" strokeWidth="1" />
        </g>
      </g>
    </svg>
  );
}
