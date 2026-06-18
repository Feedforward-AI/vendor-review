// tooling/test/intake-research.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { lint } = require('../guardrail-lint');
const fx = (f) => fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8');

const CRITERIA = ['SEE', 'USE', 'LEARN', 'CHANGE', 'ADAPT', 'EXIT'];

test('intake fixture covers all eight numbered objectives + company capture', () => {
  const t = fx('intake.sample.md');
  for (let n = 1; n <= 8; n++) assert.match(t, new RegExp(`^##\\s+${n}\\.`, 'm'), `objective ${n}`);
  for (const a of [/vendor/i, /goal/i, /top criteria/i, /alternatives/i,
                   /build(?:ing)? internally/i, /do(?:ing)? nothing/i, /journey/i,
                   /intent/i, /horizon/i, /regulated|sensitive/i, /risk posture/i, /company/i])
    assert.match(t, a, String(a));
});

test('intake fixture is lint-clean', () => {
  assert.deepEqual(lint(fx('intake.sample.md')), []);
});

test('dossier fixture is organized by all six criteria + procurement', () => {
  const t = fx('dossier.sample.md');
  for (const c of CRITERIA) assert.match(t, new RegExp(`^##\\s+${c}\\b`, 'm'), c);
  assert.match(t, /^##\s+Procurement/im);
});

test('every bullet under a criteria section is provenance-tagged + cited (spec §6: every line)', () => {
  // split on each `## ` heading; drop the preamble (which holds the header tier-legend line).
  // Stronger than "at least one tagged finding": EVERY substantive bullet in a criteria
  // section must carry a provenance tag and a citation, so an untagged/uncited bullet
  // (e.g. a bare conflict line) cannot slip through alongside one tagged finding.
  const sections = fx('dossier.sample.md').split(/^##\s+/m).slice(1);
  const TIER = /^- \[(?:Independent|Vendor claim|Provided doc)\] /;
  for (const c of CRITERIA) {
    const sec = sections.find((s) => s.startsWith(c));
    assert.ok(sec, `missing section ${c}`);
    const bullets = sec.split(/\r?\n/).filter((l) => l.startsWith('- '));
    assert.ok(bullets.length >= 1, `section ${c} has no finding bullet`);
    for (const b of bullets) {
      assert.match(b, TIER, `section ${c}: every bullet must be tier-tagged — got: ${b}`);
      if (/^- \[(?:Independent|Vendor claim)\] /.test(b)) {  // web tiers cite URL + access date
        assert.match(b, /https?:\/\//, `section ${c}: web finding missing URL — ${b}`);
        assert.match(b, /accessed 20\d\d-\d\d-\d\d/, `section ${c}: web finding missing access date — ${b}`);
      }
    }
  }
});

test('provided-doc findings cite file + section, not a web-style accessed date', () => {
  const lines = fx('dossier.sample.md').split(/\r?\n/).filter((l) => l.startsWith('- [Provided doc]'));
  assert.ok(lines.length >= 1, 'has at least one provided-doc finding');
  for (const l of lines) {
    assert.match(l, /materials\//, l);       // file name
    assert.match(l, /§/, l);                 // section
    assert.doesNotMatch(l, /accessed/i, l);  // not the web-finding shape
  }
});

test('dossier fixture cites web findings with URL + ISO access date', () => {
  const t = fx('dossier.sample.md');
  assert.match(t, /https?:\/\//);
  assert.match(t, /accessed 20\d\d-\d\d-\d\d/);
});

test('dossier fixture surfaces a conflict and routes gaps with the three terminal labels', () => {
  const t = fx('dossier.sample.md');
  assert.match(t, /conflict/i);
  assert.match(t, /question(?:s)? for (?:the )?vendor/i);
  assert.match(t, /Route: ask vendor/);
  assert.match(t, /Route: ask exec/);
  assert.match(t, /Route: unverifiable/);
});

test('dossier fixture references RFP-derived criteria', () => {
  const t = fx('dossier.sample.md');
  assert.match(t, /derived-criteria\.md/);
  assert.match(t, /RFP/);
});

test('dossier fixture passes the guardrail lint (no verdict; every Insufficient names an artifact)', () => {
  assert.deepEqual(lint(fx('dossier.sample.md')), []);
});

test('derived-criteria fixture extracts RFP criteria with provided-doc provenance, lint-clean', () => {
  const t = fx('derived-criteria.sample.md');
  assert.match(t, /RFP/);
  assert.match(t, /Provided doc/);
  assert.match(t, /§/);
  assert.match(t, /intake\.md/);   // notes its separation from the immutable intake
  assert.deepEqual(lint(t), []);
});
