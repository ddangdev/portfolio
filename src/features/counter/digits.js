/* ddanghnl-site: the counter's digits. Drawn on the clock's 5 x 7 dot grid, one string per row,
   '#' lit and '.' dark - after Doto, the clock's typeface, so the two read as one board. */

export const COLS = 5;
export const ROWS = 7;

export const DIGITS = {
  0: ['..#..', '.#.#.', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  1: ['..#..', '.##..', '#.#..', '..#..', '..#..', '..#..', '#####'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
};

/* The dots of a two-digit number, lit or dark, read digit by digit, row by row. */
export function dotsFor(n) {
  return String(n).padStart(2, '0').split('').flatMap((d) => DIGITS[d].join('').split('').map((c) => c === '#'));
}
