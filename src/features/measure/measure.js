/* ddanghnl-site: analytics, through Google Analytics 4 (owner's call, 2026-11-02). Named `measure`,
   not `analytics`: a path ending in analytics.js is on every tracker-blocker list, and in development
   (one file per module) Chrome with a blocker refused the module and the whole app fell over (2026-11-04). The site is one
   page whose address never changes - the pop-ups, the projects, the wheel are all state - so GA4 on
   its own would see one page view a visit and nothing else. Everything of interest is sent from here
   by hand instead:
     page_view       a page or project shown in the pop-up (and the wheel itself, on arrival), with a
                     made-up location (`/#name`) so GA4's pages report reads as if each had its own
     page_open       the pop-up opened, and how: the wheel's name, the preview, or the Enter key
     page_close      the pop-up closed
     page_link       a page gone to from inside the pop-up: a link in the words, a work dot, or a note
     page_back       the back arrow, along the trail of links
     page_step       the arrows at the sides (or the left and right keys)
     nav_click       a name in the nav
     wheel_turn      the wheel turned by hand: a drag, a flick, or a tap on another name
     work_dot        a project's dot on the work page opened, or picked up to see its name
     service_pick    a service disc chosen (or let go of)
     services_spin   a ring of the services' orbit spun by hand
     contact_submit  the contact form sent off to the mail app
   The measurement ID comes from the build (`VITE_GA_ID`, see .env.example): without one nothing is
   loaded and nothing is sent - in development each event is printed to the console instead, to be
   checked. GA4's own first page view is turned off (`send_page_view: false`): the arrival is sent as
   a page_view of the wheel, like the rest, so every view goes through one path. */

const ID = import.meta.env.VITE_GA_ID;
const DEV = import.meta.env.DEV;

// the location sent for a page: the site's address with the page's name on the end, as a hash. GA4
// reads the path and the hash into its pages report
// (also the hash a page answers to on arrival: see Wheel.jsx)
export const slug = (name) => name.normalize('NFD').replace(/[̀-ͯʻ]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
const where = (name) => `${location.origin}${location.pathname}${name === 'home' ? '' : `#${slug(name)}`}`;

// gtag's loader, the way Google writes it, once per page
export const init = () => {
  if (!ID || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };   // eslint-disable-line prefer-rest-params
  window.gtag('js', new Date());
  window.gtag('config', ID, { send_page_view: false });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ID)}`;
  document.head.appendChild(s);
};

// an event, with its parameters (names snake_case, values short: GA4's limits are 40 and 100 characters)
export const track = (name, params = {}) => {
  if (!ID) { if (DEV) console.debug('[analytics]', name, params); return; }
  window.gtag?.('event', name, params);
};

// a page shown: a pop-up's page or project, or 'home' - the wheel - on arrival
export const view = (page) => {
  const name = typeof page === 'string' ? page : page.name;
  track('page_view', {
    page_title: name,
    page_location: where(name),
    content_group: page.project ? 'project' : page.note ? 'note' : 'page',
    ...(page.kind ? { project_kind: page.kind } : {}),
  });
};
