const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync('renderer/region.js', 'utf8') + '\nthis.model = Region;', context);
const region = context.model;

const nuernberg = region.findPlace('nuernberg');
const match = region.matcher(nuernberg);
assert.ok(match.place.test('Neue Straßenbahn für Nürnberg'));
assert.ok(match.place.test('Der Nürnberger Christkindlesmarkt öffnet'));
assert.ok(!match.place.test('Nürnbergring bleibt gesperrt'));
assert.ok(match.region.test('Unfall in Mittelfranken'));

const roth = region.matcher(region.findPlace('roth'));
assert.ok(!roth.place.test('Claudia Roth kritisiert Kulturetat'));
assert.ok(roth.place.test('Neues Hallenbad für die Stadt Roth'));
assert.ok(roth.kreis.test('Im Landkreis Roth wird gebaut'));

const lauf = region.matcher(region.findPlace('lauf'));
assert.ok(!lauf.place.test('Der Lauf der Dinge'));
assert.ok(lauf.place.test('Altstadtfest in Lauf an der Pegnitz'));

const pappenheim = region.matcher(region.findPlace('pappenheim'));
assert.ok(!pappenheim.place.test('Er kennt seine Pappenheimer'));

assert.equal(region.placeFromCity('Nuremberg').id, 'nuernberg');
assert.equal(region.placeFromCity('Fuerth').id, 'fuerth');
assert.equal(region.placeFromCity('Forchheim'), null);
assert.equal(region.customPlace('Forchheim').custom, true);
assert.equal(region.customPlace('Zirndorf').id, 'zirndorf');
assert.equal(region.customPlace('<img src=x>').name, 'img srcx');
assert.equal(region.customPlace(' '), null);

assert.equal(region.deserialize(region.serialize(region.findPlace('hersbruck'))).id, 'hersbruck');
assert.equal(region.deserialize(region.serialize(region.customPlace('Wilhermsdorf'))).name, 'Wilhermsdorf');
assert.equal(region.deserialize('{broken'), null);
assert.equal(region.deserialize(JSON.stringify({ id: 'unknown' })), null);

assert.equal(region.placeQuery(nuernberg), '"Nürnberg"');
assert.equal(region.kreisQuery('Landkreis Ansbach'), '"Landkreis Ansbach"');
const ids = region.PLACES.map((place) => place.id);
assert.equal(new Set(ids).size, ids.length);
region.PLACES.forEach((place) => assert.ok(!place.kreis || region.KREISE[place.kreis], place.id));

console.log(`Passed: ${region.PLACES.length} places, word matching, ambiguous names, geo lookup, custom places, persistence.`);
