// tooling/state.js
const PHASES = ['intake', 'research', 'capacity', 'procurement', 'report'];
const STATUSES = ['pending', 'complete', 'stale'];

function createState({ vendor, slug, now }) {
  const phases = {};
  for (const p of PHASES) phases[p] = { status: 'pending', artifactHash: null, sourceHashes: {}, updatedAt: now };
  return {
    schema: 'vendor-review/state@1',
    vendor, slug,
    currentPhase: PHASES[0],
    phases,
    backEdges: { capacityToResearch: { used: 0, max: 2 } },
  };
}

function markPhaseComplete(state, phase, artifactHash, now) {
  if (!PHASES.includes(phase)) throw new Error('unknown phase: ' + phase);
  const ph = state.phases[phase];
  ph.status = 'complete';
  ph.artifactHash = artifactHash;
  ph.updatedAt = now;
  state.currentPhase = PHASES[PHASES.indexOf(phase) + 1] || 'done';
  return state;
}

function markDownstreamStale(state, phase, now) {
  if (!PHASES.includes(phase)) throw new Error('unknown phase: ' + phase);
  for (const p of PHASES.slice(PHASES.indexOf(phase) + 1)) {
    if (state.phases[p].status === 'complete') {
      state.phases[p].status = 'stale';
      state.phases[p].updatedAt = now;
    }
  }
  return state;
}

function validateState(state) {
  if (state.schema !== 'vendor-review/state@1') throw new Error('bad schema');
  if (![...PHASES, 'done'].includes(state.currentPhase)) throw new Error('bad currentPhase');
  for (const p of PHASES) {
    const ph = state.phases[p];
    if (!ph || !STATUSES.includes(ph.status)) throw new Error(`bad status for ${p}`);
    if (typeof ph.sourceHashes !== 'object' || ph.sourceHashes === null) throw new Error(`bad sourceHashes for ${p}`);
  }
  const be = state.backEdges && state.backEdges.capacityToResearch;
  if (!be || typeof be.used !== 'number' || be.max !== 2) throw new Error('bad backEdges');
  return true;
}

module.exports = { PHASES, createState, markPhaseComplete, markDownstreamStale, validateState };
