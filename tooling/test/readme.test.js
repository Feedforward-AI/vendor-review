// tooling/test/readme.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('README documents frozen install, run command, fallback, privacy — no tier labels', () => {
  const t = read('README.md');
  assert.match(t, /\/plugin marketplace add Feedforward-AI\/vendor-review/);
  assert.match(t, /\/plugin install vendor-review@feedforward/);
  assert.match(t, /git clone/i);                       // fallback
  assert.match(t, /\/vendor-review:vendor-evaluation/); // how to run
  assert.match(t, /privacy|feedback opt-in/i);
  assert.doesNotMatch(t, /Fortune[\s-]*(100|500)/i);
});

test('package.json wires npm test to node --test', () => {
  const pkg = JSON.parse(read('package.json'));
  // NOTE: the plan specified `node --test tooling/test/`, but Node 24 treats a bare
  // directory path as a module to import (MODULE_NOT_FOUND) rather than a dir to scan.
  // The glob form is equivalent in intent and works across Node 18–24 (Node expands the
  // glob natively; npm's shell also expands it). See Plan 01 build notes / Task 4 finding.
  assert.equal(pkg.scripts.test, 'node --test tooling/test/*.test.js');
});
