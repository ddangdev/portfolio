// Recipe illustration — steaming rice bowl.
// Hover (index): chopsticks pick up egg, steam starts rising.
// autoPlay (post page): egg bobs, steam rises continuously.
// Default (no hover, no autoPlay): everything frozen.

export default function RecipeArt({ size = 200, autoPlay = false }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="steaming rice bowl illustration"
    >
      <style>{`
        /* keyframes always defined; only applied when active */
        @keyframes steam-rise-1 {
          0%   { stroke-dashoffset: 45; }
          100% { stroke-dashoffset: -45; }
        }
        @keyframes steam-rise-2 {
          0%   { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: -40; }
        }
        @keyframes steam-rise-3 {
          0%   { stroke-dashoffset: 42; }
          100% { stroke-dashoffset: -42; }
        }

        /* default: steam hidden (dashoffset = full length) */
        .steam-1 { stroke-dasharray: 10 35; stroke-dashoffset: 45; }
        .steam-2 { stroke-dasharray: 12 28; stroke-dashoffset: 40; }
        .steam-3 { stroke-dasharray: 9 33; stroke-dashoffset: 42; }

        ${autoPlay ? `
          /* autoPlay: steam animates, egg bobs */
          .steam-1 { animation: steam-rise-1 2.8s linear infinite; }
          .steam-2 { animation: steam-rise-2 3.2s linear infinite; animation-delay: -1.1s; }
          .steam-3 { animation: steam-rise-3 2.5s linear infinite; animation-delay: -0.5s; }
          @keyframes egg-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .grab-auto { animation: egg-bob 3.5s ease-in-out infinite; }
        ` : ''}
      `}</style>

      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* bowl body */}
        <path d="M35 120 Q35 175 100 175 Q165 175 165 120" fill="#F4A27D" />

        {/* bowl decoration — simple wave band, reads clean at any size */}
        <path d="M52 148 q12 -5 24 0 q12 5 24 0 q12 -5 24 0 q12 5 24 0"
              stroke="#D67452" strokeWidth="1.5" fill="none" opacity="0.5" />

        {/* rice surface — inside the bowl, no border, overlaps rim naturally */}
        <ellipse cx="100" cy="119" rx="55" ry="9" fill="#FBF5EE" stroke="none" />

        {/* green onion — diagonal scattered slices, like chopped scallion */}
        <ellipse cx="116" cy="115" rx="7" ry="3" fill="#6F8A5A" stroke="none" transform="rotate(-30 116 115)" />
        <ellipse cx="78" cy="117" rx="6" ry="2.5" fill="#7A9A64" stroke="none" transform="rotate(20 78 117)" />
        <ellipse cx="105" cy="118" rx="5" ry="2" fill="#6F8A5A" stroke="none" transform="rotate(-15 105 118)" />
        <ellipse cx="130" cy="118" rx="4" ry="2" fill="#7A9A64" stroke="none" transform="rotate(35 130 118)" />

        {/* bowl rim — stroke only, drawn on top so it clips the rice edges */}
        <ellipse cx="100" cy="120" rx="65" ry="14" fill="none" stroke="currentColor" strokeWidth="2.5" />

        {/* chopsticks + egg — lifts on hover / bobs on autoPlay */}
        <g className={`illo-grab ${autoPlay ? 'grab-auto' : ''}`}
           style={!autoPlay ? { transition: 'transform 0.4s ease-out' } : undefined}>
          {/* back chopstick */}
          <line x1="50" y1="58" x2="90" y2="106" strokeWidth="3" />
          {/* egg */}
          <ellipse cx="95" cy="108" rx="16" ry="11" fill="#FFFFFF" stroke="none" />
          <ellipse cx="95" cy="107" rx="6" ry="5" fill="#FFE5A0" stroke="none" />
          {/* front chopstick */}
          <line x1="65" y1="52" x2="100" y2="106" strokeWidth="3" />
        </g>

        {/* steam — hidden by default, parent :hover or autoPlay activates.
            className "illo-steam" lets parent Card trigger via CSS too. */}
        <g className="illo-steam">
          <path className="steam-1"
                d="M80 98 q-4 -10 2 -20 q4 -8 -1 -18 q-3 -6 1 -12"
                stroke="#D67452" strokeWidth="1.5" fill="none" opacity="0.7" />
          <path className="steam-2"
                d="M100 94 q3 -8 -1 -18 q-4 -8 1 -16 q3 -5 0 -10"
                stroke="#D67452" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path className="steam-3"
                d="M120 96 q-3 -9 2 -18 q3 -7 -1 -15 q-2 -5 1 -10"
                stroke="#D67452" strokeWidth="1.5" fill="none" opacity="0.65" />
        </g>
      </g>
    </svg>
  );
}
