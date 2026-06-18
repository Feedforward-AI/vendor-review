# Internal Consistency Review — Plan 01 (Foundation)
**Model:** Anthropic / Claude Sonnet (review subagent)
**Lens:** Internal consistency — the plan as a contract with itself and with `2026-06-18-vendor-review-00-handoff.md`.

## Summary
The plan is largely self-consistent on its load-bearing contracts: the frozen slash-command spelling, the phase order, the `allowed-tools` set, the `lint()` rule names / `Violation` shape, the score labels, the workspace path, and the File-Structure→task mapping all line up across the Global Constraints, the task Interfaces blocks, the tests, the Self-Review, and the handoff doc. I found **three Medium-severity internal contradictions** (a Self-Review #3 claim that directly conflicts with Task 3's Interfaces block; a "runtime guardrail must match the dev lint" invariant that no test enforces; and a "resume" coverage claim that the plan's own test never gates) plus four lower-severity drift items between the plan and the handoff. None are blockers; the build will go green. Per the scoping rule (§1), I did **not** flag items deferred to Plans 02–04 as "missing."

## Findings

- **ID:** D-001
- **Severity:** Medium
- **Task(s)/Step(s):** Self-Review #3 vs Task 3 "Interfaces" (line 233); also Task 6 body
- **Issue:** The Self-Review's "Type consistency" bullet asserts *"`slugify` (Task 2) used as `<vendor-slug>` in Tasks 3/6"* (line 710). This directly contradicts Task 3's own Interfaces block, which states *"`slugify` (Task 2) is NOT required here; caller passes `vendor` and `slug`"* (line 233). It is also inaccurate for Task 6: `commands/vendor-evaluation.md` is no-`Bash` runtime markdown, so it cannot `require()` `slug.js`; it derives the slug by prose instruction ("lowercase, hyphenated, confirmed"). In Plan 01 `slugify` is exercised only by its own unit test (`slug.test.js`); no task wires `slugify`'s output into `createState` or into the command.
- **Why it matters:** The Self-Review is the plan's stated consistency check; a reviewer or downstream worker reading it would infer a `slugify → state` dependency edge that the plan deliberately removes (Task 3) and that runtime cannot express (no `Bash`). It misstates the dependency graph that the consistency lens exists to verify.
- **Suggested fix:** Reword Self-Review #3 to: *"`slugify` (Task 2) defines the `<vendor-slug>` rule; it is consumed only by its own test in Plan 01. Tasks 3 and 6 use the slug **value/contract** (caller-supplied in Task 3; prose-derived in Task 6), not the function."*

- **ID:** D-002
- **Severity:** Medium
- **Task(s)/Step(s):** Task 5 "Interfaces → Consumes" and Step 4 vs `tooling/test/shared-spine.test.js`
- **Issue:** Task 5 declares a hard invariant — the voice file's *"human-readable banned list must match the lint so runtime behavior == dev lint"* (Interfaces) and a *"Runtime guardrail check"* subsection that *"lists the same banned patterns the dev lint catches (Task 4)"* (Step 4). But `shared-spine.test.js` only checks loose prose anchors (`/never.*buy\/don['’]?t-buy/i`, `/no tier labels/i`, …) and the presence of the two positive examples. It does **not** verify that the voice file's banned list enumerates the same categories `guardrail-lint.js` enforces, nor that it refrains from banning the deliberately-allowed phrases ("purchase decision remains yours", "poses extreme risk"). The `lint()` rule *names* (`recommendation`/`tier-label`/`false-certainty`) and `Violation` shape are consistent across Task 4 impl/test — that part is fine — but the cross-file "runtime == dev lint" parity is asserted, never asserted-by-test.
- **Why it matters:** This is exactly the seam where runtime drift silently diverges from the dev lint: a worker could author a voice file whose runtime guardrail bans bare "purchase" (over-firing) or omits "aggregate Recommended" (under-firing), every test stays green, and the §0 rule is enforced inconsistently across the two surfaces that are supposed to be one source of truth.
- **Suggested fix:** Make the parity testable. Either (a) extract the banned categories into a shared constant module imported by both `guardrail-lint.js` and a spine test that asserts the voice file references each category and explicitly lists the allowed phrases, or (b) add a `shared-spine.test.js` assertion that the voice file's "Runtime guardrail check" subsection contains the same three rule names and the same two ✅-allowed examples the lint's do-not-over-fire fixture relies on.

- **ID:** D-003
- **Severity:** Medium
- **Task(s)/Step(s):** Self-Review #1 (line 705) and Task 6 Step 3 body (line 622) vs `tooling/test/command.test.js`
- **Issue:** Self-Review #1 lists *"Entry command, tight allowed-tools, workspace path, **resume** (§4, §12.1) → Task 6. ✓"*, and the Task 6 body requires the command to *"support resume from `state.json`"*. But `command.test.js` (Task 6 Step 1) asserts only frontmatter/`allowed-tools`, the five skill names, `./vendor-evaluations/<vendor-slug>/`, `state.json`, and `${CLAUDE_PLUGIN_ROOT}`. There is **no** assertion for any resume/read-existing-state behavior. Notably, the handoff's Plan 01 acceptance (lines 141–144) also does not require resume — it only requires creating the workspace + a valid `state.json`. So "resume" is claimed by the plan's Self-Review and prose but gated by neither the plan's own test nor the handoff acceptance.
- **Why it matters:** A worker can ship a command that never reads an existing `state.json` (i.e., no resume) and still satisfy every gate the plan defines, while the Self-Review's "✓" asserts it is covered. The coverage claim is unenforced.
- **Suggested fix:** Either add a `command.test.js` assertion (e.g., `assert.match(t, /resume/i)` plus a check that the command reads `state.json` *before* scaffolding), or strike "resume" from Self-Review #1's Task 6 line and defer it explicitly to the plan that implements phase execution.

- **ID:** D-004
- **Severity:** Low
- **Task(s)/Step(s):** Task 6 "Interfaces → Produces" (line 574) and Step 3 body (line 622) vs handoff Plan 04 (line 102) and Self-Review #1
- **Issue:** Task 6 says the command *"owns the closing feedback step"* (Interfaces) and Step 3 says it must *"own the closing privacy-first feedback opt-in"*. But the handoff assigns the feedback **artifact** to Plan 04 — *"the privacy-first feedback opt-in producing `feedback.md` (bundling `technical-issues.md`) + a `mailto:`"* (line 102) — and Self-Review #1's Task 6 coverage list (line 705) does not mention feedback at all. So within Plan 01 there is tension between Task 6's prose (claims ownership) and its own Self-Review (omits it), and across docs there is ambiguity over whether the *command* (Plan 01) or the *report skill* (Plan 04) owns feedback.
- **Why it matters:** This is an ownership-boundary drift, not a missing-feature flag (feedback itself is correctly deferred to Plan 04 per §1). Left as-is, a Plan 01 worker may spend effort stubbing a feedback step that Plan 04 is specified to build, or a Plan 04 worker may duplicate it.
- **Suggested fix:** Clarify in Task 6 that the command *orchestrates/delegates* the closing feedback step to the `vendor-report` skill (Plan 04), and that Plan 01 ships no feedback artifact — so the claim and the Self-Review agree.

- **ID:** D-005
- **Severity:** Low
- **Task(s)/Step(s):** Handoff Plan 02 "Consumes" (lines 46, 70) and Plan 03/04 "Consumes" (lines 87, 108) vs Plan 01 Global Constraints ("Dev tooling is NOT shipped behavior", no `Bash`)
- **Issue:** The handoff frames Plans 02–04 as consuming the JS modules — Plan 02: *"`slugify`, `state.js` (mark `intake`/`research` complete), `shared/*`, `lint()`"*; Plan 03/04 likewise consume `state.js` and `lint()`. The parenthetical *"state.js (mark `intake`/`research` complete)"* reads as a runtime call to `markPhaseComplete`. But Plan 01's frozen constraints make `slug.js`/`state.js`/`guardrail-lint.js` **dev tooling only**, and the shipped command/skills are no-`Bash` markdown that cannot `require()` them. So "consumes" can only mean dev-test/contract consumption (Plan 02's own acceptance confirms this: *"the guardrail lint passes on the generated `dossier.md`"* — i.e., `lint()` is invoked by a dev test, not at runtime). The handoff never states this distinction.
- **Why it matters:** A worker starting Plan 02 could read "consumes `state.js` (mark phases complete)" as a runtime instruction and attempt to import Node modules from a `SKILL.md`, which the no-`Bash` constraint forbids. The two governing docs are not in overt conflict, but the consumption *semantics* are unstated and easy to misread.
- **Suggested fix:** Add one line to the handoff (or Plan 01's Global Constraints) clarifying that `slug.js`/`state.js`/`guardrail-lint.js` are consumed by **dev tests and as shape/rule contracts** by later plans' skills/command, never `require()`d at runtime.

- **ID:** D-006
- **Severity:** Low
- **Task(s)/Step(s):** Task 1 Step 4 (line ~258) and Step 6 commit (line ~263) vs File Structure tree and Task 5
- **Issue:** Task 1 Step 4 runs *"`mkdir -p commands skills agents shared && touch commands/.gitkeep skills/.gitkeep agents/.gitkeep`"* — i.e., it creates `shared/` but, unlike `commands/`/`skills/`/`agents/`, gives it **no** `.gitkeep`. Step 6 then does *"`git add .claude-plugin commands skills agents shared …`"*. Git does not track empty directories, so `shared/` is silently **not** committed at Task 1; it only enters the repo when Task 5 adds `philosophy.md`. This is an asymmetry: three sibling placeholder dirs get `.gitkeep` (and thus survive in git as empty), `shared/` does not, yet all four are presented as Task 1's placeholder set and `shared` is explicitly `git add`-ed.
- **Why it matters:** Functionally harmless (Task 5 repopulates `shared/`), but a worker following the commits literally will find `git add shared` is a no-op and may believe the placeholder was committed when it was not. The File Structure tree's "`shared/`" entry is only realized at Task 5.
- **Suggested fix:** Either add `shared/.gitkeep` in Task 1 Step 4 (and remove it in Task 5, mirroring the `commands/.gitkeep` lifecycle), or drop `shared` from Task 1's `mkdir`/`git add` entirely since Task 5 creates it.

- **ID:** D-007
- **Severity:** Nit
- **Task(s)/Step(s):** Task 6 Step 3 body (line 622) vs Task 6 Step 5 commit (line ~637)
- **Issue:** `commands/.gitkeep` is removed twice: Step 3's body ends with *"Then `rm commands/.gitkeep`."*, and Step 5's commit block repeats *"`git rm --cached commands/.gitkeep 2>/dev/null; rm -f commands/.gitkeep`"*. The Step 5 form is the complete one (untracks + deletes + stages for commit); the Step 3 inline `rm` is redundant and runs before the commit staging.
- **Why it matters:** Minor — no incorrect outcome, just a duplicated instruction that could confuse a worker about which step owns the removal.
- **Suggested fix:** Drop the inline *"Then `rm commands/.gitkeep`."* from Step 3; keep the removal solely in the Step 5 commit block.

## Strengths
- **Slash-command spelling is frozen-consistent:** `/vendor-review:vendor-evaluation` matches the command file (`commands/vendor-evaluation.md` + plugin name `vendor-review`) in Task 6, the README "how to run" in Task 7 (line 668), and the handoff acceptance (line 143). No drift on lens (d).
- **Phase order is identical** across Global Constraints, `state.js` `PHASES`, the Task 6 command body, `command.test.js`, and the handoff seeds: `intake → research → capacity → procurement → report`. Lens (e) holds.
- **`allowed-tools` set (6 tools, no `Bash`)** is consistent across Global Constraints, Task 6 frontmatter, `command.test.js`, and the handoff "Constraints every plan inherits."
- **`lint()` contract is internally sound:** the `Violation = { rule, match, index }` shape and the three rule names (`recommendation`/`tier-label`/`false-certainty`) match exactly between Task 4's impl and its 7 tests; the do-not-over-fire fixture genuinely returns `[]` (traced: "purchase decision remains yours" and "poses extreme risk" hit no pattern; the clean fixture's "Insufficient Information … SOC 2 … sub-processor" is within the 220-char window so `false-certainty` does not fire).
- **Score labels** (`Met / Partially Met / Not Met / Insufficient Information`; `Available / Partial / Absent / Insufficient`) match verbatim across Global Constraints, the Task 5 `philosophy.md` test, and the handoff Plan 03 seed.
- **Workspace path** `./vendor-evaluations/<vendor-slug>/` is identical in Global Constraints, Task 6 body/test, and handoff.
- **File Structure tree ↔ task creation is complete** (lens (f)): every file in the tree carries a `(Task N)` annotation and is created by that task; no created file is orphaned outside the tree. The five phase-skill names referenced by the Task 6 command/test are exactly those the handoff allocates to Plans 02/03/04 (`vendor-intake`, `vendor-research` → 02; `vendor-capacity-assessment`, `vendor-procurement-review` → 03; `vendor-report` → 04).
- **`state.schema` constant** `vendor-review/state@1` is consistent across Task 3's Produces spec, the impl, and `validateState`.
- **Marketplace `source: "./"`** is correct for a single-plugin repo and is consistent with the handoff's local-clone install fallback (not a contradiction).

## Open questions for the human
1. **Loop-cap schema:** the handoff names *"back-edge to research (loop cap 2)"* (line 82) as a frozen state-model decision, but Task 3's `state` shape has no field for a revision/loop counter. Is Plan 03 expected to extend the phase object (e.g., add a `revisions` count), and should `validateState` eventually enforce the cap? (I did not flag the cap itself — it is Plan 03 logic — only the unmentioned schema evolution.)
2. **Phase-key vs skill-name mapping:** `state.js` `PHASES` use bare names (`intake`, `research`, …) while the command invokes `vendor-<phase>` skills. The `vendor-` prefix mapping is implied but not documented as a contract. Is `vendor-` + bare-phase the agreed skill-naming rule for Plans 02–04?
3. **`lint()` consumption mode in later plans:** confirming D-005 — are `slug.js`/`state.js`/`guardrail-lint.js` intended to be consumed only by dev tests + as shape/rule contracts in Plans 02–04, never `require()`d at runtime? (The no-`Bash` constraint implies yes, but the handoff's "Consumes" wording leaves it ambiguous.)
