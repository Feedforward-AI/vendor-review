# Plan 01 (Foundation) — Consolidated Review

**Plan:** `docs/superpowers/plans/2026-06-18-vendor-review-01-foundation.md` (710 lines, 7 tasks, TDD)
**Date:** 2026-06-18
**Method:** 5 independent reviewers, one per model family, each with a distinct lens, working from a
shared brief (`plan01-evaluator-brief.md`) that enforced the **plan-01-of-4 scoping rule** (deferred
items were explicitly *not* to be flagged as missing) and the **§0 governing rule** (opinionation is
deliberate; the lint must not be dinged for allowing sentiment/counts).

| Lens | Model (assigned) | File | Findings |
|---|---|---|---|
| A — Spec fidelity / traceability | `openai-codex/gpt-5.5` | plan01-A-spec-fidelity.md | 8 |
| B — Code & test correctness | `opencode-go/deepseek-v4-pro` | plan01-B-code-correctness.md | 10 |
| C — TDD methodology + acceptance | `opencode-go/kimi-k2.7-code` | plan01-C-tdd-methodology.md | 12 |
| D — Internal consistency | `zai/glm-5.2` | plan01-D-consistency.md | 7 |
| E — Implementability / agentic-worker | `opencode-go/qwen3.7-plus` | plan01-E-implementability.md | 12 |

> Reviewer self-reported `Model:` lines are unreliable (the agent can't introspect its model). The model
> column is what was actually assigned.

## Overall verdict
**No hard blockers — `npm test` will go green as written, and every task's red→green→commit loop is
sound for Tasks 1–6.** The plan is well-structured, the produces/consumes chain holds, the frozen
naming/allowed-tools/slug/score-label decisions are honored, and the forward-references to not-yet-built
phase skills are correctly intentional. The issues cluster around **two things**: (1) the **guardrail
lint** — the load-bearing product rule — is under-specified relative to spec §12.5 *and* has no runtime
enforcement mechanism under the no-`Bash` posture; (2) a set of **forward-compatibility and
speculation gaps** (state schema can't yet represent the §12.1 back-edge loop cap; "plugin installs" /
"command scaffolds workspace" acceptance items have no test and aren't acknowledged as manual).

## Findings scorecard
- **High:** 7 (one big cluster of ~3 around the lint, plus state-schema, runtime-lint, Task-7 TDD, acceptance)
- **Medium:** ~9
- **Low / Nit:** ~15
- Cross-confirmed by ≥2 independent reviewers: lint coverage (3), state-schema loop-cap (2), slug accent-regex (2), Task-1 schema stall (2), `report`-in-NAMED_ARTIFACT breadth (2), shared-spine↔lint parity (2), Task-5 prose-anchor fragility (3), `.gitkeep` inconsistency (3)

---

## 🟠 High — fix before building

### H-1 — The guardrail lint under-implements §12.5, and only catches the *first* match per pattern *(SF-004, SF-005, TDD-002, B-001 — 4 reviewers)*
**This is the most cross-confirmed and most important finding — it's the §0 rule's enforcement.**
- **Missing patterns.** §12.5 / IMPLEMENTATION-BRIEF §2 require catching `verdict`, `overall grade`, `score: A/B/C`, and `recommend`/`purchase` broadly. The plan's `RECOMMENDATION` regexes miss: bare **`verdict`** (only catches `verdict: buy/pass/skip`), **`overall grade`** (only `overall: recommended`), **`score: A/B/C`**, **`I recommend`** / **`recommend buying`** (only `we recommend`), **`don't purchase`**, **`buy <vendor>`** / **`purchase the product`** (only `buy this|it`). The Self-Review claims "§12.5 ✓" but it's a real subset.
- **First-match-only bug.** The loop uses `re.exec(text)` without the `g` flag, so each pattern catches only its **first** occurrence. The tests pass only because they assert `.includes('recommendation')` (presence), not completeness. A dossier with three "we recommend" sentences flags one.
- **Fix:** (a) expand `RECOMMENDATION` to cover the missing patterns (phrase-level, with the do-not-over-fire allowlist for "purchase decision remains yours" / "buyer" / "buying"); (b) add the `g` flag + a `while`/`matchAll` loop (like the certainty-marker loop already does); (c) add tests asserting *completeness* (count of violations), not just presence; (d) add tests for each §12.5-listed phrase.

### H-2 — No runtime mechanism to enforce the lint at checkpoints *(SF-003)*
The command (Task 6) must run "a guardrail check before advancing" each phase (§12.5: "blocks checkpoint advancement"), but the shipped command is **no-`Bash` markdown** and cannot execute `tooling/guardrail-lint.js`. So the §12.5 runtime-blocking guarantee is prose-only. The dev lint and the runtime check are two different things, and the plan conflates them.
- **Fix:** make the split explicit. Task 4 stays the **dev/CI lint**. Task 6's command should apply `shared/voice-and-guardrails.md`'s "Runtime guardrail check" as a **model-applied checklist** with the identical rule list (see H-3). If executable runtime lint is truly required by §12.5, the plan needs an allowed-tools-compatible design — flag for Adam's decision.

### H-3 — The "runtime guardrail == dev lint" parity is asserted but never tested *(D-002, TDD-006)*
Task 5 declares the voice file's banned list "must match the lint so runtime behavior == dev lint," but `shared-spine.test.js` only checks loose prose anchors — it doesn't verify the voice file enumerates the same categories the lint enforces, or refrains from banning the allowed phrases. This is the exact seam where runtime drifts from dev silently.
- **Fix:** make parity testable — extract the banned categories into a shared constant imported by both `guardrail-lint.js` and a spine test, OR add a spine-test assertion that the voice file's "Runtime guardrail check" section references the same three rule names + the same two ✅-allowed examples the lint's do-not-over-fire fixture relies on.

### H-4 — The `state.json` schema can't represent the §12.1 back-edge loop cap (2) or source-artifact hashes *(SF-002; D open-Q1)*
§12.1 froze a run-manifest with "source-artifact hashes" and a "Loop cap: 2 rounds" back-edge. Task 3's shape is `{ schema, vendor, slug, currentPhase, phases:{ status, artifactHash, updatedAt } }` — there's a per-phase `artifactHash` but **no `sourceHashes`/`dependencyHashes`** and **no revisions/rounds counter**. Plan 03 will have to mutate the frozen schema ad hoc.
- **Fix:** extend Task 3 now with forward-compatible fields (e.g. `phases[p].revisions: { used, max: 2 }` and a `sourceHashes` map), with validation tests. The re-research *behavior* stays in Plan 03; just land the schema shape.

### H-5 — Task 7 breaks TDD for the README test *(TDD-001)*
Step 1 writes `package.json`, Step 2 writes `README.md`, Step 3 *then* appends the README test. There's no red step — the README already contains the install strings, so the test passes on first run. It's a post-hoc checklist, not a design constraint.
- **Fix:** reorder — append the failing README test first, run `npm test` to see it fail, then write `README.md` + `package.json`, then green.

### H-6 — Two Plan-01 acceptance items have no test and aren't acknowledged as manual *(SF-007, TDD-003)*
The handoff's Plan-01 acceptance requires "plugin installs" and "running the command creates `./vendor-evaluations/<slug>/` + valid `state.json`." Neither has an automated test, and neither is called out as a manual/runtime check. A worker can finish `npm test` green without proving either.
- **Fix:** add a final Task-7 step that explicitly lists these as manual smoke checks (install locally / run the command against a throwaway vendor / `validateState` the resulting `state.json` / clean up).

### H-7 — Task 1 Step 1 (manifest-schema verification) is a stall point *(impl-001, TDD-005)*
"Verify the schema via Context7/WebFetch; if docs require more fields, add them and update the test" has no fallback if the tool/docs are unavailable, and no decision procedure for required-vs-optional. Task 1 is step 1 of the whole plan — a stall here blocks everything.
- **Fix:** add a concrete fallback ("if Context7/WebFetch unavailable or ambiguous, proceed with the JSON as given — the test is the source of truth for Plan 01") and clarify "add only fields the docs explicitly mark required."

---

## 🟡 Medium

- **M-1 — Slug accent-regex uses literal combining chars** `replace(/[̀-ͯ]/g,'')` that may not survive copy-paste → `slugify('Légora')` silently fails. *(B-002, impl-003)* Use `\u0300-\u036f` escapes. (Logic is correct; only the source encoding is fragile.)
- **M-2 — Procurement status vocabulary missing from the shared spine.** Spec §12.3 says document both scales once; Task 5 only tests the capacity scale. *(SF-006)* Add an assertion + a "Status vocabularies" subsection to the voice file.
- **M-3 — Self-Review #3 misstates the `slugify`→`state` dependency.** Task 3 explicitly says slugify is NOT consumed there ("caller passes vendor and slug"), but Self-Review claims it is. *(D-001)* Reword.
- **M-4 — `report` in `NAMED_ARTIFACT` is too broad** → "we'll need a report" wrongly satisfies the false-certainty window. *(B-003, TDD-008)* Drop bare `report` or qualify (`(?:SOC 2|audit|assessment)\s+report`).
- **M-5 — "Resume" claimed in Self-Review #1 + Task 6 body but no test gates it** (and handoff acceptance doesn't require it either). *(D-003)* Add a `command.test.js` assertion or strike "resume" from the coverage claim.
- **M-6 — Task 5 prose-anchor fragility.** The shared-spine test requires exact substrings on a single line (`/never.*buy\/don't-buy/i` — `.` doesn't cross newlines; "adaptive Q&A" must be verbatim, not "adaptive questioning"). A faithful worker can paraphrase itself into a fail-loop. *(impl-002, impl-005, B-007)* Either list the required verbatim phrases explicitly in Step 4, or loosen the anchors / add the `s` flag.
- **M-7 — Task 7's append to `manifest.test.js` isn't idempotent** → crash-resume duplicates the test. *(impl-004)* Guard with "if already present, skip," or use a dedicated `readme.test.js`.
- **M-8 — Task 6 command-body granularity unspecified.** How much orchestration detail to write when the phase skills don't exist yet? Two workers could produce wildly different (both test-passing) commands. *(impl-007)* Add a sentence: write a complete end-to-end workflow with each phase as a named section (inputs/outputs/checkpoint/guardrail check at a high level); detail lives in the skills (Plans 02–04).
- **M-9 — Feedback ownership boundary drift.** Task 6 says the command "owns the closing feedback step," but the handoff assigns the feedback *artifact* (`feedback.md`) to Plan 04, and Self-Review #1 omits feedback from Task 6's coverage. *(D-004)* Clarify the command *delegates* feedback to `vendor-report` (Plan 04); Plan 01 ships no feedback artifact.

---

## 🟢 Low / Nit (selected; full lists in per-lens files)
- **`shared/.gitkeep` inconsistency** — File Structure says shared/ gets a `.gitkeep`; the `touch` command omits it; `git add shared` is then a no-op until Task 5. *(TDD-004, D-006, impl-006)* Add it or drop `shared` from Task 1's mkdir/add.
- **`validateState` doesn't check `currentPhase`** — a bogus/null value passes. *(B-005)* Add `if (!PHASES.includes(state.currentPhase)) throw`.
- **Invalid-phase handling is asymmetric** — `markPhaseComplete('bogus')` crashes; `markDownstreamStale('bogus')` silently marks *all* complete phases stale. *(B-006)* Add a `PHASES.includes(phase)` guard to both.
- **`markPhaseComplete` on the last phase** leaves `currentPhase` at `'procurement'` (semantically "done" but says otherwise). *(B-010, impl-010, TDD-009)* Consider `'done'`/`null`, or document it.
- **`markDownstreamStale` test omits the `procurement` assertion.** *(B-004)*
- **Frontmatter/command regexes assume `\n`** — break on Windows `core.autocrlf`. *(B-008)* Use `\r?\n` or add `.gitattributes` with `eol=lf`.
- **Fortune regex misses `Fortune-100`** (hyphenated). *(SF-008)* Use `/Fortune[\s-]*(100|500)/i`.
- **Task 6 Step 3 has a redundant `rm commands/.gitkeep`** (also in Step 5's commit). *(D-007, impl-012)*
- **No Node ≥18 prerequisite check.** *(impl-009)*
- **README test only checks install commands + tier-labels** — not the POV one-liner, git-clone fallback, phases, privacy note. *(TDD-010)* And `package.json`'s `scripts.test` isn't asserted. *(TDD-011)*
- **Task 5 Step 3:** flag that `source_docs/vendor_system_prompt.md` opens with "Fortune 100" — a worker doing targeted replace could miss it and land in a fail-loop. *(impl-008)*
- **Minor:** one reviewer cited a "7 test files" claim from the brief; the plan defines **6** `.test.js` files and `npm test` globs them fine — non-issue. *(B-009)*

---

## What the reviewers agreed is **solid** (keep)
- **TDD cadence for Tasks 1–6** is clean: every red step fails for the right reason (`ENOENT` / `Cannot find module`), every implementation makes its test green, commits are small and focused.
- **The produces/consumes chain holds** (with the Self-Review #3 wording exception): `slugify` contract → Task 3 caller-supplied slug → Task 6 prose-derived slug; `state` shape → Task 6; `lint()` rule names + `Violation` shape consistent across impl + all 7 tests.
- **Frozen decisions honored:** naming triple, tight `allowed-tools` (no `Bash`), `/vendor-review:vendor-evaluation` spelling, phase order, score labels, workspace path — all consistent across Global Constraints, tasks, tests, and the handoff.
- **The do-not-over-fire fixture genuinely passes** (traced by multiple reviewers): "purchase decision remains yours," "poses extreme risk," "sentiment: negative," and the scorecard labels hit no pattern; the clean fixture's "SOC 2 … sub-processor" sits within the 220-char window so `false-certainty` correctly does *not* fire.
- **State.js core semantics are correct**: mutate-and-return, stale-marking only affects `complete` phases, `CERTAINTY_MARKER.lastIndex` reset prevents cross-call leakage.
- **Forward references to not-yet-built skills are correctly intentional** and test-gated (string presence, not runtime validity).
- **The Global Constraints block is praised as a design choice** — centralizes frozen decisions so the worker doesn't re-derive them.

---

## Recommended fix order
1. **Guardrail lint cluster (H-1, H-2, H-3)** — this is the §0 rule's enforcement and the most-reported issue. Expand patterns + globalize the loop + completeness tests; split dev-lint vs runtime-checklist; make the spine↔lint parity testable. Do this before any Plan-02 dossier work depends on `lint()`.
2. **State schema forward-compat (H-4)** — land the revisions/sourceHashes fields now so Plan 03 doesn't mutate a frozen schema.
3. **Acceptance + Task-7 TDD (H-5, H-6)** — reorder Task 7 for a real red step; add the explicit manual smoke checks.
4. **Task 1 stall fallback (H-7)** — one sentence.
5. **Medium sweep** (M-1…M-9), then the Low/Nit batch.

## Highest-leverage open questions for Adam
1. **Runtime lint posture (H-2):** is §12.5's "lint blocks checkpoint advancement" meant to be an *executable* check at runtime, or a model-applied checklist under the no-`Bash` public-plugin posture? (Determines whether Task 6 needs an allowed-tools-compatible design or just the shared-spine checklist.)
2. **Lint scope for Plan 01 (H-1):** should Plan 01 ship the *full* §12.5 pattern list now, or an explicitly-labeled minimal subset that Plans 03/04 extend? (Currently it's a subset that *claims* to be complete.)
3. **State schema (H-4):** freeze the loop-cap + source-hash fields in Plan 01, or accept a schema migration in Plan 03?
4. **Task 6 command granularity (M-8):** how detailed should the orchestrator body be when phase skills don't exist yet — high-level flow, or enough to guide Plan 02's skill author?

Per-lens files (`plan01-A…E-*.md`) carry the full evidence with task/step citations.
