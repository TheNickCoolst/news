// Mittelfranken: places, districts and text matching for local ranking.
const Region = (() => {
  const KREISE = {
    'Landkreis Ansbach': { short: 'Lkr. Ansbach' },
    'Landkreis Erlangen-Höchstadt': { short: 'Lkr. Erlangen-Höchstadt', query: '"Erlangen-Höchstadt"', terms: ['Erlangen-Höchstadt'] },
    'Landkreis Fürth': { short: 'Lkr. Fürth' },
    'Landkreis Neustadt/Aisch-Bad Windsheim': {
      short: 'Lkr. Neustadt/Aisch-Bad Windsheim',
      query: '"Neustadt/Aisch-Bad Windsheim" OR "Neustadt an der Aisch-Bad Windsheim"',
      terms: ['Neustadt/Aisch-Bad Windsheim', 'Neustadt an der Aisch-Bad Windsheim'],
    },
    'Landkreis Nürnberger Land': { short: 'Nürnberger Land', query: '"Nürnberger Land"', terms: ['Nürnberger Land'] },
    'Landkreis Roth': { short: 'Lkr. Roth' },
    'Landkreis Weißenburg-Gunzenhausen': { short: 'Lkr. Weißenburg-Gunzenhausen', query: '"Weißenburg-Gunzenhausen"', terms: ['Weißenburg-Gunzenhausen'] },
  };

  // `terms` are used for text matching, `query` for the Google News search.
  // Ambiguous names (Roth, Stein, Lauf, Feucht …) only match qualified terms.
  const PLACES = [
    { id: 'nuernberg', name: 'Nürnberg', kreis: null, aliases: ['Nuremberg', 'Nuernberg'] },
    { id: 'fuerth', name: 'Fürth', kreis: null, aliases: ['Fuerth'] },
    { id: 'erlangen', name: 'Erlangen', kreis: null },
    { id: 'schwabach', name: 'Schwabach', kreis: null },
    { id: 'ansbach', name: 'Ansbach', kreis: null },

    { id: 'dinkelsbuehl', name: 'Dinkelsbühl', kreis: 'Landkreis Ansbach' },
    { id: 'feuchtwangen', name: 'Feuchtwangen', kreis: 'Landkreis Ansbach' },
    { id: 'rothenburg', name: 'Rothenburg ob der Tauber', short: 'Rothenburg o. d. T.', kreis: 'Landkreis Ansbach', terms: ['Rothenburg ob der Tauber', 'Rothenburg o. d. T.', 'Rothenburg'] },
    { id: 'heilsbronn', name: 'Heilsbronn', kreis: 'Landkreis Ansbach' },
    { id: 'herrieden', name: 'Herrieden', kreis: 'Landkreis Ansbach' },
    { id: 'wassertruedingen', name: 'Wassertrüdingen', kreis: 'Landkreis Ansbach' },

    { id: 'herzogenaurach', name: 'Herzogenaurach', kreis: 'Landkreis Erlangen-Höchstadt' },
    { id: 'hoechstadt', name: 'Höchstadt an der Aisch', short: 'Höchstadt', kreis: 'Landkreis Erlangen-Höchstadt', terms: ['Höchstadt an der Aisch', 'Höchstadt/Aisch', 'Höchstadt'] },
    { id: 'baiersdorf', name: 'Baiersdorf', kreis: 'Landkreis Erlangen-Höchstadt' },
    { id: 'eckental', name: 'Eckental', kreis: 'Landkreis Erlangen-Höchstadt' },
    { id: 'heroldsberg', name: 'Heroldsberg', kreis: 'Landkreis Erlangen-Höchstadt' },

    { id: 'zirndorf', name: 'Zirndorf', kreis: 'Landkreis Fürth' },
    { id: 'oberasbach', name: 'Oberasbach', kreis: 'Landkreis Fürth' },
    { id: 'stein', name: 'Stein', kreis: 'Landkreis Fürth', terms: ['Stein bei Nürnberg', 'Stadt Stein'], query: '"Stein bei Nürnberg" OR "Stadt Stein"' },
    { id: 'langenzenn', name: 'Langenzenn', kreis: 'Landkreis Fürth' },
    { id: 'cadolzburg', name: 'Cadolzburg', kreis: 'Landkreis Fürth' },
    { id: 'rosstal', name: 'Roßtal', kreis: 'Landkreis Fürth', aliases: ['Rosstal'] },

    { id: 'neustadt-aisch', name: 'Neustadt an der Aisch', short: 'Neustadt/Aisch', kreis: 'Landkreis Neustadt/Aisch-Bad Windsheim', terms: ['Neustadt an der Aisch', 'Neustadt/Aisch', 'Neustadt a. d. Aisch'], query: '"Neustadt an der Aisch" OR "Neustadt/Aisch"' },
    { id: 'bad-windsheim', name: 'Bad Windsheim', kreis: 'Landkreis Neustadt/Aisch-Bad Windsheim' },
    { id: 'scheinfeld', name: 'Scheinfeld', kreis: 'Landkreis Neustadt/Aisch-Bad Windsheim' },
    { id: 'uffenheim', name: 'Uffenheim', kreis: 'Landkreis Neustadt/Aisch-Bad Windsheim' },

    { id: 'lauf', name: 'Lauf an der Pegnitz', short: 'Lauf', kreis: 'Landkreis Nürnberger Land', terms: ['Lauf an der Pegnitz', 'Lauf/Pegnitz', 'Lauf a. d. Pegnitz'], query: '"Lauf an der Pegnitz" OR "Lauf/Pegnitz"' },
    { id: 'hersbruck', name: 'Hersbruck', kreis: 'Landkreis Nürnberger Land' },
    { id: 'altdorf', name: 'Altdorf bei Nürnberg', short: 'Altdorf', kreis: 'Landkreis Nürnberger Land', terms: ['Altdorf bei Nürnberg', 'Altdorf b. Nürnberg'], query: '"Altdorf" Nürnberg OR Hersbruck OR Feucht' },
    { id: 'roethenbach', name: 'Röthenbach an der Pegnitz', short: 'Röthenbach', kreis: 'Landkreis Nürnberger Land', terms: ['Röthenbach an der Pegnitz', 'Röthenbach/Pegnitz', 'Röthenbach'] },
    { id: 'schwarzenbruck', name: 'Schwarzenbruck', kreis: 'Landkreis Nürnberger Land' },
    { id: 'feucht', name: 'Feucht', kreis: 'Landkreis Nürnberger Land', terms: ['Markt Feucht'], query: '"Feucht" Nürnberg OR Altdorf OR Schwarzenbruck' },

    { id: 'roth', name: 'Roth', kreis: 'Landkreis Roth', terms: ['Stadt Roth', 'Landkreis Roth', 'Roth bei Nürnberg'], query: '"Stadt Roth" OR "in Roth" OR "Landkreis Roth"' },
    { id: 'hilpoltstein', name: 'Hilpoltstein', kreis: 'Landkreis Roth' },
    { id: 'wendelstein', name: 'Wendelstein', kreis: 'Landkreis Roth', terms: ['Markt Wendelstein'], query: '"Wendelstein" Schwabach OR Roth OR Nürnberg' },
    { id: 'schwanstetten', name: 'Schwanstetten', kreis: 'Landkreis Roth' },
    { id: 'allersberg', name: 'Allersberg', kreis: 'Landkreis Roth' },
    { id: 'greding', name: 'Greding', kreis: 'Landkreis Roth' },

    { id: 'weissenburg', name: 'Weißenburg in Bayern', short: 'Weißenburg', kreis: 'Landkreis Weißenburg-Gunzenhausen', terms: ['Weißenburg', 'Weissenburg'], query: '"Weißenburg"' },
    { id: 'gunzenhausen', name: 'Gunzenhausen', kreis: 'Landkreis Weißenburg-Gunzenhausen' },
    { id: 'treuchtlingen', name: 'Treuchtlingen', kreis: 'Landkreis Weißenburg-Gunzenhausen' },
    { id: 'pappenheim', name: 'Pappenheim', kreis: 'Landkreis Weißenburg-Gunzenhausen', strict: true },
  ];

  const DEFAULT_ID = 'nuernberg';
  const REGION_TERMS = ['Mittelfranken', 'Franken', 'fränkisch', 'Nürnberg', 'Fürth', 'Erlangen', 'Schwabach', 'Ansbach', 'Metropolregion Nürnberg'];

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Whole-word match; `suffix` also accepts adjective forms like „Nürnberger“.
  function termRegex(terms, suffix) {
    const body = terms.map(escapeRegex).join('|');
    return new RegExp(`(^|[^\\p{L}])(?:${body})${suffix ? '(?:er|e[mnrs]?)?' : ''}(?=$|[^\\p{L}])`, 'iu');
  }

  const REGION_RE = termRegex(REGION_TERMS, true);

  function normalize(value) {
    return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');
  }

  function shortName(place) {
    return place.short || place.name;
  }

  function placeQuery(place) {
    return place.query || `"${place.name}"`;
  }

  function kreisQuery(kreis) {
    return KREISE[kreis]?.query || `"${kreis}"`;
  }

  function kreisShort(kreis) {
    return KREISE[kreis]?.short || kreis;
  }

  function matcher(place) {
    const kreis = place.kreis ? KREISE[place.kreis] : null;
    return {
      place: termRegex(place.terms || [place.name], !place.strict && !place.custom),
      kreis: kreis ? termRegex(kreis.terms || [place.kreis], false) : null,
      region: REGION_RE,
    };
  }

  function findPlace(id) {
    return PLACES.find((place) => place.id === id) || null;
  }

  function placeFromCity(city) {
    const key = normalize(city);
    if (!key) return null;
    return PLACES.find((place) => [place.name, place.short, ...(place.aliases || [])].filter(Boolean).some((name) => normalize(name) === key)) || null;
  }

  function customPlace(name) {
    const clean = String(name || '').replace(/[^\p{L}\p{N} .,'/()-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 60);
    if (clean.length < 2) return null;
    return placeFromCity(clean) || { id: 'custom', name: clean, kreis: null, custom: true };
  }

  function groups() {
    const out = [{ label: 'Kreisfreie Städte', places: PLACES.filter((place) => !place.kreis) }];
    Object.keys(KREISE).forEach((kreis) => {
      out.push({ label: kreis, places: PLACES.filter((place) => place.kreis === kreis) });
    });
    return out;
  }

  function serialize(place) {
    return JSON.stringify(place.custom ? { id: 'custom', name: place.name } : { id: place.id });
  }

  function deserialize(raw) {
    try {
      const data = JSON.parse(raw);
      if (data?.id === 'custom') return customPlace(data.name);
      return findPlace(data?.id);
    } catch {
      return null;
    }
  }

  return {
    PLACES,
    KREISE,
    DEFAULT_ID,
    shortName,
    placeQuery,
    kreisQuery,
    kreisShort,
    matcher,
    findPlace,
    placeFromCity,
    customPlace,
    groups,
    serialize,
    deserialize,
  };
})();
