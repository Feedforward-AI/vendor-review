# Evaluator Brief — Plan 01 (Foundation) Review

You are one of several independent reviewers evaluating an **implementation plan** (not a spec, not
code yet). Each reviewer runs on a different model and a different lens. Work independently.

Your job: identify **issues, errors, ambiguities, contradictions, and risks** in the plan that would
cause an agentic worker (following it task-by-task) to fail or produce a broken result. Be specific —
cite task numbers, step numbers, and quote the plan. Distinguish **real defects** from **tastes**.
It is fine to confirm something is well-designed; do not manufacture problems.

---

## 0. What the artifact is

- **File:** `docs/superpowers/plans/2026-06-18-vendor-review-01-foundation.md` (~710 lines).
- **What it is:** a **TDD implementation plan** for "Plan 01: Foundation" of the `vendor-review`
  Claude Code plugin. It is consumed by an agentic worker using a subagent-driven-development skill,
  executing tasks 1→7 in order, each task being red→green→commit.
- **What Plan 01 builds:** plugin + marketplace manifests; `slug.js`; `state.js` (run-manifest);
  `guardrail-lint.js`; the shared spine (`philosophy.md`, `voice-and-guardrails.md`); the entry
  command (`commands/vendor-evaluation.md`); README + `npm test` wiring. All as **dev-time Node.js
  tooling (zero deps, `node --test`)** plus markdown/JSON.
- **The plan contains real code and real tests.** Trace them. A code bug or a test that doesn't
  actually pass-as-written is a real finding.

## 1. ⚠️ CRITICAL SCOPING RULE — Plan 01 is 1 of 4

This plan is **deliberately partial.** Plans 02–04 (see the handoff doc
`docs/superpowers/plans/2026-06-18-vendor-review-00-handoff.md`) add the rest. **Do NOT flag the
following as "missing" — they are intentionally deferred and out of scope:**

- The five phase **skills** (`vendor-intake`, `vendor-research`, `vendor-capacity-assessment`,
  `vendor-procurement-review`, `vendor-report`) — Plan 01 only *references* them from the command.
- The six **`agents/`** (research streams + brand discovery) — Plan 02.
- **Report assets** (`report-template.html`, `theme.css`), the report skill — Plan 04.
- **Golden-fixture end-to-end tests**, `html-validate.js`, `golden-compare.js` — Plan 04.
- The BYO-materials handling, intake question bank, calibration matrix execution, etc. — Plans 02/03.

A forward reference (e.g., the command naming `vendor-intake` before that skill exists) is **correct
and intentional**, not a gap. Only flag a "missing" item if it is missing **from Plan 01's own
stated scope** (the File Structure block + the seven tasks + the Self-Review's coverage list).

## 2. Authoritative sources (check the plan against these)

In priority order:
1. **The revised spec:** `docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md` —
   especially **§11** (genuine open items), **§12** (resolved decisions), and §3/§4 (pack structure,
   phase flow). The plan must honor §12's frozen decisions.
2. **`docs/evaluations/IMPLEMENTATION-BRIEF.md` §0** — the **governing rule**: maximally opinionated
   about trade-offs; **never the literal buy/don't-buy sentence**; sentiment, scorecard counts, and
   "Against your priorities" are **deliberately kept** — do NOT flag the guardrail lint as "too lenient"
   for allowing them. That is the product.
3. **The handoff doc:** `docs/superpowers/plans/2026-06-18-vendor-review-00-handoff.md` — defines the
   4-plan split, the per-plan acceptance checks, and the inherited constraints.
4. **`source_docs/vendor_system_prompt.md`** — what `philosophy.md` evolves from (Task 5).

## 3. The plan's own stated invariants (check for internal consistency)

From its "Global Constraints" + Self-Review:
- **Naming frozen:** GitHub `feedforward/vendor-review` · marketplace `feedforward` · plugin/local dir
  `vendor-review`.
- **Runtime `allowed-tools`:** `Read, Write, Edit, WebSearch, WebFetch, Task` — **no `Bash`** in shipped
  command/skills. (Dev tooling may use Node freely.)
- **§0 rule** encoded in the lint: flag literal recommendation strings + aggregate "Recommended" grade
  + tier labels + false-certainty; **do-not-over-fire** on opinionated language (sentiment, counts,
  "poses extreme risk", "purchase decision remains yours").
- **Score labels:** capacity `Met / Partially Met / Not Met / Insufficient Information`; procurement
  `Available / Partial / Absent / Insufficient` — deliberately distinct.
- **Phase order:** `intake → research → capacity → procurement → report`.
- **Workspace:** `./vendor-evaluations/<vendor-slug>/`; slug = lowercase, hyphenated, confirmed.
- **TDD + commit per task.** `npm test` → `node --test tooling/test/`.

## 4. Watch areas (investigate each; conclude, don't assume)

1. **Do the tests pass as written?** Trace each test against its implementation. Look for: regexes that
   don't match what the test expects (or over/under-match), assertions that would fail, "expected fail"
   reasons in Step 3 that are wrong, fixtures that trip the wrong rule.
2. **Do the task interfaces line up?** Each task has "Interfaces: Consumes / Produces." Verify the
   produces/consumes chain is consistent across tasks (e.g., `slugify` signature, `state` shape, `lint()`
   return type, the command's references).
3. **Is each step concrete enough for an agentic worker?** The prose-authoring steps (Tasks 5, 6, 7) give
   instructions but not final text. Are they specific enough that two different workers would produce
   equivalent, test-passing output? Where would a worker get stuck or guess?
4. **Cross-task dependencies & ordering.** Does anything reference a file/symbol not yet created at that
   point? Is the `.gitkeep` creation/removal sequence correct? Are commit boundaries sane (no committing
   generated test artifacts that shouldn't be tracked, no missing `git add`s)?
5. **Spec §12 fidelity.** Does the plan actually honor each frozen decision? (naming, no-Bash, §0 rule,
  state model with stale-marking + back-edge loop cap=2, two distinct status vocabularies, etc.)
6. **The guardrail lint correctness specifically** — this is the load-bearing product rule. Does the
   implementation match the test intent? Does the do-not-over-fire fixture actually pass? Are there
   obvious false-positives (e.g., bare-word `purchase` colliding with "purchase decision remains yours")
   or false-negatives (e.g., a recommendation phrasing that slips through)?
7. **Will `npm test` actually go green** end-to-end after Task 7, as the plan claims? Any task whose test
   would still fail after its implementation step? Any test that depends on a later task's output?
8. **Acceptance check alignment.** The handoff doc lists Plan 01's acceptance: `npm test` green; plugin
   installs; command scaffolds workspace + `state.json`; lint flags a planted violation + passes the
   clean fixture. Does the plan's task set actually deliver all of these?

## 5. Output format (REQUIRED)

Write to your assigned output file as Markdown:

```
# <Lens Name> Review — Plan 01 (Foundation)
**Model:** <provider/model-id you actually ran as>

## Summary
2–4 sentences: overall health of the plan from your lens.

## Findings
For each finding:
- **ID:** <lens-initial>-001
- **Severity:** Blocker | High | Medium | Low | Nit
- **Task(s)/Step(s):** e.g., Task 4 Step 4, or "cross-task"
- **Issue:** one paragraph, concrete. Quote the plan where relevant.
- **Why it matters:** impact on the agentic worker or the deliverable.
- **Suggested fix:** concrete, minimal.

(Severity: Blocker = plan won't produce a working result as written; High = a task will fail or a test
won't pass / spec §12 decision violated; Medium = ambiguity or likely defect; Low = minor; Nit = style.)

## Strengths (brief)
What this lens confirms is solid (3–6 bullets max).

## Open questions for the human
Things you couldn't determine from the materials (max 5).
```

Be concrete. Cite task/step numbers. Prefer 8–18 high-quality findings over many shallow ones. Do NOT
flag deferred-to-Plans-02-04 items (§1). Do NOT re-litigate the §0 opinionation rule (§2).
