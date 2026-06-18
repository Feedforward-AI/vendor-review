// tooling/test/discover-branding.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { splitFrontmatter } = require('../md');
const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('discover-branding: required frontmatter, web-only tools, no Bash/Write/Edit', () => {
  const { frontmatter } = splitFrontmatter(read('agents/discover-branding.md'));
  assert.match(frontmatter, /name:\s*discover-branding\b/);
  assert.match(frontmatter, /description:\s*\S/);
  assert.match(frontmatter, /tools:.*WebFetch/);
  assert.doesNotMatch(frontmatter, /\bBash\b/);
  assert.doesNotMatch(frontmatter, /\bWrite\b/);
  assert.doesNotMatch(frontmatter, /\bEdit\b/);
});

test('discover-branding: fail-loudly, cite, no raster encode, propose-not-apply', () => {
  const { body } = splitFrontmatter(read('agents/discover-branding.md'));
  assert.match(body, /fail loudly/i);
  assert.match(body, /manual (?:brand )?entry/i);
  assert.match(body, /NOT FOUND/);
  assert.match(body, /accessed <YYYY-MM-DD>/);
  assert.match(body, /never download or encode/i);   // no-Bash raster posture
  assert.match(body, /candidate/i);                  // proposes, does not apply
});
