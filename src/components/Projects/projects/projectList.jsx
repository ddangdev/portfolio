import LucasExperience from './lucas/LucasExperience';
import CafeDock from './dock/CafeDock';

// Registry of projects shown in the Projects section carousel.
// Add new entries here — they automatically appear with dots and navigate via
// the section-level arrows.

const projectList = [
  {
    id: 'lucas',
    name: "luca's",
    label: "luca's — food & beverage menu",
    description: 'a fictional restaurant menu presented as a deck of tarot cards. drag to dismiss and discover the next dish.',
    tech: ['react', 'react-spring', 'pointer events'],
    component: LucasExperience,
  },
  {
    id: 'cafe-dock',
    name: 'cafe dock',
    label: 'cafe dock — react-spring magnification demo',
    description: 'a macOS-style magnifier dock reimagined as a cafe menu. icons grow toward your cursor, click to see details and preparation.',
    tech: ['react', 'react-spring', 'svg'],
    component: CafeDock,
  },
];

export default projectList;
