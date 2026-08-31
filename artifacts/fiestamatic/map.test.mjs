import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const mapSource = await readFile(new URL('./src/pages/Map.tsx', import.meta.url), 'utf8');
const serviceWorker = await readFile(new URL('./public/sw.js', import.meta.url), 'utf8');
const offlineMap = await readFile(new URL('./public/offline-map.svg', import.meta.url), 'utf8');

test('uses the keyless OpenStreetMap endpoint with visible attribution', () => {
  assert.match(mapSource, /https:\/\/tile\.openstreetmap\.org\/\{z\}\/\{x\}\/\{y\}\.png/);
  assert.match(mapSource, /OpenStreetMap<\/a> contributors/);
  assert.doesNotMatch(mapSource, /cartocdn|carto\.com\/basemaps\/apikey/i);
});

test('uses a bundled map when offline or when online tiles fail', () => {
  assert.match(mapSource, /!isOnline \|\| tileFailed/);
  assert.match(mapSource, /url="\/offline-map\.svg"/);
  assert.match(mapSource, /tileerror: \(\) => setTileFailed\(true\)/);
  assert.match(mapSource, /schematic is not for street navigation/i);
  assert.match(mapSource, /title=\{`\$\{m\.barangay\} fiesta marker`\}/);
  assert.match(offlineMap, /Offline Dumaguete barangay guide/);
});

test('precaches the bundled fallback without service-worker caching OSM tiles', () => {
  assert.match(serviceWorker, /'\/offline-map\.svg'/);
  assert.doesNotMatch(serviceWorker, /TILE_CACHE|tileStrategy/);
  assert.match(serviceWorker, /url\.hostname === 'tile\.openstreetmap\.org'\) return/);
});
