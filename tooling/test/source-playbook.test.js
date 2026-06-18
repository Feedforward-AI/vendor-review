// tooling/test/source-playbook.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const FILE = 'skills/vendor-research/references/source-playbook.md';

test('source-playbook covers the five streams + brand discovery', () => {
  const t = read(FILE);
  for (const s of [/vendor[- ]owned surfaces/i, /technical (?:&|and) developer docs/i,
                   /community (?:&|and) social/i, /third-party (?:&|and) analyst/i,
                   /compliance (?:&|and) legal/i, /brand[- ]asset discovery/i])
    assert.match(t, s, String(s));
});

test('source-playbook flags technical docs as the high-signal stream', () => {
  assert.match(read(FILE), /beneath the marketing/i);
});

test('source-playbook names the five agents and the merge discipline', () => {
  const t = read(FILE);
  for (const a of ['research-vendor-surfaces','research-technical-docs','research-community',
                   'research-thirdparty','research-compliance'])
    assert.match(t, new RegExp(a));
  assert.match(t, /evidence-standards\.md/);
});
