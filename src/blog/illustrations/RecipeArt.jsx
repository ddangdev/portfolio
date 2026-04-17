// Recipe illustration — steaming bowl.
export default function RecipeArt({ size = 200 }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="steaming bowl illustration"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* bowl */}
        <path d="M35 120 Q35 175 100 175 Q165 175 165 120" fill="#F4A27D" />
        <ellipse cx="100" cy="120" rx="65" ry="14" fill="#D67452" />
        {/* contents */}
        <circle cx="80" cy="115" r="8" fill="#FFE5A0" stroke="none" />
        <circle cx="105" cy="112" r="6" fill="#6F8A5A" stroke="none" />
        <circle cx="120" cy="116" r="7" fill="#FFE5A0" stroke="none" />
        {/* chopsticks */}
        <line x1="60" y1="70" x2="110" y2="110" strokeWidth="3" />
        <line x1="70" y1="65" x2="115" y2="108" strokeWidth="3" />
        {/* steam */}
        <path d="M85 90 q-3 -12 3 -22 q3 -8 -2 -16" stroke="#D67452" strokeWidth="1.5" />
        <path d="M100 85 q3 -10 -2 -20 q-3 -8 2 -14" stroke="#D67452" strokeWidth="1.5" />
        <path d="M115 88 q-2 -11 3 -20 q2 -7 -2 -14" stroke="#D67452" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
