// Process illustration — potted plant + sun (growth & making family).
export default function ProcessArt({ size = 200 }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="potted plant illustration"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M55 130 L70 180 L130 180 L145 130 Z" fill="#D67452" />
        <line x1="55" y1="130" x2="145" y2="130" strokeWidth="2.5" />
        <ellipse cx="100" cy="130" rx="42" ry="6" fill="#4A2E1F" />
        <path d="M100 130 Q100 100 100 70" strokeWidth="2.5" />
        <path d="M100 100 Q70 90 60 60" fill="#6F8A5A" strokeWidth="2" />
        <path d="M100 95 Q130 80 140 50" fill="#6F8A5A" strokeWidth="2" />
        <path d="M100 75 Q85 60 90 40" fill="#6F8A5A" strokeWidth="2" />
        <circle cx="160" cy="50" r="14" fill="#FFE5A0" />
        <line x1="160" y1="28" x2="160" y2="34" />
        <line x1="180" y1="50" x2="186" y2="50" />
        <line x1="175" y1="35" x2="180" y2="30" />
      </g>
    </svg>
  );
}
