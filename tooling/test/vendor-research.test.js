// tooling/test/vendor-research.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { splitFrontmatter } = require('../md');
const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const FILE = 'skills/vendor-research/SKILL.md';

test('vendor-research frontmatter: web tools + Task, no Bash', () => {
  const { frontmatter } = splitFrontmatter(read(FILE));
  assert.match(frontmatter, /name:\s*vendor-research\b/);
  assert.match(frontmatter, /allowed-tools:/);
  for (const tool of ['Read', 'Write', 'Edit', 'WebSearch', 'WebFetch', 'Task'])
    assert.match(frontmatter, new RegExp(`\\b${tool}\\b`));   // word-anchored
  assert.doesNotMatch(frontmatter, /\bBash\b/);
});

test('vendor-research dispatches all six agents', () => {
  const { body } = splitFrontmatter(read(FILE));
  for (const a of ['research-vendor-surfaces','research-technical-docs','research-community',
                   'research-thirdparty','research-compliance','discover-branding'])
    assert.match(body, new RegExp(a));
});

test('vendor-research: BYO-materials step with the no-Bash format posture', () => {
  const { body } = splitFrontmatter(read(FILE));
  assert.match(body, /\.\/vendor-evaluations\/<vendor-slug>\/materials\//);
  assert.match(body, /\.docx/);
  assert.match(body, /PDF/);
  assert.match(body, /paste/i);
  assert.match(body, /drag/i);            // OS-aware hand-holding
});

test('vendor-research: dossier outputs, evidence tiers, gaps, derived-criteria, routing', () => {
  const { body } = splitFrontmatter(read(FILE));
  assert.match(body, /dossier\.md/);
  assert.match(body, /access date/i);
  for (const tier of ['Independent', 'Vendor claim', 'Provided doc'])
    assert.match(body, new RegExp(tier));
  assert.match(body, /insufficient/i);
  assert.match(body, /question(?:s)? for (?:the )?vendor/i);
  assert.match(body, /derived-criteria\.md/);
  assert.match(body, /RFP/);
  // two-stage routing: one optional re-research pass, then exactly three terminal labels
  assert.match(body, /targeted re-research/i);
  assert.match(body, /ask exec/i);
  assert.match(body, /ask vendor/i);
  assert.match(body, /unverifiable/i);
});

test('vendor-research references the spine + reference files', () => {
  const { body } = splitFrontmatter(read(FILE));
  assert.match(body, /\$\{CLAUDE_PLUGIN_ROOT\}/);
  assert.match(body, /evidence-standards\.md/);
  assert.match(body, /source-playbook\.md/);
  assert.match(body, /voice-and-guardrails\.md/);
});
