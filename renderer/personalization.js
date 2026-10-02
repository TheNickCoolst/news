// Local, explicit preferences. No reading history or account is required.
const Personalization = (() => {
  const key = 'news.profile.v1';
  const topics = {
    lokal: 'Mein Ort',
    regional: 'Mittelfranken',
    blaulicht: 'Blaulicht',
    sport: 'Sport',
    bayern: 'Bayern',
    allgemein: 'Deutschland & Welt',
    wirtschaft: 'Wirtschaft',
    tech: 'Technik',
  };
  const empty = () => ({ interests: [], keywords: [], sources: {} });
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(key));
      if (!raw || typeof raw !== 'object') return empty();
      return {
        interests: Array.isArray(raw.interests) ? [...new Set(raw.interests.filter((v) => Object.hasOwn(topics, v)))] : [],
        keywords: Array.isArray(raw.keywords) ? raw.keywords.filter((v) => typeof v === 'string' && v.trim()).slice(0, 10).map((v) => v.trim().toLowerCase().slice(0, 40)) : [],
        sources: Object.fromEntries(Object.entries(raw.sources || {}).filter(([id, v]) => /^[a-z0-9-]+$/.test(id) && Number.isFinite(v)).map(([id, v]) => [id, Math.max(-3, Math.min(3, v))])),
      };
    } catch { return empty(); }
  }
  function save(profile) {
    try { localStorage.setItem(key, JSON.stringify(profile)); return true; }
    catch { return false; }
  }
  function matches(article, profile) {
    const text = `${article.title} ${article.desc}`.toLowerCase();
    return profile.keywords.filter((word) => text.includes(word));
  }
  function score(article, profile, now) {
    const ageHours = article.sortTime ? Math.max(0, (now - article.sortTime) / 3600000) : 168;
    return (profile.interests.includes(article.cat) ? 6 : 0)
      + Math.min(3, matches(article, profile).length) * 4
      + (profile.sources[article.sourceId] || 0) * 3
      + 8 / (1 + ageHours / 12);
  }
  function reason(article, profile) {
    const words = matches(article, profile);
    if (words.length) return `Dein Stichwort: ${words[0]}`;
    if (profile.interests.includes(article.cat)) return `Dein Interesse: ${topics[article.cat]}`;
    if (profile.sources[article.sourceId] > 0) return 'Quelle, von der du mehr sehen möchtest';
    return '';
  }
  return { topics, empty, load, save, score, reason, matches };
})();
