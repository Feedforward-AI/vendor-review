// tooling/test/manifest.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const TIER = /Fortune[\s-]*(100|500)/i; // hyphenated forms too

test('plugin.json declares the frozen plugin name and required fields', () => {
  const m = read('.claude-plugin/plugin.json');
  assert.equal(m.name, 'vendor-review');
  assert.match(m.version, /^\d+\.\d+\.\d+$/);
  assert.ok(m.description && m.description.length > 20);
  assert.ok(m.author, 'author present');
  assert.doesNotMatch(JSON.stringify(m), TIER);
});

test('marketplace.json is named feedforward and lists vendor-review', () => {
  const mk = read('.claude-plugin/marketplace.json');
  assert.equal(mk.name, 'feedforward');
  assert.ok(Array.isArray(mk.plugins));
  assert.ok(mk.plugins.some((p) => p.name === 'vendor-review'));
});
