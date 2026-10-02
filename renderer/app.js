// dahamm renderer - Mittelfranken-first RSS/Atom reader with local summaries

// Google News searches use `search` instead of `url`. Sources with `placeId`
// or `kreis` move to "Mein Ort" when they match the chosen place.
const BASE_SOURCES = [
  // Mittelfranken
  { id: 'nb-nuernberg', name: 'nordbayern · Nürnberg', url: 'https://www.nordbayern.de/nuernberg?isRss=true', cat: 'regional', placeId: 'nuernberg' },
  { id: 'nb-fuerth', name: 'nordbayern · Fürth', url: 'https://www.nordbayern.de/fuerth?isRss=true', cat: 'regional', placeId: 'fuerth' },
  { id: 'nb-erlangen', name: 'nordbayern · Erlangen', url: 'https://www.nordbayern.de/erlangen?isRss=true', cat: 'regional', placeId: 'erlangen' },
  { id: 'nb-franken', name: 'nordbayern · Franken', url: 'https://www.nordbayern.de/franken?isRss=true', cat: 'regional' },
  { id: 'n-land', name: 'N-Land · Nürnberger Land', url: 'https://www.n-land.de/rss', cat: 'regional', kreis: 'Landkreis Nürnberger Land' },
  { id: 'franken-tv', name: 'Franken Fernsehen', url: 'https://www.frankenfernsehen.tv/feed/', cat: 'regional' },
  { id: 'gn-mittelfranken', name: 'Google News · Mittelfranken', search: 'Mittelfranken', days: 3, cat: 'regional' },
  // Blaulicht
  { id: 'nb-polizei', name: 'nordbayern · Polizeiberichte', url: 'https://www.nordbayern.de/polizeiberichte?isRss=true', cat: 'blaulicht' },
  { id: 'gn-polizei', name: 'Google News · Polizei Mittelfranken', search: 'Polizei Mittelfranken', days: 2, cat: 'blaulicht' },
  // Sport
  { id: 'nb-fcn', name: 'nordbayern · 1. FC Nürnberg', url: 'https://www.nordbayern.de/sport/1-fc-nuernberg?isRss=true', cat: 'sport' },
  { id: 'gn-kleeblatt', name: 'Google News · Greuther Fürth', search: '"Greuther Fürth"', days: 3, cat: 'sport' },
  { id: 'gn-icetigers', name: 'Google News · Ice Tigers', search: '"Ice Tigers"', days: 3, cat: 'sport' },
  // Bayern
  { id: 'br-bayern', name: 'tagesschau · Bayern', url: 'https://www.tagesschau.de/inland/regional/bayern/index~rss2.xml', cat: 'bayern' },
  { id: 'sz-bayern', name: 'SZ · Bayern', url: 'https://rss.sueddeutsche.de/rss/Bayern', cat: 'bayern' },
  { id: 'merkur-bayern', name: 'Merkur · Bayern', url: 'https://www.merkur.de/bayern/rssfeed.rdf', cat: 'bayern' },
  // Deutschland & Welt
  { id: 'tagesschau', name: 'Tagesschau', url: 'https://www.tagesschau.de/index~rss2.xml', cat: 'allgemein' },
  { id: 'spiegel', name: 'Spiegel', url: 'https://www.spiegel.de/schlagzeilen/index.rss', cat: 'allgemein' },
  { id: 'zeit', name: 'ZEIT Online', url: 'https://newsfeed.zeit.de/index', cat: 'allgemein' },
  { id: 'sz', name: 'Süddeutsche', url: 'https://rss.sueddeutsche.de/rss/Topthemen', cat: 'allgemein' },
  { id: 'ntv', name: 'n-tv', url: 'https://www.n-tv.de/rss', cat: 'allgemein' },
  { id: 'welt', name: 'Welt', url: 'https://www.welt.de/feeds/topnews.rss', cat: 'allgemein' },
  { id: 'faz', name: 'FAZ', url: 'https://www.faz.net/rss/aktuell/', cat: 'allgemein' },
  { id: 'tagesspiegel', name: 'Tagesspiegel', url: 'https://www.tagesspiegel.de/contentexport/feed/home', cat: 'allgemein' },
  { id: 'dw', name: 'Deutsche Welle', url: 'https://rss.dw.com/rdf/rss-de-all', cat: 'allgemein' },
  { id: 'taz', name: 'taz', url: 'https://taz.de/!s=;rss/', cat: 'allgemein' },
  { id: 'stern', name: 'Stern', url: 'https://www.stern.de/feed/standard/all/', cat: 'allgemein' },
  { id: 'focus', name: 'Focus', url: 'https://www.focus.de/rss', cat: 'allgemein' },
  { id: 'dlf', name: 'Deutschlandfunk', url: 'https://www.deutschlandfunk.de/nachrichten-100.rss', cat: 'allgemein' },
  // Wirtschaft
  { id: 'handelsblatt', name: 'Handelsblatt', url: 'https://www.handelsblatt.com/contentexport/feed/top-themen', cat: 'wirtschaft' },
  { id: 'manager', name: 'Manager Magazin', url: 'https://www.manager-magazin.de/news/index.rss', cat: 'wirtschaft' },
  // Technik
  { id: 'heise', name: 'Heise', url: 'https://www.heise.de/rss/heise-atom.xml', cat: 'tech' },
  { id: 'heisesec', name: 'Heise Security', url: 'https://www.heise.de/security/rss/news-atom.xml', cat: 'tech' },
  { id: 'golem', name: 'Golem', url: 'https://rss.golem.de/rss.php?feed=RSS2.0', cat: 'tech' },
  { id: 't3n', name: 't3n', url: 'https://t3n.de/rss.xml', cat: 'tech' },
  { id: 'netzpol', name: 'Netzpolitik', url: 'https://netzpolitik.org/feed/', cat: 'tech' },
];

const CAT_ORDER = Object.keys(Personalization.topics);
const CAT_ICONS = {
  lokal: 'pin',
  regional: 'region',
  blaulicht: 'siren',
  sport: 'ball',
  bayern: 'mountain',
  allgemein: 'globe',
  wirtschaft: 'chart',
  tech: 'chip',
};
const CAT_LOCAL_WEIGHT = { lokal: 6, regional: 3, blaulicht: 2, sport: 1, bayern: 1 };

const PAGE_SIZE = 48;
const MAX_ITEMS_PER_SOURCE = 60;
const MAX_AGE_MS = 21 * 24 * 3600000;
const REFRESH_MS = 10 * 60 * 1000;
const JUNK_TITLE = /regenradar|wettervorhersage|7-tage-(trend|prognose)|^wetter (in|für) [^:]+:/i;

const api = window.news;

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore quota / disabled storage
    }
  },
};

const legacyMood = storage.get('news.mood');

const state = {
  place: Region.deserialize(storage.get('news.place')) || Region.findPlace(Region.DEFAULT_ID),
  placeChosen: Boolean(storage.get('news.place')),
  sources: [],
  feedCache: new Map(),
  sourceStats: {},
  articles: [],
  section: 'home',
  filterSource: 'all',
  searchTerm: '',
  view: storage.get('news.view') === 'list' ? 'list' : 'cards',
  sort: (storage.get('news.sort') || legacyMood) === 'date' ? 'date' : 'relevance',
  goodOnly: storage.get('news.goodOnly') === '1' || legacyMood === 'onlyPositive',
  listLimit: PAGE_SIZE,
  loading: false,
  pendingMissing: false,
  loadedAt: null,
  geoSuggestion: null,
  registry: [],
  profile: Personalization.load(),
};

// ───────────────────────────────────────────────────────────────
// Sentiment lexicon (German) — keyword-based scoring
// ───────────────────────────────────────────────────────────────

const POSITIVE_WORDS = new Set([
  'gut','gute','guter','gutes','besser','beste','besten','bestens',
  'erfolg','erfolgreich','erfolge','gewinn','gewinnt','gewonnen','sieg','siegt','siegte','sieger',
  'rekord','rekorde','durchbruch','fortschritt','wachstum','wächst','aufschwung','boom',
  'hoffnung','hoffnungsvoll','optimismus','optimistisch','zuversicht','zuversichtlich',
  'freude','freut','froh','glück','glücklich','glücklicher','feiert','feier','feiern','gefeiert',
  'rettet','rettung','gerettet','geheilt','heilung','gesund','genesen',
  'frieden','friedlich','versöhnung','einigung','einigen','vereinbart','abkommen',
  'lösung','gelöst','löst','geholfen','hilfe','unterstützung','spende','spenden','gespendet',
  'auszeichnung','ausgezeichnet','preis','preisträger','nobelpreis','gewürdigt',
  'innovation','innovativ','erfindung','entdeckt','entdeckung','durchbrach',
  'klimaschutz','nachhaltig','nachhaltigkeit','erneuerbar','sauber','sauberer',
  'liebe','liebt','geliebt','herzlich','dankbar','dank',
  'lächeln','lacht','lachen','gelacht','humor',
  'positiv','schön','schönste','wunderbar','wundervoll','toll','super','großartig','fantastisch','herausragend',
  'gestiegen','steigt','wachsen','steigerung','verbessert','verbesserung','erholt','erholung','aufgestiegen',
  'gefördert','förderung','ausbau','neueröffnung','eröffnet','eröffnung',
  'baby','geburt','geboren','hochzeit','geheiratet',
  'frei','freiheit','befreit','freilassung',
  'spaß','feiertag','urlaub','party','konzert','festival',
]);

const NEGATIVE_WORDS = new Set([
  'tot','tote','toten','tötet','getötet','tötung','gestorben','stirbt','leiche','leichen',
  'mord','mörder','ermordet','totschlag','attentat','attentäter',
  'krieg','kriege','kämpfe','angriff','angegriffen','offensive','bombardiert','bombe','bomben','raketen','rakete',
  'opfer','verletzt','verletzte','schwerverletzt','tödlich','schwer',
  'unfall','unfälle','crash','kollision','absturz','abgestürzt',
  'krise','krisen','katastrophe','katastrophal','desaster',
  'tragödie','tragisch','schock','schockiert',
  'angst','panik','furcht','bedroht','bedrohung','gefahr','gefährlich','gefährdet',
  'pleite','insolvenz','insolvent','bankrott','bankrotte','konkurs',
  'arbeitslos','arbeitslosigkeit','entlassen','entlassung','entlassungen','stellenabbau','kündigung','kündigungen',
  'rezession','crash','einbruch','eingebrochen','gefallen','sturz','gestürzt','verloren','verlust','verluste',
  'inflation','teuer','teurer','rekordhoch','preisanstieg',
  'streit','streitet','konflikt','konflikte','eskaliert','eskalation','spannungen',
  'protest','proteste','demonstration','randale','krawall','aufstand',
  'skandal','skandale','betrug','korruption','korrupt','manipulation','manipuliert','gefälscht',
  'gefängnis','verhaftet','festgenommen','angeklagt','verurteilt','strafe','urteil',
  'gewalt','gewalttätig','brutal','blutig','blutbad','massaker',
  'krankheit','krank','virus','pandemie','epidemie','infiziert','seuche',
  'brand','brennt','feuer','flammen','explosion','explodiert',
  'flut','überschwemmung','dürre','hitzewelle','sturm','orkan','hurrikan','erdbeben','tsunami','vulkan',
  'klimawandel','klimakrise','umweltzerstörung','vergiftet','verseucht',
  'rassismus','diskriminierung','hass','hetze','rechtsextrem','extremismus','terror','terrorist','terroristen',
  'krebs','tumor','aids','herzinfarkt','schlaganfall',
  'armut','arm','obdachlos','hunger','hungersnot',
  'schlecht','schlechte','schlimm','schlimmer','schlimmste','schrecklich','furchtbar','katastrophe','horror',
  'negativ','traurig','trauer','trauert','trauern','weint','weinen',
  'gesunken','sinkt','rückgang','einbruch','schrumpft','schwächelt','schwach',
  'kritik','kritisiert','kritisch','vorwurf','vorwürfe','beschuldigt',
  'verbot','verboten','sanktionen','strafzölle',
  'razzia','razzien','drogen','granate','granaten','sprengung','gesprengt','blindgänger','fliegerbombe','evakuiert','evakuierung',
  'durchsuchung','durchsuchungen','einbrecher','diebstahl','dieb','diebe','gestohlen','betrüger','betrügerin','abzocke',
  'festnahme','vermisst','vermisste','verunglückt','unfallflucht','fahrerflucht','polizeieinsatz','messerangriff','schüsse',
  'gesperrt','sperrung','stau','insolvenzantrag','schließung','verstirbt','verstorben',
]);

function sentiment(article) {
  const text = (article.title + ' ' + article.desc).toLowerCase();
  const words = text.replace(/[^a-zäöüß\s]/gi, ' ').split(/\s+/);
  let pos = 0;
  let neg = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) pos++;
    if (NEGATIVE_WORDS.has(w)) neg++;
  }
  // Title weights 2x — most signal there
  const titleWords = article.title.toLowerCase().replace(/[^a-zäöüß\s]/gi, ' ').split(/\s+/);
  for (const w of titleWords) {
    if (POSITIVE_WORDS.has(w)) pos++;
    if (NEGATIVE_WORDS.has(w)) neg++;
  }
  return pos - neg;
}

const SUMMARY_CACHE_KEY = 'news.summaries.v1';
const SUMMARY_CACHE_LIMIT = 200;
const summaryCache = loadSummaryCache();

const $ = (sel) => document.querySelector(sel);
const dom = {};

function bindDom() {
  [
    'content',
    'homeView',
    'listView',
    'feed',
    'empty',
    'moreButton',
    'sectionNav',
    'sourceList',
    'sourceHealth',
    'sourceFilter',
    'lastUpdate',
    'itemCount',
    'placeButton',
    'placeName',
    'search',
    'goodNews',
    'openProfile',
    'toggleTheme',
    'themeIcon',
    'refresh',
    'progress',
    'toast',
    'placeDialog',
    'placeSearch',
    'placeSuggestion',
    'placeGroups',
    'customPlace',
    'useCustomPlace',
    'profileDialog',
    'interestChoices',
    'keywords',
    'profileHint',
    'resetProfile',
    'summaryDialog',
    'summaryTitle',
    'summarySource',
    'summaryBody',
  ].forEach((id) => {
    dom[id] = document.getElementById(id);
  });
}

function debounce(fn, delay = 120) {
  let timer = null;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, wait) {
  let last = 0;
  let timer = null;
  const run = () => {
    timer = null;
    last = Date.now();
    fn();
  };
  const call = () => {
    if (timer) return;
    const remaining = wait - (Date.now() - last);
    if (remaining <= 0) run();
    else timer = window.setTimeout(run, remaining);
  };
  call.cancel = () => {
    window.clearTimeout(timer);
    timer = null;
  };
  return call;
}

function loadSummaryCache() {
  try {
    return JSON.parse(localStorage.getItem(SUMMARY_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveSummaryCache() {
  const keys = Object.keys(summaryCache);
  if (keys.length > SUMMARY_CACHE_LIMIT) {
    keys
      .sort((a, b) => (summaryCache[a].createdAt || 0) - (summaryCache[b].createdAt || 0))
      .slice(0, keys.length - SUMMARY_CACHE_LIMIT)
      .forEach((key) => delete summaryCache[key]);
  }
  storage.set(SUMMARY_CACHE_KEY, JSON.stringify(summaryCache));
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(s) {
  return escapeHtml(s);
}

function safeHref(url) {
  return /^https?:\/\//i.test(url || '') ? url : '#';
}

function icon(name) {
  return `<svg class="icon" aria-hidden="true"><use href="#i-${name}" /></svg>`;
}

function fold(value) {
  return String(value || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
}

function decodeEntities(s) {
  if (!s) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = s;
  return txt.value;
}

function stripHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

function extractImageFromHtml(html) {
  if (!html) return null;
  const m = html.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function relativeTime(date) {
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'gerade eben';
  if (m < 60) return `vor ${m} Min.`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'gestern';
  if (d < 7) return `vor ${d} Tagen`;
  return date.toLocaleDateString('de-DE');
}

function normalizedTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/\s+-\s+[^-]+$/, '')
    .replace(/[^a-z0-9äöüß\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function placeShort() {
  return Region.shortName(state.place);
}

function catLabel(cat) {
  return cat === 'lokal' ? placeShort() : Personalization.topics[cat] || cat;
}

// ───────────────────────────────────────────────────────────────
// Sources
// ───────────────────────────────────────────────────────────────

function googleNewsSearchUrl(query, days) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:${days}d`)}&hl=de&gl=DE&ceid=DE:de`;
}

function buildSources(place) {
  const local = [
    { id: 'gn-place', name: `Google News · ${Region.shortName(place)}`, search: Region.placeQuery(place), days: 7, cat: 'lokal' },
  ];
  if (place.kreis) {
    local.push({ id: 'gn-kreis', name: `Google News · ${Region.kreisShort(place.kreis)}`, search: Region.kreisQuery(place.kreis), days: 7, cat: 'lokal' });
  }
  const base = BASE_SOURCES.map((source) =>
    source.placeId === place.id || (source.kreis && source.kreis === place.kreis) ? { ...source, cat: 'lokal' } : source
  );
  // Local and regional feeds load first so the front page fills from the top.
  return [...local, ...base]
    .map((source) => (source.search ? { ...source, url: googleNewsSearchUrl(source.search, source.days) } : source))
    .sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat));
}

// ───────────────────────────────────────────────────────────────
// Parsing
// ───────────────────────────────────────────────────────────────

function findImage(item) {
  // 1. media:content / media:thumbnail (Yahoo Media RSS)
  const mediaContent = item.getElementsByTagNameNS('*', 'content');
  for (const el of mediaContent) {
    const url = el.getAttribute('url');
    const medium = el.getAttribute('medium');
    if (url && (!medium || medium === 'image')) return url;
  }
  const mediaThumb = item.getElementsByTagNameNS('*', 'thumbnail');
  for (const el of mediaThumb) {
    const url = el.getAttribute('url');
    if (url) return url;
  }
  // 2. enclosure
  const encl = item.querySelector('enclosure');
  if (encl) {
    const t = encl.getAttribute('type') || '';
    const u = encl.getAttribute('url');
    if (u && (t.startsWith('image') || /\.(jpe?g|png|gif|webp)/i.test(u))) {
      return u;
    }
  }
  // 3. Atom <link rel="enclosure">
  const links = item.querySelectorAll('link');
  for (const l of links) {
    if (
      l.getAttribute('rel') === 'enclosure' &&
      (l.getAttribute('type') || '').startsWith('image')
    ) {
      const href = l.getAttribute('href');
      if (href) return href;
    }
  }
  // 4. image tag
  const imgEl = item.querySelector('image > url, image');
  if (imgEl && imgEl.textContent && /^https?:/.test(imgEl.textContent.trim())) {
    return imgEl.textContent.trim();
  }
  // 5. itunes:image
  const itunesImg = item.getElementsByTagNameNS('*', 'image')[0];
  if (itunesImg && itunesImg.getAttribute('href')) {
    return itunesImg.getAttribute('href');
  }
  // 6. parse <img> from description / content:encoded
  const descRaw =
    item.querySelector('description')?.textContent ||
    item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent ||
    item.querySelector('summary')?.textContent ||
    item.querySelector('content')?.textContent ||
    '';
  return extractImageFromHtml(decodeEntities(descRaw));
}

// Google News appends " - Publisher" to titles and repeats the title as
// description; strip both so cards show the real publisher.
function makeItem({ title, link, desc, image, pubDate, publisher }) {
  let cleanTitle = decodeEntities(title).trim();
  if (publisher && cleanTitle.endsWith(` - ${publisher}`)) {
    cleanTitle = cleanTitle.slice(0, -(publisher.length + 3)).trim();
  }
  let cleanDesc = decodeEntities(desc).slice(0, 600).trim();
  const titleKey = normalizedTitle(cleanTitle).slice(0, 40);
  if (cleanDesc && normalizedTitle(cleanDesc).startsWith(titleKey) && cleanDesc.length < cleanTitle.length + 80) {
    cleanDesc = '';
  }
  if (!cleanTitle || !link || JUNK_TITLE.test(cleanTitle)) return null;
  const item = {
    title: cleanTitle,
    link: link.trim(),
    desc: cleanDesc,
    image: image && /^https?:\/\//i.test(image) ? image : null,
    date: parseDate(pubDate),
    publisher: publisher || null,
  };
  item.sentiment = sentiment(item);
  return item;
}

function parseFeed(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('XML parse error');
  }
  const items = [];

  doc.querySelectorAll('item').forEach((item) => {
    const parsed = makeItem({
      title: stripHtml(item.querySelector('title')?.textContent || ''),
      link: item.querySelector('link')?.textContent || '',
      desc: stripHtml(
        item.querySelector('description')?.textContent ||
          item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent ||
          ''
      ),
      image: findImage(item),
      pubDate:
        item.querySelector('pubDate')?.textContent ||
        item.getElementsByTagNameNS('*', 'date')[0]?.textContent,
      publisher: item.querySelector('source')?.textContent.trim(),
    });
    if (parsed) items.push(parsed);
  });

  if (items.length === 0) {
    doc.querySelectorAll('entry').forEach((entry) => {
      const linkEl = entry.querySelector('link[rel="alternate"], link');
      const parsed = makeItem({
        title: stripHtml(entry.querySelector('title')?.textContent || ''),
        link: linkEl?.getAttribute('href') || linkEl?.textContent || '',
        desc: stripHtml(
          entry.querySelector('summary')?.textContent ||
            entry.querySelector('content')?.textContent ||
            ''
        ),
        image: findImage(entry),
        pubDate:
          entry.querySelector('updated')?.textContent ||
          entry.querySelector('published')?.textContent,
      });
      if (parsed) items.push(parsed);
    });
  }

  return items.slice(0, MAX_ITEMS_PER_SOURCE);
}

// ───────────────────────────────────────────────────────────────
// Loading & ranking
// ───────────────────────────────────────────────────────────────

async function fetchSource(source) {
  try {
    const res = await api.fetchFeed(source.url);
    if (!res.ok) throw new Error(res.error);
    state.feedCache.set(source.url, { items: parseFeed(res.xml), error: null });
  } catch (err) {
    // Keep the last good items when a refresh fails.
    const previous = state.feedCache.get(source.url);
    state.feedCache.set(source.url, { items: previous?.items || [], error: err.message });
  }
}

async function mapWithConcurrency(items, limit, mapper) {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const idx = next++;
      await mapper(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

function locality(article, match) {
  const text = `${article.title} ${article.desc}`;
  const placeMatch = match.place.test(text);
  const kreisMatch = !placeMatch && Boolean(match.kreis && match.kreis.test(text));
  const regionMatch = match.region.test(text);
  return {
    placeMatch,
    kreisMatch,
    localScore: (CAT_LOCAL_WEIGHT[article.cat] || 0) + (placeMatch ? 5 : kreisMatch ? 3 : 0) + (regionMatch ? 1 : 0),
  };
}

function mergeDuplicates(articles) {
  const byKey = new Map();
  // Prefer direct publisher links (summaries work) over Google redirects.
  const quality = (a) => (a.viaGoogle ? 0 : 4) + (a.image ? 1 : 0) + Math.min(a.desc.length, 600) / 600;
  articles.forEach((article) => {
    const key = normalizedTitle(article.title) || article.link;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, article);
      return;
    }
    const [keep, drop] = quality(article) > quality(existing) ? [article, existing] : [existing, article];
    keep.altSources = [...new Set([...(keep.altSources || []), drop.publisher, ...(drop.altSources || [])])].filter(
      (name) => name && name !== keep.publisher
    );
    if (CAT_ORDER.indexOf(drop.cat) < CAT_ORDER.indexOf(keep.cat)) keep.cat = drop.cat;
    keep.localScore = Math.max(keep.localScore, drop.localScore);
    keep.placeMatch = keep.placeMatch || drop.placeMatch;
    keep.image = keep.image || drop.image;
    if (!keep.sortTime && drop.sortTime) {
      keep.date = drop.date;
      keep.sortTime = drop.sortTime;
    }
    byKey.set(key, keep);
  });
  return Array.from(byKey.values());
}

function rebuildArticles() {
  const match = Region.matcher(state.place);
  const cutoff = Date.now() - MAX_AGE_MS;
  const articles = [];
  state.sourceStats = {};
  state.sources.forEach((source) => {
    const entry = state.feedCache.get(source.url);
    if (!entry) return;
    state.sourceStats[source.id] = { count: entry.items.length, error: entry.error };
    entry.items.forEach((item) => {
      if (item.date && item.date.getTime() < cutoff) return;
      const article = {
        ...item,
        source: source.name,
        sourceId: source.id,
        cat: source.cat,
        publisher: item.publisher || source.name.split(' · ')[0],
        viaGoogle: Boolean(source.search),
        sortTime: item.date ? item.date.getTime() : 0,
      };
      article.searchText = `${article.title} ${article.desc} ${article.publisher}`.toLowerCase();
      Object.assign(article, locality(article, match));
      articles.push(article);
    });
  });
  state.articles = mergeDuplicates(articles);
}

function setProgress(fraction) {
  dom.progress.classList.toggle('active', fraction < 1);
  dom.progress.firstElementChild.style.width = `${Math.round(fraction * 100)}%`;
}

async function loadAll({ onlyMissing = false } = {}) {
  if (state.loading) {
    if (onlyMissing) state.pendingMissing = true;
    return;
  }
  state.loading = true;
  dom.refresh.disabled = true;
  dom.refresh.classList.add('busy');
  const sources = onlyMissing ? state.sources.filter((s) => !state.feedCache.has(s.url)) : state.sources.slice();
  const progressive = state.articles.length === 0 || onlyMissing;
  const renderSoon = throttle(() => {
    rebuildArticles();
    renderAll();
  }, 500);
  let done = 0;
  setProgress(sources.length ? 0.03 : 1);
  if (state.articles.length === 0) renderView();

  try {
    await mapWithConcurrency(sources, 8, async (source) => {
      await fetchSource(source);
      done += 1;
      setProgress(done / sources.length);
      if (progressive) renderSoon();
    });
    renderSoon.cancel();
    if (!onlyMissing) state.loadedAt = new Date();
    rebuildArticles();
    renderAll();
  } finally {
    setProgress(1);
    dom.refresh.disabled = false;
    dom.refresh.classList.remove('busy');
    state.loading = false;
    if (state.pendingMissing) {
      state.pendingMissing = false;
      loadAll({ onlyMissing: true });
    }
  }
}

async function resolveGeo() {
  try {
    const res = await api.getGeo();
    if (!res.ok || !res.geo.city) return;
    const place = Region.placeFromCity(res.geo.city) || (res.geo.countryCode === 'DE' ? Region.customPlace(res.geo.city) : null);
    if (!place) return;
    state.geoSuggestion = place;
    if (dom.placeDialog.open) renderPlaceDialog();
  } catch (err) {
    console.warn('Geo lookup error:', err);
  }
}

function passesMood(article) {
  return !state.goodOnly || (article.sentiment ?? 0) >= 1;
}

function rankScore(article, now) {
  const ageHours = article.sortTime ? Math.max(0, (now - article.sortTime) / 3600000) : 72;
  return Personalization.score(article, state.profile, now) + article.localScore - Math.min(ageHours, 120) / 12;
}

function byRank(list) {
  const now = Date.now();
  const scores = new Map(list.map((a) => [a, rankScore(a, now)]));
  return list.slice().sort((a, b) => scores.get(b) - scores.get(a) || b.sortTime - a.sortTime);
}

function byDate(list) {
  return list.slice().sort((a, b) => b.sortTime - a.sortTime);
}

function titleTokens(article) {
  if (!article.tokens) article.tokens = new Set(tokenize(article.title));
  return article.tokens;
}

function isNearDuplicate(a, b) {
  const ta = titleTokens(a);
  const tb = titleTokens(b);
  if (ta.size < 4 || tb.size < 4) return false;
  let shared = 0;
  ta.forEach((token) => {
    if (tb.has(token)) shared += 1;
  });
  return shared / Math.min(ta.size, tb.size) >= 0.5;
}

function countByCat() {
  const counts = {};
  state.articles.forEach((a) => {
    if (passesMood(a)) counts[a.cat] = (counts[a.cat] || 0) + 1;
  });
  return counts;
}

// ───────────────────────────────────────────────────────────────
// Rendering
// ───────────────────────────────────────────────────────────────

function register(article) {
  return state.registry.push(article) - 1;
}

function metaLine(a, { showCat = true } = {}) {
  return `<div class="story-meta">${showCat ? `<span class="cat-tag">${escapeHtml(catLabel(a.cat))}</span>` : ''}<span>${escapeHtml(a.publisher)}</span>${a.date ? `<span>${relativeTime(a.date)}</span>` : ''}</div>`;
}

function badges(a, { reason = false } = {}) {
  const out = [];
  if (a.placeMatch && a.cat !== 'lokal') out.push(`<span class="badge place">${icon('pin')}${escapeHtml(placeShort())}</span>`);
  if ((a.sentiment ?? 0) >= 2 && a.cat !== 'blaulicht') out.push(`<span class="badge good">${icon('sun')}Gute Nachricht</span>`);
  if (reason) {
    const why = Personalization.reason(a, state.profile);
    if (why) out.push(`<span class="badge reason">${icon('sparkle')}${escapeHtml(why)}</span>`);
  }
  if (a.altSources?.length) {
    const n = a.altSources.length;
    out.push(`<span class="badge" title="Auch bei: ${escapeAttr(a.altSources.join(', '))}">+${n} ${n === 1 ? 'Quelle' : 'Quellen'}</span>`);
  }
  return out.length ? `<div class="badges">${out.join('')}</div>` : '';
}

function actions(a) {
  const canSummarize = Boolean(a.desc) || !a.viaGoogle;
  const source = escapeAttr(a.source);
  return `<div class="story-actions">
    ${canSummarize ? `<button type="button" class="act act-summary" data-action="summary">${icon('sparkle')}Kurzfassung</button>` : '<span class="act-summary"></span>'}
    <button type="button" class="act act-more" data-action="more" title="Mehr von „${source}“" aria-label="Mehr von „${source}“">${icon('thumb')}</button>
    <button type="button" class="act act-less" data-action="less" title="Weniger von „${source}“" aria-label="Weniger von „${source}“">${icon('thumb')}</button>
    <button type="button" class="act" data-action="open" title="Original öffnen" aria-label="Original öffnen">${icon('external')}</button>
  </div>`;
}

function media(a, cls) {
  return a.image ? `<div class="${cls}"><img loading="lazy" src="${escapeAttr(a.image)}" alt="" referrerpolicy="no-referrer" /></div>` : '';
}

function storyCard(a, { reason = false, showCat = true } = {}) {
  return `<article class="story" data-key="${register(a)}" data-cat="${a.cat}">
    ${media(a, 'story-media')}
    <div class="story-body">
      ${metaLine(a, { showCat })}
      <h3 class="story-title"><a href="${escapeAttr(safeHref(a.link))}" data-action="open">${escapeHtml(a.title)}</a></h3>
      ${a.desc ? `<p class="story-desc">${escapeHtml(a.desc)}</p>` : ''}
      ${badges(a, { reason })}
      ${actions(a)}
    </div>
  </article>`;
}

function brief(a, { thumb = false, showCat = false } = {}) {
  return `<li class="brief" data-key="${register(a)}" data-cat="${a.cat}">
    <div class="brief-main">
      <a class="brief-title" href="${escapeAttr(safeHref(a.link))}" data-action="open">${escapeHtml(a.title)}</a>
      ${metaLine(a, { showCat })}
    </div>
    ${thumb ? media(a, 'brief-thumb') : ''}
  </li>`;
}

function leadStory(a) {
  return `<article class="lead-story${a.image ? '' : ' no-image'}" data-key="${register(a)}" data-cat="${a.cat}">
    ${media(a, 'story-media')}
    ${metaLine(a)}
    <h2 class="story-title"><a href="${escapeAttr(safeHref(a.link))}" data-action="open">${escapeHtml(a.title)}</a></h2>
    ${a.desc ? `<p class="story-desc">${escapeHtml(a.desc)}</p>` : ''}
    ${badges(a)}
    ${actions(a)}
  </article>`;
}

function blockHead(cat, title, total) {
  return `<header class="block-head">
    <h2 class="block-title">${escapeHtml(title)}</h2>
    <button type="button" class="block-more" data-section="${cat}">Alle ${total} anzeigen${icon('arrow')}</button>
  </header>`;
}

function masthead() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 5 ? 'Gute Nacht' : hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Servus' : 'Guten Abend';
  const date = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const stand = state.loadedAt ? ` · Stand ${state.loadedAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr` : '';
  const counts = countByCat();
  const intro = counts.lokal
    ? `${counts.lokal} Meldungen aus ${escapeHtml(placeShort())} und ${counts.regional || 0} aus ganz Mittelfranken – das Wichtigste steht oben.`
    : 'Das Wichtigste aus deinem Ort, aus Mittelfranken und dem Rest der Welt.';
  const stats = state.articles.length
    ? `<div class="stats">${['lokal', 'regional', 'blaulicht']
        .map((cat) => `<button type="button" class="stat" data-section="${cat}" data-cat="${cat}"><strong>${counts[cat] || 0}</strong><span>${escapeHtml(catLabel(cat))}</span></button>`)
        .join('')}</div>`
    : '';
  return `<header class="masthead">
    <div>
      <span class="eyebrow">${escapeHtml(date)}${stand}</span>
      <h1>${greeting}, <em>${escapeHtml(placeShort())}</em>.</h1>
      <p>${intro}</p>
    </div>
    ${stats}
  </header>`;
}

function homeSkeleton() {
  const lines = (n) => Array.from({ length: n }, () => '<div class="skeleton skeleton-line"></div>').join('');
  return `<section class="lead">
      <div><div class="skeleton skeleton-lead"></div><div class="skeleton skeleton-line wide"></div>${lines(2)}</div>
      <div>${lines(9)}</div>
    </section>
    <section class="block"><div class="grid-3">${'<div class="skeleton skeleton-card"></div>'.repeat(3)}</div></section>`;
}

function renderHome() {
  if (!state.articles.length) {
    dom.homeView.innerHTML = masthead() + (state.loading
      ? homeSkeleton()
      : `<div class="empty">${icon('alert')}<p>Keine Meldungen geladen.</p><span class="muted">Prüfe deine Internetverbindung und aktualisiere.</span></div>`);
    return;
  }

  // Each story appears once; reworded updates of the same story are skipped.
  const used = [];
  const take = (list, n) => {
    const out = [];
    for (const a of list) {
      if (out.length >= n) break;
      if (used.includes(a) || used.some((b) => isNearDuplicate(a, b))) continue;
      used.push(a);
      out.push(a);
    }
    return out;
  };
  const pools = Object.fromEntries(CAT_ORDER.map((cat) => [cat, byRank(state.articles.filter((a) => a.cat === cat && passesMood(a)))]));
  const nearby = byRank([...pools.lokal, ...pools.regional]);
  const lead = take(nearby.filter((a) => a.image).slice(0, 4), 1)[0] || take(nearby, 1)[0];
  const top = take(nearby, 5);

  const parts = [masthead()];
  if (lead) {
    parts.push(`<section class="lead">
      ${leadStory(lead)}
      <div class="lead-side" data-cat="regional">
        <h2 class="block-title">Top in der Region</h2>
        <ol class="briefs">${top.map((a) => brief(a, { thumb: true, showCat: true })).join('')}</ol>
      </div>
    </section>`);
  }

  const hasProfile = state.profile.interests.length || state.profile.keywords.length;
  if (hasProfile) {
    const picks = take(byRank(state.articles.filter((a) => passesMood(a) && Personalization.reason(a, state.profile))), 4);
    if (picks.length) {
      parts.push(`<section class="for-you">
        <header class="block-head"><h2 class="block-title">${icon('sparkle')}Für dich</h2>
          <button type="button" class="block-more" data-open-profile>Interessen bearbeiten${icon('arrow')}</button></header>
        <ul class="briefs">${picks.map((a) => brief(a, { showCat: true })).join('')}</ul>
      </section>`);
    }
  } else {
    parts.push(`<div class="cta"><p><strong>Mach dahamm zu deiner Zeitung.</strong> Wähle Themen und Stichwörter – passende Meldungen rücken dann nach oben.</p>
      <button type="button" class="button" data-open-profile>${icon('sliders')}Interessen wählen</button></div>`);
  }

  const cardBlock = (cat, title, n) => {
    // Cards with pictures first keeps rows of equal height together.
    const items = take(pools[cat], n).sort((a, b) => Boolean(b.image) - Boolean(a.image));
    if (!items.length) return '';
    return `<section class="block" data-cat="${cat}">${blockHead(cat, title, pools[cat].length)}
      <div class="grid-3">${items.map((a) => storyCard(a, { showCat: false })).join('')}</div></section>`;
  };
  const briefBlock = (cat, n) => {
    const items = take(pools[cat], n);
    if (!items.length) return '';
    return `<section class="block" data-cat="${cat}">${blockHead(cat, catLabel(cat), pools[cat].length)}
      <ol class="briefs">${items.map((a) => brief(a)).join('')}</ol></section>`;
  };

  parts.push(cardBlock('lokal', `Aus ${placeShort()}`, 6));
  parts.push(cardBlock('regional', 'Mittelfranken', 6));
  parts.push(`<div class="columns">${briefBlock('blaulicht', 5)}${briefBlock('sport', 5)}${briefBlock('bayern', 5)}</div>`);
  parts.push(cardBlock('allgemein', 'Deutschland & Welt', 6));
  parts.push(`<div class="columns two">${briefBlock('wirtschaft', 5)}${briefBlock('tech', 5)}</div>`);
  dom.homeView.innerHTML = parts.join('');
}

function renderList() {
  const term = state.searchTerm.trim().toLowerCase();
  const isSearch = Boolean(term);
  const section = state.section;
  let pool = state.articles.filter(passesMood);
  pool = isSearch ? pool.filter((a) => a.searchText.includes(term)) : pool.filter((a) => a.cat === section);

  const sourceCounts = {};
  pool.forEach((a) => {
    sourceCounts[a.sourceId] = (sourceCounts[a.sourceId] || 0) + 1;
  });
  const sourceOptions = state.sources.filter((s) => sourceCounts[s.id]);
  if (state.filterSource !== 'all' && !sourceCounts[state.filterSource]) state.filterSource = 'all';
  dom.sourceFilter.innerHTML = `<option value="all">Alle Quellen</option>${sourceOptions
    .map((s) => `<option value="${escapeAttr(s.id)}">${escapeHtml(s.name)} (${sourceCounts[s.id]})</option>`)
    .join('')}`;
  dom.sourceFilter.value = state.filterSource;
  if (state.filterSource !== 'all') pool = pool.filter((a) => a.sourceId === state.filterSource);

  const sorted = state.sort === 'date' ? byDate(pool) : byRank(pool);
  const shown = sorted.slice(0, state.listLimit);

  if (isSearch) delete dom.listView.dataset.cat;
  else dom.listView.dataset.cat = section;
  $('#listEyebrow').textContent = isSearch ? 'Suche' : section === 'lokal' ? 'Mein Ort' : 'Rubrik';
  $('#listTitle').textContent = isSearch ? `„${state.searchTerm.trim()}“` : section === 'lokal' ? `Aus ${placeShort()}` : catLabel(section);
  $('#listCaption').textContent = [
    `${pool.length} ${pool.length === 1 ? 'Meldung' : 'Meldungen'}`,
    state.sort === 'date' ? 'neueste zuerst' : 'nach Nähe, Interessen und Aktualität',
    state.goodOnly ? 'nur gute Nachrichten' : '',
  ].filter(Boolean).join(' · ');

  document.querySelectorAll('[data-sort]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sort === state.sort)));
  document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));

  dom.feed.className = `feed ${state.view}`;
  dom.feed.innerHTML = shown.map((a) => storyCard(a, { reason: state.sort === 'relevance', showCat: isSearch })).join('');
  dom.empty.hidden = pool.length > 0 || (state.loading && !state.articles.length);
  const remaining = sorted.length - shown.length;
  dom.moreButton.hidden = remaining <= 0;
  dom.moreButton.textContent = `Mehr anzeigen (${remaining} weitere)`;
}

function renderView() {
  const listing = Boolean(state.searchTerm.trim()) || state.section !== 'home';
  dom.homeView.hidden = listing;
  dom.listView.hidden = !listing;
  state.registry = [];
  if (listing) renderList();
  else renderHome();
}

function renderNav() {
  const counts = countByCat();
  const searching = Boolean(state.searchTerm.trim());
  const item = (id, label, iconName, count) => `<button type="button" class="nav-item" data-section="${id}"${id === 'home' ? '' : ` data-cat="${id}"`}${
    !searching && state.section === id ? ' aria-current="page"' : ''
  } title="${escapeAttr(label)}">${icon(iconName)}<span class="nav-label">${escapeHtml(label)}</span>${count === null ? '' : `<span class="nav-count">${count}</span>`}</button>`;
  dom.sectionNav.innerHTML = [
    item('home', 'Überblick', 'home', null),
    '<div class="nav-divider"></div>',
    ...CAT_ORDER.map((cat) => (cat === 'allgemein' ? '<div class="nav-divider"></div>' : '') + item(cat, catLabel(cat), CAT_ICONS[cat], counts[cat] || 0)),
  ].join('');
}

function renderSources() {
  const loaded = state.sources.filter((s) => state.sourceStats[s.id]);
  const failing = loaded.filter((s) => state.sourceStats[s.id].error);
  dom.sourceHealth.textContent = loaded.length ? `${loaded.length - failing.length} von ${state.sources.length} aktiv` : '';
  dom.sourceList.innerHTML = CAT_ORDER.map((cat) => {
    const sources = state.sources.filter((s) => s.cat === cat);
    if (!sources.length) return '';
    return `<li class="source-group">${escapeHtml(catLabel(cat))}</li>${sources
      .map((s) => {
        const stat = state.sourceStats[s.id];
        const status = !stat ? '…' : stat.error ? icon('alert') : stat.count;
        const title = stat?.error ? `Nicht erreichbar: ${stat.error}` : `${stat?.count ?? 0} Meldungen`;
        return `<li><button type="button" data-source="${escapeAttr(s.id)}" class="${stat?.error ? 'error' : ''}" aria-pressed="${state.section === s.cat && state.filterSource === s.id}" title="${escapeAttr(title)}"><span class="source-name">${escapeHtml(s.name)}</span><span class="source-count">${status}</span></button></li>`;
      })
      .join('')}`;
  }).join('');
}

function renderStatus() {
  dom.placeName.textContent = placeShort();
  dom.goodNews.setAttribute('aria-pressed', String(state.goodOnly));
  if (state.loadedAt) {
    dom.lastUpdate.textContent = `Aktualisiert ${state.loadedAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`;
  }
  const active = Object.values(state.sourceStats).filter((s) => !s.error).length;
  dom.itemCount.textContent = state.articles.length ? `${state.articles.length} Meldungen aus ${active} Quellen` : '';
}

function renderAll() {
  renderNav();
  renderSources();
  renderStatus();
  renderView();
}

let toastTimer = null;

function toast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => dom.toast.classList.remove('show'), 2800);
}

function goTo(section, { source = 'all' } = {}) {
  state.section = section;
  state.filterSource = source;
  state.listLimit = PAGE_SIZE;
  if (state.searchTerm) {
    state.searchTerm = '';
    dom.search.value = '';
  }
  renderAll();
  dom.content.scrollTop = 0;
}

// ───────────────────────────────────────────────────────────────
// Local summarizer (TextRank-style extractive)
// ───────────────────────────────────────────────────────────────

const GERMAN_STOPWORDS = new Set([
  'der','die','das','den','dem','des','ein','eine','einen','einem','einer','eines',
  'und','oder','aber','doch','sondern','denn','weil','dass','daß','wenn','als','wie',
  'ist','sind','war','waren','sein','seine','seiner','seines','seinem','seinen',
  'hat','haben','hatte','hatten','wird','werden','wurde','wurden','würde','würden',
  'kann','können','konnte','konnten','muss','müssen','musste','mussten',
  'soll','sollen','sollte','sollten','will','wollen','wollte','wollten',
  'ich','du','er','sie','es','wir','ihr','mich','dich','sich','uns','euch','ihm','ihn','ihnen',
  'mein','dein','sein','ihr','unser','euer','meine','deine','seine','ihre',
  'in','im','an','am','auf','aus','bei','beim','mit','nach','von','vom','zu','zum','zur','für','über','unter','durch','gegen','ohne','um','vor','zwischen','seit','bis','während','wegen','trotz',
  'nicht','kein','keine','keinen','keiner','keinem','keines',
  'auch','noch','nur','schon','sehr','mehr','weniger','immer','wieder','heute','gestern','morgen','jetzt','dann','dort','hier','so','also','etwa','etwas','jemand','niemand','alle','alles','viele','wenige','manche',
  'das','sich','sie','seit','dabei','dadurch','damit','darauf','daran','darin','darum','darüber','davor','dazu','deshalb','deswegen','dieser','diese','dieses','diesen','diesem',
  'man','sowie','sowohl','beide','beiden','jeder','jede','jedes','jeden','andere','anderen','anderem','jedoch','zwar','sondern',
  'ab','was','wer','wo','warum','wann','welche','welcher','welches','welchen','welchem',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zA-ZäöüÄÖÜß0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !GERMAN_STOPWORDS.has(w));
}

function looksLikeJunk(s) {
  if (!s) return true;
  // CSS declarations or rule blocks
  if (/[{};]\s*[a-zA-Z-]+\s*:/.test(s)) return true;
  if (/[{}]/.test(s)) {
    const braces = (s.match(/[{}]/g) || []).length;
    if (braces >= 2) return true;
  }
  // JS / inline scripts
  if (/\b(function\s*\(|var\s+|let\s+|const\s+|window\.|document\.|\.addEventListener|=>)\b/.test(s)) return true;
  // CSS at-rules and selectors
  if (/@(media|keyframes|font-face|import|supports)/i.test(s)) return true;
  if (/\bdata:image\/|base64,|url\(/i.test(s)) return true;
  // Mostly non-letters → likely markup/code
  const letters = (s.match(/[a-zA-ZäöüÄÖÜß]/g) || []).length;
  if (s.length > 0 && letters / s.length < 0.6) return true;
  // Boilerplate / UI snippets
  if (/^(Anmelden|Registrieren|Jetzt lesen|Abonnieren|Mehr erfahren|Kommentare?|Newsletter|Cookie|Datenschutz|Impressum|Werbung|Anzeige|Bitte aktivieren|Zur Merkliste|PRODUKTE & TIPPS|Mehr zum Thema|Lesen Sie auch|Zum Artikel)/i.test(s)) return true;
  // Repeated punctuation / class-name lists
  if (/(\.[\w-]+\s*){3,}/.test(s)) return true;
  return false;
}

function splitSentences(text) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const parts = cleaned
    .split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ"„])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 400)
    .filter((s) => !looksLikeJunk(s));
  // Dedupe
  const seen = new Set();
  return parts.filter((s) => {
    const key = s.slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function summarize(text, maxSentences = 3) {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) return sentences.join(' ');

  // Word frequency
  const freq = {};
  sentences.forEach((s) => {
    tokenize(s).forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });
  });

  // Score sentences: sum of word frequencies, normalized by length, with position bias
  const scored = sentences.map((s, i) => {
    const words = tokenize(s);
    if (words.length === 0) return { s, i, score: 0 };
    const sum = words.reduce((acc, w) => acc + (freq[w] || 0), 0);
    const positionBoost = i < 2 ? 1.3 : i < 5 ? 1.1 : 1.0;
    return { s, i, score: (sum / words.length) * positionBoost };
  });

  // Pick top N, then reorder by original position
  const top = scored
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);

  return top.join(' ');
}

function extractMainText(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Remove all non-content elements before any text extraction
  const REMOVE_SELECTORS = [
    'script', 'style', 'noscript', 'iframe', 'svg', 'canvas', 'video', 'audio',
    'button', 'form', 'input', 'select', 'textarea',
    'nav', 'header', 'footer', 'aside',
    '[role="navigation"]', '[role="banner"]', '[role="complementary"]', '[role="contentinfo"]',
    '[aria-hidden="true"]',
    // Common ad/widget/related/comments patterns
    '[class*="ad-"]', '[class*="-ad"]', '[class*="advert"]', '[class*="banner"]',
    '[id*="ad-"]', '[id*="-ad"]', '[id*="advert"]', '[id*="banner"]',
    '[class*="newsletter"]', '[class*="paywall"]', '[class*="subscribe"]', '[class*="abo"]',
    '[class*="related"]', '[class*="recommend"]', '[class*="empfehlung"]',
    '[class*="comment"]', '[id*="comment"]',
    '[class*="cookie"]', '[class*="consent"]',
    '[class*="share"]', '[class*="social"]', '[class*="teilen"]',
    '[class*="vergleichsinfo"]', '[class*="merkliste"]', '[class*="metadata"]',
    '[class*="breadcrumb"]', '[class*="tag-list"]', '[class*="hashtag"]',
    '[class*="meta"]', '[class*="sidebar"]', '[class*="widget"]',
    'figure figcaption', // optional — drop captions for cleaner summaries
  ];
  REMOVE_SELECTORS.forEach((sel) => {
    try {
      doc.querySelectorAll(sel).forEach((el) => el.remove());
    } catch {
      // invalid selector — skip
    }
  });

  // Strip inline event handlers / data:image attributes too (defense in depth)
  doc.querySelectorAll('[style]').forEach((el) => el.removeAttribute('style'));

  // og:description (clean lead)
  const og = (
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
    ''
  ).trim();

  // Prefer semantic article containers
  const candidateSelectors = [
    'article [itemprop="articleBody"]',
    '[itemprop="articleBody"]',
    'article',
    'main article',
    'main',
    '[role="main"]',
    '.article-body', '.story-body', '.entry-content', '.post-content', '.post-body', '.content-article',
  ];
  let container = null;
  let bestLen = 0;
  for (const sel of candidateSelectors) {
    for (const el of doc.querySelectorAll(sel)) {
      const len = (el.textContent || '').length;
      if (len > bestLen) {
        bestLen = len;
        container = el;
      }
    }
    if (container && bestLen > 800) break;
  }
  if (!container) container = doc.body || doc.documentElement;

  // Collect paragraphs and headings from container only
  const paragraphs = Array.from(
    container.querySelectorAll('p, h2, h3, li')
  )
    .map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim())
    .filter((t) => t.length > 40 && t.length < 800)
    .filter((t) => !looksLikeJunk(t));

  // Dedupe
  const seen = new Set();
  const clean = [];
  for (const p of paragraphs) {
    const key = p.slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    clean.push(p);
  }

  const body = clean.join(' ');
  const combined = ((og && !body.includes(og.slice(0, 50)) ? og + ' ' : '') + body).trim();
  return combined.slice(0, 8000);
}

let summaryRun = 0;
let summaryArticle = null;

async function createSummary(article) {
  let baseText = article.desc || '';
  let fetchedFull = false;

  // If RSS desc is too short, try to fetch full article
  if (baseText.length < 250 && !article.viaGoogle) {
    try {
      const res = await api.fetchFeed(article.link);
      if (res.ok) {
        const extracted = extractMainText(res.xml);
        if (extracted.length > baseText.length) {
          baseText = extracted;
          fetchedFull = true;
        }
      }
    } catch {
      // ignore — use RSS desc
    }
  }

  if (!baseText || baseText.length < 50) return null;

  const result = {
    summary: summarize(baseText, 4),
    fetchedFull,
    sourceLength: baseText.length,
    createdAt: Date.now(),
  };
  summaryCache[article.link] = result;
  saveSummaryCache();
  return result;
}

async function openSummary(article, trigger = null) {
  const run = ++summaryRun;
  summaryArticle = article;
  dom.summaryTitle.textContent = article.title;
  dom.summarySource.textContent = [article.publisher, relativeTime(article.date)].filter(Boolean).join(' · ');
  dom.summaryBody.innerHTML = `<div class="summary-loading" aria-live="polite">${icon('sparkle')}
    <div><strong>Kurzfassung wird erstellt …</strong><p class="muted">Nur diese Meldung wird lokal auf deinem Gerät ausgewertet.</p></div></div>`;
  if (!dom.summaryDialog.open) dom.summaryDialog.showModal();
  if (trigger) {
    trigger.classList.add('summarizing');
    trigger.disabled = true;
  }
  try {
    const cached = summaryCache[article.link];
    const result = cached || (await createSummary(article));
    if (run !== summaryRun) return;
    showSummary(result, article, !cached);
  } finally {
    if (trigger) {
      trigger.classList.remove('summarizing');
      trigger.disabled = false;
    }
  }
}

function showSummary(result, article, justGenerated) {
  const openButton = '<button type="button" class="button primary" data-summary="open">Original lesen' + icon('arrow') + '</button>';
  if (!result) {
    dom.summaryBody.innerHTML = `<p class="summary-text">Für diese Meldung liegt zu wenig Text für eine Kurzfassung vor.</p>
      <div class="summary-actions">${openButton}</div>`;
    return;
  }
  const meta = result.fetchedFull
    ? `Lokal erstellt aus dem Volltext (${result.sourceLength} Zeichen)`
    : `Lokal erstellt aus der Feed-Beschreibung (${result.sourceLength} Zeichen)`;
  const age = justGenerated ? 'gerade eben' : `aus dem Zwischenspeicher, ${relativeTime(new Date(result.createdAt))}`;
  dom.summaryBody.innerHTML = `
    <p class="summary-text">${escapeHtml(result.summary)}</p>
    <div class="summary-meta">${escapeHtml(meta)} · ${escapeHtml(age)}</div>
    <div class="summary-actions">
      ${openButton}
      <button type="button" class="button ghost" data-summary="regen">Neu erstellen</button>
    </div>
  `;
}

// ───────────────────────────────────────────────────────────────
// Place & profile dialogs
// ───────────────────────────────────────────────────────────────

function renderPlaceDialog() {
  const query = fold(dom.placeSearch.value.trim());
  const groups = Region.groups()
    .map((group) => ({
      ...group,
      places: group.places.filter((p) => !query || fold(`${p.name} ${p.short || ''}`).includes(query) || fold(group.label).includes(query)),
    }))
    .filter((group) => group.places.length);
  dom.placeGroups.innerHTML = groups.length
    ? groups
        .map((group) => `<div class="place-group"><h3>${escapeHtml(group.label)}</h3><div class="chips">${group.places
          .map((p) => `<button type="button" class="chip" data-place="${p.id}" aria-pressed="${p.id === state.place.id}">${escapeHtml(p.name)}</button>`)
          .join('')}</div></div>`)
        .join('')
    : '<p class="muted place-empty">Kein Ort in der Liste gefunden – trag ihn unten ein.</p>';
  if (!groups.length && dom.placeSearch.value.trim()) dom.customPlace.value = dom.placeSearch.value.trim();

  const suggestion = state.geoSuggestion;
  const showSuggestion = suggestion && !(suggestion.id === state.place.id && suggestion.name === state.place.name);
  dom.placeSuggestion.hidden = !showSuggestion;
  if (showSuggestion) {
    dom.placeSuggestion.innerHTML = `${icon('pin')}<span>Anhand deiner IP-Adresse vermutet: <strong>${escapeHtml(suggestion.name)}</strong></span>
      <button type="button" class="button" data-place-suggestion>Übernehmen</button>`;
  }
}

function openPlaceDialog() {
  dom.placeSearch.value = '';
  dom.customPlace.value = state.place.custom ? state.place.name : '';
  renderPlaceDialog();
  dom.placeDialog.showModal();
}

function applyPlace(place) {
  if (!place) return;
  state.place = place;
  state.placeChosen = true;
  storage.set('news.place', Region.serialize(place));
  if (dom.placeDialog.open) dom.placeDialog.close();
  state.sources = buildSources(place);
  rebuildArticles();
  renderAll();
  toast(`Dein Ort: ${placeShort()}. Lokale Meldungen werden geladen …`);
  loadAll({ onlyMissing: true });
}

function renderProfile() {
  dom.interestChoices.innerHTML = CAT_ORDER.map(
    (cat) => `<button type="button" class="chip" data-topic="${cat}" data-cat="${cat}" aria-pressed="${state.profile.interests.includes(cat)}">${icon(CAT_ICONS[cat])}${escapeHtml(catLabel(cat))}</button>`
  ).join('');
  const weighted = Object.keys(state.profile.sources).length;
  dom.profileHint.textContent = `Dein Profil bleibt auf diesem Gerät. ${
    weighted ? `${weighted} ${weighted === 1 ? 'Quelle ist' : 'Quellen sind'} über „Mehr/Weniger“ gewichtet.` : 'Mit den Daumen an jeder Meldung gewichtest du Quellen.'
  }`;
}

function persistProfile() {
  if (!Personalization.save(state.profile)) toast('Speichern nicht möglich. Dein Profil gilt nur für diese Sitzung.');
  renderProfile();
  renderView();
}

function openProfile() {
  dom.keywords.value = state.profile.keywords.join(', ');
  renderProfile();
  dom.profileDialog.showModal();
}

function adjustSource(article, delta) {
  const current = state.profile.sources[article.sourceId] || 0;
  state.profile.sources[article.sourceId] = Math.max(-3, Math.min(3, current + delta));
  const saved = Personalization.save(state.profile);
  toast(saved ? `Gemerkt: ${delta > 0 ? 'mehr' : 'weniger'} von „${article.source}“.` : 'Speichern nicht möglich. Dein Profil gilt nur für diese Sitzung.');
}

// ───────────────────────────────────────────────────────────────
// Theme & events
// ───────────────────────────────────────────────────────────────

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function effectiveTheme() {
  return document.documentElement.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
}

function updateThemeIcon() {
  dom.themeIcon.setAttribute('href', effectiveTheme() === 'dark' ? '#i-sun' : '#i-moon');
}

function initTheme() {
  const saved = storage.get('theme');
  if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
  updateThemeIcon();
  darkQuery.addEventListener('change', updateThemeIcon);
  dom.toggleTheme.addEventListener('click', () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    storage.set('theme', next);
    updateThemeIcon();
  });
}

function isTyping(target) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

function handleArticleClick(e) {
  const sectionButton = e.target.closest('[data-section]');
  if (sectionButton) {
    goTo(sectionButton.dataset.section);
    return;
  }
  if (e.target.closest('[data-open-profile]')) {
    openProfile();
    return;
  }
  const item = e.target.closest('[data-key]');
  const article = item && state.registry[+item.dataset.key];
  if (!article) return;
  const actionEl = e.target.closest('[data-action]');
  const action = actionEl ? actionEl.dataset.action : 'open';
  if (e.target.closest('button') && !actionEl) return;
  e.preventDefault();
  if (action === 'summary') openSummary(article, actionEl);
  else if (action === 'more') adjustSource(article, 1);
  else if (action === 'less') adjustSource(article, -1);
  else api.openExternal(article.link);
}

function initEvents() {
  initTheme();

  dom.refresh.addEventListener('click', () => loadAll());
  dom.content.addEventListener('click', handleArticleClick);

  dom.sectionNav.addEventListener('click', (e) => {
    const button = e.target.closest('[data-section]');
    if (button) goTo(button.dataset.section);
  });
  dom.sourceList.addEventListener('click', (e) => {
    const button = e.target.closest('[data-source]');
    const source = button && state.sources.find((s) => s.id === button.dataset.source);
    if (source) goTo(source.cat, { source: source.id });
  });

  dom.search.addEventListener('input', debounce(() => {
    state.searchTerm = dom.search.value;
    state.filterSource = 'all';
    state.listLimit = PAGE_SIZE;
    renderNav();
    renderView();
    dom.content.scrollTop = 0;
  }, 150));
  dom.search.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (dom.search.value) {
      dom.search.value = '';
      state.searchTerm = '';
      renderNav();
      renderView();
    } else {
      dom.search.blur();
    }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      dom.search.focus();
      dom.search.select();
    } else if (e.key === '/' && !isTyping(e.target) && !document.querySelector('dialog[open]')) {
      e.preventDefault();
      dom.search.focus();
    }
  });

  dom.goodNews.addEventListener('click', () => {
    state.goodOnly = !state.goodOnly;
    storage.set('news.goodOnly', state.goodOnly ? '1' : '0');
    renderAll();
    toast(state.goodOnly ? 'Nur noch gute Nachrichten.' : 'Wieder alle Meldungen.');
  });
  dom.sourceFilter.addEventListener('change', () => {
    state.filterSource = dom.sourceFilter.value;
    state.listLimit = PAGE_SIZE;
    renderSources();
    renderView();
  });
  document.querySelectorAll('[data-sort]').forEach((button) => {
    button.addEventListener('click', () => {
      state.sort = button.dataset.sort;
      storage.set('news.sort', state.sort);
      renderView();
    });
  });
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      state.view = button.dataset.view;
      storage.set('news.view', state.view);
      renderView();
    });
  });
  dom.moreButton.addEventListener('click', () => {
    state.listLimit += PAGE_SIZE;
    renderView();
  });
  $('#resetFilters').addEventListener('click', () => {
    state.goodOnly = false;
    storage.set('news.goodOnly', '0');
    if (state.searchTerm) dom.search.value = '';
    goTo(state.searchTerm ? 'home' : state.section);
  });

  // Broken or tracking-pixel images collapse instead of leaving gaps.
  document.addEventListener('error', (e) => {
    if (e.target instanceof HTMLImageElement) e.target.parentElement?.classList.add('broken');
  }, true);
  document.addEventListener('load', (e) => {
    if (e.target instanceof HTMLImageElement && e.target.naturalWidth < 60) e.target.parentElement?.classList.add('broken');
  }, true);

  // Dialogs: close buttons and backdrop clicks
  document.addEventListener('click', (e) => {
    const close = e.target.closest('[data-close]');
    if (close) close.closest('dialog')?.close();
  });
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
  });

  dom.placeButton.addEventListener('click', openPlaceDialog);
  dom.placeSearch.addEventListener('input', renderPlaceDialog);
  dom.placeGroups.addEventListener('click', (e) => {
    const button = e.target.closest('[data-place]');
    if (button) applyPlace(Region.findPlace(button.dataset.place));
  });
  dom.placeSuggestion.addEventListener('click', (e) => {
    if (e.target.closest('[data-place-suggestion]')) applyPlace(state.geoSuggestion);
  });
  const useCustom = () => {
    const place = Region.customPlace(dom.customPlace.value);
    if (place) applyPlace(place);
    else toast('Bitte gib einen Ortsnamen ein.');
  };
  dom.useCustomPlace.addEventListener('click', useCustom);
  dom.customPlace.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') useCustom();
  });
  dom.placeDialog.addEventListener('close', () => {
    // Closing the first-run picker keeps the default place for good.
    if (!state.placeChosen) {
      state.placeChosen = true;
      storage.set('news.place', Region.serialize(state.place));
    }
  });

  dom.openProfile.addEventListener('click', openProfile);
  dom.interestChoices.addEventListener('click', (e) => {
    const button = e.target.closest('[data-topic]');
    if (!button) return;
    const topic = button.dataset.topic;
    state.profile.interests = state.profile.interests.includes(topic)
      ? state.profile.interests.filter((id) => id !== topic)
      : [...state.profile.interests, topic];
    persistProfile();
  });
  dom.keywords.addEventListener('input', debounce(() => {
    state.profile.keywords = [...new Set(dom.keywords.value.split(',').map((word) => word.trim().toLowerCase().slice(0, 40)).filter(Boolean))].slice(0, 10);
    persistProfile();
  }, 300));
  dom.resetProfile.addEventListener('click', () => {
    state.profile = Personalization.empty();
    dom.keywords.value = '';
    persistProfile();
    toast('Profil zurückgesetzt.');
  });

  dom.summaryBody.addEventListener('click', (e) => {
    const button = e.target.closest('[data-summary]');
    if (!button || !summaryArticle) return;
    if (button.dataset.summary === 'open') {
      api.openExternal(summaryArticle.link);
    } else {
      delete summaryCache[summaryArticle.link];
      saveSummaryCache();
      openSummary(summaryArticle);
    }
  });
  dom.summaryDialog.addEventListener('close', () => {
    summaryRun += 1;
  });

  window.setInterval(() => loadAll(), REFRESH_MS);
}

bindDom();
state.sources = buildSources(state.place);
initEvents();
renderAll();
loadAll();
if (!state.placeChosen) {
  openPlaceDialog();
  resolveGeo();
}
