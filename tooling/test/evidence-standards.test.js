// tooling/test/evidence-standards.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const FILE = 'skills/vendor-research/references/evidence-standards.md';

test('evidence-standards names the three §6 provenance tiers', () => {
  const t = read(FILE);
  assert.match(t, /Independent/);
  assert.match(t, /Vendor claim/);
  assert.match(t, /Provided doc/);
});

test('evidence-standards states the discipline rules', () => {
  const t = read(FILE);
  assert.match(t, /claim, not proof/i);
  assert.match(t, /surface the conflict/i);          // vendor claim vs independent
  assert.match(t, /never fabricate/i);
  assert.match(t, /URL/);
  assert.match(t, /access date/i);
});

test('evidence-standards harmonizes provenance with the spine reliability scale', () => {
  assert.match(read(FILE), /reliability follows from independent corroboration/i);
});
