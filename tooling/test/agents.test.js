// tooling/test/agents.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { splitFrontmatter } = require('../md');
const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const RESEARCH_AGENTS = [
  'research-vendor-surfaces', 'research-technical-docs', 'research-community',
  'research-thirdparty', 'research-compliance',
];

for (const a of RESEARCH_AGENTS) {
  test(`agent ${a}: required frontmatter, web-only tools, no Bash/Write/Edit`, () => {
    const { frontmatter } = splitFrontmatter(read(`agents/${a}.md`));
    assert.match(frontmatter, new RegExp(`name:\\s*${a}\\b`));
    assert.match(frontmatter, /description:\s*\S/);
    assert.match(frontmatter, /tools:.*WebSearch/);
    assert.match(frontmatter, /tools:.*WebFetch/);
    assert.doesNotMatch(frontmatter, /\bBash\b/);
    assert.doesNotMatch(frontmatter, /\bWrite\b/);
    assert.doesNotMatch(frontmatter, /\bEdit\b/);
  });

  test(`agent ${a}: states the structured output contract`, () => {
    const { body } = splitFrontmatter(read(`agents/${a}.md`));
    assert.match(body, /\[<tier>\]/);
    assert.match(body, /URL/);
    assert.match(body, /\(accessed <YYYY-MM-DD>\)/);
    assert.match(body, /Independent/);
    assert.match(body, /Vendor claim/);
    assert.match(body, /never fabricate/i);
    assert.match(body, /evidence-standards\.md/);
    // gap-line template + all three terminal routes pinned
    assert.match(body, /- <gap>: Insufficient — <specific artifact>/);
    assert.match(body, /ask vendor/i);
    assert.match(body, /ask exec/i);
    assert.match(body, /unverifiable/i);
    // tier asymmetry stated so a later worker doesn't add Provided doc to the agents
    assert.match(body, /added later by the research skill/i);
  });
}
