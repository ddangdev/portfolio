// Simple original line-art cafe icons for the dock project.
// All use stroke="currentColor" so they inherit the dock's color,
// viewBox 0 0 60 60 for consistent sizing.

const SHARED = {
  viewBox: '0 0 60 60',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const Espresso = () => (
  <svg {...SHARED}>
    {/* Short small cup */}
    <path d="M 19 28 L 21 43 Q 22 46 25 46 L 34 46 Q 37 46 38 43 L 40 28 Z" />
    <path d="M 19 28 L 40 28" />
    {/* Saucer */}
    <path d="M 14 48 L 45 48" />
    {/* Handle */}
    <path d="M 40 31 Q 46 33 44 39 Q 42 41 40 40" />
  </svg>
);

export const Latte = () => (
  <svg {...SHARED}>
    {/* Tall cup */}
    <path d="M 19 22 L 21 46 Q 22 50 26 50 L 34 50 Q 38 50 39 46 L 41 22 Z" />
    <path d="M 19 22 L 41 22" />
    <path d="M 14 52 L 46 52" />
    {/* Handle */}
    <path d="M 41 28 Q 47 30 45 38 Q 43 40 41 39" />
    {/* Three steam wisps rising */}
    <path d="M 25 14 Q 26 10 24 7" />
    <path d="M 30 14 Q 31 10 29 7" />
    <path d="M 35 14 Q 36 10 34 7" />
  </svg>
);

export const Cappuccino = () => (
  <svg {...SHARED}>
    {/* Cup */}
    <path d="M 19 26 L 21 44 Q 22 48 26 48 L 34 48 Q 38 48 39 44 L 41 26 Z" />
    <path d="M 14 50 L 46 50" />
    {/* Handle */}
    <path d="M 41 32 Q 47 34 45 40 Q 43 42 41 41" />
    {/* Foam dome — wavy line over the top */}
    <path d="M 19 26 Q 22 18 27 23 Q 30 18 33 23 Q 38 18 41 26" />
  </svg>
);

export const ColdBrew = () => (
  <svg {...SHARED}>
    {/* Straight-sided cup (no handle) */}
    <path d="M 21 20 L 23 48 Q 24 52 28 52 L 33 52 Q 37 52 38 48 L 40 20 Z" />
    <path d="M 21 20 L 40 20" />
    {/* Straw sticking out */}
    <path d="M 35 10 L 31 36" />
    {/* Ice cubes — two little crosses */}
    <path d="M 24 32 L 28 36 M 28 32 L 24 36" />
    <path d="M 34 40 L 37 43 M 37 40 L 34 43" />
  </svg>
);

export const Matcha = () => (
  <svg {...SHARED}>
    {/* Cup */}
    <path d="M 19 26 L 21 44 Q 22 48 26 48 L 34 48 Q 38 48 39 44 L 41 26 Z" />
    <path d="M 14 50 L 46 50" />
    {/* Handle */}
    <path d="M 41 32 Q 47 34 45 40 Q 43 42 41 41" />
    {/* Leaf accent above */}
    <path d="M 30 18 Q 22 14 24 7 Q 30 9 30 18 Q 30 9 36 7 Q 38 14 30 18 Z" />
    <path d="M 30 9 L 30 18" />
  </svg>
);

export const Croissant = () => (
  <svg {...SHARED}>
    {/* Crescent outline */}
    <path d="M 10 42 Q 8 22 28 14 Q 50 20 50 42 Q 42 32 30 30 Q 18 32 10 42 Z" />
    {/* Lamination lines */}
    <path d="M 22 28 L 25 22" />
    <path d="M 30 27 L 30 20" />
    <path d="M 38 28 L 35 22" />
  </svg>
);

export const Donut = () => (
  <svg {...SHARED}>
    <circle cx="30" cy="30" r="19" />
    <circle cx="30" cy="30" r="6" />
    {/* Sprinkles */}
    <path d="M 20 18 L 18 22" />
    <path d="M 40 20 L 42 16" />
    <path d="M 42 38 L 46 40" />
    <path d="M 18 40 L 20 44" />
  </svg>
);

export const Muffin = () => (
  <svg {...SHARED}>
    {/* Rounded dome top */}
    <path d="M 14 32 Q 14 13 30 13 Q 46 13 46 32" />
    {/* Flared paper liner */}
    <path d="M 14 32 L 17 52 L 43 52 L 46 32 Z" />
    {/* Vertical flutes on the liner */}
    <path d="M 22 34 L 23 50" />
    <path d="M 30 34 L 30 52" />
    <path d="M 38 34 L 37 50" />
  </svg>
);

export const Cookie = () => (
  <svg {...SHARED}>
    <circle cx="30" cy="30" r="20" />
    {/* Chocolate chip dots */}
    <circle cx="22" cy="24" r="2.5" fill="currentColor" stroke="none" />
    <circle cx="37" cy="22" r="2.5" fill="currentColor" stroke="none" />
    <circle cx="27" cy="36" r="2.5" fill="currentColor" stroke="none" />
    <circle cx="39" cy="37" r="2.5" fill="currentColor" stroke="none" />
  </svg>
);

export const Bagel = () => (
  <svg {...SHARED}>
    {/* Outer ring */}
    <circle cx="30" cy="30" r="20" />
    {/* Wider inner hole */}
    <circle cx="30" cy="30" r="9" />
    {/* Sesame seeds on top */}
    <circle cx="22" cy="17" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="28" cy="14" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="34" cy="14" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="40" cy="17" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="30" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const cafeIconList = [
  {
    id: 'espresso', name: 'espresso', Icon: Espresso, price: 3.00,
    ingredients: ['finely ground beans', 'hot water'],
    preparation: 'pulled under pressure, 25\u201330 second extraction. served neat.',
  },
  {
    id: 'latte', name: 'latte', Icon: Latte, price: 5.00,
    ingredients: ['espresso', 'steamed milk', 'microfoam'],
    preparation: 'double shot pulled, milk textured to silky microfoam, poured to meet.',
  },
  {
    id: 'cappuccino', name: 'cappuccino', Icon: Cappuccino, price: 5.00,
    ingredients: ['espresso', 'steamed milk', 'thick foam'],
    preparation: 'double shot with equal parts steamed milk and foam \u2014 one third each.',
  },
  {
    id: 'cold-brew', name: 'cold brew', Icon: ColdBrew, price: 5.00,
    ingredients: ['coarse ground coffee', 'cold water'],
    preparation: 'steeped cold for ~18 hours, strained, served over ice.',
  },
  {
    id: 'matcha', name: 'matcha', Icon: Matcha, price: 6.00,
    ingredients: ['ceremonial matcha powder', 'hot water', 'steamed milk'],
    preparation: 'sifted, whisked smooth with bamboo chasen, poured over warm milk.',
  },
  {
    id: 'croissant', name: 'croissant', Icon: Croissant, price: 4.00,
    ingredients: ['butter', 'flour', 'yeast', 'salt', 'sugar'],
    preparation: 'laminated dough, folded in thirds, proofed overnight, baked until golden.',
  },
  {
    id: 'donut', name: 'donut', Icon: Donut, price: 3.00,
    ingredients: ['flour', 'sugar', 'yeast', 'egg'],
    preparation: 'proofed, deep fried, glazed while warm.',
  },
  {
    id: 'muffin', name: 'muffin', Icon: Muffin, price: 4.00,
    ingredients: ['flour', 'sugar', 'baking powder', 'butter', 'egg'],
    preparation: 'mixed just to combined \u2014 never overworked \u2014 baked at 400\u00b0F.',
  },
  {
    id: 'cookie', name: 'cookie', Icon: Cookie, price: 3.00,
    ingredients: ['butter', 'brown sugar', 'flour', 'chocolate chips', 'sea salt'],
    preparation: 'creamed, chilled overnight, baked 350\u00b0F until edges set.',
  },
  {
    id: 'bagel', name: 'bagel', Icon: Bagel, price: 4.00,
    ingredients: ['flour', 'yeast', 'malt', 'salt', 'sesame seeds'],
    preparation: 'shaped and rested, boiled briefly, topped, baked on a stone.',
  },
];
