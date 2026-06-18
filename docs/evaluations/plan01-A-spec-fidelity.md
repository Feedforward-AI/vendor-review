# Spec Fidelity / Traceability Review — Plan 01 (Foundation)
**Model:** OpenAI ChatGPT (model id not exposed in session)

## Summary
Plan 01 is broadly aligned with the frozen naming, no-`Bash` posture, slug rule, command-as-orchestrator direction, and the §0 do-not-over-soften rule. The main fidelity risks are in the parts Plan 01 itself claims to settle: the manifest shape, `state.json` schema, and guardrail lint do not fully trace to spec §12.1/§12.5, and the final acceptance checks do not prove the handoff’s install/run requirements.

## Findings

- **ID:** SF-001
- **Severity:** High
- **Task(s)/Step(s):** Task 1 Step 1/4; Self-Review §1
- **Issue:** The plan softens a frozen manifest requirement. Spec §12.1 says `plugin.json` includes “the command, skills, and agents” (spec lines 480–482), but Task 1’s proposed `plugin.json` contains only `name`, `version`, `description`, `author`, `homepage`, and `license` (plan lines 117–126). Task 1 Step 1 also says “Components in `commands/`, `skills/`, `agents/` are auto-discovered by convention; do not hand-list them unless the docs require it” (plan line 77), which makes live docs override a §12 frozen decision.
- **Why it matters:** The plan can pass its manifest tests while silently dropping component declarations that §12.1 explicitly froze. If Claude Code’s current schema requires component metadata, the plugin may not expose the command/skills/agents even though Plan 01 is marked installable.
- **Suggested fix:** Keep the live-schema verification, but make it traceable to §12.1: either add the schema-correct command/skills/agents declarations and tests, or require Task 1 to document that the live schema auto-discovers them and update the manifest test to assert the schema’s actual component-discovery contract.

- **ID:** SF-002
- **Severity:** High
- **Task(s)/Step(s):** Task 3 Step 1/3
- **Issue:** The `state.json` model does not support the frozen Phase 3→2 back-edge loop cap or source-artifact hashes. Spec §12.1 requires a run-manifest with “source-artifact hashes” and a back-edge with “Loop cap: 2 rounds” (spec lines 472–477). Plan 01’s state shape is only `{ schema, vendor, slug, currentPhase, phases: { status, artifactHash, updatedAt } }` (plan lines 235–240), and the implementation exposes no back-edge counter/max or dependency/source-hash field (plan lines 296–331).
- **Why it matters:** Plan 03 can add the back-edge behavior, but without schema support from Plan 01 it must either mutate the frozen state schema ad hoc or track loop count somewhere else. That undermines resumability and the “artifact existence is not the phase signal” decision.
- **Suggested fix:** Extend Task 3 now with explicit state fields such as `backEdges: { capacityToResearch: { roundsUsed: 0, maxRounds: 2 } }` and `sourceHashes`/`dependencyHashes` per phase, plus validation tests. The actual re-research behavior can remain deferred to Plan 03.

- **ID:** SF-003
- **Severity:** High
- **Task(s)/Step(s):** Task 4; Task 6 Step 3; Global Constraints
- **Issue:** The plan claims a runtime guardrail check but implements only a dev-time Node lint. Plan 01 states dev tooling is “NOT shipped behavior” (plan line 24), while Task 6 requires each phase to end with “a guardrail check before advancing” (plan line 622). Spec §12.5 requires the lint to run after every phase and block checkpoint advancement (spec lines 551–552), but the shipped command has no `Bash` and no described allowed-tools-compatible way to execute `tooling/guardrail-lint.js`.
- **Why it matters:** A worker can implement the Node lint and the markdown command exactly as written, yet runtime phase outputs will not actually be linted by that code. The §12.5 checkpoint-blocking guarantee becomes an ambiguous prose instruction rather than an enforceable mechanism.
- **Suggested fix:** Make the runtime path explicit. If executable lint cannot run under the no-`Bash` posture, Task 6 should require the command to apply the `shared/voice-and-guardrails.md` “Runtime guardrail check” as a model checklist with the same rule list, while Task 4 remains CI/dev lint. If §12.5 truly requires executable lint at runtime, the plan needs an allowed-tools-compatible invocation design.

- **ID:** SF-004
- **Severity:** High
- **Task(s)/Step(s):** Task 4 Step 2/4; Self-Review §1
- **Issue:** The guardrail lint drops several frozen §12.5 checks. Spec §12.5 and IMPLEMENTATION-BRIEF §2 require catching `verdict`, `overall grade`, `score: A/B/C`, tier labels, and uncited claims, plus fail-loudly completeness across report gaps (spec lines 544–550; implementation brief lines 79–86). Task 4’s interface narrows rules to `recommendation`, `tier-label`, and `false-certainty` (plan lines 356–358), and the regex list lacks bare/structural `verdict`, `overall grade`, `score: A/B/C`, uncited-claim, and cross-artifact completeness checks (plan lines 438–448).
- **Why it matters:** The Self-Review claims “Guardrail lint incl. §0 rule, false-certainty, do-not-over-fire (§2, §12.5)” (plan line 703), but the implementation is only a subset. Later plans may rely on this lint as complete and miss forbidden verdict/grade language.
- **Suggested fix:** Add explicit tests and rules for `verdict` misuse, `overall grade`, `score: A/B/C`, and scoped uncited-claim detection. For fail-loudly completeness, either add a cross-artifact API stub now or clearly mark that specific §12.5 sub-rule as Plan 04-owned rather than claiming full §12.5 coverage.

- **ID:** SF-005
- **Severity:** Medium
- **Task(s)/Step(s):** Task 4 Step 4
- **Issue:** The recommendation regexes are narrower than the frozen lexical rule without documenting the intended exceptions. The governing brief bans literal strings such as “buy this,” “we recommend purchasing,” “you should move forward with,” and “pass on this” (implementation brief lines 29–32), while §12.5 says catch literal `buy`, `purchase`, and `recommend` strings but do not over-fire on the allowed “purchase decision remains yours” example (spec lines 544–554). Plan 01 catches only selected forms like `buy this|it`, `purchase this|it`, `we recommend`, and `you should ...` (plan lines 438–444), so phrases such as “buy Acme,” “purchase the product,” “our recommendation is to proceed,” or “pass on this” can slip through.
- **Why it matters:** This imports an over-softened rule: it avoids false positives, but at the cost of missing literal purchase/recommendation sentences that §0 says are out of bounds.
- **Suggested fix:** Add tests for the brief’s concrete banned examples and common variants, while preserving tests for “buyer,” “buying,” and “purchase decision remains yours.” Prefer phrase-level verdict patterns with explicit allowlisted contexts over bare-word matching.

- **ID:** SF-006
- **Severity:** Medium
- **Task(s)/Step(s):** Task 5 Step 1/4; Global Constraints
- **Issue:** The two distinct status vocabularies are noted in the plan’s Global Constraints (plan line 25) but not carried into the shared spine requirements or tests. Task 5’s `philosophy.md` test asserts only the capacity scale `Met / Partially Met / Not Met / Insufficient Information` (plan lines 508–514), and Step 4’s `voice-and-guardrails.md` requirements do not mention the procurement vocabulary `Available / Partial / Absent / Insufficient` (plan line 549). Spec §12.3 says the two vocabularies are deliberate and should be documented once (spec lines 517–519).
- **Why it matters:** Plan 01 creates the shared single source of truth. If procurement labels are not documented there, Plan 03 may collapse or rename them despite the frozen decision.
- **Suggested fix:** Add a “Status vocabularies” subsection to `shared/voice-and-guardrails.md` or `shared/philosophy.md`, and add a test that asserts both capacity and procurement vocabularies appear with their distinct meanings.

- **ID:** SF-007
- **Severity:** Medium
- **Task(s)/Step(s):** Task 7 Step 4; cross-task acceptance
- **Issue:** Plan 01 does not include the handoff’s full Plan 01 acceptance check. The handoff requires: `npm test` green, plugin installs, running `/vendor-review:vendor-evaluation` confirms a vendor, creates `./vendor-evaluations/<slug>/`, and writes valid `state.json` (handoff lines 138–145). Plan 01’s final suite is only `npm test` (plan lines 682–685), and the command test only checks that the markdown mentions phase skills, workspace path, `state.json`, and `${CLAUDE_PLUGIN_ROOT}` (plan lines 597–605).
- **Why it matters:** A worker can finish Plan 01 green without proving the plugin installs or that the orchestrator can scaffold the workspace/state manifest, which are explicit handoff acceptance criteria.
- **Suggested fix:** Add a final manual or automated acceptance step after `npm test`: install the plugin locally or through the marketplace path, run `/vendor-review:vendor-evaluation` against a test vendor, verify `./vendor-evaluations/<slug>/state.json`, validate it with `validateState`, then clean up any generated test workspace.

- **ID:** SF-008
- **Severity:** Low
- **Task(s)/Step(s):** Task 4 Step 4; Task 5 Step 1; Task 7 Step 3
- **Issue:** The no-tier-label checks catch `Fortune 100/500` with whitespace but miss hyphenated forms. The plan’s global constraint bans “Fortune 100,” “Fortune 500,” “or similar” (plan line 19), and the review prompt specifically calls out Fortune-100 removal. The test/lint regexes use `Fortune\s*(100|500)` or equivalent (plan lines 98, 446, 512, 678), which does not match `Fortune-100`.
- **Why it matters:** This is a small traceability gap in the frozen carry-forward hygiene rule: a stale tier label can survive with punctuation.
- **Suggested fix:** Use a shared pattern such as `/Fortune[\s-]*(100|500)/i` in manifest, shared-spine, README, and lint tests. Consider adding one fixture with `Fortune-100`.

## Strengths (brief)
- The naming triple is consistently stated and tested for plugin/marketplace names (`vendor-review`, `feedforward`) in Task 1 and README install commands.
- The runtime `allowed-tools` frontmatter for the command is tight and explicitly excludes `Bash` (plan lines 587–594, 615–620).
- The §0 “do not over-fire” posture is preserved with a clean fixture that includes `sentiment`, blunt risk language, scorecard labels, and “purchase decision remains yours” (plan lines 362–372).
- The slug rule is well traced: `slugify` lowercases/hyphenates/strips accents, and the command must confirm `<vendor-slug>` with the exec (plan lines 166–209, 622).
- The carry-forward instructions for `philosophy.md` include the required verbatim phrases, score-label rename, tier-label replacement, central question, and foundational points (plan lines 538–545).

## Open questions for the human
1. Should the Plan 01 `state.json` schema be frozen now with back-edge loop metadata, or is a schema migration in Plan 03 acceptable?
2. Does the current Claude Code plugin schema truly auto-discover commands/skills/agents, or should `plugin.json` explicitly enumerate them as spec §12.1 says?
3. Is runtime guardrail enforcement intended to be executable lint, or a model-applied checklist under the no-`Bash` public-plugin posture?
