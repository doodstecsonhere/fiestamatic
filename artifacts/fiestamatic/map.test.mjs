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

test('keeps the enlarged offline schematic covering the viewport while panning', () => {
  assert.match(offlineMap, /viewBox="0 0 2400 1350"/);
  assert.match(offlineMap, /<rect width="2400" height="1350" fill="#b8dce8"/);
  assert.match(mapSource, /\[9\.245, 123\.195\][\s\S]*\[9\.365, 123\.415\]/);
  assert.match(mapSource, /getBoundsZoom\(bounds, true\)/);
  assert.match(mapSource, /setMinZoom\(coverZoom\)/);
  assert.match(mapSource, /setMaxBounds\(bounds\)/);
  assert.match(mapSource, /maxBoundsViscosity = 1/);
});

test('restores the normal online map viewport without offline constraints', () => {
  assert.match(mapSource, /setMaxBounds\(undefined\)/);
  assert.match(mapSource, /setMinZoom\(0\)/);
  assert.match(mapSource, /maxBoundsViscosity = 0/);
  assert.match(mapSource, /setView\(ONLINE_CENTER, ONLINE_ZOOM/);
});

test('precaches the bundled fallback without service-worker caching OSM tiles', () => {
  assert.match(serviceWorker, /'\/offline-map\.svg'/);
  assert.doesNotMatch(serviceWorker, /TILE_CACHE|tileStrategy/);
  assert.match(serviceWorker, /url\.hostname === 'tile\.openstreetmap\.org'\) return/);
});
