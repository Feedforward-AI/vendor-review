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

test('reconciliation example does not reuse a Provided-doc noun (no "contract" collision)', () => {
  // "contract" is a canonical Provided-doc example; it must not also be the
  // reliable-Vendor-claim example, or an agent could tag a contract clause either way.
  const t = read(FILE);
  const recon = t.slice(t.indexOf('### Provenance vs. reliability'), t.indexOf('## Citation rule'));
  assert.doesNotMatch(recon, /\bcontract\b/i,
    'the reliability example must not reuse "contract" (a Provided-doc canonical noun)');
});
