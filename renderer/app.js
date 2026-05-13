// news renderer - aggregates RSS/Atom feeds + local AI summaries

const BASE_SOURCES = [
  // General news
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
  { id: 'focus', name: 'Focus', url: 'https://rss.focus.de/fol/XML/rss_folnews.xml', cat: 'allgemein' },
  // Public broadcasters / regional
  { id: 'br24', name: 'BR24', url: 'https://www.br.de/nachrichten/index.rssfeed', cat: 'regional' },
  { id: 'ndr', name: 'NDR', url: 'https://www.ndr.de/nachrichten/index-rss.xml', cat: 'regional' },
  { id: 'wdr', name: 'WDR', url: 'https://www1.wdr.de/uebersicht100.feed', cat: 'regional' },
  { id: 'dlf', name: 'Deutschlandfunk', url: 'https://www.deutschlandfunk.de/nachrichten-100.rss', cat: 'regional' },
  // Tech
  { id: 'heise', name: 'Heise', url: 'https://www.heise.de/rss/heise-atom.xml', cat: 'tech' },
  { id: 'heisesec', name: 'Heise Security', url: 'https://www.heise.de/security/rss/news-atom.xml', cat: 'tech' },
  { id: 'golem', name: 'Golem', url: 'https://rss.golem.de/rss.php?feed=RSS2.0', cat: 'tech' },
  { id: 't3n', name: 't3n', url: 'https://t3n.de/rss.xml', cat: 'tech' },
  { id: 'netzpol', name: 'Netzpolitik', url: 'https://netzpolitik.org/feed/', cat: 'tech' },
  // Business
  { id: 'handelsblatt', name: 'Handelsblatt', url: 'https://www.handelsblatt.com/contentexport/feed/top-themen', cat: 'wirtschaft' },
  { id: 'manager', name: 'Manager Magazin', url: 'https://www.manager-magazin.de/news/index.rss', cat: 'wirtschaft' },
];

let SOURCES = BASE_SOURCES.slice();

const state = {
  articles: [],
  filterSource: 'all',
  filterCat: 'all',
  searchTerm: '',
  view: 'cards',
  sourceStats: {},
  mood: localStorage.getItem('news.mood') || 'positiveFirst', // 'positiveFirst' | 'date' | 'onlyPositive'
  geo: null,
  loading: false,
  visibleArticles: [],
};

const api = window.news;

// ───────────────────────────────────────────────────────────────
// Geo / Google News (location-aware) — uses public ipapi.co lookup
// ───────────────────────────────────────────────────────────────

// Map ISO country code → Google News hl/gl/ceid locale.
// Fallback covers anything not listed.
const GEO_LOCALES = {
  DE: { hl: 'de', gl: 'DE', ceid: 'DE:de' },
  AT: { hl: 'de', gl: 'AT', ceid: 'AT:de' },
  CH: { hl: 'de', gl: 'CH', ceid: 'CH:de' },
  US: { hl: 'en-US', gl: 'US', ceid: 'US:en' },
  GB: { hl: 'en-GB', gl: 'GB', ceid: 'GB:en' },
  FR: { hl: 'fr', gl: 'FR', ceid: 'FR:fr' },
  IT: { hl: 'it', gl: 'IT', ceid: 'IT:it' },
  ES: { hl: 'es', gl: 'ES', ceid: 'ES:es' },
  NL: { hl: 'nl', gl: 'NL', ceid: 'NL:nl' },
  PL: { hl: 'pl', gl: 'PL', ceid: 'PL:pl' },
};

const GERMAN_REGION_ALIASES = {
  'baden-wuerttemberg': 'Baden-Württemberg',
  'baden-wurttemberg': 'Baden-Württemberg',
  'baden-württemberg': 'Baden-Württemberg',
  bawü: 'Baden-Württemberg',
  bavaria: 'Bayern',
  bayern: 'Bayern',
  berlin: 'Berlin',
  brandenburg: 'Brandenburg',
  bremen: 'Bremen',
  hamburg: 'Hamburg',
  hesse: 'Hessen',
  hessen: 'Hessen',
  'mecklenburg-vorpommern': 'Mecklenburg-Vorpommern',
  niedersachsen: 'Niedersachsen',
  'lower saxony': 'Niedersachsen',
  'nordrhein-westfalen': 'Nordrhein-Westfalen',
  nrw: 'Nordrhein-Westfalen',
  'north rhine-westphalia': 'Nordrhein-Westfalen',
  'north-rhine-westphalia': 'Nordrhein-Westfalen',
  'rheinland-pfalz': 'Rheinland-Pfalz',
  saarland: 'Saarland',
  sachsen: 'Sachsen',
  saxony: 'Sachsen',
  'sachsen-anhalt': 'Sachsen-Anhalt',
  'saxony-anhalt': 'Sachsen-Anhalt',
  'schleswig-holstein': 'Schleswig-Holstein',
  thüringen: 'Thüringen',
  thueringen: 'Thüringen',
  thuringen: 'Thüringen',
  thuringia: 'Thüringen',
};

const REGIONAL_PORTAL_QUERIES = {
  'Baden-Württemberg': ['SWR Baden-Württemberg', 'Stuttgarter Zeitung', 'Badische Zeitung'],
  Bayern: ['BR24 Bayern', 'Merkur Bayern', 'Augsburger Allgemeine'],
  Berlin: ['rbb24 Berlin', 'Tagesspiegel Berlin', 'Berliner Zeitung'],
  Brandenburg: ['rbb24 Brandenburg', 'Märkische Allgemeine', 'Lausitzer Rundschau'],
  Bremen: ['buten un binnen Bremen', 'Weser Kurier'],
  Hamburg: ['NDR Hamburg', 'Hamburger Abendblatt', 'MOPO Hamburg'],
  Hessen: ['hessenschau Hessen', 'Frankfurter Rundschau', 'FAZ Rhein-Main'],
  'Mecklenburg-Vorpommern': ['NDR Mecklenburg-Vorpommern', 'Ostsee-Zeitung', 'Nordkurier'],
  Niedersachsen: ['NDR Niedersachsen', 'Hannoversche Allgemeine', 'Neue Osnabrücker Zeitung'],
  'Nordrhein-Westfalen': ['WDR Nordrhein-Westfalen', 'Rheinische Post', 'Kölner Stadt-Anzeiger'],
  'Rheinland-Pfalz': ['SWR Rheinland-Pfalz', 'Rhein-Zeitung', 'Allgemeine Zeitung Mainz'],
  Saarland: ['SR Saarland', 'Saarbrücker Zeitung'],
  Sachsen: ['MDR Sachsen', 'Sächsische Zeitung', 'Leipziger Volkszeitung'],
  'Sachsen-Anhalt': ['MDR Sachsen-Anhalt', 'Mitteldeutsche Zeitung', 'Volksstimme'],
  'Schleswig-Holstein': ['NDR Schleswig-Holstein', 'Kieler Nachrichten', 'Lübecker Nachrichten'],
  Thüringen: ['MDR Thüringen', 'Thüringer Allgemeine', 'Ostthüringer Zeitung'],
};

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

function germanRegionName(region) {
  if (!region) return null;
  const direct = GERMAN_REGION_ALIASES[String(region).trim().toLowerCase()];
  if (direct) return direct;
  return GERMAN_REGION_ALIASES[normalizeKey(region)] || region;
}

function googleNewsTopUrl(loc) {
  return `https://news.google.com/rss?hl=${encodeURIComponent(loc.hl)}&gl=${encodeURIComponent(loc.gl)}&ceid=${encodeURIComponent(loc.ceid)}`;
}

function googleNewsSearchUrl(query, loc, whenDays = 2) {
  const q = encodeURIComponent(`${query} when:${whenDays}d`);
  return `https://news.google.com/rss/search?q=${q}&hl=${encodeURIComponent(loc.hl)}&gl=${encodeURIComponent(loc.gl)}&ceid=${encodeURIComponent(loc.ceid)}`;
}

function buildLocationSources(geo) {
  if (!geo) {
    return [
      {
        id: 'gnews-de-top',
        name: 'Deutschland aktuell',
        url: googleNewsTopUrl(GEO_LOCALES.DE),
        cat: 'lokal',
        local: true,
      },
    ];
  }
  const loc = GEO_LOCALES.DE;
  const region = germanRegionName(geo.region);
  const useNearby = !geo.countryCode || geo.countryCode === 'DE';
  const out = [
    {
      id: 'gnews-de-top',
      name: 'Deutschland aktuell',
      url: googleNewsTopUrl(loc),
      cat: 'lokal',
      local: true,
    },
  ];
  if (useNearby && geo.city) {
    out.push({
      id: 'gnews-city',
      name: `Nachrichten aus ${geo.city}`,
      url: googleNewsSearchUrl(`${geo.city} Nachrichten`, loc, 7),
      cat: 'lokal',
      local: true,
    });
    out.push({
      id: 'gnews-city-portals',
      name: `Lokale Portale · ${geo.city}`,
      url: googleNewsSearchUrl(`${geo.city} Zeitung OR ${geo.city} Lokalnachrichten`, loc, 7),
      cat: 'lokal',
      local: true,
    });
  }
  if (useNearby && region && region !== geo.city) {
    out.push({
      id: 'gnews-region',
      name: `Nachrichten aus ${region}`,
      url: googleNewsSearchUrl(`${region} Nachrichten`, loc, 7),
      cat: 'lokal',
      local: true,
    });
  }
  (useNearby ? REGIONAL_PORTAL_QUERIES[region] || [] : []).forEach((query, idx) => {
    out.push({
      id: `gnews-region-portal-${idx}`,
      name: query,
      url: googleNewsSearchUrl(query, loc, 7),
      cat: 'lokal',
      local: true,
    });
  });
  return out;
}

async function resolveGeo() {
  if (state.geo) return state.geo;
  try {
    const res = await api.getGeo();
    if (res.ok) {
      state.geo = res.geo;
      SOURCES = buildLocationSources(res.geo).concat(BASE_SOURCES);
      updateGeoUi();
      return res.geo;
    }
    console.warn('Geo lookup failed:', res.error);
  } catch (err) {
    console.warn('Geo lookup error:', err);
  }
  SOURCES = buildLocationSources(null).concat(BASE_SOURCES);
  updateGeoUi();
  return null;
}

function updateGeoUi() {
  const el = $('#geoTag');
  if (!el) return;
  if (state.geo && state.geo.city) {
    el.textContent = `📍 ${state.geo.city}${state.geo.countryCode ? ', ' + state.geo.countryCode : ''}`;
    el.classList.remove('hidden');
  } else if (state.geo && state.geo.countryCode) {
    el.textContent = `📍 ${state.geo.countryCode}`;
    el.classList.remove('hidden');
  }
}

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

function moodLabel(score) {
  if (score >= 2) return { emoji: '😊', cls: 'mood-pos', title: 'gute Nachricht' };
  if (score === 1) return { emoji: '🙂', cls: 'mood-mild-pos', title: 'eher positiv' };
  if (score === 0) return { emoji: '😐', cls: 'mood-neutral', title: 'neutral' };
  if (score === -1) return { emoji: '😕', cls: 'mood-mild-neg', title: 'eher negativ' };
  return { emoji: '😟', cls: 'mood-neg', title: 'schlechte Nachricht' };
}

const SUMMARY_CACHE_KEY = 'news.summaries.v1';
const summaryCache = loadSummaryCache();

const $ = (sel) => document.querySelector(sel);
const dom = {};

function bindDom() {
  [
    'loading',
    'empty',
    'feed',
    'lastUpdate',
    'itemCount',
    'sourceList',
    'sourceFilter',
    'catFilter',
    'moodFilter',
    'refresh',
    'search',
    'toggleView',
    'toggleTheme',
    'summaryModal',
    'summaryTitle',
    'summaryBody',
    'summarySource',
    'closeSummary',
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

function loadSummaryCache() {
  try {
    return JSON.parse(localStorage.getItem(SUMMARY_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveSummaryCache() {
  try {
    localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(summaryCache));
  } catch {
    // ignore quota errors
  }
}

function decodeEntities(s) {
  if (!s) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = s;
  return txt.value;
}

function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
}

function extractImageFromHtml(html) {
  if (!html) return null;
  const m = html.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
  if (m) return m[1];
  return null;
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
  if (m < 60) return `vor ${m} Min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std`;
  const d = Math.floor(h / 24);
  if (d < 7) return `vor ${d} T`;
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

function localScore(article, geo) {
  if (!article) return 0;
  let score = article.cat === 'lokal' || article.local ? 4 : 0;
  const text = `${article.title} ${article.desc} ${article.source}`.toLowerCase();
  const terms = [
    geo?.city,
    geo?.region,
    germanRegionName(geo?.region),
    geo?.countryCode === 'DE' ? 'deutschland' : null,
  ]
    .filter(Boolean)
    .map((term) => String(term).toLowerCase());
  terms.forEach((term, idx) => {
    if (text.includes(term)) score += idx === 0 ? 5 : 3;
  });
  return score;
}

function mergeDuplicates(articles) {
  const byKey = new Map();
  articles.forEach((article) => {
    const key = normalizedTitle(article.title) || article.link;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, article);
      return;
    }
    const existingScore = (existing.localScore || 0) + (existing.desc?.length || 0) / 1000;
    const nextScore = (article.localScore || 0) + (article.desc?.length || 0) / 1000;
    if (nextScore > existingScore) {
      article.altSources = [existing.source].concat(existing.altSources || []);
      byKey.set(key, article);
    } else {
      existing.altSources = (existing.altSources || []).concat(article.source);
    }
  });
  return Array.from(byKey.values());
}

function findImage(item, source) {
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
  const fromHtml = extractImageFromHtml(decodeEntities(descRaw));
  if (fromHtml) return fromHtml;
  return null;
}

function parseFeed(xmlText, source) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('XML parse error');
  }
  const items = [];

  const rssItems = doc.querySelectorAll('item');
  rssItems.forEach((item) => {
    const title = stripHtml(item.querySelector('title')?.textContent || '');
    const link = (item.querySelector('link')?.textContent || '').trim();
    const desc = stripHtml(
      item.querySelector('description')?.textContent ||
        item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent ||
        ''
    );
    const pubDate =
      item.querySelector('pubDate')?.textContent ||
      item.getElementsByTagNameNS('*', 'date')[0]?.textContent;
    if (title && link) {
      items.push({
        title: decodeEntities(title),
        link,
        desc: decodeEntities(desc).slice(0, 600),
        image: findImage(item, source),
        date: parseDate(pubDate),
        source: source.name,
        sourceId: source.id,
        cat: source.cat,
        local: Boolean(source.local),
      });
    }
  });

  if (items.length === 0) {
    const atomEntries = doc.querySelectorAll('entry');
    atomEntries.forEach((entry) => {
      const title = stripHtml(entry.querySelector('title')?.textContent || '');
      const linkEl = entry.querySelector('link[rel="alternate"], link');
      const link = linkEl?.getAttribute('href') || linkEl?.textContent || '';
      const desc = stripHtml(
        entry.querySelector('summary')?.textContent ||
          entry.querySelector('content')?.textContent ||
          ''
      );
      const pubDate =
        entry.querySelector('updated')?.textContent ||
        entry.querySelector('published')?.textContent;
      if (title && link) {
        items.push({
          title: decodeEntities(title),
          link: link.trim(),
          desc: decodeEntities(desc).slice(0, 600),
          image: findImage(entry, source),
          date: parseDate(pubDate),
          source: source.name,
          sourceId: source.id,
          cat: source.cat,
          local: Boolean(source.local),
        });
      }
    });
  }

  return items;
}

async function fetchSource(source) {
  try {
    const res = await api.fetchFeed(source.url);
    if (!res.ok) throw new Error(res.error);
    const items = parseFeed(res.xml, source);
    state.sourceStats[source.id] = { count: items.length, error: null };
    return items;
  } catch (err) {
    state.sourceStats[source.id] = { count: 0, error: err.message };
    return [];
  }
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const idx = next++;
      results[idx] = await mapper(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return results;
}

async function loadAll() {
  if (state.loading) return;
  state.loading = true;
  dom.refresh.disabled = true;
  dom.loading.classList.remove('hidden');
  dom.empty.classList.add('hidden');
  dom.feed.innerHTML = '';

  try {
    await resolveGeo();

    const results = await mapWithConcurrency(SOURCES, 6, fetchSource);
    const merged = results.flat();
    merged.forEach((a) => {
      a.sentiment = sentiment(a);
      a.localScore = localScore(a, state.geo);
      a.searchText = `${a.title} ${a.desc}`.toLowerCase();
      a.sortTime = a.date ? a.date.getTime() : 0;
    });

    state.articles = mergeDuplicates(merged);
    dom.lastUpdate.textContent =
      'aktualisiert ' + new Date().toLocaleTimeString('de-DE');
    renderSources();
    render();
  } finally {
    dom.loading.classList.add('hidden');
    dom.refresh.disabled = false;
    state.loading = false;
  }
}

function render() {
  const term = state.searchTerm.trim().toLowerCase();
  const filtered = state.articles.filter((a) => {
    if (state.filterSource !== 'all' && a.sourceId !== state.filterSource)
      return false;
    if (state.filterCat !== 'all' && a.cat !== state.filterCat) return false;
    if (state.mood === 'onlyPositive' && (a.sentiment ?? 0) < 1) return false;
    if (term) {
      if (!a.searchText.includes(term)) return false;
    }
    return true;
  });

  // Sort: positiveFirst boosts good news to top, then by date.
  // 'date' keeps pure chronological. 'onlyPositive' uses positiveFirst order.
  filtered.sort((a, b) => {
    const ta = a.sortTime || 0;
    const tb = b.sortTime || 0;
    if (state.mood === 'date') {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return tb - ta;
    }
    if ((a.localScore || 0) !== (b.localScore || 0)) {
      return (b.localScore || 0) - (a.localScore || 0);
    }
    // positiveFirst / onlyPositive:
    // bucket by sentiment sign so positives float above negatives,
    // but inside each bucket keep recency.
    const bucket = (s) => (s >= 1 ? 2 : s <= -1 ? 0 : 1);
    const ba = bucket(a.sentiment ?? 0);
    const bb = bucket(b.sentiment ?? 0);
    if (ba !== bb) return bb - ba;
    return tb - ta;
  });

  state.visibleArticles = filtered;
  dom.itemCount.textContent = `${filtered.length} Meldungen`;
  const feed = dom.feed;
  feed.className = 'feed ' + state.view;
  feed.innerHTML = '';

  if (filtered.length === 0) {
    $('#empty').classList.remove('hidden');
    return;
  }
  $('#empty').classList.add('hidden');

  const frag = document.createDocumentFragment();
  filtered.forEach((a, idx) => {
    const el = document.createElement('article');
    el.className = 'article';
    el.dataset.idx = idx;
    const imgPart = a.image
      ? `<div class="thumb"><img loading="lazy" src="${escapeAttr(a.image)}" alt="" onerror="this.parentElement.classList.add('broken')" /></div>`
      : '';
    const mood = moodLabel(a.sentiment ?? 0);
    el.innerHTML = `
      ${imgPart}
      <div class="body">
        <div class="meta">
          <span class="source" data-cat="${escapeAttr(a.cat)}">${escapeHtml(a.source)}</span>
          <span class="mood ${mood.cls}" title="${escapeAttr(mood.title)}">${mood.emoji}</span>
          <span class="time">${relativeTime(a.date)}</span>
        </div>
        <h3>${escapeHtml(a.title)}</h3>
        <p class="desc">${escapeHtml(a.desc)}</p>
        <div class="actions">
          <button class="btn-summary" data-idx="${idx}">🧠 Zusammenfassen</button>
          <button class="btn-open" data-idx="${idx}">↗ Öffnen</button>
        </div>
      </div>
    `;
    frag.appendChild(el);
  });
  feed.appendChild(frag);
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

function renderSources() {
  const list = $('#sourceList');
  const filterSel = $('#sourceFilter');
  list.innerHTML = '';
  filterSel.innerHTML = '<option value="all">Alle Quellen</option>';

  const allLi = document.createElement('li');
  allLi.dataset.id = 'all';
  allLi.innerHTML = `<span>Alle</span><span class="count">${state.articles.length}</span>`;
  if (state.filterSource === 'all') allLi.classList.add('active');
  allLi.addEventListener('click', () => {
    state.filterSource = 'all';
    $('#sourceFilter').value = 'all';
    renderSources();
    render();
  });
  list.appendChild(allLi);

  // Group by category
  const byCat = {};
  SOURCES.forEach((s) => {
    byCat[s.cat] = byCat[s.cat] || [];
    byCat[s.cat].push(s);
  });
  const catNames = { lokal: 'Lokal (dein Ort)', allgemein: 'Allgemein', regional: 'Regional / ÖR', tech: 'Tech', wirtschaft: 'Wirtschaft' };

  Object.keys(byCat).forEach((cat) => {
    const header = document.createElement('li');
    header.className = 'category-header';
    header.innerHTML = `<span>${escapeHtml(catNames[cat] || cat)}</span>`;
    list.appendChild(header);
    byCat[cat].forEach((s) => {
      const stat = state.sourceStats[s.id] || { count: 0 };
      const li = document.createElement('li');
      li.dataset.id = s.id;
      if (stat.error) li.classList.add('error');
      if (state.filterSource === s.id) li.classList.add('active');
      li.innerHTML = `<span>${escapeHtml(s.name)}</span><span class="count">${stat.count}</span>`;
      li.title = stat.error ? `Fehler: ${stat.error}` : `${stat.count} Meldungen`;
      li.addEventListener('click', () => {
        state.filterSource = s.id;
        $('#sourceFilter').value = s.id;
        renderSources();
        render();
      });
      list.appendChild(li);

      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      filterSel.appendChild(opt);
    });
  });

  filterSel.value = state.filterSource;
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

async function openSummary(article, triggerButton = null) {
  const modal = $('#summaryModal');
  const titleEl = $('#summaryTitle');
  const bodyEl = $('#summaryBody');
  const sourceEl = $('#summarySource');
  if (triggerButton) {
    triggerButton.classList.add('summarizing');
    triggerButton.disabled = true;
  }
  modal.classList.remove('hidden');
  requestAnimationFrame(() => modal.classList.add('open'));
  titleEl.textContent = article.title;
  sourceEl.textContent = `${article.source} · ${relativeTime(article.date)}`;
  bodyEl.innerHTML = `
    <div class="summary-loading" aria-live="polite">
      <div class="summary-orbit"><div class="spinner small"></div></div>
      <div>
        <strong>Zusammenfassung wird jetzt erzeugt</strong>
        <p>Nur diese Meldung wird lokal analysiert.</p>
      </div>
    </div>
  `;

  const cacheKey = article.link;
  if (summaryCache[cacheKey]) {
    showSummary(summaryCache[cacheKey], article, false);
    if (triggerButton) {
      triggerButton.classList.remove('summarizing');
      triggerButton.disabled = false;
    }
    return;
  }

  let baseText = article.desc || '';
  let fetchedFull = false;

  // If RSS desc is too short, try to fetch full article
  if (baseText.length < 250) {
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

  if (!baseText || baseText.length < 50) {
    bodyEl.innerHTML = '<p>Keine Daten für Zusammenfassung verfügbar.</p>';
    if (triggerButton) {
      triggerButton.classList.remove('summarizing');
      triggerButton.disabled = false;
    }
    return;
  }

  const summary = summarize(baseText, 4);
  const result = {
    summary,
    fetchedFull,
    sourceLength: baseText.length,
    createdAt: Date.now(),
  };
  summaryCache[cacheKey] = result;
  saveSummaryCache();
  showSummary(result, article, true);
  if (triggerButton) {
    triggerButton.classList.remove('summarizing');
    triggerButton.disabled = false;
  }
}

function showSummary(result, article, justGenerated) {
  const bodyEl = $('#summaryBody');
  const meta = result.fetchedFull
    ? `Lokale KI-Zusammenfassung aus Volltext (${result.sourceLength} Zeichen).`
    : `Lokale KI-Zusammenfassung aus RSS-Beschreibung (${result.sourceLength} Zeichen).`;
  const age = justGenerated
    ? 'gerade erzeugt'
    : 'aus Cache (' + relativeTime(new Date(result.createdAt)) + ')';
  bodyEl.innerHTML = `
    <p class="summary-text reveal">${escapeHtml(result.summary)}</p>
    <div class="summary-meta">${escapeHtml(meta)} · ${escapeHtml(age)}</div>
    <div class="summary-actions">
      <button id="openOriginal">Original lesen →</button>
      <button id="regenSummary">Neu erstellen</button>
    </div>
  `;
  $('#openOriginal').addEventListener('click', () => {
    api.openExternal(article.link);
  });
  $('#regenSummary').addEventListener('click', () => {
    delete summaryCache[article.link];
    saveSummaryCache();
    openSummary(article);
  });
}

function closeSummary() {
  const modal = $('#summaryModal');
  modal.classList.remove('open');
  window.setTimeout(() => {
    if (!modal.classList.contains('open')) modal.classList.add('hidden');
  }, 180);
}

function initEvents() {
  dom.refresh.addEventListener('click', loadAll);
  dom.search.addEventListener('input', debounce((e) => {
    state.searchTerm = e.target.value;
    render();
  }));
  dom.sourceFilter.addEventListener('change', (e) => {
    state.filterSource = e.target.value;
    renderSources();
    render();
  });
  dom.catFilter.addEventListener('change', (e) => {
    state.filterCat = e.target.value;
    render();
  });
  dom.moodFilter.value = state.mood;
  dom.moodFilter.addEventListener('change', (e) => {
    state.mood = e.target.value;
    localStorage.setItem('news.mood', state.mood);
    render();
  });
  dom.toggleView.addEventListener('click', () => {
    state.view = state.view === 'cards' ? 'list' : 'cards';
    dom.toggleView.textContent =
      state.view === 'cards' ? '⊞ Karten' : '☰ Liste';
    render();
  });
  dom.toggleTheme.addEventListener('click', () => {
    const root = document.documentElement;
    root.classList.toggle('light');
    dom.toggleTheme.textContent = root.classList.contains('light') ? '☀' : '☾';
    localStorage.setItem(
      'theme',
      root.classList.contains('light') ? 'light' : 'dark'
    );
  });
  dom.feed.addEventListener('click', (e) => {
    const articleEl = e.target.closest('.article');
    if (!articleEl) return;
    const article = state.visibleArticles[+articleEl.dataset.idx];
    if (!article) return;
    const summaryButton = e.target.closest('.btn-summary');
    if (summaryButton) {
      openSummary(article, summaryButton);
      return;
    }
    if (e.target.closest('.btn-open') || !e.target.closest('button')) {
      api.openExternal(article.link);
    }
  });

  // Summary modal
  dom.closeSummary.addEventListener('click', closeSummary);
  dom.summaryModal.addEventListener('click', (e) => {
    if (e.target.id === 'summaryModal') closeSummary();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSummary();
  });

  setInterval(loadAll, 10 * 60 * 1000);

  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.add('light');
    dom.toggleTheme.textContent = '☀';
  }
}

bindDom();
initEvents();
loadAll();
