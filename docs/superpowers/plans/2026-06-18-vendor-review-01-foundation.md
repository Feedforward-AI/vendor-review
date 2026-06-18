# Vendor Review — Plan 01: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up an installable `vendor-review` Claude Code plugin whose entry command scaffolds a per-evaluation workspace, plus the shared POV/guardrail spine and a tested dev-time guardrail lint that encodes the product's central rule.

**Architecture:** A Claude Code plugin (markdown command + skills, JSON manifests) distributed via a public marketplace. End-user runtime is markdown-only (no Bash). A separate **dev-time tooling layer** (`tooling/`, plain Node.js, zero dependencies, run with `node --test`) provides the guardrail lint, the slug helper, and the `state.json` run-manifest logic with real unit tests. This plan builds the skeleton + spine + command + tooling; Plans 02–04 add the phase skills, agents, and report.

**Tech Stack:** Markdown (command/skills/shared), JSON (plugin + marketplace manifests, `state.json`), Node.js ≥ 18 with the built-in test runner (`node --test`) and zero npm dependencies for dev tooling.

This is **plan 1 of 4** (revised 2026-06-18 after a 5-lens review — see `docs/evaluations/PLAN01-SUMMARY.md`). Source spec: `docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md`. POV material to evolve: `source_docs/vendor_system_prompt.md` and the six criterion prompts.

## Global Constraints

*(Every task implicitly includes these — values copied verbatim from the spec.)*

- **Naming frozen:** GitHub `Feedforward-AI/vendor-review` · marketplace name `feedforward` · plugin name & local dir `vendor-review`.
- **§0 governing rule:** maximally opinionated about trade-offs; **never the literal buy/don't-buy sentence.** Allowed: blunt risk-naming, `sentiment`, scorecard counts, "Against your priorities." Banned: literal recommendation strings and any single aggregate "Recommended" grade.
- **No tier labels anywhere** — never "Fortune 100/500," hyphenated or not. Use "senior leaders," "your organization."
- **Runtime `allowed-tools` (tight):** `Read, Write, Edit, WebSearch, WebFetch, Task` only. **No `Bash`** in shipped command/skills.
- **Dev tooling is consumed as contracts, never `require()`d at runtime.** `tooling/slug.js`, `state.js`, `guardrail-lint.js`, `guardrail-rules.js` are exercised by **dev tests** and serve as **shape/rule contracts** for the no-`Bash` skills/command in later plans — the markdown surfaces re-express their rules, they do not import them.
- **Two guardrail surfaces, one rule set:** the **dev/CI lint** (`tooling/guardrail-lint.js`) and the **runtime model-applied checklist** (in `shared/voice-and-guardrails.md`) draw from one shared source (`tooling/guardrail-rules.js`); a test enforces parity. §12.5's "blocks checkpoint advancement" is satisfied at runtime by the model applying the checklist (no executable lint under the no-`Bash` posture).
- **Workspace location:** the user's CWD at `./vendor-evaluations/<vendor-slug>/`.
- **Slug rule:** `<vendor-slug>` = lowercase, hyphenated vendor name, confirmed with the exec.
- **Phase order:** `intake → research → capacity → procurement → report`; skill names are `vendor-<phase>`.
- **Score labels:** `Met / Partially Met / Not Met / Insufficient Information` (capacity); `Available / Partial / Absent / Insufficient` (procurement) — deliberately distinct, both documented in the spine.

---

## Prerequisites (run once, before Task 1)

- [ ] Verify the toolchain: `node --version` returns **v18+** and `npm --version` works. If not, install Node.js ≥ 18 before proceeding (the dev tests use the built-in `node --test` runner, added in 18).

---

## File Structure (this plan)

```
vendor-review/                          # repo root (= plugin root = local dir)
├── .gitattributes                      # Task 1 — eol=lf (keeps regex tests portable)
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
    ├── guardrail-rules.js              # Task 4 — shared rule source (lint + runtime parity)
    ├── guardrail-lint.js               # Task 4
    └── test/
        ├── manifest.test.js            # Task 1
        ├── slug.test.js                # Task 2
        ├── state.test.js               # Task 3
        ├── guardrail-lint.test.js      # Task 4
        ├── shared-spine.test.js        # Task 5
        ├── command.test.js             # Task 6
        ├── readme.test.js              # Task 7
        └── fixtures/
            ├── clean-opinionated.md     # Task 4 — must PASS the lint
            └── violations.md            # Task 4 — must be FLAGGED
```

`commands/`, `skills/`, `agents/` are created as empty tracked dirs (`.gitkeep`) so the plugin loads; their contents land in Plans 02–04. `shared/` gets real files in Task 5, so it is **not** `.gitkeep`-ed here.

---

### Task 1: Plugin + marketplace manifests (installable skeleton)

**Files:**
- Create: `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.gitattributes`
- Create: `tooling/test/manifest.test.js`
- Create (empty tracked dirs): `commands/.gitkeep`, `skills/.gitkeep`, `agents/.gitkeep`

**Interfaces:**
- Produces: an installable plugin named `vendor-review` from marketplace `feedforward`; the manifest field shape the test enforces.

- [ ] **Step 1: Confirm the manifest schema (with a hard fallback)**

Verify field names against the live plugin docs via Context7 (`mcp__claude_ai_Context7__query-docs`, "Claude Code plugin.json marketplace.json schema") or WebFetch `https://docs.claude.com/en/docs/claude-code/plugins`.
- **Decision rule:** add only fields the docs **explicitly mark required**; do **not** remove any field listed below unless the docs deprecate it.
- **Components:** commands/skills/agents are auto-discovered from their conventional dirs. If — and only if — the live schema requires explicit component arrays (e.g. a `commands` list), add them and a matching test assertion (this satisfies spec §12.1's "includes the command, skills, and agents" either by declaration or by documented auto-discovery).
- **Fallback:** if Context7/WebFetch is unavailable or the docs are ambiguous, **proceed with the JSON below as-is — the test is the source of truth for Plan 01.** Do not stall.

- [ ] **Step 2: Write the failing test**

```js
// tooling/test/manifest.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const TIER = /Fortune[\s-]*(100|500)/i; // hyphenated forms too

test('plugin.json declares the frozen plugin name and required fields', () => {
  const m = read('.claude-plugin/plugin.json');
  assert.equal(m.name, 'vendor-review');
  assert.match(m.version, /^\d+\.\d+\.\d+$/);
  assert.ok(m.description && m.description.length > 20);
  assert.ok(m.author, 'author present');
  assert.doesNotMatch(JSON.stringify(m), TIER);
});

test('marketplace.json is named feedforward and lists vendor-review', () => {
  const mk = read('.claude-plugin/marketplace.json');
  assert.equal(mk.name, 'feedforward');
  assert.ok(Array.isArray(mk.plugins));
  assert.ok(mk.plugins.some((p) => p.name === 'vendor-review'));
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test tooling/test/manifest.test.js`
Expected: FAIL — `ENOENT` (manifests don't exist yet).

- [ ] **Step 4: Create the manifests, `.gitattributes`, and placeholder dirs**

```json
// .claude-plugin/plugin.json
{
  "name": "vendor-review",
  "version": "0.1.0",
  "description": "Opinionated, capacity-building evaluation of B2B AI vendors for senior leaders: phased research, six-criteria scoring, a courtesy procurement review, and a branded report.",
  "author": { "name": "Feedforward" },
  "homepage": "https://github.com/Feedforward-AI/vendor-review",
  "license": "MIT"
}
```

```json
// .claude-plugin/marketplace.json
{
  "name": "feedforward",
  "owner": { "name": "Feedforward" },
  "plugins": [
    { "name": "vendor-review", "source": "./", "description": "Opinionated, capacity-building vendor evaluation with a branded report." }
  ]
}
```

```gitattributes
# .gitattributes — keep line endings stable so frontmatter/regex tests are portable
* text=auto eol=lf
```

Then: `mkdir -p commands skills agents && touch commands/.gitkeep skills/.gitkeep agents/.gitkeep`

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tooling/test/manifest.test.js`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add .claude-plugin .gitattributes commands skills agents tooling/test/manifest.test.js
git commit -m "feat(foundation): installable plugin + marketplace manifests"
```

---

### Task 2: Slug helper

**Files:**
- Create: `tooling/slug.js`
- Create: `tooling/test/slug.test.js`

**Interfaces:**
- Produces: `slugify(name: string) => string` — lowercase, hyphenated, accent-stripped. Defines the `<vendor-slug>` rule. In Plan 01 it is consumed only by its own test; later plans honor the *rule*, not the function (no-`Bash` markdown cannot `require()` it).

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

> Note the accent range uses **`̀-ͯ` escapes** (copy-paste-safe), not literal combining marks.

```js
// tooling/slug.js
function slugify(name) {
  return String(name)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // strip accents (escaped range)
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
- Produces:
  - `PHASES = ['intake','research','capacity','procurement','report']`
  - `createState({vendor, slug, now}) => state`
  - `markPhaseComplete(state, phase, artifactHash, now) => state` (throws on unknown phase; sets `currentPhase` to the next phase, or `'done'` after `report`)
  - `markDownstreamStale(state, phase, now) => state` (throws on unknown phase)
  - `validateState(state) => true | throws`
  - `state` shape: `{ schema:'vendor-review/state@1', vendor, slug, currentPhase, phases: { [name]: { status, artifactHash, sourceHashes, updatedAt } }, backEdges: { capacityToResearch: { used, max } } }`, `status ∈ {'pending','complete','stale'}`, `currentPhase ∈ PHASES ∪ {'done'}`.
- Forward-compat: `sourceHashes` (per-phase dependency hashes) and `backEdges` (the §12.1 loop cap, `max: 2`) are landed now; the *behavior* (hash diffing, round counting) is Plan 03.

- [ ] **Step 1: Write the failing test**

```js
// tooling/test/state.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { createState, markPhaseComplete, markDownstreamStale, validateState, PHASES } = require('../state');

const T = '2026-06-18T00:00:00Z';

test('createState starts every phase pending with forward-compat fields', () => {
  const s = createState({ vendor: 'Harvey AI', slug: 'harvey-ai', now: T });
  assert.equal(s.slug, 'harvey-ai');
  assert.equal(s.currentPhase, 'intake');
  for (const p of PHASES) {
    assert.equal(s.phases[p].status, 'pending');
    assert.deepEqual(s.phases[p].sourceHashes, {});
  }
  assert.deepEqual(s.backEdges.capacityToResearch, { used: 0, max: 2 });
  assert.equal(validateState(s), true);
});

test('markPhaseComplete records hash and advances currentPhase', () => {
  const s = markPhaseComplete(createState({ vendor: 'X', slug: 'x', now: T }), 'intake', 'abc123', T);
  assert.equal(s.phases.intake.status, 'complete');
  assert.equal(s.phases.intake.artifactHash, 'abc123');
  assert.equal(s.currentPhase, 'research');
});

test('completing the last phase sets currentPhase to done', () => {
  let s = createState({ vendor: 'X', slug: 'x', now: T });
  for (const p of PHASES) s = markPhaseComplete(s, p, 'h', T);
  assert.equal(s.currentPhase, 'done');
});

test('markDownstreamStale marks only phases after the given one', () => {
  let s = createState({ vendor: 'X', slug: 'x', now: T });
  for (const p of PHASES) s = markPhaseComplete(s, p, 'h', T);
  s = markDownstreamStale(s, 'research', T);
  assert.equal(s.phases.intake.status, 'complete');
  assert.equal(s.phases.research.status, 'complete');
  assert.equal(s.phases.capacity.status, 'stale');
  assert.equal(s.phases.procurement.status, 'stale');
  assert.equal(s.phases.report.status, 'stale');
});

test('unknown phase names throw on both mutators', () => {
  const s = createState({ vendor: 'X', slug: 'x', now: T });
  assert.throws(() => markPhaseComplete(s, 'bogus', 'h', T), /unknown phase/);
  assert.throws(() => markDownstreamStale(s, 'bogus', T), /unknown phase/);
});

test('validateState rejects bad status, currentPhase, and sourceHashes', () => {
  let s = createState({ vendor: 'X', slug: 'x', now: T });
  s.phases.intake.status = 'nope';
  assert.throws(() => validateState(s), /status/);
  s = createState({ vendor: 'X', slug: 'x', now: T });
  s.currentPhase = 'bogus';
  assert.throws(() => validateState(s), /currentPhase/);
  s = createState({ vendor: 'X', slug: 'x', now: T });
  s.phases.report.sourceHashes = null;
  assert.throws(() => validateState(s), /sourceHashes/);
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
  for (const p of PHASES) phases[p] = { status: 'pending', artifactHash: null, sourceHashes: {}, updatedAt: now };
  return {
    schema: 'vendor-review/state@1',
    vendor, slug,
    currentPhase: PHASES[0],
    phases,
    backEdges: { capacityToResearch: { used: 0, max: 2 } },
  };
}

function markPhaseComplete(state, phase, artifactHash, now) {
  if (!PHASES.includes(phase)) throw new Error('unknown phase: ' + phase);
  const ph = state.phases[phase];
  ph.status = 'complete';
  ph.artifactHash = artifactHash;
  ph.updatedAt = now;
  state.currentPhase = PHASES[PHASES.indexOf(phase) + 1] || 'done';
  return state;
}

function markDownstreamStale(state, phase, now) {
  if (!PHASES.includes(phase)) throw new Error('unknown phase: ' + phase);
  for (const p of PHASES.slice(PHASES.indexOf(phase) + 1)) {
    if (state.phases[p].status === 'complete') {
      state.phases[p].status = 'stale';
      state.phases[p].updatedAt = now;
    }
  }
  return state;
}

function validateState(state) {
  if (state.schema !== 'vendor-review/state@1') throw new Error('bad schema');
  if (![...PHASES, 'done'].includes(state.currentPhase)) throw new Error('bad currentPhase');
  for (const p of PHASES) {
    const ph = state.phases[p];
    if (!ph || !STATUSES.includes(ph.status)) throw new Error(`bad status for ${p}`);
    if (typeof ph.sourceHashes !== 'object' || ph.sourceHashes === null) throw new Error(`bad sourceHashes for ${p}`);
  }
  const be = state.backEdges && state.backEdges.capacityToResearch;
  if (!be || typeof be.used !== 'number' || be.max !== 2) throw new Error('bad backEdges');
  return true;
}

module.exports = { PHASES, createState, markPhaseComplete, markDownstreamStale, validateState };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tooling/test/state.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add tooling/state.js tooling/test/state.test.js
git commit -m "feat(foundation): state.json run-manifest (stale-marking, loop-cap + source-hash fields)"
```

---

### Task 4: Guardrail rules + lint (encodes the §0 rule)

**Files:**
- Create: `tooling/guardrail-rules.js` (shared source of truth — also used by Task 5's parity test)
- Create: `tooling/guardrail-lint.js`
- Create: `tooling/test/guardrail-lint.test.js`
- Create: `tooling/test/fixtures/clean-opinionated.md`, `tooling/test/fixtures/violations.md`

**Interfaces:**
- Produces:
  - `guardrail-rules.js`: `RULES = ['recommendation','tier-label','false-certainty']`, `ALLOWED_EXAMPLES` (deliberately-allowed opinionated phrases the lint must never flag and the voice file must list), and the regex sets.
  - `guardrail-lint.js`: `lint(text) => Violation[]`, `Violation = { rule, match, index }`. **Every** occurrence is reported (global `matchAll`), not just the first.
- The **do-not-over-fire** requirement is a test: the clean-opinionated fixture must yield `[]`, and `recommend you ask the vendor…` / `buyer` / `buying` / `purchase decision remains yours` must not flag.
- Scope note: this lint covers the **literal purchase-verdict, tier-label, and no-false-certainty** rules. The cross-artifact **fail-loudly completeness** check (§12.5: every dossier gap appears in the report) is **Plan 04-owned** (needs the report) and is not claimed here.

- [ ] **Step 1: Write the fixtures**

```markdown
<!-- tooling/test/fixtures/clean-opinionated.md  (MUST PASS: zero violations) -->
Sentiment: negative. SEE: Not Met. EXIT: Not Met.

Acme uses a proprietary system unique to itself. This poses extreme risk to your
portability. A strong fit for organizations prioritizing speed-to-value, with
severe lock-in risk for anyone on a multi-year horizon — the purchase decision
remains yours. We do not issue a buy/don't-buy verdict.

We recommend you ask the vendor to confirm encryption-at-rest.

Insufficient Information on encryption: request their SOC 2 Type II report and
current sub-processor list to close this gap.
```

```markdown
<!-- tooling/test/fixtures/violations.md  (MUST be flagged) -->
Overall: Recommended. We recommend purchasing this, so don't buy the competitor.
Our verdict: adopt it. This is a great fit for Fortune-100 companies.

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
const rules = (t) => lint(t).map((v) => v.rule);

test('clean opinionated copy passes (do-not-over-fire)', () => {
  assert.deepEqual(lint(fx('clean-opinionated.md')), []);
});

test('flags literal recommendation strings', () => {
  assert.ok(rules(fx('violations.md')).includes('recommendation'));
});

test('reports EVERY occurrence, not just the first', () => {
  const v = lint('We recommend buying this. We recommend buying that.')
    .filter((x) => x.rule === 'recommendation');
  assert.equal(v.length, 2);
});

test('flags aggregate grade, bare verdict, overall grade, letter score', () => {
  assert.ok(rules('Overall: Recommended').includes('recommendation'));
  assert.ok(rules('Our verdict: adopt it').includes('recommendation'));
  assert.ok(rules('Overall grade: strong').includes('recommendation'));
  assert.ok(rules('Score: B+ for value').includes('recommendation'));
});

test('flags purchase/recommend variants', () => {
  for (const s of ["don't purchase this", "you should move forward with this",
                   "buy Acme today", "I recommend purchasing", "purchase the product"])
    assert.ok(rules(s).includes('recommendation'), s);
});

test('flags hyphenated tier labels', () => {
  assert.ok(rules('great for Fortune-100 buyers').includes('tier-label'));
});

test('flags Insufficient not followed by a named artifact', () => {
  assert.ok(rules('Insufficient Information on pricing. More research needed.').includes('false-certainty'));
});

test('does NOT flag Insufficient that names a specific artifact', () => {
  assert.ok(!rules('Insufficient Information — request their SOC 2 Type II report.').includes('false-certainty'));
});

test('does NOT over-fire on allowed phrases', () => {
  assert.deepEqual(lint('The buyer should weigh buying cycles.'), []);
  assert.deepEqual(lint('We recommend you ask the vendor to confirm this.'), []);
  assert.deepEqual(lint('The purchase decision remains yours. We do not issue a buy/don’t-buy verdict.'), []);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test tooling/test/guardrail-lint.test.js`
Expected: FAIL — `Cannot find module '../guardrail-lint'`.

- [ ] **Step 4: Write `guardrail-rules.js`**

```js
// tooling/guardrail-rules.js
// One source of truth for the §0 guardrails. Imported by the dev lint AND asserted
// against the runtime checklist in shared/voice-and-guardrails.md (see shared-spine.test.js).
const RULES = ['recommendation', 'tier-label', 'false-certainty'];

// Deliberately-allowed opinionated phrases: the lint must NEVER flag these and the voice
// file must list them as allowed.
const ALLOWED_EXAMPLES = [
  'the purchase decision remains yours',
  'this poses extreme risk',
  'we recommend you ask the vendor',
];

// Literal purchase-VERDICT statements (all global for full-text scanning).
const RECOMMENDATION = [
  /\b(?:do ?n['’]?t|do not)\s+(?:buy|purchase)\b/gi,
  /\byou\s+should\s+(?:buy|purchase|adopt|procure|sign|proceed|move\s+forward|pass|skip)\b/gi,
  /\b(?:buy|purchase)\s+(?:this|it|the\s+(?:tool|product|vendor|deal|platform)|[A-Z][\w-]+)\b/g, // "buy Acme", "purchase the product"
  /\b(?:strongly\s+)?recommend(?:s|ed|ing)?\s+(?:buying|purchasing|adopting|procuring|signing|proceeding|moving\s+forward|this|it|the\s+(?:tool|product|vendor|purchase|deal))\b/gi,
  // "we/I recommend ..." EXCEPT investigative guidance ("we recommend you ask/confirm/...").
  /\b(?:we|i|our\s+team)\s+recommend(?:s|ed)?\b(?!\s+(?:that\s+)?(?:you\s+)?(?:ask|confirm|verify|clarify|request|require|evaluate|review|investigate|press|push)\b)/gi,
  /\b(?:our\s+)?recommendation(?:\s+is)?:?\s+(?:to\s+)?(?:buy|purchas\w+|adopt|proceed|pass|skip|do ?n['’]?t)/gi,
  /\boverall\s+grade\b/gi,
  /\boverall:\s*(?:not\s+)?recommended\b/gi,
  /\bscore:\s*[A-F][+-]?\b/gi,
];

const TIER = /\bFortune[\s-]*(?:100|500)\b/gi;

// Bare "verdict" is a violation UNLESS negated in the preceding window.
const VERDICT_MARKER = /\bverdict\b/gi;
const NEGATION_BEFORE = /\b(?:not|without|no|never|isn['’]?t|do ?n['’]?t|avoid)\b/i;

const CERTAINTY_MARKER = /\b(?:Insufficient(?:\s+Information)?|Withheld)\b/gi;
// A SPECIFIC named artifact (deliberately excludes bare "report"/"document").
const NAMED_ARTIFACT = /\b(?:SOC\s?2(?:\s+Type\s+I{1,2})?|ISO\s?27001|DPA|BAA|sub-?processor\s+list|pen[-\s]?test\s+report|pricing\s+quote|SLA|SIG|CAIQ|HECVAT|certificat\w+|audit\s+report|MSA|data\s+processing\s+agreement)\b/i;

module.exports = { RULES, ALLOWED_EXAMPLES, RECOMMENDATION, TIER, VERDICT_MARKER, NEGATION_BEFORE, CERTAINTY_MARKER, NAMED_ARTIFACT };
```

- [ ] **Step 5: Write `guardrail-lint.js`**

```js
// tooling/guardrail-lint.js
const R = require('./guardrail-rules');

function lint(text) {
  const out = [];
  for (const re of R.RECOMMENDATION)
    for (const m of text.matchAll(re)) out.push({ rule: 'recommendation', match: m[0], index: m.index });
  for (const m of text.matchAll(R.TIER))
    out.push({ rule: 'tier-label', match: m[0], index: m.index });
  for (const m of text.matchAll(R.VERDICT_MARKER)) {
    const before = text.slice(Math.max(0, m.index - 32), m.index);
    if (!R.NEGATION_BEFORE.test(before)) out.push({ rule: 'recommendation', match: m[0], index: m.index });
  }
  for (const m of text.matchAll(R.CERTAINTY_MARKER)) {
    const window = text.slice(m.index, m.index + 220);
    if (!R.NAMED_ARTIFACT.test(window)) out.push({ rule: 'false-certainty', match: m[0], index: m.index });
  }
  return out;
}
module.exports = { lint };
```

> `String.prototype.matchAll` operates on a clone of each global regex, so reusing the module-level regexes across `lint()` calls leaves no `lastIndex` state — no manual reset needed. If the clean fixture trips a rule, tighten the regex; **the clean fixture is the source of truth for "do not over-fire."**

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test tooling/test/guardrail-lint.test.js`
Expected: PASS (9 tests).

- [ ] **Step 7: Commit**

```bash
git add tooling/guardrail-rules.js tooling/guardrail-lint.js tooling/test/guardrail-lint.test.js tooling/test/fixtures
git commit -m "feat(foundation): shared guardrail rules + dev lint (no-verdict, every-occurrence, do-not-over-fire)"
```

---

### Task 5: Shared spine — `philosophy.md` + `voice-and-guardrails.md`

**Files:**
- Create: `shared/philosophy.md`, `shared/voice-and-guardrails.md`
- Create: `tooling/test/shared-spine.test.js`

**Interfaces:**
- Consumes: `tooling/guardrail-rules.js` (`RULES`, `ALLOWED_EXAMPLES`) — the parity test imports these so the runtime checklist provably tracks the dev lint.
- Produces: two reference files every phase skill loads via `${CLAUDE_PLUGIN_ROOT}/shared/...`.

- [ ] **Step 1: Write the failing test**

```js
// tooling/test/shared-spine.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { RULES, ALLOWED_EXAMPLES } = require('../guardrail-rules');
const root = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('philosophy.md carries the evolved POV, new score labels, no tier labels', () => {
  const t = read('shared/philosophy.md');
  assert.match(t, /outsourcing your thinking/i);
  assert.match(t, /Met \/ Partially Met \/ Not Met \/ Insufficient Information/);
  assert.doesNotMatch(t, /Fortune[\s-]*(100|500)/i);
  assert.match(t, /present trade-offs, not verdicts/i); // kept verbatim
});

test('voice-and-guardrails.md states every cross-cutting rule', () => {
  const t = read('shared/voice-and-guardrails.md');
  for (const anchor of [
    /buy\/don['’]?t-buy/i, /no tier labels/i,
    /adaptive Q&A/i, /meet (them|people) where they are/i,
    /framework is non-negotiable/i, /no false certainty/i, /fail loudly/i,
    /evidence tier/i,
  ]) assert.match(t, anchor, String(anchor));
  // both status vocabularies documented once
  assert.match(t, /Met \/ Partially Met \/ Not Met \/ Insufficient Information/);
  assert.match(t, /Available \/ Partial \/ Absent \/ Insufficient/);
});

test('voice file runtime checklist tracks the dev lint (parity)', () => {
  const t = read('shared/voice-and-guardrails.md').toLowerCase();
  for (const r of RULES) assert.ok(t.includes(r), `missing rule name: ${r}`);
  for (const ex of ALLOWED_EXAMPLES) assert.ok(t.includes(ex.toLowerCase()), `missing allowed example: ${ex}`);
  for (const banned of ["don't buy", 'we recommend', 'overall grade'])
    assert.ok(t.includes(banned), `missing banned example: ${banned}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tooling/test/shared-spine.test.js`
Expected: FAIL — `ENOENT`.

- [ ] **Step 3: Author `shared/philosophy.md`** (evolve `source_docs/vendor_system_prompt.md` per spec §12.6)

- Keep verbatim: "state conclusions first," "no corporate hedging," "do not infer or speculate," "present trade-offs, not verdicts," and the "What Excellent Vendors Look Like" bullets.
- Rename the scale to `Met / Partially Met / Not Met / Insufficient Information` with the one-liner *"(maps to the original Yes / Partially / No / Insufficient.)"*
- Include the central question verbatim: *"Are you outsourcing your thinking to a vendor, or bringing the learning and understanding internally to strengthen your organization?"* and the three foundational points.
- **Tier-label sweep:** the source's opening sentence reads *"…helping Fortune 100 executives…"* — replace with "senior leaders," then **search the finished file for any remaining `Fortune`** (the test's `doesNotMatch` will fail otherwise).

- [ ] **Step 4: Author `shared/voice-and-guardrails.md`** (single source of truth)

Write scannable rules covering: pointed/declarative tone; **the §0 rule with both directions**; no tier labels; explain jargon; adaptive Q&A; framework non-negotiable; no false certainty (tentative vs withheld, always name the specific artifact); fail loudly + 3-way gap routing; the three evidence tiers; never fabricate. Then a **"Runtime guardrail check"** subsection that the model applies at every checkpoint.

To satisfy the parity test, that subsection must include these **verbatim** strings (each on its own line is fine):
- the three rule names: `recommendation`, `tier-label`, `false-certainty`
- the allowed examples: `the purchase decision remains yours` · `this poses extreme risk` · `we recommend you ask the vendor`
- the banned examples: `don't buy` · `we recommend` · `overall grade`
- both status vocabularies: `Met / Partially Met / Not Met / Insufficient Information` and `Available / Partial / Absent / Insufficient`
- the anchor phrases: `no tier labels`, `adaptive Q&A`, `meet them where they are`, `framework is non-negotiable`, `no false certainty`, `fail loudly`, `evidence tier`, and `buy/don't-buy`

> If adjusting one required phrase removes another, add the missing phrase elsewhere rather than rewriting the same sentence — each anchor should live in its own line/context.

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tooling/test/shared-spine.test.js`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add shared/philosophy.md shared/voice-and-guardrails.md tooling/test/shared-spine.test.js
git commit -m "feat(foundation): shared POV + voice/guardrails spine (lint parity, status vocab)"
```

---

### Task 6: Entry command (orchestrator)

**Files:**
- Create: `commands/vendor-evaluation.md`
- Create: `tooling/test/command.test.js`
- Delete: `commands/.gitkeep`

**Interfaces:**
- Consumes: `shared/philosophy.md`, `shared/voice-and-guardrails.md`; references the (not-yet-built) phase skills `vendor-intake`, `vendor-research`, `vendor-capacity-assessment`, `vendor-procurement-review`, `vendor-report`.
- Produces: the entry point. On run it confirms vendor name + URL → derives `<vendor-slug>` (prose rule, not the JS function) → creates `./vendor-evaluations/<vendor-slug>/` + `state.json` → runs phases with checkpoints + a runtime guardrail check → can resume from an existing `state.json` → **delegates** the closing feedback step to `vendor-report` (Plan 04 ships the feedback artifact; Plan 01 ships none).

- [ ] **Step 1: Write the failing test**

```js
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
**Granularity:** write the body as a **complete end-to-end workflow a model can follow**, with **each phase as a named section** referencing its skill by name and stating, at a high level, the phase's inputs, outputs (the artifact), checkpoint, and the runtime guardrail check before advancing. The detailed phase logic lives in the skill files (Plans 02–04) — keep phase sections to the integration contract, not full procedures.

Body must: load `${CLAUDE_PLUGIN_ROOT}/shared/philosophy.md` and `voice-and-guardrails.md` as binding context; ask for vendor name + URL; derive `<vendor-slug>` (lowercase, hyphenated, confirmed with the exec); **on start, read any existing `./vendor-evaluations/<vendor-slug>/state.json` and resume at its `currentPhase`** (else create the dir + initialize `state.json` per Task 3); drive the five phases in order, each ending in a **checkpoint** + a **runtime guardrail check** (applying the "Runtime guardrail check" from the voice file) before advancing; **delegate the closing privacy-first feedback step to `vendor-report`** (no feedback artifact ships in Plan 01).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tooling/test/command.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git rm -f commands/.gitkeep
git add commands/vendor-evaluation.md tooling/test/command.test.js
git commit -m "feat(foundation): vendor-evaluation entry command/orchestrator"
```

---

### Task 7: README + test wiring + acceptance (full suite green)

**Files:**
- Create: `package.json`, `README.md`
- Create: `tooling/test/readme.test.js`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: `npm test` → runs every `tooling/test/*.test.js`; install/usage docs with the frozen names.

- [ ] **Step 1: Write the failing README test FIRST** (so there's a real red step)

```js
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
  assert.equal(pkg.scripts.test, 'node --test tooling/test/');
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `node --test tooling/test/readme.test.js`
Expected: FAIL — `ENOENT` for `README.md` / `package.json`.

- [ ] **Step 3: Write `package.json`**

```json
{
  "name": "vendor-review-dev",
  "private": true,
  "version": "0.1.0",
  "description": "Dev tooling and tests for the vendor-review plugin (not shipped to end users).",
  "scripts": { "test": "node --test tooling/test/" }
}
```

- [ ] **Step 4: Write `README.md`**

Include (the test guards the key strings): the POV one-liner; the two-command install **verbatim**:
```
/plugin marketplace add Feedforward-AI/vendor-review
/plugin install vendor-review@feedforward
```
the `git clone` + local `/plugin install` fallback; how to run (`/vendor-review:vendor-evaluation`); the five phases; what you get (Full Report + four cuts + custom outputs); a privacy note (everything local; feedback opt-in). No tier labels.

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: PASS — every test across manifest, slug, state, guardrail-lint, shared-spine, command, readme.

- [ ] **Step 6: Manual acceptance smoke check** (not automatable under `node --test`)

The handoff's Plan-01 acceptance includes runtime checks the unit tests can't prove. Do them by hand, then clean up:
1. Install locally: from the repo dir, `/plugin install` the local path (or `/plugin marketplace add Feedforward-AI/vendor-review` + install) and confirm `/vendor-review:vendor-evaluation` appears.
2. Run it against a throwaway vendor; confirm it creates `./vendor-evaluations/<slug>/state.json`.
3. In a node REPL: `require('./tooling/state').validateState(JSON.parse(require('fs').readFileSync('./vendor-evaluations/<slug>/state.json')))` returns `true`.
4. Delete the throwaway `./vendor-evaluations/<slug>/`.

Record the result in the commit message or a scratch note; this gate is manual by design (no-`Bash` runtime).

- [ ] **Step 7: Commit**

```bash
git add README.md package.json tooling/test/readme.test.js
git commit -m "feat(foundation): README, install docs, npm test wiring, manual acceptance"
```

---

## Self-Review

**1. Spec coverage (Plan-01 scope):**
- Plugin/packaging + frozen naming (spec §3, §12.1) → Tasks 1, 7. ✓
- `state.json` + stale-marking + loop-cap/source-hash fields (§4, §12.1) → Task 3. ✓
- Slug rule (§12.4) → Task 2. ✓
- Guardrail lint incl. §0 rule, every-occurrence, false-certainty, do-not-over-fire (§2, §12.5) → Task 4. The cross-artifact **fail-loudly completeness** sub-rule is explicitly **Plan 04-owned**, not claimed here. ✓
- Runtime-vs-dev guardrail split + parity (§12.5) → Global Constraints + Tasks 4–6. ✓
- Shared spine + carry-forward hygiene + both status vocabularies (§10, §12.3, §12.6) → Task 5. ✓
- Entry command, tight allowed-tools, workspace path, resume, feedback delegation (§4, §12.1) → Task 6. ✓
- Deferred to Plans 02–04: the five phase skills, the six `agents/`, report assets, golden-fixture end-to-end tests. Noted, not gaps.

**2. Placeholder scan:** No "TBD/TODO." Task 1 Step 1 has a concrete fallback; the prose-authoring steps (Tasks 5–6) name exact required strings + the test that gates them.

**3. Dependency accuracy:** `slugify` (Task 2) defines the `<vendor-slug>` **rule**; in Plan 01 it is exercised only by its own test. Tasks 3 and 6 use the slug **value/contract** (caller-supplied in Task 3; prose-derived in the no-`Bash` command), never the function. The `state` shape (Task 3) and the `lint()`/`guardrail-rules` contract (Task 4) are referenced by Tasks 5–6 as contracts, not runtime imports.

**4. Type consistency:** `lint()`'s `Violation = { rule, match, index }` and the three rule names in `guardrail-rules.RULES` are consistent across the impl, all lint tests, and the shared-spine parity test. Score labels match the Global Constraints verbatim in Task 5's tests. `state.currentPhase ∈ PHASES ∪ {'done'}` is consistent between `markPhaseComplete` and `validateState`.
