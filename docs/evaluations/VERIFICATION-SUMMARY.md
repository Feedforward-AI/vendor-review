# Verification Summary — Vendor Evaluation Skill Pack Revision

**Revision reviewed:** commit `3349305` "Revise design spec per multi-LLM implementation review"
(spec 431 → 564 lines; diff `docs/evaluations/SPEC-DIFF.md`, +165/−32).
**Method:** the **same 5 model+lens combos** re-ran, each verifying its own earlier findings against
the diff, under a brief that embedded the §0 governing rule (so deliberately-rejected items were
checked as "preserve," not re-flagged).
**Per-lens verification files:** `A-mechanics-verify.md`, `B-consistency-verify.md`,
`C-completeness-verify.md`, `D-fidelity-verify.md`, `E-guardrails-verify.md`.

## Bottom line
**The revision is solid and correctly targeted.** The 3 blockers are resolved. The §0 governing rule
was correctly applied — the deliberately-opinionated structures (sentiment, scorecard counts,
"Against your priorities," blunt tone) are **verified preserved and even reinforced**, not softened.
The guardrail lint got the do-not-over-fire carve-out you wanted. A handful of low-severity items
slipped through (mostly untouched Low/Nit findings + a couple of small new gaps), and there's **one
real new internal contradiction** worth fixing.

## Findings scorecard across all 5 lenses

| Status | Count | Examples |
|---|---|---|
| **RESOLVED** | 35 | All 3 blockers; naming triple; scoring-rubric ownership; preset filenames; calibration matrix; gap-routing; brand timing; `derived-criteria.md`; lint definition; label-rename; positive guardrail example |
| **INTENTIONALLY-REJECTED (verified preserved)** | 5 | sentiment (D-002, G-001), scorecard counts (G-009), "Against your priorities" opinionation (D-009), blunt tone — all confirmed intact per §0 |
| **PARTIALLY** | 5 | intake framework-but-no-question-bank (C-004); allowed-tools posture (A-006); plugin.json fields deferred (A-011); two-register reconciliation implied-not-stated (D-004); disagreement-recording principle-set-mechanism-missing (G-006) |
| **MISSED** | 7 | "parallel" guarantee wording (A-005); "unlimited custom outputs" app-like framing (A-013); §10 stale-vs-overwrite contradiction *(also a new finding, see below)*; custom-output format taxonomy (C-008); Gartner qualifier drift (B-009); section-name variants (B-010); "confirm or adjust" wording (G-007); Key Takeaway/Key Questions source examples (D-005/D-006); quiet-logging disclosure (G-014) |
| **New regressions** | 4 | see below |

## ✅ What was definitively fixed (no further action)
- **BLK-1** Entry point → `commands/vendor-evaluation.md` (namespaced), no orchestrator skill. *(all 3 mechanics/consistency/completeness reviewers confirmed)*
- **BLK-2** Bundled `agents/` for the 5 research streams + brand discovery, each with its own allowlist + output contract.
- **BLK-3** `state.json` run-manifest with stale-downstream-marking + Phase 3→2 back-edge **loop cap = 2**.
- **Naming triple** frozen everywhere (`feedforward/vendor-review` / marketplace `feedforward` / plugin `vendor-review`); removed from §11.
- **§11 ↔ §10 contradiction** dissolved (mechanism specified, only the endpoint left open).
- **Two status vocabularies** now explicitly documented as deliberate (capacity vs procurement).
- **`scoring-scale.md`** ownership stated; preset variant filenames declared.
- **Calibration matrix**, **gap-routing protocol**, **brand-discovery mechanics + immediate confirmation**, **`derived-criteria.md` + immutable `intake.md`**, **"Against your priorities" rubric** — all added concretely.
- **Guardrail lint** defined: literal-string catches + structural no-false-certainty (named artifact required) + gap-completeness cross-check + runs after every phase + blocks checkpoint + **covers `custom-*`** + **do-not-over-fire carve-out** protecting sentiment/counts/opinionated language (the key §0 correctness check — **verified passing**).
- **"verdict" → "scored assessment"** rename (§7 Layer 3) + **symmetric positive guardrail example** (§1) — the two narrow survivors you wanted.
- **Carry-forward hygiene** (§12.6): label rename with mapping note, Fortune-100 removal, verbatim-keep list incl. "What Excellent Vendors Look Like."

## 🔴 The one real new contradiction (fix this)
**`resumability-rerun-rule` — §10 contradicts §4/§12.1.** *(B-N01, also flagged by A as A-007 partial)*
The diff updated §4 and §12.1 to the new model: *"Re-running a phase overwrites its artifact **and marks downstream artifacts stale**."* But it **left §10's bullet as the old rule:** *"re-running a phase overwrites **only** its own artifact."* These directly contradict.
**Fix:** one line in §10 → "re-running a phase overwrites its artifact and marks downstream artifacts stale (per §4 / §12.1)."

## 🟠 Small new gaps the diff introduced (low severity)
1. **`feedback.md` is referenced but missing from the §3 artifact tree.** *(C-N01)* §10/§12.4 both point the `mailto:` at a generated `feedback.md`, but §3 only lists `technical-issues.md`. Add it.
2. **Allowed-tools may be too tight to list the materials folder.** *(A-N01)* §6a requires the skill to *list* the materials folder, but §12.1's allowlist is `Read, Write, Edit, WebSearch, WebFetch, Task` — `Read` can't enumerate an unknown folder. Add `LS` (and likely `Glob`), or require exact file paths.
3. **Lint catch-list has bare `purchase`,** which would collide with the spec's own ✅ example ("the purchase decision remains yours") under naive substring matching. *(G-N01, D also noted)* The spec already mandates the lint pass its own ✅ examples — so just implement with phrasal patterns (`recommend.*purchas`, etc.), not bare words. Construction note, not a design flaw.
4. **Per-agent `allowed-tools` not enumerated** (only the command+skills set is). *(C-N02)* Specify each research agent's subset.

## 🟡 Low-severity items the diff didn't touch (optional cleanup)
These are all Low/Nit from the original review that weren't in the implementation brief's tiers — safe to defer, but listed for completeness:
- **"Parallel" still stated as a guarantee** (A-005/MISSED) — reword to "may run concurrently or be serialized."
- **"Unlimited; any time" custom-outputs framing** (A-013/MISSED) still reads app-like; rephrase as re-invocable against an existing workspace.
- **Custom-output format taxonomy** (C-008/MISSED) — no decision tree for `.md` vs `.html` from natural-language requests. Low risk (LLM usually gets it right).
- **Per-objective intake questions** (C-004/PARTIAL) — framework is specified (cap, progress, two-axis gauge, stop condition) but the 8 objectives still lack core question text + "I'm not sure" scaffolding.
- **Gartner qualifier drift** (B-009), **"Against your priorities" section-title variants** (B-010), **orphaned `source-playbook.md`/`branding-guide.md`** (B-012), **procurement + entry-command smoke tests** (B-014) — terminology/test-coverage hygiene.
- **"Confirm or adjust"** checkpoint wording (G-007/MISSED) still invites softening findings; one-word fix → "confirm or add context." (Cheap and worth doing — it's a guardrail-adjacent wording.)
- **Disagreement-recording mechanism** (G-006/PARTIAL) — principle is set, but the structured disagreement block + its visibility in the report aren't specified.
- **Key Takeaway as the source's single trade-off sentence** (D-005), **Key Questions source examples** (D-006), **provisional Phase 3 sentiment** (D-010), **two-register rule stated explicitly** (D-004) — source-fidelity polish.
- **Quiet logging disclosure** (G-014/MISSED) — one-line upfront note that a local technical-issues log is kept.

## Note on the §10 contradiction
That's the only item I'd call a genuine defect rather than unfinished polish — and it's a one-line fix. Everything else is either confirmed-correct, a small additive gap, or optional Low/Nit cleanup. The reviewers independently agreed the revision **did not over-soften** the product, which was the main risk.

**Recommendation:** apply the §10 one-liner + the 4 small new-gap fixes (feedback.md in tree, LS/Glob in allowlist, phrasal lint patterns, per-agent allowlists), then the spec is implementation-ready. The Low/Nit batch can ride along or wait.
