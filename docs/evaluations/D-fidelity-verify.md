# Source Fidelity & POV Drift Verification — Vendor Evaluation Skill Pack Revision
**Model:** Anthropic Claude

## Verdict on the revision
The revision resolves the actionable source-fidelity findings in the narrow survivor set and, crucially, does not soften the product's deliberate opinionation. The literal word "verdict" is renamed to "scored assessment" in §7 Layer 3, the symmetric positive guardrail example is added to §1, the score-label mapping note is required, the missing source critical rules are kept verbatim, the "What Excellent Vendors Look Like" bullets are preserved, and the evidence tiers plus procurement capacity cross-links are intact. The structures that were intentionally rejected as over-softening — sentiment, scorecard counts, "Against your priorities," and the blunt declarative tone — are explicitly preserved in §12 and throughout. The only remaining source-fidelity gaps are carry-overs the diff did not touch: the Key Takeaway framing, the Key Questions examples, and the provisional status of the Phase 3 sentiment.

## Findings checklist (your earlier findings, each classified)

- **D-001** [Medium]: Score labels renamed Yes/No → Met/Not Met risk tonal drift without a mapping note.
  - **Status:** RESOLVED
  - **Evidence:** §12.6 (Carry-forward hygiene) now explicitly requires: "Rename score labels Yes/Partially/No/Insufficient → Met/Partially Met/Not Met/Insufficient Information, **with a one-line semantic-mapping note**." Diff lines +159–+163.
  - **Note:** The mapping note requirement closes the rubric-author confusion risk.

- **D-002** [High]: Sentiment + "Against your priorities" scored verdicts read as implicit buy/don't-buy recommendations.
  - **Status:** INTENTIONALLY-REJECTED (verified preserved)
  - **Evidence:** IMPLEMENTATION-BRIEF §0 and spec §12 state the product is "maximally opinionated about trade-offs" and that reviewers' "verdict-drift" softening of `sentiment`, the scorecard counts, the "Against your priorities" section, and the pointed tone is **rejected**. §7 still places a "draft key-takeaway and sentiment" in `capacity-assessment.md`; §9b keeps the Key Takeaway box + sentiment; §7 Layer 3 remains the "most personalized, most opinionated part."
  - **Note:** Per §0, these structures are the product and stay sharp. Do not re-litigate.

- **D-003** [Medium]: "What Excellent Vendors Look Like" bullets not enumerated in spec, left to open item.
  - **Status:** RESOLVED
  - **Evidence:** §12.6 now lists under carry-forward hygiene: "**Keep verbatim:** … and the 'What Excellent Vendors Look Like' bullets." Diff lines +159–+163.

- **D-004** [Medium]: No explicit reconciliation of gentle intake register with blunt assessment register.
  - **Status:** PARTIALLY
  - **Evidence:** The registers are structurally separated — §1 / §7 / §10 enforce "pointed/declarative tone" and "Name risks bluntly," while §5 is the adaptive, gentle intake skill. §12.6 adds "adaptive-Q&A … rules as the single source of truth." However, the spec does not include an explicit two-register rule stating that gentle scaffolding applies to intake/education and conclusion-first bluntness applies to assessment/reporting.
  - **Note:** The structure and examples imply the rule, but an explicit sentence in `shared/voice-and-guardrails.md` would prevent implementer drift.

- **D-005** [Low]: Key Takeaway box not required to be the source's single direct trade-off statement.
  - **Status:** MISSED
  - **Evidence:** §9b still describes the Executive Summary as "Key Takeaway box + sentiment + 'what kind of org this suits / doesn't'" without requiring a single direct sentence answering "What should we know about this tool, and what trade-offs does it present?"
  - **Note:** Not in the narrow survivor set, but a genuine source-fidelity gap the diff did not address.

- **D-006** [Low]: Key Questions lack the source's examples and organizational-context framing.
  - **Status:** MISSED
  - **Evidence:** §9b retains "Key questions for your decision — 5–6, personalized" but does not carry forward the source `Key Questions.md` examples (e.g., "How do you evaluate the trade-off between immediate productivity gains and long-term capability development?") or the explicit requirement that they be framed as strategic decisions for the executive's organization rather than vendor capabilities.

- **D-007** [Low]: Discontinuity between source lowercase labels and spec title-case labels.
  - **Status:** RESOLVED
  - **Evidence:** Same fix as D-001 — §12.6 requires the one-line semantic-mapping note covering the Yes/Partially/No/Insufficient ↔ Met/Partially Met/Not Met/Insufficient Information mapping.

- **D-008** [Medium]: Source critical rules "do not infer or speculate," "frame missing information as questions for the vendor," and "present trade-offs, not verdicts" missing from shared-spine listing.
  - **Status:** RESOLVED
  - **Evidence:** §12.6 now says "**Keep verbatim:** 'state conclusions first,' 'no corporate hedging,' **'do not infer or speculate,' 'present trade-offs, not verdicts,'** and the 'What Excellent Vendors Look Like' bullets." "Frame missing information as questions for the vendor" is covered by the gap-routing protocol in §6 and §12.3.

- **D-009** [High]: "Against your priorities" is a major POV evolution beyond the source framework.
  - **Status:** INTENTIONALLY-REJECTED (verified preserved)
  - **Evidence:** §12 adopts the governing rule and explicitly rejects reviewers' calls to soften/remove the "Against your priorities" section. §7 Layer 3 still gives each exec-stated criterion a "direct, cited scored assessment" and calls it the "most personalized, most opinionated part." §9b places it prominently in the report.
  - **Note:** Per §0, this is the product, not a defect. Do not re-litigate.

- **D-010** [Low]: Phase 3 sentiment is "draft" but not explicitly labeled provisional or revisable by Phase 4.
  - **Status:** MISSED
  - **Evidence:** §7 still says the capacity-assessment artifact contains a "draft key-takeaway and sentiment," and §9b uses sentiment in the final report, but the spec never clarifies whether procurement-review findings can revise the final sentiment or that the Phase 3 sentiment is provisional pending Phase 4.
  - **Note:** "Draft" implies provisional, but an explicit rule would close the stale-sentiment risk.

- **D-011** [Nit]: Ban on tier labels ("Fortune 100") vs source's Fortune-100 framing.
  - **Status:** RESOLVED
  - **Evidence:** §2 retains "No tier labels anywhere in the tool — never 'Fortune 100,' 'Fortune 500,' or similar" and §12.6 requires "Remove tier labels ('Fortune 100' → 'senior leaders')." This is a clean, documented evolution.

- **D-012** [Medium]: No symmetric positive example in the §1 opinionation guardrail.
  - **Status:** RESOLVED
  - **Evidence:** §1 now includes: "✅ Allowed (positive): *'A strong fit for organizations prioritizing X, with limited capacity risk — the purchase decision remains yours.'*" and "❌ Not allowed: *'…so we recommend purchasing.'*" Diff lines +34–+36.

- **D-013** [Low]: Source "distinguish claims from evidence" rule operationalized as evidence tiers.
  - **Status:** RESOLVED
  - **Evidence:** §6b and §10 retain the three tiers (Independent evidence / Vendor claim / Provided document) and the rule that vendor claims conflicting with independent evidence must be surfaced explicitly.

- **D-014** [Low]: Procurement review added as courtesy layer; cross-links keep capacity POV primary.
  - **Status:** RESOLVED
  - **Evidence:** §8 retains the explicit courtesy frame and the capacity cross-links (e.g., proprietary OAuth → EXIT lock-in, opaque architecture → SEE opacity, data-training terms → LEARN/EXIT risk).

- **D-015** [Medium]: Source tone instructions "State conclusions first" and "No corporate hedging" fragmented across spec.
  - **Status:** RESOLVED
  - **Evidence:** §12.6 now requires keeping verbatim: "**state conclusions first,**" "**no corporate hedging,**" "do not infer or speculate," and "present trade-offs, not verdicts." The two-register reconciliation aspect overlaps with D-004 (see above).

## New issues introduced by the revision (if any)

None identified. The revision preserved opinionation where required and sharpened the guardrails. The only implementation hazard worth watching is the guardrail lint's catch-list including the literal string `purchase` (§12.5) while the §1 positive example uses "the purchase decision remains yours"; the spec correctly includes a do-not-over-fire rule requiring the lint to pass its own ✅ examples, so this is not a spec regression but an implementation test requirement.

## Anything still genuinely open

- **D-005:** Require the report-template reference to frame the Key Takeaway as one direct sentence answering "What should we know about this tool, and what trade-offs does it present?" (source `Executive Summary.md`).
- **D-006:** Carry forward the source `Key Questions.md` examples and the rule that final questions must be strategic decisions for the executive's organization, not generic vendor Q&A.
- **D-010:** Clarify in §7/§9 that the Phase 3 sentiment is provisional and that Phase 4 procurement findings can revise the final report sentiment; label it accordingly in the artifact guidance.
- **D-004 follow-up:** Add an explicit two-register sentence to `shared/voice-and-guardrails.md` — gentle/scaffolded during intake and user education; direct, declarative, conclusion-first during assessment and reporting — so implementers do not collapse the registers.
