/* ddanghnl-site: the pages on the wheel. Each stands on the rim as a post with its name above, at
   its own angle (degrees, clockwise), the set running round twice the way the reference's numbers
   did. In order (owner's calls, 2026-10-30 and 11-01): about, services, then work, then work's
   projects as smaller posts, then contact, then notes (added 2026-11-02). Pages stand one stop (15 degrees) apart, so the next is always in
   view. Work's projects stand on the outer band's small ticks straight after work's line: the first
   three ticks on (work's name is bigger, and nearer put nori bar's on top of it), the rest every other
   tick (3.75 degrees), so no two names touch, on a phone too (owner's call). Every angle is on a tick (multiples of 1.875). The wheel starts on
   about (a home page was tried first, and dropped as redundant).
   `preview` is what the preview screen shows for the page: a muted looping video (with a poster
   frame) or an image, from public/. `embed` is a project that runs live in its pop-up, so it can be
   played with: a copy of it in public/embed/, made by scripts/embed_projects.py. `body` is a page's
   own words in its pop-up, in order: a `lead` line, then plain paragraphs (`p`, a \n breaking a line; given as a list, its
   `{ go, text }` parts are links to another page), then any services
   (`service`, a line on it, and a `price` if it is to show one), any `links` (pages listed by name, each opening it), and an `email` with the services to ask about (`asks`),
   each opening a message about it, and a `faq` (questions, each a `q` and an `a`, the answer a list
   where it links), and `notes` (the notes listed, each by `name`, `date` and `dek`, under a `title`,
   with a `more` row on to another page); a page with an
   `article` is a note (`note: true`, a small post under notes): its `date`, `dek` and `paras`.
   `light` turns its pop-up white with black words - the pages and
   every project (owner's call, 2026-11-01). */

const HALE = { video: 'work/hale-build.mp4', poster: 'work/hale-build.jpg' };
// the studio's address, as on ddanghnl.com
const EMAIL = 'ddanghnlstudio@gmail.com';
// what the studio offers (owner's call, 2026-11-01; regrouped 2026-11-02): on services, each a disc on
// the orbit - `ring` says which ring out from the core, 0 the nearest (owner's call, 2026-11-02, the
// second that day: branding, websites and social media nearest, local visibility (getting found, until 2026-11-02) and custom video on the
// middle, ai tools alone on the outer); a `parts` list (the peripheral
// details) puts small discs on its ring - the owner brings these out one at a time (2026-11-02), starting
// from social media's monthly drop, to say it is posts, not videos. Asked about on contact.
// No prices for now (owner's call, 2026-11-02)
const SERVICES = [
  { service: 'social media', ring: 0, p: 'posts for your feeds, designed and scheduled month by month.', parts: ['monthly drop', 'icons', 'content'] },
  { service: 'websites', ring: 0, p: 'modern homepages for your customers.', parts: ['hosting', 'maintenance', 'traffic'] },
  { service: 'branding', ring: 0, p: 'reworking the look and feel of your business.', parts: ['logo', 'colors', 'type'] },
  { service: 'custom video', ring: 1, p: 'short videos and ad clips shot and cut for you. ask for anything custom.', parts: ['ai', 'promos', 'reels', 'shorts'] },
  { service: 'local visibility', ring: 1, p: 'our recommended list to help you rank on google.', parts: ['seo', 'topical authority', 'semrush', 'google analytics', 'google search console'] },
  { service: 'ai tools', ring: 2, p: 'modern-day technology for your competitive edge.', parts: ['chatbot', 'receptionist', 'sms'] },
];
// the kinds of work, each a column on work's box of dots with its own colour (owner's call, 2026-11-02):
// a project's `kind` names one
const KINDS = [
  { kind: 'websites', color: '#ea4e3d' },
  { kind: 'social media', color: '#2f6fed' },
  { kind: 'graphics', color: '#e0a100' },
  { kind: 'interactive', color: '#1aa16b' },
  { kind: 'video', color: '#8a4fd8' },
];
// work's projects: on the wheel straight after work, 3.75 degrees apart (any closer and their names
// touch on a phone), and floating as dots in work's pop-up, each in its kind's column; contact follows
// the last by a page's own gap
// each project has a line of its own under its name (`body`), written to match each
// project's own notes (the owner's nori bar line revised at his ask, 2026-11-02), for the owner to redo
const PROJECTS = [
  // the live client sites first, each filmed as a slow scroll down its homepage; then kope, say when,
  // ʻāina moana, my personal shelf, hale build, and shmeep last (owner's order, 2026-11-02)
  { name: 'nori bar', kind: 'websites', at: 35.625, project: true, light: true, body: [{ p: "a sushi hand roll bar with two homes, ward and waikiki. fresh seafood on crisp nori, rolled to order and eaten the moment it's made." }], preview: { video: 'work/noribar.mp4', poster: 'work/noribar.jpg' } },
  { name: 'mani pedi spa', kind: 'websites', at: 39.375, project: true, light: true, body: [{ p: "a nail and lash salon on level 2 of ala moana center. the whole menu online with every price the real one, built for people choosing a salon on their phone." }], preview: { video: 'work/manipedispa.mp4', poster: 'work/manipedispa.jpg' } },
  // a sample instagram feed for kope, a fictional makiki café: nine posts, flat flyers and generated
  // photos (Projects/ddanghnl/src/brand/instagram/sample-cafe); filmed as the profile scrolling on a
  // phone, on its butter yellow (scripts/film_kope.py)
  { name: 'kope', kind: 'social media', at: 43.125, project: true, light: true, body: [{ p: "a makiki café that doesn't exist. a month of posts made for it to show what a feed can look like: one red thing in every tile, every photo made from scratch." }], preview: { video: 'work/kope.mp4', poster: 'work/kope.jpg' } },
  // filmed on a stepped clock 90 s in: the cup brimming, letters already spilling off the table (Projects/hanging-book)
  { name: 'say when', kind: 'interactive', at: 46.875, project: true, light: true, body: [{ p: "a pitcher pouring letters into a cup that never gets told to stop. a small live drawing, made to be played with." }], preview: { video: 'work/say-when-spill.mp4', poster: 'work/say-when-spill.jpg' }, embed: 'embed/say-when/index.html?palette=cafe' },
  // filmed frame by frame: the island building up from the bottom, then 17 s running, then round again
  { name: 'ʻāina moana', kind: 'interactive', at: 50.625, project: true, light: true, body: [{ p: "magic island, honolulu, drawn as a field of lit dots on black and seen from straight above. the lamps come on, walkers and runners cross it. named by its hawaiian name, the one hardly anyone uses." }], preview: { video: 'work/aina-moana.mp4', poster: 'work/aina-moana.jpg' }, embed: 'embed/aina-moana/index.html' },
  // filmed live: the pointer runs along the shelf and back, opens Jujutsu Kaisen 27, scrolls to its card
  { name: 'my personal shelf', kind: 'interactive', at: 54.375, project: true, light: true, body: [{ p: "one shelf in a dark room: the studio's work as books, beside a few real ones from my own shelf. pull one out and turn it over." }], preview: { video: 'work/my-personal-shelf.mp4', poster: 'work/my-personal-shelf.jpg' }, embed: 'embed/my-personal-shelf/index.html?embed' },
  { name: 'hale build', kind: 'video', at: 58.125, project: true, light: true, body: [{ p: "a hawaiian plantation hale going up stage by stage, rendered in blender as real 3d geometry, with modern tech filling in the details." }], preview: HALE },
  // the shmeep "who's in?" poster in a bus shelter panel, composited at 3x so the poster stays sharp
  // when shown large (shmeep/design/_composite_hd.py)
  { name: 'shmeep', kind: 'graphics', at: 61.875, project: true, light: true, body: [{ p: "rsvp for small plans: make a plan, send a link, see who's in. this is its look, drawn out at a bus stop." }], preview: { image: 'work/shmeep-busstop-hd.jpg' } },
];


// the notes under the notes page, small posts after it the way the projects follow work (owner's
// call, 2026-11-02): three samples with filler words, to settle the look before the content - the
// owner writes the real ones. Each has a date, a standfirst (`dek`) and its paragraphs (a list
// where it links). Each title is a question, and the first sentence answers it straight (owner's
// call, 2026-11-02). Oldest first here; the wheel and the lists take them newest first
const NOTES = [
  { name: 'why should a site load in a second?', note: true, light: true, article: {
    date: '2026-10-14',
    dek: 'a small business site has about a second to prove it is worth the wait. most of what makes it slow was never needed.',
    paras: [
      "because the blank screen before a site appears is the first thing a visitor learns about the business. before the logo, before the words, before the photo of the storefront, there is that blank, and its length is the first impression. it is not a fair test, but it is the one everyone runs, and they run it on a phone, on the bus, on one bar of signal.",
      "most of the weight on a slow site is not the site. it is the things bolted on afterwards: a chat bubble nobody uses, three fonts where one would do, a video that plays whether anyone asked or not, scripts that measure the visitor from six directions. none of it was in the brief. all of it was easy to add, and nothing ever gets taken off, so a site that started light ends up carrying a year of good intentions.",
      "the rule i work to is simple. the page should be readable in under a second on a phone on an ordinary connection, and anything that gets in the way of that has to earn its place. usually, when you ask what a thing is for, it quietly leaves. the chat bubble becomes a phone number. the three fonts become one. the video becomes a photograph that loads before the thumb has finished scrolling.",
      "what is left is small, and small is fast without trying. a page that is mostly words and one good picture does not need clever tricks to be quick; it just needs nobody to make it slow. the trick, if there is one, is saying no early, when a thing is still an idea and not yet a line on the invoice.",
      "and speed is not a technical nicety. a site that shows up at once feels like a business that answers the phone. the visitor has not read a word yet, and they already trust you a little more than the place that made them wait.",
    ] } },
  { name: 'why make up a café?', note: true, light: true, article: {
    date: '2026-10-28',
    dek: 'to show what a month of posts can look like, i made the café up. it turned out to be the honest way to do it.',
    paras: [
      "to show social media work without borrowing a real business. the trouble with real work is that it belongs to someone: a real café has a real owner, who did not ask to be a sample, and their photos are theirs. you can ask, and sometimes they say yes, but then the work on your page is a favour, and it goes stale the first time they change the menu.",
      "so for the studio's own feed i invented one: a name, a handle, an address in makiki, a short menu of drinks with names that sound right, and a month of posts for it. the stamp on the cups, the handwriting on the specials board, the hours on the door. enough of a place that you could almost go.",
      "every photo was generated from a description alone, no reference images, so nothing in the set is borrowed from a place that exists. the rule for the tiles was one red thing in each of them, and nothing else that shouted: a red cup, a red stool, a red flower in a jar. it is surprising how much that one rule does for a grid. the feed holds together from across the room, before anyone has read a word.",
      "the posts say what posts for a café should say: what is new, what is good today, who is behind the counter, when the lilikoʻi is back. the captions are short, the hashtags are few, and nothing in them is trying too hard. that is the part that takes the longest to get right, because it looks like nothing.",
      ["the café is not real, but the approach is, and that is the part a client is buying. ", { go: "kope", text: "kope" }, " is on the work page, and the plan for a real café would be the same month, with their food in it."],
    ] } },
  { name: 'what is a menu page for?', note: true, light: true, article: {
    date: '2026-11-01',
    dek: 'a hand roll bar taught me that a menu online is not a list of food. it is the answer to one question: should i go?',
    paras: [
      "for deciding whether to come, not what to eat. when a restaurant hands over its menu for the website, it arrives as the thing printed for the table: every item, every price, the allergens, the house rules in small type. it is complete, and it is the wrong document, because nobody online is choosing a dish. they are choosing whether to come at all.",
      "what a visitor wants is the shape of the place. what kind of food, roughly what it costs, whether there is a bar, how long they might wait, whether it is the kind of room you take your parents to. the full list can sit a tap away for the people who want it; the page itself should answer the question that brought them there, in the time it takes to decide between two tabs.",
      "a hand roll bar taught me this. the first draft of their menu page was the menu, all of it, and it was long enough that the signature rolls, the reason the place exists, were below the fold on a phone. everything was there and nothing was said.",
      "so the menu page became a short one. the signature rolls first, with photographs that look like the real thing, the price range in one line, the two locations and their hours, and a button to the whole list. the dishes that make people drive across town got the room; the sides and the sodas went where they belong, behind the tap.",
      "fewer words, and more people who read them. the full menu still exists, and the people who want to know whether the rice is koshihikari can find out. but the page does its one job first: it says come, or it says not for you, and either answer is a good one.",
    ] } },
  // the first real one (owner's ask, 2026-11-02): why search matters to a business opening where
  // nobody knows it yet. Drafted for the owner to make his own
  { name: 'why does seo matter in a new town?', note: true, light: true, article: {
    date: '2026-11-02',
    dek: 'when nobody knows you yet, search is how the neighbourhood checks you out. it is the one thing that works before word of mouth does.',
    paras: [
      'because when nobody knows you, search is the only way a stranger finds you on purpose. opening a business somewhere new means starting with none of the things that usually carry a place. no regulars, no cousin who tells everyone, no years of people walking past the sign. the first customers are strangers who have to find you on purpose.',
      'they will pick up their phone. not a flyer, not the banner over the door: a search. coffee near me, nail salon ward village, is it open right now. what comes back is a map with a few names on it, their hours, a photo or two, a star rating. if you are not on that map, with the hours right and a handful of reviews, you are not there. the place that is there gets the visit, and it did not have to be better than you. it just had to be findable.',
      'this is what seo means for a small business, and none of it is a dark art. a google business profile that is filled in and kept true. a site that says where you are and what you do in the words people actually type, not the words on the business cards. hours that match the door. photos that look like the place. reviews, asked for and answered. boring, every bit of it, and done properly it compounds.',
      'the part people miss is that it has to start early. search learns slowly. reviews pile up one at a time, the map takes a while to believe you are real, and your name has to mean something to google before it means anything to the street. start on day one and it is working by the time word of mouth catches up. start a year in and you are behind places that opened after you.',
      'a new community makes all of this sharper. when a neighbourhood is still going up, the way they are out west in koa ridge and hoʻopili, the people moving in have no habits yet. they do not have a barber, a dentist, a place for friday dinner. they are searching for everything, all at once, and whoever shows up first becomes the default. that window does not stay open.',
      ['so if you are opening somewhere new, treat being found as part of the build, not something to sort out once the doors are open. it is most of what ', { go: 'services', text: 'local visibility' }, ' is at the studio, and the first three things i would do for any new place are the profile, the hours, and the first ten reviews.'],
    ] } },
  // the next two (owner's ask, 2026-11-02): being seen in honolulu in particular, and the studio's way
  // of generating pictures for a real place on higgsfield. Drafted for the owner to make his own
  { name: 'how do you get seen in honolulu?', note: true, light: true, article: {
    date: '2026-11-02',
    dek: 'honolulu is two towns on one street: the people who live here and the people visiting this week. being seen means showing up for both.',
    paras: [
      "by showing up for both of its crowds, the people who live here and the people visiting this week, in the places each one looks. honolulu is small and specific. a place in kaimukī lives off people within ten minutes of it. a shop on the ward side of kakaʻako sees as many visitors as neighbours. a café in waikīkī might not serve a local all week. the first job is knowing which one you are, because the two crowds find you in different ways, and a page built for the wrong one is a page built for nobody.",
      "locals search by neighbourhood, not by city. nobody here types honolulu. they type kaimukī, or kapahulu, or the name of the strip mall, or the shop next door that everyone already knows. the site and the map profile should say the neighbourhood plainly, the way people say it, ʻokina and all, and the street should be on the page in words and not only in a map embed that search cannot read.",
      "visitors search from a hotel room in waikīkī, a lot of them in japanese, nearly all of them on the map. for them the photos do the talking: the dish, the room, the front door, so they know the place when they reach it on foot. and the hours have to be right, every day, including the holiday you closed for, because a wasted walk in the heat turns into a review by dinner.",
      "reviews carry more weight here than most places. the island is small enough that a bad one gets read by people who know the owner, and a good one travels through a family chat in an afternoon. ask for them, at the counter, the day the customer is happiest. answer every one, the kind ones in a line, the hard ones with care. never buy them; everyone can tell.",
      "instagram counts as search in honolulu. people check the feed before they check the map, to see whether a place is alive this month and what the room looks like on a tuesday. one real photo a week is enough, as long as the feed and the map profile agree with each other about the hours, the menu and the name.",
      ["that is the shape of ", { go: "services", text: "local visibility" }, " at the studio: the profile, the neighbourhood words, the photos, the reviews, a feed that is alive. none of it costs much. all of it is work, and most of it is the kind that gets skipped."],
    ] } },
  { name: 'how do you prompt for a real dish?', note: true, light: true, article: {
    date: '2026-11-02',
    dek: 'the trick to generating pictures for a real café is not getting the model to invent. it is getting it to leave the food alone.',
    paras: [
      "by naming this exact dish, and telling the model it may change only the photography. when i mock up a feed or a site for a café, the photos are the problem. the owner's phone pictures are honest and badly lit. a stock photo is well lit and a lie. the middle path i have landed on is to re-light the owner's own photos with an image model, so the dish stays theirs and only the photography changes.",
      "the tool is higgsfield, running gpt image 2.5, with the owner's photo given as the reference. the prompt is where it lives or dies. a loose one, a beautiful latte on a café table, gives you a beautiful latte that is not their latte. the shape that works is to name this exact thing, describe what is in the reference, say what to keep, and then say that only the photography may change.",
      'so: photograph of this exact lilikoʻi malasada, the same sugar, the same tear in the dough, the same plate. restyle only the photography: mustard table, warm off-white wall, window light from the left, low angle. no text, no logos added. it comes back as their malasada, shot properly.',
      'one more line does the rest. the same style line across the whole set, table, wall, light, angle, so twenty pictures read as one shoot. a second reference, the room itself, keeps the background honest too.',
      'two rules i hold to. no generated people: they look wrong, and they are not the staff. and the re-lit pictures are for the pitch, labelled as previews, never passed off as the real feed. the real feed gets real photos, which by then the owner knows how to take, because they have seen what the light should do.',
      ['the one time inventing is the honest option is when the café does not exist. ', { go: 'kope', text: 'kope' }, ', on the work page, was made that way from nothing, so that no real business had to be a sample.'],
    ] } },
];

// the notes on the wheel: the newest three stand after notes, three ticks on and then every other
// tick as the projects stand from work (the fourth post after them goes to all of them); each as it
// is listed on a page: name, date and standfirst
const NOTES_AT = 82.5;
const NEWEST = [...NOTES].reverse();
const LATEST = NEWEST.slice(0, 3).map((n, i) => ({ ...n, at: NOTES_AT + (i + 1.5) * 3.75 }));
const ALL = 'all notes';
const listed = (n) => ({ name: n.name, date: n.article.date, dek: n.article.dek });

export const CATEGORIES = [
  // the owner's words, 2026-10-30, reworded 2026-11-01
  { name: 'about', at: 0, light: true, body: [
    { lead: 'ddanghnl studio' },
    { p: 'a small studio making you look good\nwith modern digital solutions.' },
    // the way on: to the work, the services (owner's call, 2026-11-02), or just to say hi (owner's call,
    // 2026-11-01)
    { p: ['curious about ', { go: 'work', text: 'the work' }, ' or ', { go: 'services', text: 'the services' }, '? or if you just want to say hi, ', { go: 'contact', text: 'drop a line' }, '.'] },
  ] },
  // the owner's words, 2026-11-01
  { name: 'services', at: 15, light: true, body: [
    { lead: 'at the core' },
    { p: 'designing systems with modern tools.' },
    // a way through to the work, inline (owner's call, 2026-11-02) - its own paragraph, so the line
    // before still shows on the preview, which leaves out paragraphs with links
    { p: ['see them put to use in ', { go: 'work', text: 'the work' }, '.'] },
    ...SERVICES,
  ] },
  // no film of its own (the construction film belongs to hale build); one line saying what it holds,
  // then every project as a dot floating in a box, each opening it (owner's call, 2026-11-02; a list before)
  { name: 'work', at: 30, light: true, body: [
    { lead: 'a small studio' },   // owner's call, 2026-11-01
    { p: 'some of the work the studio has produced.' },
    { links: PROJECTS.map((p) => ({ name: p.name, kind: p.kind })), kinds: KINDS },
  ] },
  ...PROJECTS,
  // a line to start with, then the form: tick the services, a few words, and an email opens filled in
  // (owner's call, 2026-11-02, in place of a list of services)
  { name: 'contact', at: 67.5, light: true, body: [
    { lead: "let's make something" },
    { p: 'a few quick questions, and it goes straight to the studio.' },
    { email: EMAIL, asks: SERVICES.map((s) => s.service) },
  ] },
  // notes, one stop on from contact (owner's call, 2026-11-02): short notes from the studio, and the
  // questions that come up most (`faq`: each a `q` and an `a`, the answer given as a list where it
  // links to a page). Four to start, the owner's ask - the pricing one answered his way: no number,
  // reach out and he quotes it personally (2026-11-02)
  { name: 'notes', at: 82.5, light: true, body: [
    { lead: 'notes' },
    { p: 'the questions that come up most, and short notes from the studio.' },
    // the questions first (owner's call, 2026-11-02), then the latest notes
    { faq: [
      { q: 'what do you price at?', a: ['it depends on the work, so there is no one number. ', { go: 'contact', text: 'send the form' }, ' or reach out, and i will personally get back to you with a quote.'] },
      { q: 'how long does a website take?', a: 'as long as you need it to. a site can go up the same day, but what matters most is the pace you are comfortable with. i can work under any time constraint.' },
      { q: 'do you work with businesses outside hawaii?', a: 'yes. the studio is in honolulu, but most of the work happens over email and calls, so anywhere works.' },
      { q: 'what do you need from me to start?', a: 'a sense of what you do, any photos or words you already have, and an hour for a first call. the rest i can work out.' },
    ] },
    // the latest notes, listed: date, title, standfirst, each opening its page; a last row on to all
    { notes: LATEST.map(listed), title: 'latest', more: ALL },
  ] },
  // the latest notes stand on the wheel after notes, and then one more post, to every note there is
  // (owner's call, 2026-11-02: three on the dial, the fourth to the whole list)
  ...LATEST,
  { name: ALL, note: true, at: NOTES_AT + (LATEST.length + 1.5) * 3.75, light: true, body: [
    { lead: 'all notes' },
    { p: 'every note from the studio, newest first.' },
    { notes: NEWEST.map(listed) },
  ] },
];
export const START = 'about';   // the page on the selector when the wheel appears
export const REPEAT = 2;       // times the set runs round the wheel
