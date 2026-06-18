// tooling/test/guardrail-lint.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { lint } = require('../guardrail-lint');

const fx = (f) => fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8');
const rules = (t) => lint(t).map((v) => v.rule);

test('clean opinionated copy passes (do-not-over-fire)', () => {
  assert.deepEqual(lint(fx('clean-opinionated.md')), []);
});

test('flags literal recommendation strings', () => {
  assert.ok(rules(fx('violations.md')).includes('recommendation'));
});

test('reports EVERY occurrence, not just the first', () => {
  const v = lint('We recommend buying this. We recommend buying that.')
    .filter((x) => x.rule === 'recommendation');
  assert.equal(v.length, 2);
});

test('flags aggregate grade, bare verdict, overall grade, letter score', () => {
  assert.ok(rules('Overall: Recommended').includes('recommendation'));
  assert.ok(rules('Our verdict: adopt it').includes('recommendation'));
  assert.ok(rules('Overall grade: strong').includes('recommendation'));
  assert.ok(rules('Score: B+ for value').includes('recommendation'));
});

test('flags purchase/recommend variants', () => {
  for (const s of ["don't purchase this", "you should move forward with this",
                   "buy Acme today", "I recommend purchasing", "purchase the product"])
    assert.ok(rules(s).includes('recommendation'), s);
});

test('flags hyphenated tier labels', () => {
  assert.ok(rules('great for Fortune-100 buyers').includes('tier-label'));
});

test('flags Insufficient not followed by a named artifact', () => {
  assert.ok(rules('Insufficient Information on pricing. More research needed.').includes('false-certainty'));
});

test('does NOT flag Insufficient that names a specific artifact', () => {
  assert.ok(!rules('Insufficient Information — request their SOC 2 Type II report.').includes('false-certainty'));
});

test('does NOT over-fire on allowed phrases', () => {
  assert.deepEqual(lint('The buyer should weigh buying cycles.'), []);
  assert.deepEqual(lint('We recommend you ask the vendor to confirm this.'), []);
  assert.deepEqual(lint('The purchase decision remains yours. We do not issue a buy/don’t-buy verdict.'), []);
});
