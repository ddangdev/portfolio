/* Every GA4 event the page fires, named once. The names that existed on the old site are kept so
   reports stay continuous (cta_start_project, work_visit_click, service_select, form_unsure, generate_lead). */
import { track } from './track';

export const EVENTS = {
  startProject: 'cta_start_project',
  email: 'cta_email',
  workVisit: 'work_visit_click',
  serviceSelect: 'service_select',
  unsure: 'form_unsure',
  lead: 'generate_lead',
  leadError: 'lead_error',
};

/** location: 'nav' | 'hero' */
export const trackStartProject = (location) => track(EVENTS.startProject, { location });

/** location: 'nav' | 'mail_tile' | 'send_error' */
export const trackEmail = (location) => track(EVENTS.email, { location });

export const trackWorkVisit = (url) => track(EVENTS.workVisit, { url });

/** service: 'website' | 'gbp' | 'analytics' */
export const trackServiceSelect = (service) => track(EVENTS.serviceSelect, { service });

export const trackUnsure = () => track(EVENTS.unsure);

export const trackLead = () => track(EVENTS.lead, { form: 'intake' });

/** reason: 'server' | 'network' | 'spam_check' */
export const trackLeadError = (reason) => track(EVENTS.leadError, { reason });
