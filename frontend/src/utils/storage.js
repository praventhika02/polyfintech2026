const SAVED_KEY = "esg-pulse-saved-analyses";
const WATCHLIST_KEY = "esg-pulse-watchlist";

export function loadSavedAnalyses() {
  return readList(SAVED_KEY);
}

export function saveAnalysis(analysis) {
  if (!analysis) return [];
  const items = loadSavedAnalyses();
  const next = [
    {
      ...analysis,
      saved_at: new Date().toISOString(),
    },
    ...items.filter((item) => item.analysis_id !== analysis.analysis_id),
  ].slice(0, 12);
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next;
}

export function loadWatchlist() {
  return readList(WATCHLIST_KEY);
}

export function toggleWatchlist(companyId) {
  const current = loadWatchlist();
  const next = current.includes(companyId)
    ? current.filter((item) => item !== companyId)
    : [...current, companyId];
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  return next;
}

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
