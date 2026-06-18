// tooling/test/state.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { createState, markPhaseComplete, markDownstreamStale, validateState, PHASES } = require('../state');

const T = '2026-06-18T00:00:00Z';

test('createState starts every phase pending with forward-compat fields', () => {
  const s = createState({ vendor: 'Harvey AI', slug: 'harvey-ai', now: T });
  assert.equal(s.slug, 'harvey-ai');
  assert.equal(s.currentPhase, 'intake');
  for (const p of PHASES) {
    assert.equal(s.phases[p].status, 'pending');
    assert.deepEqual(s.phases[p].sourceHashes, {});
  }
  assert.deepEqual(s.backEdges.capacityToResearch, { used: 0, max: 2 });
  assert.equal(validateState(s), true);
});

test('markPhaseComplete records hash and advances currentPhase', () => {
  const s = markPhaseComplete(createState({ vendor: 'X', slug: 'x', now: T }), 'intake', 'abc123', T);
  assert.equal(s.phases.intake.status, 'complete');
  assert.equal(s.phases.intake.artifactHash, 'abc123');
  assert.equal(s.currentPhase, 'research');
});

test('completing the last phase sets currentPhase to done', () => {
  let s = createState({ vendor: 'X', slug: 'x', now: T });
  for (const p of PHASES) s = markPhaseComplete(s, p, 'h', T);
  assert.equal(s.currentPhase, 'done');
});

test('markDownstreamStale marks only phases after the given one', () => {
  let s = createState({ vendor: 'X', slug: 'x', now: T });
  for (const p of PHASES) s = markPhaseComplete(s, p, 'h', T);
  s = markDownstreamStale(s, 'research', T);
  assert.equal(s.phases.intake.status, 'complete');
  assert.equal(s.phases.research.status, 'complete');
  assert.equal(s.phases.capacity.status, 'stale');
  assert.equal(s.phases.procurement.status, 'stale');
  assert.equal(s.phases.report.status, 'stale');
});

test('unknown phase names throw on both mutators', () => {
  const s = createState({ vendor: 'X', slug: 'x', now: T });
  assert.throws(() => markPhaseComplete(s, 'bogus', 'h', T), /unknown phase/);
  assert.throws(() => markDownstreamStale(s, 'bogus', T), /unknown phase/);
});

test('validateState rejects bad status, currentPhase, and sourceHashes', () => {
  let s = createState({ vendor: 'X', slug: 'x', now: T });
  s.phases.intake.status = 'nope';
  assert.throws(() => validateState(s), /status/);
  s = createState({ vendor: 'X', slug: 'x', now: T });
  s.currentPhase = 'bogus';
  assert.throws(() => validateState(s), /currentPhase/);
  s = createState({ vendor: 'X', slug: 'x', now: T });
  s.phases.report.sourceHashes = null;
  assert.throws(() => validateState(s), /sourceHashes/);
});
