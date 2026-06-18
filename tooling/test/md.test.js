// tooling/test/md.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { splitFrontmatter } = require('../md');

test('splitFrontmatter separates a YAML frontmatter block from the body', () => {
  const { frontmatter, body } = splitFrontmatter('---\nname: x\ntools: Read\n---\nHello body\n');
  assert.match(frontmatter, /name: x/);
  assert.match(frontmatter, /tools: Read/);
  assert.match(body, /Hello body/);
});

test('splitFrontmatter returns empty frontmatter when there is none', () => {
  const { frontmatter, body } = splitFrontmatter('No frontmatter here');
  assert.equal(frontmatter, '');
  assert.equal(body, 'No frontmatter here');
});

test('splitFrontmatter handles CRLF line endings', () => {
  const { frontmatter, body } = splitFrontmatter('---\r\nname: y\r\n---\r\nbody\r\n');
  assert.match(frontmatter, /name: y/);
  assert.match(body, /body/);
});
