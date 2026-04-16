// Case study illustration — layered receipt/document cards.
// Uses currentColor for stroke so the parent .illo can swap it per theme.
export default function CaseStudyArt({ size = 220 }) {
  return (
    <svg
      viewBox="0 0 320 240"
      width={size}
      height={size * (240 / 320)}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="layered cards illustration"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="80" y="50" width="150" height="170" rx="4" fill="#FFE5A0" transform="rotate(-7 155 135)" />
        <rect x="100" y="60" width="150" height="170" rx="4" fill="#F4A27D" transform="rotate(2 175 145)" />
        <rect x="120" y="70" width="150" height="170" rx="4" fill="#FBF5EE" />
        <line x1="138" y1="100" x2="252" y2="100" />
        <line x1="138" y1="120" x2="220" y2="120" />
        <line x1="138" y1="140" x2="240" y2="140" />
        <line x1="138" y1="160" x2="200" y2="160" />
        <line x1="138" y1="190" x2="252" y2="190" stroke="#D67452" />
        <circle cx="160" cy="50" r="3" fill="#D67452" stroke="none" />
        <path d="M155 38 q5 -8 10 0" stroke="#D67452" />
      </g>
    </svg>
  );
}
