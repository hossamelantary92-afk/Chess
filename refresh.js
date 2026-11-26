// Store the view on its own history entry, independently for each tab and URL.
const readers = new Map();
const saved = history.state?.rookView;
const reload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
const restoring = reload && saved?.url === location.href;

export function keepView(key, read, restore) {
  readers.set(key, read);
  if (restoring && saved.views[key] != null) restore(saved.views[key]);
}

function remember() {
  const views = {};
  for (const [key, read] of readers) views[key] = read();
  history.replaceState({...history.state, rookView:{url:location.href, y:scrollY, views}}, '');
}
addEventListener('pagehide', remember);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') remember();
});
if (restoring) addEventListener('load', () => requestAnimationFrame(() => {
  if (location.href === saved.url) window.scrollTo({top:saved.y, behavior:'instant'});
}), {once:true});
