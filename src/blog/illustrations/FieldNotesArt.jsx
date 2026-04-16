// Field notes illustration — crescent moon + stars (quiet observations family).
export default function FieldNotesArt({ size = 200 }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="crescent moon and stars illustration"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M120 60 a55 55 0 1 0 0 90 a40 40 0 1 1 0 -90 z" fill="#FFE5A0" />
        <circle cx="105" cy="90" r="4" fill="#D67452" stroke="none" />
        <circle cx="95" cy="120" r="3" fill="#D67452" stroke="none" />
        <circle cx="115" cy="135" r="2.5" fill="#D67452" stroke="none" />
        <g stroke="#D67452">
          <line x1="40" y1="60" x2="46" y2="60" />
          <line x1="43" y1="57" x2="43" y2="63" />
          <line x1="60" y1="100" x2="64" y2="100" />
          <line x1="62" y1="98" x2="62" y2="102" />
          <line x1="170" y1="160" x2="176" y2="160" />
          <line x1="173" y1="157" x2="173" y2="163" />
          <circle cx="50" cy="160" r="2" fill="#F4A27D" stroke="none" />
        </g>
      </g>
    </svg>
  );
}
