/* Things the studio makes for itself, shown as they really are. */
import shmeep from '../assets/own/shmeep-feature-banner.webp';
import shmeep640 from '../assets/own/shmeep-feature-banner-640w.webp';

export const ownProjects = [
  {
    id: 'shmeep',
    name: 'shmeep',
    tag: 'design render',
    thumbVariant: 'white',
    description: 'an RSVP app for small plans. one link in the group chat; friends tap in, out or maybe.',
    status: 'in the works · paused',
    live: false,
    image: {
      src: shmeep,
      srcSet: `${shmeep640} 640w, ${shmeep} 1024w`,
      width: 1024,
      height: 500,
      alt: 'shmeep brand banner: one link, everyone answers, nobody downloads anything',
    },
  },
];
