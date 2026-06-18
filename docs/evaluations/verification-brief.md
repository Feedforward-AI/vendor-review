# Verification Brief — Vendor Evaluation Skill Pack (Revision Review)

You reviewed an earlier version of this spec. A revision was made in response. **Your job now is to
verify the revision, not re-review from scratch.** Work efficiently: check your own earlier findings
against the diff, classify each, and flag regressions.

## Inputs (read in this order)
1. `docs/evaluations/SPEC-DIFF.md` — the exact `git diff` between the version you reviewed and the
   current revision (+165 / −32 lines; spec grew 431 → 564 lines). This is your primary input.
2. `docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md` — the **current
   (revised)** spec. Read sections the diff touches, in full.
3. **Your own earlier review file** (see your task for the path) — the findings you must verify.
4. `docs/evaluations/IMPLEMENTATION-BRIEF.md` §0 — the **governing rule** the human adopted. Several
   of your earlier findings were **deliberately rejected** as over-softening (see "Do-not-re-litigate"
   below). Those must come back as `INTENTIONALLY-REJECTED — verified correct`.

## Critical context: the human's governing rule (from IMPLEMENTATION-BRIEF §0)
The product is **deliberately maximally opinionated about trade-offs** — in some cases that amounts
to "a recommendation in everything but name," and that is intentional. The only line not crossed is
**the literal buy/don't-buy sentence** and an explicit "Overall: Recommended"-style grade phrase.
Therefore:

### Do NOT re-litigate (these were rejected on purpose — verify the revision *preserved* them, do not flag them as still-open problems)
- **Sentiment label** (positive/neutral/negative) in the Key Takeaway box → must STAY. *(was E/G-001)*
- **Scorecard counts** of Met/Partial/Not/Insufficient → must STAY prominent. *(was E/G-009)*
- **"Against your priorities"** as a sharp, opinionated, personalized scored section → must STAY. *(was D-009, E/G-002)*
- **Declarative, conclusion-first, blunt** assessment/report tone → must STAY. *(was D-004/D-015)*
- Any finding whose fix would add hedging like "this is a characterization, not a recommendation," or
  bury the lead → **skip it.**

The two **narrow** sub-issues from that cluster WERE supposed to be fixed and you SHOULD verify them:
- §7 Layer 3's word **"verdict"** renamed (e.g., to "scored assessment") — the *word*, not the sharpness.
- A **symmetric positive example** added to the §1 guardrail (✅ opinionated-positive / ❌ "we recommend purchasing").

## Output format (REQUIRED) — write to your assigned file
```
# <Lens> Verification — Vendor Evaluation Skill Pack Revision
**Model:** <as assigned>

## Verdict on the revision
One paragraph: did the revision resolve your lens's actionable findings correctly, without
introducing regressions and without over-softening (per §0)?

## Findings checklist (your earlier findings, each classified)
For EACH finding from your earlier review (by ID):
- **<ID>** [severity from before]: <one-line issue>
  - **Status:** RESOLVED | PARTIALLY | MISSED | INTENTIONALLY-REJECTED (verified preserved) | N/A
  - **Evidence:** cite the diff line(s) / current-spec section that resolves (or fails to resolve) it.
  - **Note:** only if needed.

## New issues introduced by the revision (if any)
- **ID:** <lens>-N01, **Severity:** …, **Section:** …, **Issue:** …, **Fix:** …
  (Only list genuine regressions/contraditions/gaps *introduced* by the diff. Don't re-raise old
  findings here — those go in the checklist.)

## Anything still genuinely open
Max 5 bullets, only items the diff did not address and that are NOT in the do-not-re-litigate list.
```

## How to classify
- **RESOLVED** — diff makes the change your finding asked for (or the IMPLEMENTATION-BRIEF's decided
  resolution), correctly and completely.
- **PARTIALLY** — fix addresses the finding but leaves a loose end (name the loose end).
- **MISSED** — diff doesn't touch this; finding still stands.
- **INTENTIONALLY-REJECTED (verified preserved)** — finding is in the do-not-re-litigate list above;
  confirm the revision did NOT soften/remove it. (This is a *pass* result, not a problem.)
- **N/A** — finding was about a section that was rewritten and no longer applies.

Be precise with diff-line citations. Do not re-summarize the spec. Do not repeat praise. Prefer
correctness over volume.
