# Guardrail Coherence & UX Safety Verification — Vendor Evaluation Skill Pack Revision
**Model:** anthropic/claude-sonnet-4-20250514

## Verdict on the revision
The revision is strong and well-targeted. It correctly resolves the majority of actionable findings (G-002 narrow, G-003/G-012, G-004, G-005, G-008, G-010, G-011, G-015) and explicitly adopts the §0 governing rule, including a formal do-not-re-litigate declaration in §12. Critically, the INTENTIONALLY-REJECTED structures — sentiment label, scorecard counts, "Against your priorities" sharpness, and declarative tone — are all verified preserved and even reinforced. The guardrail lint is now concretely defined with literal-string checks, a structural no-false-certainty rule, gap-completeness cross-checks, checkpoint-blocking, and a do-not-over-fire carve-out tested against the spec's own ✅ examples. Three findings remain only partially or not addressed (G-006 structural disagreement recording, G-007 "confirm or adjust" wording, G-014 quiet-logging disclosure) — none are blockers, and none risk over-softening. One correctness concern warrants attention: the lint's catch list includes `purchase` as a bare literal, which could collide with the allowed positive example's phrase "the purchase decision remains yours" unless the lint uses phrasal rather than literal matching. No regressions or over-softening were found.

## Findings checklist (your earlier findings, each classified)

- **G-001** [High]: Sentiment label (positive/neutral/negative) as a soft-buy signal.
  - **Status:** INTENTIONALLY-REJECTED (verified preserved)
  - **Evidence:** §7 Output still says "a draft key-takeaway and sentiment (positive/neutral/negative describing the *character of the trade-offs*, not a recommendation)" (spec line 296). §9b #2 still has "Key Takeaway box + sentiment" (line 353). §12 explicitly rejects softening: "the reviewers' 'verdict-drift' softening of `sentiment`…is **rejected**" (line 460). §12.5 do-not-over-fire: "never flag `sentiment`" (line 553).

- **G-002** [High]: §7 Layer 3 uses the word "verdict"; aggregation path to implicit verdict.
  - **Status:** RESOLVED (narrow sub-issue)
  - **Evidence:** (1) §7 Layer 3 now reads "a direct, cited **scored assessment** (the literal word 'verdict' is avoided by design)" — diff line replacing Layer 3 text. (2) §1 guardrail adds symmetric positive example: `✅ Allowed (positive): "A strong fit for organizations prioritizing X, with limited capacity risk — the purchase decision remains yours."` and extends ❌ to include `"…so we recommend purchasing." · a single aggregate "Recommended" grade.` (3) §12.3 lexical rule: `Layer 3's output is a "scored assessment," not a "verdict."` (line 512). (4) §12.5 lint catches literal string `verdict`, `overall grade`, `score: A/B/C` (line 545). (5) §8 output reframed as "a checklist **profile, not a rival verdict-grade**" (line 331).
  - **Note:** The broad finding (aggregation-by-counts, opinionation in Layer 3) is INTENTIONALLY-REJECTED — verified preserved. The opinionated "Against your priorities" section stays sharp. Only the *word* "verdict" and literal verdict-grade strings were targeted and are fixed.

- **G-003** [High]: Custom-outputs gameable; lint didn't cover custom-* files.
  - **Status:** RESOLVED
  - **Evidence:** §10 Testing now says "scan ALL generated artifacts (including `custom-*`) after every phase, blocking checkpoint advancement on failure" (diff replacing old guardrail lint sentence). §12.5 explicitly: "covers ALL artifacts including `custom-*`" (line 549). The do-not-over-fire carve-out (line 553) ensures the lint does not over-correct by suppressing legitimate opinionated language in custom outputs.
  - **Note:** The original finding also suggested (1) a disclaimer footer on custom outputs and (2) a soft warning after N attempts. Neither was adopted. This is consistent with §0 — those additions would add hedging the governing rule rejects. Correctly scoped.

- **G-004** [High]: Guardrail lint undefined; no structural no-false-certainty check; doesn't block checkpoint.
  - **Status:** RESOLVED
  - **Evidence:** §12.5 defines the lint in full: (a) literal-string catches: `buy`, `don't buy`, `purchase`, `recommend`, `should (move forward|proceed|adopt|pass|skip)`, `verdict`, `overall grade`, `score: A/B/C`, tier labels, uncited claims (line 544-546); (b) structural no-false-certainty: "every `Insufficient`/`Withheld` must be followed (within ~N characters) by a named specific artifact" (line 547); (c) fail-loudly completeness: "every gap in `dossier.md` / `capacity-assessment.md` / `procurement-review.md` must appear in the report's 'What we couldn't verify'" (line 548); (d) "Runs after every phase; blocks checkpoint advancement on failure" (line 549). §10 cross-references §12.5.

- **G-005** [Medium]: Gap-list completeness not structurally enforced into report.
  - **Status:** RESOLVED
  - **Evidence:** §12.5 fail-loudly completeness rule: "every gap in `dossier.md` / `capacity-assessment.md` / `procurement-review.md` must appear in the report's 'What we couldn't verify'" (line 548). This is a cross-check the lint performs, not just an instruction to the LLM.

- **G-006** [Medium]: Exec disagreement silently absorbed; no structural recording.
  - **Status:** PARTIALLY
  - **Evidence:** §12.3 adds: "The framework is non-negotiable. The exec can *reject a conclusion* (recorded as disagreement) but cannot make a finding soften away" (line 509-510) and "Calibration changes wording and emphasis only; it never alters a score, removes a finding, or hedges it" (line 508). The principle that disagreement ≠ score change is now structurally reinforced. However, the specific mechanism I suggested — a structured disagreement block appended to the assessment, visible in the final report — is not specified. §7 still says "Exec can challenge any score or add context" (line 297) without specifying the format of the recording or its appearance in the report.
  - **Note:** The loose end is that the report audience cannot see that an exec disagreed. This matters because the non-negotiable framework's visibility to downstream readers is the whole point. Low risk of over-softening — this is a "nice to have" structural safeguard, not a guardrail failure.

- **G-007** [Medium]: "Confirm or adjust" wording invites exec to modify findings.
  - **Status:** MISSED
  - **Evidence:** §4 still reads: "asks the exec to confirm or adjust before continuing" (line 125). No diff change. §12 does not address checkpoint wording. The original concern — that "adjust" invites the exec to soften findings, not just add context — remains.
  - **Note:** The §12.3 "framework is non-negotiable" language provides a backstop, but the checkpoint prompt itself still uses the ambiguous word. A one-word change ("confirm or add context") would close this cleanly.

- **G-008** [Medium]: Brand-asset confirmation timing (discovery in Phase 2, confirmation only in Phase 5).
  - **Status:** RESOLVED
  - **Evidence:** §12.4: "Brand discovery timing: attempt extraction (WebFetch of homepage / CSS / favicon) during research; **confirm immediately, with a visual preview, and block report generation until confirmed.** Frequent failure is expected → fail loudly → manual entry is the norm." (lines 532-533). Confirmation is now immediate (end of research phase) and blocks report generation, closing the multi-phase gap.

- **G-009** [High]: Scorecard counts function as a de facto grade.
  - **Status:** INTENTIONALLY-REJECTED (verified preserved)
  - **Evidence:** §7 Output still has "an overview scorecard (counts of Met/Partial/Not/Insufficient, presented as a **profile, not a single grade that implies a verdict**)" (line 296). §9b #3 still has "scorecard (counts + six dimensions; a profile, not a grade)" (line 354). §12 explicitly: "the reviewers' 'verdict-drift' softening of…the scorecard counts…is **rejected**" (line 460). §12.5 do-not-over-fire: "never flag…the counts" (line 553). Counts are preserved and prominent.

- **G-010** [Medium]: No-tier-label scope ambiguous; "Fortune 100" in source prompt could leak.
  - **Status:** RESOLVED
  - **Evidence:** §12.6 explicitly requires: "Remove tier labels ('Fortune 100' → 'senior leaders')" (line 561). §12.5 lint catches "tier labels (`Fortune 100/500`)" (line 545). §12.6 also clarifies that `philosophy.md` should "carry forward" the source prompt with these evolutions, so the "Fortune 100" framing is not preserved verbatim — it is replaced. §2 scope is unchanged but now has an explicit remediation path.

- **G-011** [Medium]: Intake has no soft cap, no progress indicator, no early pause/resume.
  - **Status:** RESOLVED
  - **Evidence:** §12.2: "Adaptive interview with a **soft cap of ~12 questions**, a lightweight progress indicator, and an early **pause/resume** prompt" (line 489). Also: "Stop condition: every objective answered or explicitly N/A — don't pad to the cap" (line 491). Two-axis fluency/specificity rubric added (line 492).

- **G-012** [Medium]: Custom outputs lack structural enforcement; coherence risk (contradicting cuts).
  - **Status:** RESOLVED (enforcement aspect)
  - **Evidence:** Same as G-003: §12.5 lint covers `custom-*`, blocks checkpoint, with do-not-over-fire carve-out. Custom outputs are now structurally policed by the same lint as canonical artifacts.
  - **Note:** The original also suggested a mandatory footer linking back to the canonical report. This was not adopted, consistent with §0 (it would add hedging). The lint coverage is the core fix and is sufficient.

- **G-013** [Low]: AI-journey stage labels function as a maturity hierarchy.
  - **Status:** INTENTIONALLY-REJECTED (verified preserved) — *not in scope for the revision*
  - **Evidence:** The diff does not address this finding. §5 still uses Exploring / Piloting / Scaling / AI-native labels. This is consistent with §0 — the finding would soften the intake, and the labels serve a functional calibration purpose. Not a guardrail risk.

- **G-014** [Low]: Quiet logging of technical issues; no upfront disclosure.
  - **Status:** MISSED
  - **Evidence:** §10 Closing step still says "the run quietly collected (fetch failures, unreadable files, gaps)" (line 434). No diff change. §12.4 specifies `technical-issues.md` as the file but does not add an opening-run disclosure.
  - **Note:** The finding asked for a one-line disclosure at the start of the run. This is a small, low-risk addition that would not soften anything. Worth a future pass.

- **G-015** [Medium]: Stale artifacts after re-run; no staleness tracking.
  - **Status:** RESOLVED
  - **Evidence:** §4 now says: "Re-running a phase overwrites its artifact and marks downstream artifacts stale (tracked in `state.json`)" (line 126). §12.1 adds full state model: "`state.json` run-manifest per workspace: phase status, timestamps, source-artifact hashes, current phase. Re-running a phase marks downstream artifacts **stale** and prompts regeneration" (lines 477-479). This fully addresses the staleness problem with a structural mechanism.

## New issues introduced by the revision

- **ID:** G-N01, **Severity:** Low, **Section:** §12.5, **Issue:** The lint's catch list includes `purchase` as a bare literal string (line 545), but the spec's own allowed positive example (§1) contains the phrase "the **purchase** decision remains yours." If the lint is implemented as a simple substring match, it would flag the allowed example, violating the do-not-over-fire rule the spec explicitly requires. **Fix:** Implement the lint with phrasal/contextual patterns (e.g., `recommend.*purchas`, `should.*purchas`, `purchas.*this`) rather than bare-word substring matching, and verify it passes all ✅ examples — which the spec already mandates ("The lint is tested against those examples"). This is a construction note, not a design defect; the spec's intent is clear.

## Anything still genuinely open

- **G-007** — "confirm or adjust" in §4 checkpoint wording remains ambiguous; the exec can still interpret "adjust" as "change the findings." A one-line scoping clarification would close this without any softening.
- **G-006** (loose end) — The disagreement is "recorded" per §12.3 but the format and its appearance in the final report are not specified. The exec's challenge remains invisible to the report's audience.
- **G-014** — No upfront disclosure that technical issues are being logged. Minor trust issue for the privacy-sensitive audience.
- **G-N01** — The `purchase` bare-literal in the lint catch list needs phrasal matching to avoid colliding with the spec's own positive example. Easily addressed in implementation.
