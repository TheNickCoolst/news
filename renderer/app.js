// OpaNews renderer - aggregates RSS/Atom feeds from public news sources

const SOURCES = [
  { id: 'tagesschau', name: 'Tagesschau', url: 'https://www.tagesschau.de/index~rss2.xml' },
  { id: 'spiegel', name: 'Spiegel', url: 'https://www.spiegel.de/schlagzeilen/index.rss' },
  { id: 'zeit', name: 'ZEIT Online', url: 'https://newsfeed.zeit.de/index' },
  { id: 'heise', name: 'Heise', url: 'https://www.heise.de/rss/heise-atom.xml' },
  { id: 'sz', name: 'Süddeutsche', url: 'https://rss.sueddeutsche.de/rss/Topthemen' },
  { id: 'ntv', name: 'n-tv', url: 'https://www.n-tv.de/rss' },
  { id: 'welt', name: 'Welt', url: 'https://www.welt.de/feeds/topnews.rss' },
  { id: 'faz', name: 'FAZ', url: 'https://www.faz.net/rss/aktuell/' },
  { id: 'tagesspiegel', name: 'Tagesspiegel', url: 'https://www.tagesspiegel.de/contentexport/feed/home' },
  { id: 'dw', name: 'Deutsche Welle', url: 'https://rss.dw.com/rdf/rss-de-all' },
];

const state = {
  articles: [],
  filterSource: 'all',
  searchTerm: '',
  view: 'cards',
  sourceStats: {},
};

const $ = (sel) => document.querySelector(sel);

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

function parseFeed(xmlText, source) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('XML parse error');
  }
  const items = [];

  // RSS 2.0
  doc.querySelectorAll('item').forEach((item) => {
    const title = stripHtml(item.querySelector('title')?.textContent || '');
    const link = (item.querySelector('link')?.textContent || '').trim();
    const desc = stripHtml(
      item.querySelector('description')?.textContent ||
        item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent ||
        ''
    );
    const pubDate = item.querySelector('pubDate')?.textContent;
    if (title && link) {
      items.push({
        title: decodeEntities(title),
        link,
        desc: decodeEntities(desc).slice(0, 400),
        date: parseDate(pubDate),
        source: source.name,
        sourceId: source.id,
      });
    }
  });

  // Atom
  if (items.length === 0) {
    doc.querySelectorAll('entry').forEach((entry) => {
      const title = stripHtml(entry.querySelector('title')?.textContent || '');
      const linkEl = entry.querySelector('link');
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
          desc: decodeEntities(desc).slice(0, 400),
          date: parseDate(pubDate),
          source: source.name,
          sourceId: source.id,
        });
      }
    });
  }

  // RDF (DW feed)
  if (items.length === 0) {
    doc.querySelectorAll('item').forEach((item) => {
      const title = stripHtml(item.querySelector('title')?.textContent || '');
      const link = (item.querySelector('link')?.textContent || '').trim();
      const desc = stripHtml(item.querySelector('description')?.textContent || '');
      const dateEl = item.getElementsByTagNameNS('*', 'date')[0];
      if (title && link) {
        items.push({
          title: decodeEntities(title),
          link,
          desc: decodeEntities(desc).slice(0, 400),
          date: parseDate(dateEl?.textContent),
          source: source.name,
          sourceId: source.id,
        });
      }
    });
  }

  return items;
}

async function fetchSource(source) {
  try {
    const res = await window.opaNews.fetchFeed(source.url);
    if (!res.ok) throw new Error(res.error);
    const items = parseFeed(res.xml, source);
    state.sourceStats[source.id] = { count: items.length, error: null };
    return items;
  } catch (err) {
    state.sourceStats[source.id] = { count: 0, error: err.message };
    return [];
  }
}

async function loadAll() {
  $('#loading').classList.remove('hidden');
  $('#empty').classList.add('hidden');
  $('#feed').innerHTML = '';

  const results = await Promise.all(SOURCES.map((s) => fetchSource(s)));
  const merged = results.flat();
  merged.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date - a.date;
  });

  state.articles = merged;
  $('#lastUpdate').textContent =
    'aktualisiert ' + new Date().toLocaleTimeString('de-DE');
  $('#loading').classList.add('hidden');
  renderSources();
  render();
}

function render() {
  const term = state.searchTerm.trim().toLowerCase();
  const filtered = state.articles.filter((a) => {
    if (state.filterSource !== 'all' && a.sourceId !== state.filterSource)
      return false;
    if (term) {
      const hay = (a.title + ' ' + a.desc).toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });

  $('#itemCount').textContent = `${filtered.length} Meldungen`;
  const feed = $('#feed');
  feed.className = 'feed ' + state.view;
  feed.innerHTML = '';

  if (filtered.length === 0) {
    $('#empty').classList.remove('hidden');
    return;
  }
  $('#empty').classList.add('hidden');

  const frag = document.createDocumentFragment();
  filtered.forEach((a) => {
    const el = document.createElement('article');
    el.className = 'article';
    el.innerHTML = `
      <div class="meta">
        <span class="source">${escapeHtml(a.source)}</span>
        <span class="time">${relativeTime(a.date)}</span>
      </div>
      <h3>${escapeHtml(a.title)}</h3>
      <p class="desc">${escapeHtml(a.desc)}</p>
    `;
    el.addEventListener('click', () => {
      window.opaNews.openExternal(a.link);
    });
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

function renderSources() {
  const list = $('#sourceList');
  const filterSel = $('#sourceFilter');
  list.innerHTML = '';
  // keep "Alle" option, rebuild source-specific options
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

  SOURCES.forEach((s) => {
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
  filterSel.value = state.filterSource;
}

function initEvents() {
  $('#refresh').addEventListener('click', loadAll);
  $('#search').addEventListener('input', (e) => {
    state.searchTerm = e.target.value;
    render();
  });
  $('#sourceFilter').addEventListener('change', (e) => {
    state.filterSource = e.target.value;
    renderSources();
    render();
  });
  $('#toggleView').addEventListener('click', () => {
    state.view = state.view === 'cards' ? 'list' : 'cards';
    $('#toggleView').textContent =
      state.view === 'cards' ? '⊞ Karten' : '☰ Liste';
    render();
  });
  $('#toggleTheme').addEventListener('click', () => {
    const root = document.documentElement;
    root.classList.toggle('light');
    $('#toggleTheme').textContent = root.classList.contains('light') ? '☀' : '☾';
    localStorage.setItem(
      'theme',
      root.classList.contains('light') ? 'light' : 'dark'
    );
  });

  // Auto-refresh every 10 minutes
  setInterval(loadAll, 10 * 60 * 1000);

  // Theme from storage
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.add('light');
    $('#toggleTheme').textContent = '☀';
  }
}

initEvents();
loadAll();
