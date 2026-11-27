import { groups } from './study-lines.js';

const back = document.querySelector('.rook-back');
const home = document.querySelector('.rook-home');
const page = location.pathname.split('/').pop();
const section = new URLSearchParams(location.search).get('section');
const homeHref = 'index.html#home';
const defaultParent = back.getAttribute('href');
const sectionHref = id => `index.html?section=${id}`;

const routeSections = {
  academy: 'resources',
  fundamentals: 'resources',
  'game-tips': 'resources',
  middlegame: 'middlegame',
  'opening-traps': 'opening',
  'position-evaluation': 'middlegame',
  safety: 'middlegame',
  plans: 'middlegame',
  'piece-activity': 'middlegame',
  'practical-decisions': 'middlegame',
  'tactics-lab': 'tactical',
  'tactics-guide': 'tactical',
  calculation: 'tactical',
  'practical-endgames': 'finish',
  'checkmate-patterns': 'finish',
  draws: 'finish',
  'hero-lessons': 'games',
  'model-games': 'games'
};

const trainingSections = {
  basics: 'resources',
  vision: 'resources',
  openings: 'opening',
  tactics: 'tactical',
  mates: 'finish',
  endings: 'finish'
};

function indexParent() {
  const [route, detail] = location.hash.slice(1).split('/');
  if (!route || route === 'home') {
    return Object.values(routeSections).includes(section) || section === 'opening' || section === 'progress'
      ? homeHref : null;
  }
  if (route === 'fundamentals' && detail) return sectionHref('resources') + '#fundamentals';
  if (route === 'fundamentals' || (route === 'train' && ['basics', 'vision'].includes(detail))) {
    return sectionHref('resources') + '#academy';
  }
  const parent = route === 'train' ? trainingSections[detail] : routeSections[route];
  return parent ? sectionHref(parent) : homeHref;
}

function studyParent() {
  let lesson;
  try {
    lesson = decodeURIComponent(location.hash.slice(1));
  } catch {
    return sectionHref('middlegame');
  }
  if (lesson === 'Read and Play a Game') return sectionHref('games');
  if (lesson === 'Trust Your Intuition' || groups.Bullet.includes(lesson)) return sectionHref('progress');
  if (groups['Checkmate Patterns'].includes(lesson)) return sectionHref('finish');
  if (['Dutch Defense', 'Offbeat Openings'].includes(lesson)) return 'opening-mastery.html';
  return sectionHref('middlegame');
}

const indexPage = !page || page === 'index.html';
function updateNavigation() {
  const parent = indexPage ? indexParent()
    : page === 'study.html' ? studyParent()
    : page === 'training.html' && location.hash !== '#plan' ? 'opening-mastery.html'
    : defaultParent;
  back.hidden = !parent;
  if (parent) back.href = parent;
  if (indexPage && !parent) home.setAttribute('aria-current', 'page');
  else home.removeAttribute('aria-current');
}

window.addEventListener('hashchange', updateNavigation);
updateNavigation();
