// tooling/test/slug.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { slugify } = require('../slug');

test('slugify lowercases and hyphenates', () => {
  assert.equal(slugify('Harvey AI'), 'harvey-ai');
});
test('slugify strips punctuation and collapses separators', () => {
  assert.equal(slugify('Glean.com'), 'glean-com');
  assert.equal(slugify('A/B  Test!!'), 'a-b-test');
});
test('slugify strips accents and trims edge hyphens', () => {
  assert.equal(slugify('  Légora  '), 'legora');
});
test('slugify is idempotent', () => {
  assert.equal(slugify(slugify('Harvey AI')), 'harvey-ai');
});
