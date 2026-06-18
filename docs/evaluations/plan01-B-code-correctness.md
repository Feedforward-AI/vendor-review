# Code & Test Correctness Review — Plan 01 (Foundation)
**Model:** Claude (claude-sonnet-4-20250514)

## Summary
The plan ships well-structured, zero-dependency Node.js tooling with real TDD tests. The guardrail lint correctly distinguishes the clean-opinionated fixture from the violations fixture, and all stated tests would pass after their implementation steps. The primary substantive bug is in the RECOMMENDATION regex loop: each pattern is executed only once via `.exec()`, so only the first occurrence per pattern is caught. The tests mask this because they only assert presence, not completeness. A secondary risk is the slug accent-stripping regex using literal combining characters that may not survive copy-paste intact. The state.js, manifest, and command implementations are sound. All §12 spec decisions are honored.

## Findings

- **ID:** B-001
- **Severity:** Medium
- **Task(s)/Step(s):** Task 4 Step 4 (guardrail-lint.js implementation)
- **Issue:** The RECOMMENDATION loop iterates each regex pattern once with `re.exec(text)`, which returns only the first match per pattern. If the same violation pattern appears multiple times in the text, subsequent occurrences are silently missed. For example, `"We recommend X. We recommend Y."` would flag only the first "We recommend." The violations fixture happens to trigger three *different* patterns (`Overall: Recommended`, `We recommend`, `don't buy`), so all three are caught — but if it contained, say, two different `"we recommend"` phrases, only the first would be reported.
- **Why it matters:** The lint is the load-bearing product rule (§12.5). Missing occurrences of the same pattern reduces its effectiveness at checkpoint time. The tests pass because they only assert `rules().includes('recommendation')` — presence, not completeness.
- **Suggested fix:** Add the `g` flag to each RECOMMENDATION regex and use a `while` loop (like the certainty-marker loop) to collect all matches per pattern. Alternatively, `String.prototype.matchAll()` on the combined alternation. Minimal change to the for-loop body:

  ```js
  for (const re of RECOMMENDATION) {
    let m;
    while ((m = re.exec(text)) !== null) {
      out.push({ rule: 'recommendation', match: m[0], index: m.index });
    }
  }
  ```
  (Requires adding the `g` flag to each regex in the RECOMMENDATION array.)

---

- **ID:** B-002
- **Severity:** Medium
- **Task(s)/Step(s):** Task 2 Step 3 (slug.js implementation)
- **Issue:** The accent-stripping regex is written as `replace(/[̀-ͯ]/g, '')` using literal Unicode combining-diacritical-mark glyphs (U+0300 COMBINING GRAVE ACCENT and U+036F COMBINING LATIN SMALL LETTER X). These are zero-width combining marks. In a rendered markdown document, they may combine with surrounding characters or be normalized/corrupted when copied into a `.js` file. If the encoding doesn't survive the copy-paste trip intact, the regex character class range silently breaks, and accents (including the `é` in "Légora") would not be stripped — causing `slugify('Légora')` to produce `'l-gora'` or `'légora'` instead of `'legora'`.
- **Why it matters:** The slug is used as the workspace directory name everywhere downstream (`./vendor-evaluations/<vendor-slug>/`). An accent surviving in the slug creates directory names with Unicode characters, which could cause path-resolution issues in some environments. The test `slugify('  Légora  ')` expects `'legora'` and would fail if the accent isn't stripped.
- **Suggested fix:** Use explicit Unicode escape sequences: `replace(/[\u0300-\u036f]/g, '')`. This is copy-paste-safe and unambiguous regardless of editor encoding. The logic (NFKD decomposition of `é` → `e` + `\u0301`, which falls in `\u0300–\u036f`) is correct; only the literal encoding in the source file is at risk.

---

- **ID:** B-003
- **Severity:** Low
- **Task(s)/Step(s):** Task 4 Step 4 — NAMED_ARTIFACT regex
- **Issue:** The `NAMED_ARTIFACT` regex pattern includes `report` as an alternative: `/\b(SOC ?2|ISO ?27001|...|report|...)\b/i`. The word "report" is very broad. A future text like `"Insufficient Information on pricing. We'll need a report."` would trigger a false negative — the word "report" appears within 220 characters, so the false-certainty rule would not fire, even though "a report" is not a specific named artifact. For the current fixtures, this is harmless (the clean fixture names "SOC 2 Type II report" which is genuinely specific). But the broad match creates a loophole.
- **Why it matters:** The false-certainty rule (§12.5) is meant to require a **named specific artifact**. "Report" alone is not specific. In Plan 04 (golden-fixture tests), this could cause misses on generated artifacts that mention "report" generically.
- **Suggested fix:** Either remove `report` from `NAMED_ARTIFACT` (relying on the other artifact names like `SOC 2`, `ISO 27001`, `certificat\w+`, etc.), or qualify it to `(?:SOC 2|audit|assessment)\s+report`.

---

- **ID:** B-004
- **Severity:** Low
- **Task(s)/Step(s):** Task 3 Step 1 — `markDownstreamStale` test assertions
- **Issue:** The test `markDownstreamStale marks only phases after the given one` asserts on four phases (intake, research, capacity, report) but omits the `procurement` phase. The loop `for (const p of PHASES) ... markPhaseComplete` marks all five phases complete, then `markDownstreamStale(s, 'research', T)` should mark capacity, procurement, and report stale. The test verifies only three of those four downstream phases. The implementation is correct; the test coverage has a gap.
- **Why it matters:** If a future change to `markDownstreamStale` accidentally skips the procurement phase, this test would not catch it because procurement is never asserted.
- **Suggested fix:** Add `assert.equal(s.phases.procurement.status, 'stale');` to the test block (between the capacity and report assertions).

---

- **ID:** B-005
- **Severity:** Low
- **Task(s)/Step(s):** Task 3 Step 3 — `validateState` implementation
- **Issue:** `validateState()` checks the `schema` string and each phase's `status`, but does not validate the `currentPhase` field. A corrupted state object with `currentPhase: 'bogus'` or `currentPhase: null` would pass validation silently.
- **Why it matters:** Downstream code (e.g., the command orchestrator in Task 6) relies on `currentPhase` to determine where to resume. An invalid value could cause the orchestrator to skip phases or behave unexpectedly with no validation error.
- **Suggested fix:** Add to `validateState`: `if (!PHASES.includes(state.currentPhase)) throw new Error('bad currentPhase');`

---

- **ID:** B-006
- **Severity:** Low
- **Task(s)/Step(s):** Task 3 Step 3 — `markPhaseComplete` / `markDownstreamStale` edge cases
- **Issue:** `markPhaseComplete` called with an invalid phase name accesses `state.phases[bogus]` which is `undefined`, causing a TypeError crash (not a graceful error). `markDownstreamStale` called with an invalid phase name causes `PHASES.indexOf(bogus)` to return `-1`, making `start = 0`, which silently marks ALL complete phases stale — incorrect behavior with no error. Neither case is tested, and the plan does not specify error handling for invalid phase names.
- **Why it matters:** In practice, phase names come from the controlled `PHASES` array, so invalid names are unlikely. But the asymmetry (one crashes, one silently corrupts) is a robustness concern for future maintenance.
- **Suggested fix:** Add a guard at the top of both functions: `if (!PHASES.includes(phase)) throw new Error('unknown phase: ' + phase);`

---

- **ID:** B-007
- **Severity:** Low
- **Task(s)/Step(s):** Task 5 Step 1 — shared-spine.test.js regex anchors
- **Issue:** The test regex `/never.*buy\/don['\u2019]?t-buy/i` uses `.*` which, without the `s` (dotAll) flag, does not match newline characters. If the prose in `voice-and-guardrails.md` wraps the key phrase across lines (e.g., "never produce a\nbuy/don't-buy verdict"), the test assertion would fail even though the content is semantically present.
- **Why it matters:** The prose author (agentic worker) must ensure the phrase appears on a single line to satisfy the test. This is a test-authoring constraint, not a bug per se, but could cause a false test failure during Task 5 Step 5 iteration.
- **Suggested fix:** Either add the `s` flag (`/never.*buy\/don['\u2019]?t-buy/is`) or use `[\s\S]*` instead of `.*`. Alternatively, document in the prose-authoring instructions that key phrases must not wrap across lines.

---

- **ID:** B-008
- **Severity:** Low
- **Task(s)/Step(s):** Task 6 Step 1 — command frontmatter regex
- **Issue:** The frontmatter regex `/^---\n([\s\S]*?)\n---/` uses `\n` exclusively and assumes Unix line endings. On Windows, `fs.readFileSync` may return `\r\n` line endings (depending on git `core.autocrlf` settings). In that case, the regex would fail to match, and `fm` would be `null`, causing the test to fail its first assertion (`assert.ok(fm, 'has YAML frontmatter')`).
- **Why it matters:** If the repo is cloned on Windows with `core.autocrlf` enabled, or if the file is created with Windows line endings, `npm test` would fail on the command test. This is a portability concern.
- **Suggested fix:** Use `\r?\n` for newlines: `/^---\r?\n([\s\S]*?)\r?\n---/`. Or add a `.gitattributes` file with `* text=auto eol=lf` to enforce Unix line endings in the repo.

---

- **ID:** B-009
- **Severity:** Nit
- **Task(s)/Step(s):** Cross-task — test file count
- **Issue:** The evaluator brief refers to "all 7 test files," but the plan's File Structure and task breakdown define exactly **6** `.test.js` files: `manifest.test.js`, `slug.test.js`, `state.test.js`, `guardrail-lint.test.js`, `shared-spine.test.js`, `command.test.js`. The `package.json` `test` script runs `node --test tooling/test/`, which recursively finds all `*.test.js` files. All 6 would be discovered and executed correctly.
- **Why it matters:** No functional impact; `npm test` would run all tests. The count mismatch is cosmetic but could confuse a worker tracking completion.
- **Suggested fix:** Either update the brief to say "6 test files" or confirm whether a 7th test file was intended but omitted from the plan.

---

- **ID:** B-010
- **Severity:** Nit
- **Task(s)/Step(s):** Task 3 Step 3 — `markPhaseComplete` on last phase
- **Issue:** When `markPhaseComplete(state, 'report', ...)` is called (the last phase), `PHASES.indexOf('report')` returns 4, `next = PHASES[5]` is `undefined`, so `currentPhase` is not advanced. If all phases are marked complete in order, `currentPhase` ends at `'report'` (set by the procurement→report advance). But if `'report'` is completed first (out of order), `currentPhase` stays at `'intake'` — a misleading state. No test covers this edge case.
- **Why it matters:** Minor — phases should be completed in order, and the orchestrator enforces this. The edge case is unlikely in practice.
- **Suggested fix:** Optionally set `state.currentPhase = null` or `'complete'` when the last phase is marked complete, to signal "all done." Or document that `currentPhase` on the last phase means "the last completed phase."

---

## Strengths (brief)
- The guardrail-lint clean/violations fixture distinction is precise and well-tested. The clean fixture genuinely passes all regex checks: `"purchase decision"` doesn't match `purchase\s+(this|it)`, and `"SOC 2 Type II report"` correctly satisfies the named-artifact window check. ✓
- State.js mutate-and-return semantics are consistent; `PHASES` index arithmetic is correct for all in-order operations. The stale-marking only affects `'complete'` phases, leaving pending ones untouched. ✓
- The RECOMMENDATION patterns use `\b` boundaries and required following words (`\s+(?:this|it)`, `\s+(?:buy|purchase|...)`) to avoid bare-word collisions with allowed copy like "buyer," "buying," or "purchase decision." ✓
- The `CERTAINTY_MARKER` regex correctly resets `lastIndex = 0` before the while loop, preventing state leakage across `lint()` calls. ✓
- All "expected fail reasons" in each task's Step 2/3 are accurate: `ENOENT` for missing files, `Cannot find module` for unimplemented modules. ✓
- The NFKD + U+0300–U+036F range logic for accent stripping is algorithmically correct; `'é'` decomposes to `'e' + U+0301`, and U+0301 falls within the range. ✓

## Open questions for the human
1. **Is first-match-only per RECOMMENDATION pattern acceptable?** (B-001) The current loop catches only one occurrence per regex. If a generated artifact contains, say, three different "we recommend" sentences, only the first is flagged. Is this sufficient for a checkpoint-blocking lint, or should the loop collect all matches?
2. **Should the slug regex use `\u` escapes?** (B-002) The plan writes the literal combining characters. If the worker's editor normalizes them, the regex silently breaks. Would you prefer the plan to specify `\u0300-\u036f` escapes explicitly?
3. **Should `NAMED_ARTIFACT` drop the bare `report` alternative?** (B-003) "Report" is very broad and could create a false-certainty loophole in generated artifacts. The test fixtures are constructed around this, but Plan 04 might hit it.
4. **Line-ending policy for the repo?** (B-008) The command frontmatter regex and other tests assume `\n` line endings. Should the plan add a `.gitattributes` with `eol=lf`, or should the regexes be made `\r?\n`-tolerant?
