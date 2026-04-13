// Original line-art icons for the poke bar — all simple SVGs.
// stroke=currentColor so they inherit color from the parent.

const SHARED = {
  viewBox: '0 0 60 60',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 3.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

// Bowl with grains pattern on top — for both rice variants
function BowlWithGrains() {
  return (
    <svg {...SHARED}>
      <path d="M 12 30 Q 30 22 48 30 L 44 46 Q 30 52 16 46 Z" />
      <path d="M 12 30 L 48 30" />
      {/* grains */}
      <ellipse cx="22" cy="27" rx="2" ry="1" />
      <ellipse cx="30" cy="25" rx="2" ry="1" />
      <ellipse cx="38" cy="27" rx="2" ry="1" />
    </svg>
  );
}

export const WhiteRice = BowlWithGrains;

export function BrownRice() {
  // Same bowl shape, with filled grain dots to suggest darker grain
  return (
    <svg {...SHARED}>
      <path d="M 12 30 Q 30 22 48 30 L 44 46 Q 30 52 16 46 Z" />
      <path d="M 12 30 L 48 30" />
      <ellipse cx="22" cy="27" rx="2" ry="1" fill="currentColor" />
      <ellipse cx="30" cy="25" rx="2" ry="1" fill="currentColor" />
      <ellipse cx="38" cy="27" rx="2" ry="1" fill="currentColor" />
    </svg>
  );
}

// Ahi — fish silhouette with tail
export function Ahi() {
  return (
    <svg {...SHARED}>
      <path d="M 12 30 Q 22 18 38 22 Q 48 26 50 30 Q 48 34 38 38 Q 22 42 12 30 Z" />
      <path d="M 50 30 L 56 24 L 54 30 L 56 36 Z" />
      <circle cx="40" cy="28" r="1.5" fill="currentColor" />
      <path d="M 30 25 Q 32 28 30 31" />
    </svg>
  );
}

// Salmon — different fish shape, slightly more rounded
export function Salmon() {
  return (
    <svg {...SHARED}>
      <path d="M 10 30 Q 18 16 36 18 Q 50 22 52 30 Q 50 38 36 42 Q 18 44 10 30 Z" />
      <path d="M 52 30 L 58 26 L 58 34 Z" />
      <circle cx="42" cy="27" r="1.5" fill="currentColor" />
      {/* Stripe pattern down the side */}
      <path d="M 22 27 Q 30 25 38 28" />
      <path d="M 22 33 Q 30 35 38 32" />
    </svg>
  );
}

// Tofu — soft cube
export function Tofu() {
  return (
    <svg {...SHARED}>
      {/* front face */}
      <path d="M 14 22 L 38 22 L 38 46 L 14 46 Z" />
      {/* top face (perspective) */}
      <path d="M 14 22 L 22 16 L 46 16 L 38 22" />
      {/* right face */}
      <path d="M 38 22 L 46 16 L 46 40 L 38 46" />
    </svg>
  );
}

// Avocado — half avocado with pit
export function Avocado() {
  return (
    <svg {...SHARED}>
      <path d="M 30 12 Q 18 16 16 32 Q 16 46 30 50 Q 44 46 44 32 Q 42 16 30 12 Z" />
      <circle cx="30" cy="32" r="6" fill="currentColor" />
    </svg>
  );
}

// Edamame — pod with 3 beans visible
export function Edamame() {
  return (
    <svg {...SHARED}>
      <path d="M 12 30 Q 12 18 30 16 Q 48 18 48 30 Q 48 42 30 44 Q 12 42 12 30 Z" />
      <circle cx="22" cy="30" r="4" />
      <circle cx="30" cy="30" r="4" />
      <circle cx="38" cy="30" r="4" />
    </svg>
  );
}

// Seaweed — wavy strand
export function Seaweed() {
  return (
    <svg {...SHARED}>
      <path d="M 18 12 Q 14 22 18 30 Q 22 38 18 48" />
      <path d="M 30 12 Q 26 22 30 30 Q 34 38 30 48" />
      <path d="M 42 12 Q 38 22 42 30 Q 46 38 42 48" />
      {/* base line */}
      <path d="M 12 50 L 48 50" />
    </svg>
  );
}

// Shoyu — soy sauce bottle
export function Shoyu() {
  return (
    <svg {...SHARED}>
      {/* bottle body */}
      <path d="M 22 22 L 22 48 Q 22 52 26 52 L 34 52 Q 38 52 38 48 L 38 22" />
      {/* bottle neck + cap */}
      <path d="M 25 22 L 25 14 L 35 14 L 35 22" />
      <path d="M 24 14 L 36 14" />
      {/* label */}
      <path d="M 24 32 L 36 32" />
      <path d="M 24 38 L 36 38" />
    </svg>
  );
}

// Spicy mayo — squeeze bottle with squiggle
export function SpicyMayo() {
  return (
    <svg {...SHARED}>
      {/* bottle */}
      <path d="M 22 24 L 22 50 Q 22 54 26 54 L 34 54 Q 38 54 38 50 L 38 24" />
      <path d="M 26 24 L 26 18 L 34 18 L 34 24" />
      {/* nozzle */}
      <path d="M 28 18 L 30 12 L 32 18" />
      {/* squiggle / drip */}
      <path d="M 30 9 Q 32 6 30 4" />
    </svg>
  );
}

// ── Item registry ───────────────────────────────────────────────
// Each item: id, name, price, category (for grouping in the grid),
// Icon component, short description for tooltip / receipt.

export const pokeMenu = [
  // Bases
  { id: 'white-rice',  name: 'white rice',  price: 4.00, category: 'base',    Icon: WhiteRice },
  { id: 'brown-rice',  name: 'brown rice',  price: 4.00, category: 'base',    Icon: BrownRice },
  // Proteins
  { id: 'ahi',         name: 'ahi',         price: 9.00, category: 'protein', Icon: Ahi },
  { id: 'salmon',      name: 'salmon',      price: 9.00, category: 'protein', Icon: Salmon },
  { id: 'tofu',        name: 'tofu',        price: 7.00, category: 'protein', Icon: Tofu },
  // Toppings
  { id: 'avocado',     name: 'avocado',     price: 2.00, category: 'topping', Icon: Avocado },
  { id: 'edamame',     name: 'edamame',     price: 2.00, category: 'topping', Icon: Edamame },
  { id: 'seaweed',     name: 'seaweed',     price: 2.00, category: 'topping', Icon: Seaweed },
  // Sauces
  { id: 'shoyu',       name: 'shoyu',       price: 0.50, category: 'sauce',   Icon: Shoyu },
  { id: 'spicy-mayo',  name: 'spicy mayo',  price: 0.50, category: 'sauce',   Icon: SpicyMayo },
];
