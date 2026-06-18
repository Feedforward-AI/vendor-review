# Implementability / Agentic-Worker Clarity Review — Plan 01 (Foundation)
**Model:** anthropic/claude-sonnet-4-20250514

## Summary
The plan is well-structured and largely implementable as written — each task has clear TDD cadence, concrete shell commands, and a produces/consumes chain that holds together. However, there are several **stall points** where a worker would get stuck or produce a test-failing result: Task 1 Step 1's schema-verification has no fallback path; Task 5 Step 4's prose-authoring instructions leave several regex-anchor phrases to chance (a worker could easily paraphrase and fail the test for non-obvious reasons); and Task 7 Step 3's append operation is not idempotent, so a crash-and-resume would produce a duplicate test. The shell commands are copy-paste runnable in the happy path, and the forward references to not-yet-built skills in Task 6 are clearly intentional and test-gated.

## Findings

- **ID:** impl-001
- **Severity:** High
- **Task(s)/Step(s):** Task 1 Step 1
- **Issue:** The step instructs the worker to "verify field names against the live plugin docs" via Context7 or WebFetch, and says "If the platform requires fields beyond those below, add them and update the test." There is no fallback if (a) the MCP tool or WebFetch is unavailable in the worker's session, (b) the docs are unreachable, or (c) the docs are ambiguous about which fields are required vs optional. The instruction "add them and update the test" also provides no decision procedure — the worker doesn't know whether to add every field mentioned in the docs, only the required ones, or only the ones the test already checks. A worker following this literally could stall, or worse, add fields that break the provided JSON structure.
- **Why it matters:** Task 1 is the very first step. A stall here blocks the entire plan. A worker that skips the step silently produces manifests that may not match the live schema, and the test wouldn't catch missing required fields.
- **Suggested fix:** Add a concrete fallback: "If Context7/WebFetch is unavailable or the docs don't clearly list required fields, proceed with the JSON as provided — the test is the source of truth for Plan 01." Additionally, clarify: "Only add fields the docs explicitly mark as required; do not add optional/recommended fields."

---

- **ID:** impl-002
- **Severity:** High
- **Task(s)/Step(s):** Task 5 Step 4
- **Issue:** The `shared-spine.test.js` test for `voice-and-guardrails.md` uses several regex anchors that require **exact substrings on a single line** (because `.` doesn't match `\n` in JS). Two of these are at serious risk of a worker paraphrasing them out of existence:
  - `/never.*buy\/don['']?t-buy/i` — requires "never" and "buy/don't-buy" on the **same line**. Step 4 says to include "the §0 rule with both examples" and lists negative examples like '❌ "…so don't buy it"'. A worker could reasonably write "Do not use buy/don't-buy language" (no "never") or put the word "Never" in a heading and the phrase "buy/don't-buy" in a bullet below it (different lines). Both would fail the regex.
  - `/adaptive Q&A|meet (them|people) where they are/i` — requires the exact string "adaptive Q&A" (not "adaptive questioning" or "adaptive interview") or "meet them/people where they are" (not "meet stakeholders where they are"). Step 4 says "adaptive Q&A / meet-them-where-they-are" in a bullet, but a worker might naturally paraphrase.
- **Why it matters:** A worker following the step's bullet list faithfully but paraphrasing any of these would fail the test with no obvious indication of why. The worker would be stuck in a "adjust the prose" loop (Step 5) without understanding the regex constraint. Two workers would very likely produce different files; both could pass or fail depending on whether they happened to use the exact substrings.
- **Suggested fix:** In Step 4, explicitly call out the phrases that must appear verbatim (e.g., "Include the exact phrase 'Never use buy/don't-buy' on one line" and "Use the exact term 'adaptive Q&A', not 'adaptive questioning'"). Alternatively, add a comment in the test file listing the required phrases as a reference for the authoring worker.

---

- **ID:** impl-003
- **Severity:** High
- **Task(s)/Step(s):** Task 2 Step 3
- **Issue:** The accent-stripping regex in `slug.js` contains literal Unicode combining diacritical mark characters: `replace(/[̀-ͯ]/g, '')` (intended range U+0300–U+036F). These characters are embedded in the markdown source of the plan. When a worker copies this code block from the plan markdown, the combining marks may (a) render invisibly, making the brackets look empty (`//g`); (b) get corrupted by markdown processing or clipboard operations; or (c) be misinterpreted by the editor. The test `slugify('  Légora  ') → 'legora'` would fail silently (accent not stripped, result: 'légora' instead of 'legora').
- **Why it matters:** A worker copying the code literally might produce a working or broken implementation depending on clipboard behavior — a non-deterministic failure. This is the kind of issue that's extremely hard to debug because the code looks correct on screen.
- **Suggested fix:** Replace the literal characters with Unicode escapes: `.replace(/[\u0300-\u036F]/g, '')`. This is unambiguous in any copy-paste context.

---

- **ID:** impl-004
- **Severity:** Medium
- **Task(s)/Step(s):** Task 7 Step 3
- **Issue:** The step says "Append to `tooling/test/manifest.test.js`" and provides a test block to add. This is not idempotent: if a worker crashes or is interrupted after appending but before committing (Task 7 Step 5), re-running Step 3 would append the same test a second time. The test would still pass (duplicate test names are allowed in `node --test`), but the file would contain dead weight. More critically, if the worker re-runs the entire task from Step 1, the `package.json` write (Step 1) is idempotent but the append is cumulative.
- **Why it matters:** Resumability is explicitly called out as a requirement in the evaluator brief. A non-idempotent append means a crash mid-Task-7 produces a subtly corrupted file that would confuse future workers or reviewers.
- **Suggested fix:** Either (a) instruct the worker to check whether the test already exists before appending ("If `manifest.test.js` already contains the README test, skip this step"), or (b) rewrite the entire `manifest.test.js` file (the original from Task 1 plus the new test) instead of appending, or (c) put the README test in its own file `tooling/test/readme.test.js`.

---

- **ID:** impl-005
- **Severity:** Medium
- **Task(s)/Step(s):** Task 5 Step 4 (voice-and-guardrails.md), cross-referenced with Task 4
- **Issue:** The test for `voice-and-guardrails.md` includes the anchor `/no tier labels/i`. Step 4 lists "no tier labels" as a bullet point, which a worker would likely include verbatim. However, the step says these should be "scannable rules" — a worker might format them as a numbered list, a table, or prose paragraphs. The phrase "no tier labels" might appear as "No tier labels allowed" or "Tier labels: none" depending on formatting choice. The regex requires the substring "no tier labels" — "Tier labels: none" would fail.
- **Why it matters:** Same class of issue as impl-002 — the test enforces exact substrings but the authoring instructions describe semantic requirements. A worker following the semantic instructions might not produce the exact substrings.
- **Suggested fix:** Either explicitly list the exact phrases that must appear verbatim (as a "required strings" checklist), or loosen the regex anchors to be more flexible (e.g., `/no tier labels|tier labels.*not|avoid.*tier labels/i`).

---

- **ID:** impl-006
- **Severity:** Medium
- **Task(s)/Step(s):** Task 1 Step 4
- **Issue:** The Files section at the top of Task 1 says "Create (empty dirs with `.gitkeep`): `commands/`, `skills/`, `agents/`, `shared/`" — listing four directories with `.gitkeep`. But the actual shell command in Step 4 is: `mkdir -p commands skills agents shared && touch commands/.gitkeep skills/.gitkeep agents/.gitkeep` — which only creates `.gitkeep` for three directories, omitting `shared/`. A worker following the shell command literally (which is correct behavior for an agentic worker) would not create `shared/.gitkeep`.
- **Why it matters:** Functionally harmless — `shared/` gets real files in Task 5, and git doesn't track empty directories anyway. But the inconsistency between the description and the command could confuse a worker who re-reads the task and wonders if they missed something. A careful worker might add `shared/.gitkeep` manually, creating a file that then needs to be cleaned up when Task 5 adds real files to `shared/`.
- **Suggested fix:** Either add `shared/.gitkeep` to the `touch` command for consistency with the description, or change the description to say "Create (empty dirs with `.gitkeep`): `commands/`, `skills/`, `agents/`" (omitting `shared/`).

---

- **ID:** impl-007
- **Severity:** Medium
- **Task(s)/Step(s):** Task 6 Step 3
- **Issue:** Step 3 instructs the worker to author `commands/vendor-evaluation.md` with a body that must "drive the five phases (`vendor-intake → vendor-research → ...`), each ending in a checkpoint and a guardrail check before advancing." The test only checks for the presence of skill-name strings, the workspace path, `state.json`, and `${CLAUDE_PLUGIN_ROOT}` — it does not validate the command's actual runtime behavior. A worker could satisfy the test with a skeletal markdown file that name-drops the skills but provides no usable orchestration instructions. The plan says this is intentional (Plans 02–04 build the skills), but it doesn't tell the worker **how much detail to write** in the command body. Should the command include full step-by-step instructions for each phase, or just a high-level flow? Two workers could produce wildly different levels of detail, both passing the test.
- **Why it matters:** When Plan 02 builds the first phase skill, the worker will read the command to understand the integration contract. If the command is too skeletal, the Plan 02 worker has no guidance on how the phase should interact with the orchestrator. If it's too detailed, the Plan 02 worker might find contradictions with the actual skill implementation.
- **Suggested fix:** Add a sentence specifying the command's granularity: "Write the command body as a complete end-to-end workflow that a model could follow, with each phase as a named section referencing the skill by name. The phase sections should describe the phase's inputs, outputs, checkpoint, and guardrail check at a high level — the detail lives in the skill files (Plans 02–04)."

---

- **ID:** impl-008
- **Severity:** Medium
- **Task(s)/Step(s):** Task 5 Step 3 (philosophy.md)
- **Issue:** Step 3 says to "Evolve `source_docs/vendor_system_prompt.md` per spec §12.6" and gives specific instructions: keep certain phrases verbatim, rename the score scale, replace tier labels, include the central question. The test anchors check for `/outsourcing your thinking/i` (inside the central question) and `/present trade-offs, not verdicts/i` (a verbatim phrase from the source). However, the source document says "Fortune 100" in its very first sentence ("You are an expert analyst helping Fortune 100 executives..."). The step says "Replace any tier label with 'senior leaders'" but a worker who copies the source document and does targeted replacements might miss this instance if it appears in a slightly different form (e.g., "Fortune 100 and Fortune 500" or "Fortune-100"). The test's negative assertion `assert.doesNotMatch(t, /Fortune\s*(100|500)/i)` would catch it, but the worker would be in a confusing fail-loop.
- **Why it matters:** The source document is 42 lines. A worker evolving it needs to find and replace all tier references. If the worker misses one, the test fails. The step says to "replace" but doesn't enumerate all instances.
- **Suggested fix:** Add an explicit note: "The source document mentions 'Fortune 100' in its opening sentence — replace with 'senior leaders' or rephrase. Search the final file for any remaining 'Fortune' references."

---

- **ID:** impl-009
- **Severity:** Low
- **Task(s)/Step(s):** Cross-task (Tasks 1–7)
- **Issue:** The plan assumes Node.js ≥ 18 with `node --test` support but no step verifies this prerequisite. If the worker's environment has Node 16 or no Node at all, Task 1 Step 3 would fail with an obscure error ("unknown option '--test'" or "command not found") and the worker would have no guidance on what went wrong.
- **Why it matters:** A prerequisite check is cheap insurance. Without it, a worker in a misconfigured environment wastes time debugging test failures that aren't caused by the plan.
- **Suggested fix:** Add a prerequisite check before Task 1: "Verify: `node --version` returns v18+ and `npm --version` is available. If not, install Node.js ≥ 18 before proceeding."

---

- **ID:** impl-010
- **Severity:** Low
- **Task(s)/Step(s):** Task 3 Step 3
- **Issue:** `markPhaseComplete(state, 'report', hash, now)` — when called on the last phase, `PHASES[PHASES.indexOf('report') + 1]` is `PHASES[5]` = `undefined`. The `if (next)` guard prevents an error, but `currentPhase` remains at its previous value (likely `'procurement'`), which may be semantically confusing — the state says all phases are complete but `currentPhase` says `'procurement'`. This edge case is untested.
- **Why it matters:** Plan 02+ workers will call `markPhaseComplete` for the `report` phase. If they then check `currentPhase` to determine "is the evaluation done?", they'd get a wrong answer. The function's behavior is technically correct (no crash) but semantically ambiguous.
- **Suggested fix:** Either (a) add a test for this edge case and document that `currentPhase` stays at the last real phase after `report` is completed, or (b) set `currentPhase` to `'done'` or `null` when the last phase completes. This is a Plan 01 fix — better to resolve the contract now than surprise Plan 04.

---

- **ID:** impl-011
- **Severity:** Low
- **Task(s)/Step(s):** Task 5 Step 5
- **Issue:** Step 5 says "Adjust the prose until every required anchor is present." This implies an iterative loop: run test → check which anchors fail → adjust prose → repeat. But if a worker adjusts one anchor and inadvertently removes another (e.g., rewording a sentence to include "never...buy/don't-buy" on one line but in doing so removing "poses extreme risk"), the loop could cycle. The plan provides no guidance on how to resolve conflicts between anchors.
- **Why it matters:** The anchors are all independent substrings that should coexist naturally, but a worker who rewrites aggressively could create conflicts. The risk is low but the frustration is real.
- **Suggested fix:** Add a note: "Each required anchor should appear in its own context. If adjusting one anchor breaks another, add the missing phrase elsewhere rather than rewriting the same sentence."

---

- **ID:** impl-012
- **Severity:** Nit
- **Task(s)/Step(s):** Task 6 Step 3
- **Issue:** The step ends with "Then `rm commands/.gitkeep`." This file deletion is embedded in the authoring step rather than being a separate explicit step. A worker focused on writing the markdown might not notice this instruction, leaving `commands/.gitkeep` alongside `commands/vendor-evaluation.md`. The Step 5 commit command does `git rm --cached commands/.gitkeep 2>/dev/null; rm -f commands/.gitkeep` which cleans it up, but if the worker commits the `.gitkeep` by accident (e.g., runs `git add .` before the explicit commit command), the cleanup in Step 5 still handles it. So this is cosmetic.
- **Why it matters:** Minimal — the commit step's cleanup handles it. But embedding a file operation in a prose-authoring step is easy to miss.
- **Suggested fix:** Move the `rm commands/.gitkeep` to a separate explicit step (e.g., "Step 3.5: Remove the placeholder: `rm commands/.gitkeep`") or fold it into the Step 5 commit block more visibly.

## Strengths (brief)

- **TDD cadence is consistent and well-paced.** Every task follows red→green→commit with exact shell commands and expected output. A worker never has to guess what to run or what to expect.
- **The produces/consumes chain is correct.** `slugify` flows from Task 2 → Task 3/6; `state` shape from Task 3 → Task 6; `lint()` rule names are consistent in Task 4; score labels match the Global Constraints verbatim. No dangling references.
- **Forward references to not-yet-built skills (Task 6) are clearly intentional and well-gated.** The test checks for string presence, not runtime validity. The plan explicitly calls out that Plans 02–04 build the skills.
- **The guardrail lint implementation is correct and well-tested.** I traced all seven tests against the implementation and fixtures. The do-not-over-fire fixture passes; the violations fixture triggers all three rule types. The regex patterns correctly avoid bare-word collisions ("buyer," "buying").
- **Shell commands are copy-paste runnable** (with the minor `.gitkeep` inconsistency noted). The `git rm --cached ... 2>/dev/null; rm -f ...` pattern handles both tracked and untracked states correctly.
- **The Global Constraints block is an excellent design choice** — it centralizes all frozen decisions so the worker doesn't have to re-derive them from the spec.

## Open questions for the human

1. **Task 1 Step 1 schema verification:** What should the worker do if Context7/WebFetch is unavailable or the docs are ambiguous? Should there be an explicit "proceed with provided JSON" fallback?
2. **Task 5 regex anchors:** Should the plan include an explicit "required verbatim phrases" checklist for the prose-authoring steps, or should the test regexes be loosened? The current design requires the worker to guess which phrases the test demands.
3. **Task 6 command granularity:** How detailed should the command body be, given that the phase skills don't exist yet? Is a high-level flow sufficient, or should it include enough detail to guide Plan 02's skill author?
4. **Task 3 `markPhaseComplete` on the last phase:** Should `currentPhase` transition to a terminal value (`'done'`/`null`) when `report` is completed, or is it acceptable for it to remain at `'procurement'`?
5. **Task 2 accent-stripping regex:** Was the literal Unicode range intentional, or should it use `\u0300-\u036F` escapes for copy-paste safety? (This may depend on how the plan is consumed — if the worker reads raw markdown, the literal characters may be fine; if rendered HTML, they may be lost.)
