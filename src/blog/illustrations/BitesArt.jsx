// Bites illustration — chopsticks holding a dumpling.
export default function BitesArt({ size = 200 }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="chopsticks and dumpling illustration"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* chopstick 1 */}
        <line x1="55" y1="30" x2="105" y2="110" strokeWidth="3" />
        {/* chopstick 2 */}
        <line x1="75" y1="25" x2="115" y2="108" strokeWidth="3" />
        {/* dumpling held by chopsticks */}
        <ellipse cx="110" cy="115" rx="28" ry="18" fill="#FFE5A0" />
        <path d="M84 110 q13 -8 26 0 q13 -8 26 0" strokeWidth="1.5" />
        {/* folds on dumpling */}
        <path d="M92 108 q4 -3 8 0" strokeWidth="1" />
        <path d="M104 106 q4 -3 8 0" strokeWidth="1" />
        <path d="M116 108 q4 -3 8 0" strokeWidth="1" />
        {/* plate below */}
        <ellipse cx="110" cy="165" rx="50" ry="10" fill="#F4A27D" />
        <ellipse cx="110" cy="162" rx="45" ry="8" fill="#FBF5EE" />
        {/* two more dumplings on plate */}
        <ellipse cx="95" cy="158" rx="16" ry="10" fill="#FFE5A0" />
        <ellipse cx="125" cy="158" rx="16" ry="10" fill="#FFE5A0" />
        {/* steam */}
        <path d="M95 142 q-2 -8 2 -14" stroke="#D67452" strokeWidth="1" />
        <path d="M125 140 q2 -7 -1 -13" stroke="#D67452" strokeWidth="1" />
      </g>
    </svg>
  );
}
