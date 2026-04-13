import LucasExperience from './lucas/LucasExperience';
import CafeDock from './dock/CafeDock';
import PokeExperience from './poke/PokeExperience';

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
    description: 'a macOS-style magnifier dock reimagined as a cafe menu. explore the icons to see details and preparation for each drink.',
    tech: ['react', 'react-spring', 'svg'],
    component: CafeDock,
  },
  {
    id: 'poke',
    name: 'the poke bar',
    label: 'the poke bar — build-a-bowl ordering flow',
    description: 'a fictional poke counter where you tap ingredients to build your bowl. receipt updates live with running total and animated line items.',
    tech: ['react', 'react-spring', 'styled-components'],
    component: PokeExperience,
  },
];

export default projectList;
