// tooling/test/vendor-intake.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { splitFrontmatter } = require('../md');
const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const FILE = 'skills/vendor-intake/SKILL.md';

test('vendor-intake frontmatter: name + allowed-tools, no Bash', () => {
  const { frontmatter } = splitFrontmatter(read(FILE));
  assert.match(frontmatter, /name:\s*vendor-intake\b/);
  assert.match(frontmatter, /description:\s*\S/);
  assert.match(frontmatter, /allowed-tools:/);
  assert.doesNotMatch(frontmatter, /\bBash\b/);
});

test('vendor-intake covers the eight objectives + company capture (body, not frontmatter)', () => {
  const { body } = splitFrontmatter(read(FILE));
  for (const a of [/vendor/i, /goal/i, /top criteria/i, /alternatives/i,
                   /build(?:ing)? internally/i, /do(?:ing)? nothing/i,
                   /journey/i, /intent/i, /horizon/i, /regulated|sensitive/i, /risk posture/i,
                   /company/i, /brand/i])
    assert.match(body, a, String(a));
});

test('vendor-intake states calibration, pacing, scaffolding, immutability', () => {
  const { body } = splitFrontmatter(read(FILE));
  assert.match(body, /specificity/i);
  assert.match(body, /fluency/i);
  assert.match(body, /\b12\b/);            // soft cap ~12 questions
  assert.match(body, /pause/i);
  assert.match(body, /resume/i);
  assert.match(body, /I'?m not sure/i);
  assert.match(body, /immutable/i);
  assert.match(body, /intake\.md/);
});

test('vendor-intake records the §5 personalization effects (nothing dropped downstream)', () => {
  const { body } = splitFrontmatter(read(FILE));
  assert.match(body, /against your priorities/i);
  assert.match(body, /executive summary/i);
  assert.match(body, /jargon/i);
  assert.match(body, /procurement depth/i);
  assert.match(body, /competitive framing/i);
});

test('vendor-intake loads the shared spine', () => {
  const t = read(FILE);
  assert.match(t, /\$\{CLAUDE_PLUGIN_ROOT\}/);
  assert.match(t, /shared\/philosophy\.md/);
  assert.match(t, /shared\/voice-and-guardrails\.md/);
});
