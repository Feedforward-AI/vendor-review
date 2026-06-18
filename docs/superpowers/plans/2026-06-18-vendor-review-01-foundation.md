# Vendor Review — Plan 01: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up an installable `vendor-review` Claude Code plugin whose entry command scaffolds a per-evaluation workspace, plus the shared POV/guardrail spine and a tested dev-time guardrail lint that encodes the product's central rule.

**Architecture:** A Claude Code plugin (markdown command + skills, JSON manifests) distributed via a public marketplace. End-user runtime is markdown-only (no Bash). A separate **dev-time tooling layer** (`tooling/`, plain Node.js, zero dependencies, run with `node --test`) provides the guardrail lint, the slug helper, and the `state.json` run-manifest logic with real unit tests. This plan builds the skeleton + spine + command + tooling; Plans 02–04 add the phase skills, agents, and report.

**Tech Stack:** Markdown (command/skills/shared), JSON (plugin + marketplace manifests, `state.json`), Node.js ≥ 18 with the built-in test runner (`node --test`) and zero npm dependencies for dev tooling.

This is **plan 1 of 4** (see the roadmap in `docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md` §§3–4, 12). Source spec: that file. Source POV material to evolve: `source_docs/vendor_system_prompt.md` and the six criterion prompts in `source_docs/`.

## Global Constraints

*(Every task implicitly includes these — values copied verbatim from the spec.)*

- **Naming frozen:** GitHub `feedforward/vendor-review` · marketplace name `feedforward` · plugin name & local dir `vendor-review`.
- **§0 governing rule:** maximally opinionated about trade-offs; **never the literal buy/don't-buy sentence.** Allowed: blunt risk-naming, `sentiment`, scorecard counts, "Against your priorities." Banned: literal recommendation strings and any single aggregate "Recommended" grade.
- **No tier labels anywhere** — never "Fortune 100," "Fortune 500," or similar. Use "senior leaders," "your organization."
- **Runtime `allowed-tools` (tight):** `Read, Write, Edit, WebSearch, WebFetch, Task` only. **No `Bash`** in shipped command/skills.
- **Workspace location:** the user's CWD at `./vendor-evaluations/<vendor-slug>/` (never inside the plugin cache).
- **Slug rule:** `<vendor-slug>` = lowercase, hyphenated vendor name, confirmed with the exec.
- **Phase order:** `intake → research → capacity → procurement → report`.
- **Dev tooling:** Node.js, zero runtime deps, tests via `node --test`. Dev tooling is NOT shipped behavior — it validates artifacts and fixtures during development/CI.
- **Score labels:** `Met / Partially Met / Not Met / Insufficient Information` (capacity); `Available / Partial / Absent / Insufficient` (procurement) — deliberately distinct.

---

## File Structure (this plan)

```
vendor-review/                          # repo root (= plugin root = local dir)
├── .claude-plugin/
│   ├── plugin.json                     # Task 1
│   └── marketplace.json                # Task 1
├── README.md                           # Task 7
├── package.json                        # Task 7 — wires `npm test` → node --test
├── commands/
│   └── vendor-evaluation.md            # Task 6 — entry point / orchestrator
├── shared/
│   ├── philosophy.md                   # Task 5 — evolved POV
│   └── voice-and-guardrails.md         # Task 5 — single source of truth for rules
└── tooling/                            # dev-time only
    ├── slug.js                         # Task 2
    ├── state.js                        # Task 3
    ├── guardrail-lint.js               # Task 4
    └── test/
        ├── manifest.test.js            # Task 1
        ├── slug.test.js                # Task 2
        ├── state.test.js               # Task 3
        ├── guardrail-lint.test.js      # Task 4
        ├── shared-spine.test.js        # Task 5
        ├── command.test.js             # Task 6
        └── fixtures/
            ├── clean-opinionated.md     # Task 4 — must PASS the lint
            └── violations.md            # Task 4 — must be FLAGGED
```

`skills/` and `agents/` directories are created (empty placeholders are fine) so the plugin loads; their contents land in Plans 02–04.

---

### Task 1: Plugin + marketplace manifests (installable skeleton)

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`
- Create: `tooling/test/manifest.test.js`
- Create (empty dirs with `.gitkeep`): `commands/`, `skills/`, `agents/`, `shared/`

**Interfaces:**
- Consumes: nothing.
- Produces: an installable plugin named `vendor-review` from marketplace `feedforward`; manifest field shape the test enforces.

- [ ] **Step 1: Confirm the current manifest schema**

Before writing, verify field names against the live plugin docs (schemas evolve). Use Context7 (`mcp__claude_ai_Context7__query-docs` for "Claude Code plugin.json marketplace.json schema") or WebFetch `https://docs.claude.com/en/docs/claude-code/plugins`. If the platform requires fields beyond those below, add them and update the test. Components in `commands/`, `skills/`, `agents/` are auto-discovered by convention; do not hand-list them unless the docs require it.

- [ ] **Step 2: Write the failing test**

```js
// tooling/test/manifest.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

test('plugin.json declares the frozen plugin name and required fields', () => {
  const m = read('.claude-plugin/plugin.json');
  assert.equal(m.name, 'vendor-review');
  assert.match(m.version, /^\d+\.\d+\.\d+$/);
  assert.ok(m.description && m.description.length > 20);
  assert.ok(m.author, 'author present');
  // No tier labels anywhere in the manifest copy.
  assert.doesNotMatch(JSON.stringify(m), /Fortune\s*(100|500)/i);
});

test('marketplace.json is named feedforward and lists vendor-review', () => {
  const mk = read('.claude-plugin/marketplace.json');
  assert.equal(mk.name, 'feedforward');
  assert.ok(Array.isArray(mk.plugins));
  assert.ok(mk.plugins.some((p) => p.name === 'vendor-review'),
    'vendor-review listed in marketplace');
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test tooling/test/manifest.test.js`
Expected: FAIL — `ENOENT` (manifests don't exist yet).

- [ ] **Step 4: Create the manifests and placeholder dirs**

```json
// .claude-plugin/plugin.json
{
  "name": "vendor-review",
  "version": "0.1.0",
  "description": "Opinionated, capacity-building evaluation of B2B AI vendors for senior leaders: phased research, six-criteria scoring, a courtesy procurement review, and a branded report.",
  "author": { "name": "Feedforward" },
  "homepage": "https://github.com/feedforward/vendor-review",
  "license": "MIT"
}
```

```json
// .claude-plugin/marketplace.json
{
  "name": "feedforward",
  "owner": { "name": "Feedforward" },
  "plugins": [
    {
      "name": "vendor-review",
      "source": "./",
      "description": "Opinionated, capacity-building vendor evaluation with a branded report."
    }
  ]
}
```

Then: `mkdir -p commands skills agents shared && touch commands/.gitkeep skills/.gitkeep agents/.gitkeep`

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tooling/test/manifest.test.js`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add .claude-plugin commands skills agents shared tooling/test/manifest.test.js
git commit -m "feat(foundation): installable plugin + marketplace manifests"
```

---

### Task 2: Slug helper

**Files:**
- Create: `tooling/slug.js`
- Create: `tooling/test/slug.test.js`

**Interfaces:**
- Produces: `slugify(name: string) => string` — lowercase, hyphenated, accent-stripped, used for `<vendor-slug>` everywhere downstream.

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tooling/test/slug.test.js`
Expected: FAIL — `Cannot find module '../slug'`.

- [ ] **Step 3: Write the implementation**

```js
// tooling/slug.js
function slugify(name) {
  return String(name)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric → hyphen
    .replace(/-{2,}/g, '-')      // collapse runs
    .replace(/^-+|-+$/g, '');    // trim edges
}
module.exports = { slugify };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tooling/test/slug.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add tooling/slug.js tooling/test/slug.test.js
git commit -m "feat(foundation): vendor-slug helper"
```

---

### Task 3: `state.json` run-manifest logic

**Files:**
- Create: `tooling/state.js`
- Create: `tooling/test/state.test.js`

**Interfaces:**
- Consumes: `slugify` (Task 2) is NOT required here; caller passes `vendor` and `slug`.
- Produces:
  - `PHASES = ['intake','research','capacity','procurement','report']`
  - `createState({vendor, slug, now}) => state`
  - `markPhaseComplete(state, phase, artifactHash, now) => state` (mutates + returns)
  - `markDownstreamStale(state, phase, now) => state`
  - `validateState(state) => true | throws Error`
  - `state` shape: `{ schema:'vendor-review/state@1', vendor, slug, currentPhase, phases: { [name]: { status, artifactHash, updatedAt } } }`, `status ∈ {'pending','complete','stale'}`.

- [ ] **Step 1: Write the failing test**

```js
// tooling/test/state.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { createState, markPhaseComplete, markDownstreamStale, validateState, PHASES } = require('../state');

const T = '2026-06-18T00:00:00Z';

test('createState starts every phase pending', () => {
  const s = createState({ vendor: 'Harvey AI', slug: 'harvey-ai', now: T });
  assert.equal(s.slug, 'harvey-ai');
  assert.equal(s.currentPhase, 'intake');
  for (const p of PHASES) assert.equal(s.phases[p].status, 'pending');
  assert.equal(validateState(s), true);
});

test('markPhaseComplete records hash and advances currentPhase', () => {
  const s = markPhaseComplete(createState({ vendor: 'X', slug: 'x', now: T }), 'intake', 'abc123', T);
  assert.equal(s.phases.intake.status, 'complete');
  assert.equal(s.phases.intake.artifactHash, 'abc123');
  assert.equal(s.currentPhase, 'research');
});

test('markDownstreamStale marks only phases after the given one', () => {
  let s = createState({ vendor: 'X', slug: 'x', now: T });
  for (const p of PHASES) s = markPhaseComplete(s, p, 'h', T);
  s = markDownstreamStale(s, 'research', T);
  assert.equal(s.phases.intake.status, 'complete');
  assert.equal(s.phases.research.status, 'complete');
  assert.equal(s.phases.capacity.status, 'stale');
  assert.equal(s.phases.report.status, 'stale');
});

test('validateState rejects an unknown status', () => {
  const s = createState({ vendor: 'X', slug: 'x', now: T });
  s.phases.intake.status = 'bogus';
  assert.throws(() => validateState(s), /status/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tooling/test/state.test.js`
Expected: FAIL — `Cannot find module '../state'`.

- [ ] **Step 3: Write the implementation**

```js
// tooling/state.js
const PHASES = ['intake', 'research', 'capacity', 'procurement', 'report'];
const STATUSES = ['pending', 'complete', 'stale'];

function createState({ vendor, slug, now }) {
  const phases = {};
  for (const p of PHASES) phases[p] = { status: 'pending', artifactHash: null, updatedAt: now };
  return { schema: 'vendor-review/state@1', vendor, slug, currentPhase: PHASES[0], phases };
}

function markPhaseComplete(state, phase, artifactHash, now) {
  state.phases[phase].status = 'complete';
  state.phases[phase].artifactHash = artifactHash;
  state.phases[phase].updatedAt = now;
  const next = PHASES[PHASES.indexOf(phase) + 1];
  if (next) state.currentPhase = next;
  return state;
}

function markDownstreamStale(state, phase, now) {
  const start = PHASES.indexOf(phase) + 1;
  for (const p of PHASES.slice(start)) {
    if (state.phases[p].status === 'complete') {
      state.phases[p].status = 'stale';
      state.phases[p].updatedAt = now;
    }
  }
  return state;
}

function validateState(state) {
  if (state.schema !== 'vendor-review/state@1') throw new Error('bad schema');
  for (const p of PHASES) {
    const ph = state.phases[p];
    if (!ph || !STATUSES.includes(ph.status)) throw new Error(`bad status for ${p}`);
  }
  return true;
}

module.exports = { PHASES, createState, markPhaseComplete, markDownstreamStale, validateState };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tooling/test/state.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add tooling/state.js tooling/test/state.test.js
git commit -m "feat(foundation): state.json run-manifest with stale-marking"
```

---

### Task 4: Guardrail lint (encodes the §0 rule)

**Files:**
- Create: `tooling/guardrail-lint.js`
- Create: `tooling/test/guardrail-lint.test.js`
- Create: `tooling/test/fixtures/clean-opinionated.md`
- Create: `tooling/test/fixtures/violations.md`

**Interfaces:**
- Produces: `lint(text: string) => Violation[]` where `Violation = { rule: string, match: string, index: number }`. Rules: `recommendation` (literal buy/don't-buy/aggregate-grade), `tier-label`, `false-certainty` (an Insufficient/Withheld marker not followed by a named artifact within 220 chars).
- The **do-not-over-fire** requirement is encoded as a test: the clean-opinionated fixture must yield zero violations.

- [ ] **Step 1: Write the fixtures**

```markdown
<!-- tooling/test/fixtures/clean-opinionated.md  (MUST PASS: zero violations) -->
Sentiment: negative. SEE: Not Met. EXIT: Not Met.

Acme uses a proprietary system unique to itself. This poses extreme risk to your
portability. A strong fit for organizations prioritizing speed-to-value, with
severe lock-in risk for anyone on a multi-year horizon — the purchase decision
remains yours.

Insufficient Information on encryption: request their SOC 2 Type II report and
current sub-processor list to close this gap.
```

```markdown
<!-- tooling/test/fixtures/violations.md  (MUST be flagged) -->
Overall: Recommended. We recommend purchasing this, so don't buy the competitor.
This is a great fit for Fortune 100 companies.

Insufficient Information on pricing. More research needed.
```

- [ ] **Step 2: Write the failing test**

```js
// tooling/test/guardrail-lint.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { lint } = require('../guardrail-lint');

const fx = (f) => fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8');
const rules = (text) => lint(text).map((v) => v.rule);

test('clean opinionated copy passes (do-not-over-fire)', () => {
  assert.deepEqual(lint(fx('clean-opinionated.md')), []);
});

test('flags literal recommendation strings', () => {
  const r = rules(fx('violations.md'));
  assert.ok(r.includes('recommendation'));
});

test('flags an aggregate Recommended grade', () => {
  assert.ok(rules('Overall: Recommended').includes('recommendation'));
});

test('flags tier labels', () => {
  assert.ok(rules('great for Fortune 100 buyers').includes('tier-label'));
});

test('flags Insufficient not followed by a named artifact', () => {
  assert.ok(rules('Insufficient Information on pricing. More research needed.')
    .includes('false-certainty'));
});

test('does NOT flag Insufficient that names the artifact', () => {
  assert.ok(!rules('Insufficient Information — request their SOC 2 Type II report.')
    .includes('false-certainty'));
});

test('does NOT flag the word "buyer" or "buying"', () => {
  assert.deepEqual(lint('The buyer should weigh buying cycles.'), []);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test tooling/test/guardrail-lint.test.js`
Expected: FAIL — `Cannot find module '../guardrail-lint'`.

- [ ] **Step 4: Write the implementation**

```js
// tooling/guardrail-lint.js
// Precise patterns: target recommendation STATEMENTS, never bare words like "buyer".
const RECOMMENDATION = [
  /\b(?:do ?n['’]?t|do not)\s+buy\b/i,
  /\byou should\s+(?:buy|purchase|adopt|proceed|move forward|pass|skip)\b/i,
  /\bwe\s+recommend\b/i,
  /\b(?:buy|purchase)\s+(?:this|it)\b/i,
  /\boverall:\s*(?:not\s+)?recommended\b/i,
  /\b(?:bottom line|verdict):\s*(?:buy|do ?n['’]?t|pass|skip)\b/i,
];
const TIER = /\bFortune\s*(?:100|500)\b/i;
const CERTAINTY_MARKER = /\b(Insufficient(?:\s+Information)?|Withheld)\b/gi;
const NAMED_ARTIFACT = /\b(SOC ?2|ISO ?27001|DPA|BAA|sub-?processor|pen[- ]?test|pricing quote|SLA|questionnaire|SIG|CAIQ|report|certificat\w+|documentation|contract|MSA)\b/i;

function lint(text) {
  const out = [];
  for (const re of RECOMMENDATION) {
    const m = re.exec(text);
    if (m) out.push({ rule: 'recommendation', match: m[0], index: m.index });
  }
  const tier = TIER.exec(text);
  if (tier) out.push({ rule: 'tier-label', match: tier[0], index: tier.index });

  let m;
  CERTAINTY_MARKER.lastIndex = 0;
  while ((m = CERTAINTY_MARKER.exec(text)) !== null) {
    const window = text.slice(m.index, m.index + 220);
    if (!NAMED_ARTIFACT.test(window)) {
      out.push({ rule: 'false-certainty', match: m[0], index: m.index });
    }
  }
  return out;
}
module.exports = { lint };
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tooling/test/guardrail-lint.test.js`
Expected: PASS (7 tests). If the clean fixture trips a rule, tighten the regex — the clean fixture is the source of truth for "do not over-fire."

- [ ] **Step 6: Commit**

```bash
git add tooling/guardrail-lint.js tooling/test/guardrail-lint.test.js tooling/test/fixtures
git commit -m "feat(foundation): dev-time guardrail lint encoding the no-verdict rule"
```

---

### Task 5: Shared spine — `philosophy.md` + `voice-and-guardrails.md`

**Files:**
- Create: `shared/philosophy.md`
- Create: `shared/voice-and-guardrails.md`
- Create: `tooling/test/shared-spine.test.js`

**Interfaces:**
- Consumes: the forbidden-pattern intent from `guardrail-lint.js` (Task 4) — the voice file's human-readable banned list must match the lint so runtime behavior == dev lint.
- Produces: two reference files every phase skill loads via `${CLAUDE_PLUGIN_ROOT}/shared/...`.

- [ ] **Step 1: Write the failing test**

```js
// tooling/test/shared-spine.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('philosophy.md carries the evolved POV and new score labels', () => {
  const t = read('shared/philosophy.md');
  assert.match(t, /outsourcing your thinking/i);
  assert.match(t, /Met \/ Partially Met \/ Not Met \/ Insufficient Information/);
  assert.doesNotMatch(t, /Fortune\s*(100|500)/i);          // tier labels removed
  assert.match(t, /present trade-offs, not verdicts/i);     // kept verbatim
});

test('voice-and-guardrails.md states every cross-cutting rule', () => {
  const t = read('shared/voice-and-guardrails.md');
  for (const anchor of [
    /never.*buy\/don['’]?t-buy/i,           // no purchase verdict
    /no tier labels/i,
    /adaptive Q&A|meet (them|people) where they are/i,
    /framework is non-negotiable/i,
    /no false certainty/i,
    /fail loudly/i,
    /three evidence tiers|evidence tier/i,
  ]) assert.match(t, anchor);
  // Positive AND negative opinionation examples both present.
  assert.match(t, /poses extreme risk/i);
  assert.match(t, /purchase decision remains yours/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tooling/test/shared-spine.test.js`
Expected: FAIL — `ENOENT`.

- [ ] **Step 3: Author `shared/philosophy.md`**

Evolve `source_docs/vendor_system_prompt.md` per spec §12.6. Concretely:
- Keep verbatim: "state conclusions first," "no corporate hedging," "do not infer or speculate," "present trade-offs, not verdicts," and the "What Excellent Vendors Look Like" bullets.
- Rename the score scale to `Met / Partially Met / Not Met / Insufficient Information` and add a one-line note: *"(maps to the original Yes / Partially / No / Insufficient.)"*
- Replace any tier label with "senior leaders."
- Include the central question verbatim: *"Are you outsourcing your thinking to a vendor, or bringing the learning and understanding internally to strengthen your organization?"*
- Include the three foundational points (economics changed / moat eroded / stakes organizational).

- [ ] **Step 4: Author `shared/voice-and-guardrails.md`**

Single source of truth. Must include, as scannable rules: pointed/declarative tone; **the §0 rule with both examples** (✅ "…poses extreme risk", ✅ "…the purchase decision remains yours", ❌ "…so don't buy it" / "…we recommend purchasing" / aggregate "Recommended"); no tier labels; explain jargon (self-serve); adaptive Q&A / meet-them-where-they-are; framework is non-negotiable; no false certainty (tentative vs withheld, always name the specific artifact); fail loudly + 3-way gap routing; the three evidence tiers; never fabricate. Include a **"Runtime guardrail check"** subsection that lists the same banned patterns the dev lint catches (Task 4) so the model applies them at each checkpoint.

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tooling/test/shared-spine.test.js`
Expected: PASS (2 tests). Adjust the prose until every required anchor is present.

- [ ] **Step 6: Commit**

```bash
git add shared/philosophy.md shared/voice-and-guardrails.md tooling/test/shared-spine.test.js
git commit -m "feat(foundation): shared POV + voice/guardrails spine"
```

---

### Task 6: Entry command (orchestrator)

**Files:**
- Create: `commands/vendor-evaluation.md`
- Create: `tooling/test/command.test.js`
- Delete: `commands/.gitkeep`

**Interfaces:**
- Consumes: `shared/philosophy.md`, `shared/voice-and-guardrails.md`; references (not yet built) phase skills `vendor-intake`, `vendor-research`, `vendor-capacity-assessment`, `vendor-procurement-review`, `vendor-report`.
- Produces: the user-facing entry point. On run it: confirms vendor name + URL → derives `<vendor-slug>` → creates `./vendor-evaluations/<vendor-slug>/` + `state.json` → runs phases with checkpoints → owns the closing feedback step.

- [ ] **Step 1: Write the failing test**

```js
// tooling/test/command.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('command has frontmatter with tight allowed-tools (no Bash)', () => {
  const t = read('commands/vendor-evaluation.md');
  const fm = t.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(fm, 'has YAML frontmatter');
  assert.match(fm[1], /allowed-tools:/);
  assert.doesNotMatch(fm[1], /\bBash\b/);
  for (const tool of ['Read', 'Write', 'Edit', 'WebSearch', 'WebFetch', 'Task'])
    assert.match(fm[1], new RegExp(tool));
});

test('command references all five phase skills and the workspace path', () => {
  const t = read('commands/vendor-evaluation.md');
  for (const skill of ['vendor-intake', 'vendor-research', 'vendor-capacity-assessment',
                       'vendor-procurement-review', 'vendor-report'])
    assert.match(t, new RegExp(skill));
  assert.match(t, /\.\/vendor-evaluations\/<vendor-slug>\//);
  assert.match(t, /state\.json/);
  assert.match(t, /\$\{CLAUDE_PLUGIN_ROOT\}/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tooling/test/command.test.js`
Expected: FAIL — `ENOENT`.

- [ ] **Step 3: Author `commands/vendor-evaluation.md`**

Frontmatter:
```yaml
---
description: Run an opinionated, capacity-building vendor evaluation end to end.
allowed-tools: Read, Write, Edit, WebSearch, WebFetch, Task
---
```
Body must: load `${CLAUDE_PLUGIN_ROOT}/shared/philosophy.md` and `voice-and-guardrails.md` as binding context; ask for vendor name + URL; derive `<vendor-slug>` (lowercase, hyphenated, confirmed); create `./vendor-evaluations/<vendor-slug>/` and initialize `state.json` (shape per Task 3); then drive the five phases (`vendor-intake → vendor-research → vendor-capacity-assessment → vendor-procurement-review → vendor-report`), each ending in a checkpoint and a guardrail check before advancing; support resume from `state.json`; own the closing privacy-first feedback opt-in. Then `rm commands/.gitkeep`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tooling/test/command.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add commands/vendor-evaluation.md tooling/test/command.test.js
git rm --cached commands/.gitkeep 2>/dev/null; rm -f commands/.gitkeep
git commit -m "feat(foundation): vendor-evaluation entry command/orchestrator"
```

---

### Task 7: README + test wiring (full suite green)

**Files:**
- Create: `README.md`
- Create: `package.json`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: `npm test` → runs every `tooling/test/*.test.js`; install/usage docs with the frozen names.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "vendor-review-dev",
  "private": true,
  "version": "0.1.0",
  "description": "Dev tooling and tests for the vendor-review plugin (not shipped to end users).",
  "scripts": { "test": "node --test tooling/test/" }
}
```

- [ ] **Step 2: Write `README.md`**

Must contain (a content test guards the install commands): the POV one-liner; the two-command install **verbatim**:
```
/plugin marketplace add feedforward/vendor-review
/plugin install vendor-review@feedforward
```
the git-clone fallback; how to run (`/vendor-review:vendor-evaluation`); the five phases; what you get (Full Report + four cuts + custom outputs); and a privacy note (everything local; feedback opt-in). No tier labels.

- [ ] **Step 3: Add a README content test**

Append to `tooling/test/manifest.test.js`:
```js
test('README documents the frozen install commands and no tier labels', () => {
  const t = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.match(t, /\/plugin marketplace add feedforward\/vendor-review/);
  assert.match(t, /\/plugin install vendor-review@feedforward/);
  assert.doesNotMatch(t, /Fortune\s*(100|500)/i);
});
```

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS — all tests across manifest, slug, state, guardrail-lint, shared-spine, command.

- [ ] **Step 5: Commit**

```bash
git add README.md package.json tooling/test/manifest.test.js
git commit -m "feat(foundation): README, install docs, and npm test wiring"
```

---

## Self-Review

**1. Spec coverage (Plan-01 scope):**
- Plugin/packaging (spec §3, §12.1) → Tasks 1, 7. ✓
- Frozen naming (§12.1) → Tasks 1, 7 (asserted). ✓
- `state.json` + stale-marking (§4, §12.1) → Task 3. ✓
- Slug rule (§12.4) → Task 2. ✓
- Guardrail lint incl. §0 rule, false-certainty, do-not-over-fire (§2, §12.5) → Task 4. ✓
- Shared spine + carry-forward hygiene (§10, §12.6) → Task 5. ✓
- Entry command, tight allowed-tools, workspace path, resume (§4, §12.1) → Task 6. ✓
- Deferred by design to Plans 02–04: the five phase skills, the six `agents/`, report assets, golden-fixture end-to-end tests. Noted, not gaps.

**2. Placeholder scan:** No "TBD/TODO." The Step-1 schema-verification in Task 1 and the prose-authoring steps in Tasks 5–6 name the exact action + the test that gates them — concrete, not placeholders.

**3. Type consistency:** `slugify` (Task 2) used as `<vendor-slug>` in Tasks 3/6. `state` shape from Task 3 referenced by Task 6's command. `lint()`'s rule names (`recommendation`/`tier-label`/`false-certainty`) are consistent across Task 4. Score labels match the Global Constraints verbatim. ✓
