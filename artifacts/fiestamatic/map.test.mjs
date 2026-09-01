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

test('uses one geographic projection for the portrait schematic and Leaflet overlay', () => {
  assert.match(offlineMap, /viewBox="0 0 1100 1350"/);
  assert.match(offlineMap, /data-bounds="9\.235,123\.240,9\.370,123\.350"/);
  assert.match(offlineMap, /x = \(longitude - 123\.240\) × 10000/);
  assert.match(offlineMap, /y = \(9\.370 - latitude\) × 10000/);
  assert.match(offlineMap, /© OpenStreetMap contributors/);
  assert.match(mapSource, /\[9\.235, 123\.240\][\s\S]*\[9\.370, 123\.350\]/);
});

test('fits every marker with compact mobile padding while keeping the schematic bounded', () => {
  assert.match(offlineMap, /<rect width="1100" height="1350" fill="#b8dce8"/);
  assert.match(mapSource, /getBoundsZoom\(bounds, true\)/);
  assert.match(mapSource, /FIESTA_MARKER_BOUNDS/);
  assert.match(mapSource, /fitBounds\(FIESTA_MARKER_BOUNDS, \{[\s\S]*padding: L\.point\(8, 96\)/);
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

test('shows the custom status only for the offline fallback', () => {
  assert.match(mapSource, /\{useOfflineMap && \(/);
  assert.doesNotMatch(mapSource, /Interactive map · © OpenStreetMap contributors/);
  assert.match(mapSource, /Offline barangay guide — markers and fiesta details remain available/);
  assert.match(mapSource, /bottom-\[96px\][^\n]*sm:bottom-\[84px\]/);
});

test('precaches the bundled fallback without service-worker caching OSM tiles', () => {
  assert.match(serviceWorker, /'\/offline-map\.svg'/);
  assert.doesNotMatch(serviceWorker, /TILE_CACHE|tileStrategy/);
  assert.match(serviceWorker, /url\.hostname === 'tile\.openstreetmap\.org'\) return/);
});
