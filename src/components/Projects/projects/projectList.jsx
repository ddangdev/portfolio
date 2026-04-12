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
    component: LucasExperience,
  },
  {
    id: 'cafe-dock',
    name: 'cafe dock',
    label: 'cafe dock — react-spring magnification demo',
    component: CafeDock,
  },
];

export default projectList;
