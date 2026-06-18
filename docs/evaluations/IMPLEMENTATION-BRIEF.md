# Implementation Brief — Vendor Evaluation Skill Pack

**Audience:** the Claude Code agent that will implement the plugin from
`docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md`.
**Read alongside:** the spec (primary), then `docs/evaluations/SUMMARY.md` and the per-lens files
(`A-mechanics.md`, `B-consistency.md`, `C-completeness.md`, `D-fidelity.md`, `E-guardrails.md`)
as a findings catalog.
**Status of this doc:** it **supersedes** SUMMARY.md wherever they conflict. SUMMARY.md was written
by five reviewers who *misread* the product's central intent (below). This doc corrects that.

---

## 0. THE GOVERNING RULE — read this before anything else

The product is **deliberately opinionated about trade-offs.** In some cases the trade-off framing
will amount to **a recommendation in everything but name**, and that is intentional. The line we do
not cross is narrow and lexical:

> **We are opinionated about trade-offs — maximally so — and we let the reader draw the purchase
> conclusion. We never make the literal buy/don't-buy statement ourselves.**

### The line, concretely
- ✅ **In scope (do this):** blunt, declarative trade-off characterizations; a `sentiment` label
  (positive/neutral/negative); scorecard **counts** of Met/Partial/Not/Insufficient; an opinionated
  "Against your priorities" scored section; risk-naming like *"This poses extreme risk"*; conclusions
  like *"A strong fit for organizations prioritizing X, with severe lock-in risk for anyone on a
> 12-month horizon."* If the reader concludes "don't buy," that is the reader's conclusion, well-earned
  by the evidence.
- ❌ **Out of scope (never do this):** literal recommendation strings — *"buy this," "we recommend
  purchasing," "so don't buy it," "you should move forward with," "pass on this."* Also: aggregate
  the scores into a single grade/verdict *phrase* that says the purchase conclusion for the reader
  (e.g., *"Overall: Recommended"*). The framing, the evidence stack, and the sentiment are
  opinionated; the **final purchase sentence is the reader's to write**, never ours.

### This reverses the biggest theme of the review
Five reviewers flagged `sentiment`, the scorecard counts, the "Against your priorities" section, and
the opinionated Layer-3 scoring as "verdict-drift" and told you to soften/remove them (SUMMARY.md
H-4; D-002, D-009; E/G-001, E/G-002, E/G-009). **Disregard that recommendation.** Those structures are
the product. Implement them as designed and make them as sharp as the spec implies.

The two narrow sub-issues from that cluster **do** survive, because they serve the same intent
(opinionated *without* the literal verdict), not contradict it:

1. **Rename the literal word "verdict."** §7 Layer 3 currently calls its output *"a direct, cited
   verdict."* The *output* is right; the *word* is wrong — it's a lexical cue that will pull
   generation toward literal verdict prose. Rename to **"scored assessment"** (or "blunt, cited
   read") throughout. Keep the opinionation; drop the verdict-naming. *(from E/G-002, narrowed)*
2. **Add a symmetric positive example to the §1 guardrail.** Today only the negative case is shown
   (`❌ "…so don't buy it"`). Add the positive mirror so the model knows how to be opinionated-
   positive without slipping into "buy": `❌ "…so we recommend purchasing"` / `✅ "This is a strong
   fit for organizations prioritizing X, with limited capacity risk; the purchase decision remains
   yours."` *(from D-012)*

---

## 1. Non-goals — things the reviewers flagged that you must NOT "fix"

Do not implement any change whose effect is to **reduce opinionation**. Concretely, leave these as
the spec designed them:

- **Sentiment label** (positive/neutral/negative) in the Key Takeaway box — KEEP. *(not E-001)*
- **Scorecard counts** of Met/Partial/Not/Insufficient — KEEP, prominent. *(not E-009)*
- **"Against your priorities"** as the most opinionated, personalized scored section — KEEP sharp.
  *(not D-009, not E-002's "don't aggregate" intent; aggregation *phrases* are still banned per §0)*
- **Pointed, declarative, conclusion-first tone** in assessment/reporting — KEEP. *(not D-004/D-015
  insofar as they'd soften it; the gentle tone applies to intake only — see §2 M-11)*

If a finding in SUMMARY.md would have you hedge, soften, add caveats like *"this is a
characterization, not a recommendation,"* or bury the lead — **skip it.** That undercuts the product.

---

## 2. The guardrail lint — implement it, but scope it to the *real* rule

The lint (§10) is genuinely undefined and that's a real gap *(E-004, E-003, E-012)*. But build it to
enforce the **actual** rule from §0, not the reviewers' imagined "suppress anything that feels like a
recommendation." The lint must:

- **Catch literal recommendation strings:** `buy`, `don't buy`, `purchase`, `recommend`,
  `should (move forward|proceed|adopt|pass|skip)`, `verdict`, `overall grade`, `score: A/B/C`,
  tier labels (`Fortune 100/500`), uncited claims.
- **Enforce no-false-certainty structurally:** every `Insufficient Information` / `Withheld` must be
  followed (within ~N chars) by a **named specific artifact** ("SOC 2 Type II report," "current
  sub-processor list"). Vague "more research needed" fails.
- **Enforce fail-loudly completeness:** every gap flagged in `dossier.md` / `capacity-assessment.md`
  / `procurement-review.md` must surface in the report's "What we couldn't verify" (§9b #8).
- **Run after every phase**, block checkpoint advancement on failure.
- **Cover ALL artifacts**, including `custom-*.{md,html}` — custom outputs are the most gameable
  surface *(E-003, H-6)*.

> ⚠️ **Do-not-over-fire rule:** the lint must NOT flag opinionated trade-off language, sentiment, the
> counts, blunt risk-naming, or "strong fit for orgs prioritizing X." Those are in-scope (§0). Test
> the lint against the spec's own ✅ examples to ensure it passes them.

---

## 3. Build order — what to actually implement/fix, decisions pre-made

### Tier 0 — Blockers (nothing runs without these)

| # | Change | Decision (implement as) |
|---|---|---|
| **B1** | Entry point has no command file | Add **`commands/vendor-evaluation.md`** that drives the flow and references the skills + `${CLAUDE_PLUGIN_ROOT}` assets. Update §3 tree, §4, §10. *(BLK-1)* |
| **B2** | "Parallel subagents" undefined | **Recommendation: bundle `agents/` definitions** for the 5 research streams + brand-discovery (system prompt + `allowed-tools` + output contract + evidence-tier tagging). Reasons: repeatable, testable, matches §10 golden-fixture testing. Fallback only if you prefer: rewrite §6b as inline Task calls with inline prompts. *(BLK-2 — confirm preference)* |
| **B3** | Orchestrator state/resume/back-edge undefined | **Recommendation: a `state.json` run-manifest** in each workspace: phase status, timestamps, source-artifact hashes, current phase. On phase rerun, mark downstream artifacts **stale** and prompt regen. Back-edge (Phase 3→2): collect all blocked scores → present at checkpoint → targeted re-research appends a "Targeted follow-up" section to `dossier.md` → re-run assessment. **Loop cap: 2 rounds.** *(BLK-3, M-10, E-015)* |

### Tier 1 — Packaging & permissions (blocks the install→run test)

| # | Change | Decision |
|---|---|---|
| **P1** | Plugin command namespace | Document the real installed invocation (plugin commands are namespaced); fix every `/vendor-evaluation` reference. *(H-1)* |
| **P2** | `allowed-tools` undefined | Add a per-skill/per-command tool matrix: entry command + research need `Task`, `WebSearch`, `WebFetch`, `Read`, `Write`, `Edit`; docx/base64 conversion only if you allow `Bash` (justify tightly). *(H-2)* |
| **P3** | Naming triple contradicts itself | **Freeze:** GitHub repo = `feedforward/vendor-review`; marketplace name = `feedforward`; plugin `name` = `vendor-review`; local dir = `vendor-review`. Update §3 install commands; **remove** "marketplace repo name/slug" from §11. *(H-3, A-010)* |
| **P4** | Manifests unspecified | Write implementation-ready `.claude-plugin/plugin.json` + `marketplace.json` fields. *(A-011)* |

### Tier 2 — Spec completeness (so an implementer isn't guessing)

- **Spec the adaptive intake** (H-10): per-objective core questions + "I'm not sure" scaffolding; satisfaction/stop conditions; a 2-axis fluency/specificity rubric; a **soft cap (~12 questions)** + progress indicator + early pause/resume prompt.
- **Calibration matrix** (H-7): for each intake-dimension value → concrete textual modification per affected section. (The 6-month-stopgap example is the template, not the whole spec.)
- **Gap-routing protocol** (H-8): decision criteria for the 3 buckets + "try re-research once, then escalate."
- **Brand discovery** (H-9): specify extraction (WebFetch + parse homepage/CSS/favicon; accept frequent failure → fail-loudly + manual entry is the norm). Move confirmation to **immediately after discovery** with a visual preview that blocks report gen.
- **RFP-feedback loop** (H-11): store RFP-derived criteria in a separate file (e.g., `derived-criteria.md`), reference at report time; keep `intake.md` immutable post-checkpoint. Don't mutate a checkpointed artifact.
- **"Against your priorities" methodology** (M-12): a lightweight rubric for arbitrary exec criteria (dossier-relevance search → Met/Partially/Not/Insufficient with cited evidence + tiers), mirroring the six-criteria discipline.

### Tier 3 — Internal consistency sweep

- **Filenames for the 4 preset variants** (M-2, B-004): give `brief.html`, `procurement-memo.html`, `strategic-capacity-memo.html`, `technical-deep-dive.html` a home in §3/§4; or explicitly state they reuse `custom-<slug>`.
- **Reconcile the two status vocabularies** (M-3, B-007): capacity `Met/Partially Met/Not Met/Insufficient Information` vs procurement `Available/Partial/Absent/Insufficient`. Either rename procurement's overlaps (e.g., `Available/Limited/Missing/Unknown`) or document both as deliberate, once.
- **`scoring-rubric.md` ownership** (M-1, B-003): state whether it's a shared scale file or six embedded rubrics (pick one; I recommend shared scale + per-criterion boundaries).
- **HTML inlining step** (M-4, A-009): specify the build — read `${CLAUDE_PLUGIN_ROOT}/skills/vendor-report/assets/theme.css` → inline into `<style>`; logo only if encoded as a data URI; else text branding.
- **`prints to PDF`** (M-6, C-013): reword to "styled for clean PDF when printed from the browser (`@media print`)." No `.pdf` artifact.
- **`mailto:` length** (M-7, C-015): summary + local path to full log; or generate `feedback.md` to attach.
- **Technical-issues log** (M-8, A-012, B-013): add to artifact tree (e.g., in run-manifest or `technical-issues.md`); every phase appends failures. Assign the closing/feedback step to the orchestrator.
- **Path placeholder** (Low, B-008, C-012): use `<vendor-slug>` everywhere; define slug rule once (lowercase, hyphenated; confirm with exec).
- **Carry-forward hygiene** (H-12, B-015, D-001/007/008/015): in §11, explicitly enumerate required evolutions of `vendor_system_prompt.md` into `philosophy.md`/`voice-and-guardrails.md` — (a) score-label rename Yes/No→Met/Not-Met with a one-line semantic-mapping note, (b) Fortune-100→"senior leaders," (c) keep verbatim: "state conclusions first," "no corporate hedging," "do not infer or speculate," "present trade-offs, not verdicts," and the "What Excellent Vendors Look Like" bullets.

### Tier 4 — Open items still genuinely needing the human
- **`.docx` support on day one?** (M-5, C-011) — decide: require pandoc/textutil (and detect), or scope docx out (paste/PDF fallback). Blocks Phase 2 finalization.
- Default Feedforward theme hex palette/fonts (extract from existing reports — §11).

---

## 4. Two open decisions for you (Adam) before handing this off

These are technical and I've recommended a default; confirm or override:

1. **B2 — bundled `agents/` vs inline Task calls?** I recommend bundled `agents/` for repeatability + testability. Override if you'd rather keep the tree lean.
2. **B3 — orchestrator state model?** I recommend `state.json` run-manifest with stale-marking. Override if you'd rather use artifact-existence as the phase signal (simpler, weaker resume).

Everything else above is decided. Hand the implementer **this doc + the spec**, and point it at `SUMMARY.md` + per-lens files only as a reference catalog — with the explicit warning that the reviewers' "verdict-drift" recommendation is overruled by §0.
