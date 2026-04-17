// Behind the counter illustration — restaurant order ticket + pencil.
export default function BehindTheCounterArt({ size = 200 }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="order ticket illustration"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* ticket */}
        <rect x="50" y="30" width="100" height="140" rx="4" fill="#FBF5EE" />
        {/* perforated top edge */}
        <path d="M55 45 h90" strokeDasharray="4 4" strokeWidth="1" />
        {/* lines on ticket */}
        <line x1="65" y1="65" x2="135" y2="65" />
        <line x1="65" y1="82" x2="120" y2="82" />
        <line x1="65" y1="99" x2="130" y2="99" />
        <line x1="65" y1="116" x2="105" y2="116" />
        {/* total line */}
        <line x1="65" y1="140" x2="135" y2="140" stroke="#D67452" strokeWidth="2.5" />
        {/* pencil */}
        <g transform="rotate(-30 160 60)">
          <rect x="148" y="20" width="8" height="80" rx="1" fill="#FFE5A0" />
          <polygon points="148,100 152,112 156,100" fill="#D67452" />
          <rect x="148" y="20" width="8" height="8" rx="1" fill="#F4A27D" />
        </g>
      </g>
    </svg>
  );
}
