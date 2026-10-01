/* Live client work: one record per WorkTile. Images are imported so Vite hashes them into /assets/. */
import noriDesk from '../assets/work/noribar-desktop-hero.webp';
import noriDesk800 from '../assets/work/noribar-desktop-hero-800w.webp';
import noriPhone from '../assets/work/noribar-phone-hero.webp';
import noriPhone390 from '../assets/work/noribar-phone-hero-390w.webp';
import maniDesk from '../assets/work/manipedispa-desktop-hero.webp';
import maniDesk800 from '../assets/work/manipedispa-desktop-hero-800w.webp';
import maniPhone from '../assets/work/manipedispa-phone-hero.webp';
import maniPhone390 from '../assets/work/manipedispa-phone-hero-390w.webp';

export const work = [
  {
    id: 'nori',
    tileClass: 'b-nori',
    headingId: 'c1-h',
    number: '01',
    name: 'Nori Bar Hawaii',
    category: 'sushi hand roll bar · Ward and Waikiki',
    liveSince: 'Sept 2026',
    url: 'https://noribarhawaii.com',
    domain: 'noribarhawaii.com',
    description: 'a custom six-page site for two Honolulu locations.',
    eager: true,
    desktop: {
      src: noriDesk,
      srcSet: `${noriDesk800} 800w, ${noriDesk} 1440w`,
      width: 1440,
      height: 900,
      alt: "Nori Bar Hawaii home page on desktop: Hawaii's premium sushi handroll bar, with menu, reserve and order buttons",
    },
    phone: {
      src: noriPhone,
      srcSet: `${noriPhone390} 390w, ${noriPhone} 780w`,
      width: 780,
      height: 1688,
      alt: 'Nori Bar Hawaii home page on a phone',
    },
  },
  {
    id: 'mani',
    tileClass: 'b-mani',
    headingId: 'c2-h',
    number: '02',
    name: 'Mani Pedi Spa',
    category: 'nail salon · Ala Moana Center',
    liveSince: 'May 2026',
    url: 'https://manipedihnl.com',
    domain: 'manipedihnl.com',
    description: 'a phone-first site where the menu is the website.',
    eager: false,
    desktop: {
      src: maniDesk,
      srcSet: `${maniDesk800} 800w, ${maniDesk} 1440w`,
      width: 1440,
      height: 900,
      alt: 'Mani Pedi Spa home page on desktop: walk in, leave glowing, with a book by phone button',
    },
    phone: {
      src: maniPhone,
      srcSet: `${maniPhone390} 390w, ${maniPhone} 780w`,
      width: 780,
      height: 1688,
      alt: 'Mani Pedi Spa home page on a phone',
    },
  },
];
