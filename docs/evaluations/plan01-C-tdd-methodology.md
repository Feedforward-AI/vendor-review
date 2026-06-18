# TDD Methodology + Acceptance Alignment Review — Plan 01 (Foundation)
**Model:** Claude (Anthropic)

## Summary
Plan 01 is structurally sound as a red-green-commit loop for Tasks 1–6: each task writes a failing test first, the failure reason matches reality, and the implementation is committed cleanly. The biggest weaknesses are in Task 7, where the README test is written *after* the implementation, breaking TDD; in the guardrail lint, where the implementation is narrower than the spec/implementation-brief requires; and in two Plan-01 acceptance items (`plugin installs`, `command scaffolds workspace + state.json`) that have no automated test and are not explicitly acknowledged as manual/runtime checks.

## Findings

- **ID:** TDD-001
  - **Severity:** High
  - **Task(s)/Step(s):** Task 7 Steps 1–4
  - **Issue:** The TDD loop is broken for README validation. Step 1 writes `package.json`, Step 2 writes `README.md`, and only Step 3 appends the failing-test to `tooling/test/manifest.test.js`. There is no red step: the README already exists with the required install strings before the test is written, so the test will pass on first run.
  - **Why it matters:** A worker following the plan literally will not observe a failing test for README content. This defeats the purpose of using the test to drive README completeness and makes the test a post-hoc checklist rather than a design constraint.
  - **Suggested fix:** Reorder Task 7: Step 1 append the README test to `manifest.test.js`, Step 2 run `npm test` and confirm the new test fails, Step 3 write `README.md` and `package.json`, Step 4 run until green.

- **ID:** TDD-002
  - **Severity:** High
  - **Task(s)/Step(s):** Task 4 Step 4 (implementation)
  - **Issue:** The guardrail-lint regexes are narrower than the rule defined in `docs/evaluations/IMPLEMENTATION-BRIEF.md` §2 and the spec §12.5. The implementation does **not** flag: standalone `verdict` (only `verdict: buy/pass/skip`), `overall grade`, `score: A/B/C`, `I recommend ...`, `recommend buying`, `don't purchase`, or other literal recommendation variants.
  - **Why it matters:** The central product rule is "never the literal buy/don't-buy sentence." A lint that misses common phrasings will let violations through, undermining the guardrail the whole pack depends on. The spec explicitly lists these patterns as required catches.
  - **Suggested fix:** Expand `RECOMMENDATION` to cover `\brecommend\b` (any subject), `\bverdict\b`, `\boverall grade\b`, `\bscore:\s*[A-D][+-]?\b`, and `don't\s+(?:buy|purchase)`; add corresponding tests.

- **ID:** TDD-003
  - **Severity:** High
  - **Task(s)/Step(s):** Cross-task / Plan-01 acceptance
  - **Issue:** The handoff doc lists four Plan-01 acceptance checks. Two of them have **no automated test** in the plan: "The plugin installs (`/plugin marketplace add feedforward/vendor-review` + install ...)" and "Running `/vendor-review:vendor-evaluation` confirms a vendor, creates `./vendor-evaluations/<slug>/`, and writes a valid `state.json`." The plan's Self-Review claims these areas are covered by Tasks 1 and 6, but the tests only assert static manifest/command content, not installation or runtime scaffolding.
  - **Why it matters:** Without explicit acknowledgment, a worker may treat `npm test` green as full acceptance. The runtime acceptance gap is real and must be covered by manual/smoke testing or an explicit note.
  - **Suggested fix:** Add a Task-7 step that documents the two runtime acceptance checks as manual verification steps, or add a dry-run smoke test that invokes the command file parsing logic (if feasible with `node --test`).

- **ID:** TDD-004
  - **Severity:** Medium
  - **Task(s)/Step(s):** Task 1 Step 4 and File Structure block
  - **Issue:** The File Structure block says shared/ is created with a `.gitkeep`, but the actual command in Step 4 is `touch commands/.gitkeep skills/.gitkeep agents/.gitkeep` — `shared/.gitkeep` is missing. The directory is created by `mkdir -p` but not tracked until Task 5 adds real files.
  - **Why it matters:** Inconsistent `.gitkeep` lifecycle. If Task 5 is deferred or the worker forgets, `shared/` is an untracked empty directory between Task 1 and Task 5.
  - **Suggested fix:** Either add `shared/.gitkeep` to the touch command or remove the claim that shared/ gets a `.gitkeep` in Task 1. If added, remove it in Task 5 when real files land.

- **ID:** TDD-005
  - **Severity:** Medium
  - **Task(s)/Step(s):** Task 1 Step 1
  - **Issue:** The manifest-schema verification step defers to Context7/WebFetch and says: "If the platform requires fields beyond those below, add them and update the test." This is vague about *which* fields are required and how to detect a schema mismatch.
  - **Why it matters:** A worker could get stuck comparing live docs to the plan's sample JSON, or over/under-specify `plugin.json`. The fallback is judgment-based, not a concrete decision rule.
  - **Suggested fix:** Add a concrete fallback: "If the live docs require additional top-level fields, add them to `plugin.json` and add an assertion for each to the test; do not remove any of the fields already listed unless the docs explicitly deprecate them."

- **ID:** TDD-006
  - **Severity:** Medium
  - **Task(s)/Step(s):** Task 5 Step 1 / Step 4
  - **Issue:** Task 5's interfaces state that `voice-and-guardrails.md` "must match the lint so runtime behavior == dev lint." However, the test only checks a list of prose anchors; it does **not** verify that the banned patterns listed in the "Runtime guardrail check" subsection correspond to the regexes in `tooling/guardrail-lint.js`.
  - **Why it matters:** The two artifacts can drift. A worker could write a voice file that passes the anchor test while listing banned patterns that differ from the lint, weakening the contract between shared spine and dev tooling.
  - **Suggested fix:** Add a test that reads the "Runtime guardrail check" section and asserts that every banned pattern is represented in the lint's `RECOMMENDATION`/`TIER`/certainty regexes (or vice-versa), or at least that the rule names align.

- **ID:** TDD-007
  - **Severity:** Medium
  - **Task(s)/Step(s):** Task 6 Step 1 / Step 3
  - **Issue:** `command.test.js` only performs static string checks (frontmatter allowed-tools, skill names, workspace path placeholder, `state.json`, `${CLAUDE_PLUGIN_ROOT}`). It does not test that the command body actually orchestrates the phases, scaffolds the workspace, writes `state.json`, supports resume, or runs guardrail checks at checkpoints.
  - **Why it matters:** A markdown command can pass the test while being incoherent or incomplete at runtime. This directly relates to the acceptance item "command scaffolds workspace + state.json" being untested.
  - **Suggested fix:** At minimum, add structural assertions for required sections (e.g., "checkpoint", "guardrail check", "resume from state.json", "privacy-first feedback"). Acknowledge full runtime verification as manual.

- **ID:** TDD-008
  - **Severity:** Low
  - **Task(s)/Step(s):** Task 4 Step 4
  - **Issue:** The `NAMED_ARTIFACT` regex includes very broad terms such as `report` and `certificat\w+`. This can cause false-negatives: an `Insufficient Information` sentence followed by a vague phrase like "see their annual report" may be treated as naming a specific artifact even though it is not specific enough per the no-false-certainty rule.
  - **Why it matters:** The lint may miss violations where the worker names a generic artifact to bypass the rule.
  - **Suggested fix:** Tighten `NAMED_ARTIFACT` to require specificity (e.g., `SOC 2 Type II report`, `ISO 27001 certificate`, `current sub-processor list`) or add a negative list of vague qualifiers.

- **ID:** TDD-009
  - **Severity:** Low
  - **Task(s)/Step(s):** Task 3 Step 3
  - **Issue:** `markPhaseComplete` always advances `currentPhase` to the phase after the one being marked, even if that phase is not the current phase. For example, marking `procurement` complete while `currentPhase` is `intake` would set `currentPhase` to `report`.
  - **Why it matters:** This is an edge case not covered by tests. It could produce a misleading run-manifest if a worker calls the function out of order.
  - **Suggested fix:** Either advance `currentPhase` only when `phase === state.currentPhase`, or add a test documenting the intended out-of-order behavior.

- **ID:** TDD-010
  - **Severity:** Low
  - **Task(s)/Step(s):** Task 7 Step 3
  - **Issue:** The README test only verifies the install commands and the absence of tier labels. It does not verify the other required sections listed in Step 2: POV one-liner, git-clone fallback, how to run, the five phases, what you get, or the privacy note.
  - **Why it matters:** A worker could write a minimal README that passes the test but omits important user-facing content.
  - **Suggested fix:** Add assertions for each required section, or at minimum for the install fallback and the privacy note.

- **ID:** TDD-011
  - **Severity:** Low
  - **Task(s)/Step(s):** Task 7 Step 1
  - **Issue:** `package.json` is created without any test verifying its existence, its `"test"` script, or that `npm test` actually invokes `node --test tooling/test/`.
  - **Why it matters:** If the worker mistypes the script, the final acceptance check (`npm test` green) might run the wrong command or fail silently.
  - **Suggested fix:** Add a test in `tooling/test/manifest.test.js` that reads `package.json` and asserts `scripts.test === 'node --test tooling/test/'`.

- **ID:** TDD-012
  - **Severity:** Nit
  - **Task(s)/Step(s):** Task 4 Step 4
  - **Issue:** `CERTAINTY_MARKER.lastIndex = 0` is set manually before the `while` loop, but the regex is freshly declared and has not been executed yet.
  - **Why it matters:** Harmless defensive code, but unnecessary and slightly confusing.
  - **Suggested fix:** Remove the explicit `lastIndex = 0` line.

## Strengths (brief)
- Red steps are present and correctly reasoned for Tasks 1–6: each failing-test step produces the expected `ENOENT` or `Cannot find module` error.
- Test files are committed alongside their implementations, keeping commits small and focused.
- The guardrail lint includes a strong do-not-over-fire test via the `clean-opinionated.md` fixture, which is the right way to prevent over-zealous suppression of opinionated language.
- The state-machine tests cover the core stale-marking semantics required by spec §12.1.
- Task 2's slug tests are behavioral and cover idempotence, accents, and edge punctuation.
- Commit boundaries avoid leaking later-task files into earlier commits (apart from the minor `shared/.gitkeep` inconsistency).

## Open questions for the human
1. Should Plan 01 include a lightweight smoke test that parses or dry-runs the command scaffolding logic, or are plugin-install and workspace-scaffolding acceptance checks intentionally manual/runtime-only?
2. Is the narrower lint implementation in Task 4 intentional as a minimal Plan-01 subset, or should it fully implement the pattern list in `IMPLEMENTATION-BRIEF.md` §2 before Plan 01 is accepted?
3. Should the manifest test verify additional `plugin.json` fields that the live Claude Code docs may require (e.g., an explicit `commands` array or `entrypoint`), or is convention-based discovery the final decision?
