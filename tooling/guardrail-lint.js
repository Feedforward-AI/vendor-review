// tooling/guardrail-lint.js
const R = require('./guardrail-rules');

function lint(text) {
  const out = [];
  for (const re of R.RECOMMENDATION)
    for (const m of text.matchAll(re)) out.push({ rule: 'recommendation', match: m[0], index: m.index });
  for (const m of text.matchAll(R.TIER))
    out.push({ rule: 'tier-label', match: m[0], index: m.index });
  for (const m of text.matchAll(R.VERDICT_MARKER)) {
    const before = text.slice(Math.max(0, m.index - 32), m.index);
    if (!R.NEGATION_BEFORE.test(before)) out.push({ rule: 'recommendation', match: m[0], index: m.index });
  }
  for (const m of text.matchAll(R.CERTAINTY_MARKER)) {
    const window = text.slice(m.index, m.index + 220);
    if (!R.NAMED_ARTIFACT.test(window)) out.push({ rule: 'false-certainty', match: m[0], index: m.index });
  }
  return out;
}
module.exports = { lint };
