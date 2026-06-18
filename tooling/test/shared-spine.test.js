// tooling/test/shared-spine.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { RULES, ALLOWED_EXAMPLES } = require('../guardrail-rules');
const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('philosophy.md carries the evolved POV, new score labels, no tier labels', () => {
  const t = read('shared/philosophy.md');
  assert.match(t, /outsourcing your thinking/i);
  assert.match(t, /Met \/ Partially Met \/ Not Met \/ Insufficient Information/);
  assert.doesNotMatch(t, /Fortune[\s-]*(100|500)/i);
  assert.match(t, /present trade-offs, not verdicts/i); // kept verbatim
});

test('voice-and-guardrails.md states every cross-cutting rule', () => {
  const t = read('shared/voice-and-guardrails.md');
  for (const anchor of [
    /buy\/don['’]?t-buy/i, /no tier labels/i,
    /adaptive Q&A/i, /meet (them|people) where they are/i,
    /framework is non-negotiable/i, /no false certainty/i, /fail loudly/i,
    /evidence tier/i,
  ]) assert.match(t, anchor, String(anchor));
  // both status vocabularies documented once
  assert.match(t, /Met \/ Partially Met \/ Not Met \/ Insufficient Information/);
  assert.match(t, /Available \/ Partial \/ Absent \/ Insufficient/);
});

test('voice file runtime checklist tracks the dev lint (parity)', () => {
  const t = read('shared/voice-and-guardrails.md').toLowerCase();
  for (const r of RULES) assert.ok(t.includes(r), `missing rule name: ${r}`);
  for (const ex of ALLOWED_EXAMPLES) assert.ok(t.includes(ex.toLowerCase()), `missing allowed example: ${ex}`);
  for (const banned of ["don't buy", 'we recommend', 'overall grade'])
    assert.ok(t.includes(banned), `missing banned example: ${banned}`);
});
