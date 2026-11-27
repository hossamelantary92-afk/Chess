// Store the view on its own history entry, independently for each tab and URL.
const readers = new Map();
const saved = history.state?.rookView;
const reload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
const restoring = reload && saved?.url === location.href && saved.views && typeof saved.views === 'object';

export function keepView(key, read, restore) {
  readers.set(key, read);
  if (restoring && saved.views[key] != null) { try { restore(saved.views[key]); } catch (error) { console.warn('Rook view restore skipped:', key, error); } }
}

function remember() {
  const views = {};
  for (const [key, read] of readers) { try { views[key] = read(); } catch (error) { console.warn('Rook view save skipped:', key, error); } }
  try { history.replaceState({...history.state, rookView:{url:location.href, y:scrollY, views}}, ''); } catch (error) { console.warn('Rook view save unavailable:', error); }
}
addEventListener('pagehide', remember);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') remember();
});
if (restoring) addEventListener('load', () => requestAnimationFrame(() => {
  if (location.href === saved.url) window.scrollTo({top:saved.y, behavior:'instant'});
}), {once:true});
