// tooling/test/command.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('command frontmatter is tight (allowed-tools, no Bash)', () => {
  const t = read('commands/vendor-evaluation.md');
  const fm = t.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(fm, 'has YAML frontmatter');
  assert.match(fm[1], /allowed-tools:/);
  assert.doesNotMatch(fm[1], /\bBash\b/);
  for (const tool of ['Read', 'Write', 'Edit', 'WebSearch', 'WebFetch', 'Task'])
    assert.match(fm[1], new RegExp(tool));
});

test('command references the five phase skills, workspace, state, resume, plugin root', () => {
  const t = read('commands/vendor-evaluation.md');
  for (const s of ['vendor-intake', 'vendor-research', 'vendor-capacity-assessment',
                   'vendor-procurement-review', 'vendor-report'])
    assert.match(t, new RegExp(s));
  assert.match(t, /\.\/vendor-evaluations\/<vendor-slug>\//);
  assert.match(t, /state\.json/);
  assert.match(t, /\$\{CLAUDE_PLUGIN_ROOT\}/);
  assert.match(t, /resume/i);                 // resume behavior is required
  assert.match(t, /checkpoint/i);
  assert.match(t, /guardrail check/i);        // runtime checklist at each checkpoint
});
