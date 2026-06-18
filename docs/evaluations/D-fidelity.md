# D-fidelity Review — Vendor Evaluation Skill Pack
**Model:** Anthropic Claude

## Summary
The spec generally carries forward the six criteria, the executive-summary/key-questions structure, and the Feedforward capacity-building POV, but it introduces meaningful point-of-view tension by layering an opinionated "Against your priorities" scored section and a sentiment label on top of the source's explicit "analyst, not decision-maker" stance. The rename of scores from Yes/No to Met/Not Met is semantically faithful but risks a tonal drift toward procurement-compliance language. Several source guardrails ("present trade-offs, not verdicts," "do not infer or speculate," "state conclusions first") are not explicitly surfaced in the shared-spine listing, leaving their survival to an open-item implementation detail. No source requirement is directly contradicted, but the most distinctive analyst stance is silently stretched.

## Findings

- **ID:** D-001
  - **Severity:** Medium
  - **Section(s):** §7; source `vendor_system_prompt.md` (Scoring Methodology)
  - **Issue:** The source scoring methodology uses `Yes / Partially / No / Insufficient Information`, where `Yes` is defined as "Clear, verifiable evidence that this criterion is met." The spec renames the same semantics to `Met / Partially Met / Not Met / Insufficient Information`. The mapping is one-to-one (`Yes` ↔ `Met`, `No` ↔ `Not Met`), but the label register shifts from an analyst's direct verdict to an RFP-style compliance statement.
  - **Why it matters:** The original tone rule demands language that is "direct and declarative" and "not polite at the expense of clarity." A report full of "Not Met" badges reads more like a vendor audit than a blunt analyst assessment, diluting the distinctive Feedforward voice.
  - **Suggested fix:** In `shared/voice-and-guardrails.md`, explicitly state that `Met` means the analyst answers "yes" to the criterion and preserve the declarative analyst register in the narrative. Consider adding a short rationale for the rename so implementers do not drift further toward corporate procurement phrasing.

- **ID:** D-002
  - **Severity:** High
  - **Section(s):** §1 (Opinionation guardrail); §7 Layer 3; §9b
  - **Issue:** The source system prompt opens with: "You are an analyst, not a decision-maker. Your role is to illuminate trade-offs and provide information that supports informed decisions—not to make buy/don't buy recommendations." The spec maintains the narrower "never issue a buy/don't-buy verdict" rule (§1) but then designs §7 Layer 3 as a "'How [vendor] measures against your priorities' section" that gives "each exec-stated criterion ... a direct, cited verdict" and calls it the "Most personalized, most opinionated part." It also places a `sentiment` (positive/neutral/negative) in the capacity-assessment artifact and the report executive summary.
  - **Why it matters:** For a self-serve executive, a "negative" sentiment plus "Not Met on your priorities" is highly likely to be read as "don't buy" even if the literal words are avoided. This stretches the source's "analyst, not decision-maker" stance into territory the source explicitly rejects.
  - **Suggested fix:** Add a hard guardrail in `shared/voice-and-guardrails.md` and in the report template: every "Against your priorities" score must be paired with a trade-off statement and a visible disclaimer (e.g., "This is a characterization of fit, not a purchase recommendation"). Lint for verdict-like phrasing in this section specifically.

- **ID:** D-003
  - **Severity:** Medium
  - **Section(s):** §1; §10; §11 open item; source `vendor_system_prompt.md` (What Excellent Vendors Look Like)
  - **Issue:** The source includes a normative section, "What Excellent Vendors Look Like," with four specific bullets: identify a specific worthwhile problem, locate value honestly, be transparent about commodity components, and don't hide AI mechanics. The spec's §1 "Foundational philosophy" carries forward only the three macro claims (economics/moat/stakes) and does not enumerate this section. §10 mentions that `shared/philosophy.md` will include "what excellent vendors look like," but §11 leaves the "final wording of `philosophy.md`" as an open item.
  - **Why it matters:** The "excellent vendors" bullets are part of the distinctive POV and give the six criteria their north star. Delegating them to an open item risks omission or dilution during implementation.
  - **Suggested fix:** Require `shared/philosophy.md` to include the four "What Excellent Vendors Look Like" bullets (evolved only as needed) and explicitly map each bullet to the relevant criteria (SEE, USE, LEARN).

- **ID:** D-004
  - **Severity:** Medium
  - **Section(s):** §1; §2; §5; source `vendor_system_prompt.md` (Tone)
  - **Issue:** The source tone rule is: "Be direct and declarative. State conclusions first, then support them. No corporate hedging language. Not hostile, but not polite at the expense of clarity. If something is a problem, call it a problem." The spec's self-serve framing (§2, §5) requires the intake skill to "guide gently, explain jargon in one line, never condescend, never overwhelm." The spec does not reconcile these two registers.
  - **Why it matters:** Without explicit register rules, the same run may oscillate between gentle scaffolding and blunt risk statements, undermining the coherent analyst persona that the source establishes.
  - **Suggested fix:** Add a two-register rule to `shared/voice-and-guardrails.md`: gentle/scaffolded during intake and user education; direct, declarative, and conclusion-first when reporting findings on the vendor. State which register applies to each skill.

- **ID:** D-005
  - **Severity:** Low
  - **Section(s):** §9b; source `Executive Summary.md`
  - **Issue:** The source requires the executive summary to "Open with a single, direct statement that answers: 'What should we know about this tool, and what trade-offs does it present?'" The spec replaces this with a "Key Takeaway box + sentiment + 'what kind of org this suits / doesn't.'" The "Key Takeaway box" is plausibly the same single direct statement, but the spec does not require it to be a single sentence or to frame the trade-off explicitly.
  - **Why it matters:** If the template allows a multi-sentence box or omits the trade-off framing, the source's opening intent is diluted.
  - **Suggested fix:** In the report-template reference, specify that the Key Takeaway box must be one direct sentence answering the source's exact question: "What should we know about this tool, and what trade-offs does it present?"

- **ID:** D-006
  - **Severity:** Low
  - **Section(s):** §9b; source `Key Questions.md`
  - **Issue:** The source says to generate "5-6 strategic questions that decision-makers should consider based on their organizational context and priorities," with examples such as "How do you evaluate the trade-off between immediate productivity gains and long-term capability development?" The spec says "Key questions for your decision — 5–6, personalized." The count and decision-framing are preserved, but the spec does not carry forward the examples or the explicit requirement that questions be about organizational context rather than vendor capabilities.
  - **Why it matters:** Without the examples and framing, an implementer might generate generic vendor Q&A ("What is your pricing?") rather than the strategic, organization-facing questions that are the source's signature.
  - **Suggested fix:** Include the source's example questions in the report-generation reference and instruct that final questions must be framed as strategic decisions for the executive's organization, not as a vendor questionnaire.

- **ID:** D-007
  - **Severity:** Low
  - **Section(s):** §7; source `See/Use/Learn/Change/Adapt/Exit - *.md`
  - **Issue:** All six criterion source files require the same three outputs: a 2-4 sentence assessment, a trade-off statement, and 2-3 vendor questions. Spec §7 Layer 1 preserves this structure exactly. However, the source files use lowercase shorthand labels (`yes / partially / no / insufficient`) while the spec uses title-case `Met / Partially Met / Not Met / Insufficient Information`.
  - **Why it matters:** Structure is preserved, but the label discontinuity could confuse rubric authors unless an explicit mapping is documented.
  - **Suggested fix:** Add a one-line mapping note in each criterion reference file and in the scoring rubric: "Source labels were Yes/Partially/No/Insufficient; this pack uses Met/Partially Met/Not Met/Insufficient Information with identical semantics."

- **ID:** D-008
  - **Severity:** Medium
  - **Section(s):** §10; source `vendor_system_prompt.md` (Critical Rules)
  - **Issue:** The source's Critical Rules are: (1) default to Insufficient when uncertain / do not infer or speculate, (2) frame missing information as questions for the vendor, (3) never fabricate, (4) distinguish claims from evidence, and (5) present trade-offs, not verdicts. The spec's `voice-and-guardrails.md` listing (§10) includes: pointed/declarative tone, no buy/don't-buy, no tier labels, explain jargon, adaptive Q&A, framework non-negotiable, no false certainty, fail loudly + gap routing, three evidence tiers, and never fabricate. It does not explicitly list "Do not infer or speculate," "Frame missing information as questions for the vendor," or "Present trade-offs, not verdicts."
  - **Why it matters:** "Present trade-offs, not verdicts" is the foundational expression of the analyst stance; its absence from the enumerated guardrails makes it easier for the "Against your priorities" section to slip into recommendation language.
  - **Suggested fix:** Add the three missing source rules verbatim to `shared/voice-and-guardrails.md`: "Do not infer or speculate," "Frame missing information as questions for the vendor," and "Present trade-offs, not verdicts."

- **ID:** D-009
  - **Severity:** High
  - **Section(s):** §5 (intake objective #3); §7 Layer 3; §9b
  - **Issue:** The source framework evaluates six fixed criteria and leaves the purchase decision to the executive. The spec adds a new, prominent feature: the executive's "own top criteria" are captured in intake (objective #3) and then scored in a dedicated "Against your priorities" section with "direct, cited verdicts." This feature does not exist in the source.
  - **Why it matters:** It is the single largest POV evolution in the spec. Even with the "no buy/don't-buy verdict" guardrail, scoring the user's own criteria and presenting a sentiment creates an implicit recommendation engine. The source's stance is that "Different organizations will reasonably make different choices" even when criteria are known.
  - **Suggested fix:** Treat this as an intentional evolution but add a strict output rule: every priority score must be framed as "This criterion is [met/not met] by the vendor, which means [trade-off] for your stated priority of X," never as "This vendor is/is not a good fit for you." Add it to guardrail lint.

- **ID:** D-010
  - **Severity:** Low
  - **Section(s):** §7; §9b; source `Executive Summary.md`
  - **Issue:** The source defines sentiment only in the context of the final Executive Summary: positive = "well-suited with minimal concerns"; neutral = "meaningful trade-offs that depend on organizational priorities"; negative = "significant concerns that warrant careful consideration." The spec places a "draft key-takeaway and sentiment" in the `capacity-assessment.md` artifact (§7) and then uses sentiment again in the final report (§9b). It does not state whether procurement-review findings can revise the sentiment.
  - **Why it matters:** If procurement review surfaces a must-have compliance gap, the draft sentiment could be stale, but the spec does not say it must be updated.
  - **Suggested fix:** Clarify whether the capacity-assessment sentiment is provisional and whether Phase 4 findings can revise the final report sentiment. If so, label the Phase 3 sentiment "provisional — may be revised after procurement review."

- **ID:** D-011
  - **Severity:** Nit
  - **Section(s):** §2; source `vendor_system_prompt.md`
  - **Issue:** The source system prompt is explicitly addressed to "Fortune 100 executives." The spec bans tier labels everywhere (§2: "never 'Fortune 100,' 'Fortune 500,' or similar") and replaces them with neutral language such as "senior leaders" and "your organization."
  - **Why it matters:** This is a clean, intentional evolution from a consultant-delivered Fortune-100 framing to a self-serve heterogeneous audience. No contradiction remains.
  - **Suggested fix:** None; document the rationale in the README so the evolution is explicit to users.

- **ID:** D-012
  - **Severity:** Medium
  - **Section(s):** §1 (Opinionation guardrail)
  - **Issue:** The spec's allowed/not-allowed examples only illustrate the negative case: ✅ "Company XYZ uses a proprietary system unique to itself. This poses extreme risk." and ❌ "…so don't buy it." There is no example of how to handle a clearly positive finding without slipping into a "buy" recommendation.
  - **Why it matters:** If a vendor scores well, the model is more likely to generate language like "this is a strong choice" or "we recommend moving forward" because no positive counter-example is provided.
  - **Suggested fix:** Add a symmetric example: ❌ "…so we recommend purchasing" and ✅ "This is a strong fit for organizations prioritizing X, with limited capacity risk; the purchase decision remains yours."

- **ID:** D-013
  - **Severity:** Low
  - **Section(s):** §6; §10
  - **Issue:** The source's Critical Rule #4 is "Distinguish claims from evidence—marketing claims are not evidence." The spec evolves this into three explicit evidence tiers: Independent, Vendor claim, and Provided document (§6, §10).
  - **Why it matters:** This is a faithful strengthening of the source rule; it makes the claim-vs-evidence distinction operational without weakening the underlying guardrail.
  - **Suggested fix:** None.

- **ID:** D-014
  - **Severity:** Low
  - **Section(s):** §8
  - **Issue:** The source has no procurement checklist; it is a pure capacity assessment. The spec adds a procurement review as a "courtesy" secondary layer but requires every strategically relevant procurement fact to be cross-linked back to the six criteria (e.g., proprietary OAuth → EXIT lock-in).
  - **Why it matters:** The cross-links prevent the procurement layer from drifting into a conventional Gartner-style review and keep the capacity-building POV primary.
  - **Suggested fix:** None; this is a sound evolution.

- **ID:** D-015
  - **Severity:** Medium
  - **Section(s):** §1; §2; §10; source `vendor_system_prompt.md` (Tone)
  - **Issue:** The source's tone section contains four concrete writing instructions: "State conclusions first, then support them," "No corporate hedging language," "Not hostile, but not polite at the expense of clarity," and "If something is a problem, call it a problem." The spec fragments these across §1 ("Name risks bluntly"), §2 (self-serve gentle tone), and §10 ("pointed/declarative tone") but does not explicitly preserve "State conclusions first, then support them" or "No corporate hedging language" in the shared-spine listing.
  - **Why it matters:** These are actionable writing rules; losing them makes it more likely that generated reports hedge or bury the lead.
  - **Suggested fix:** Add the two missing tone instructions verbatim to `shared/voice-and-guardrails.md`: "State conclusions first, then support with citations" and "No corporate hedging language."

## Strengths (brief)
- The six criteria definitions in §7 faithfully match the source prompts' scope and required outputs (assessment, trade-off, vendor questions).
- The three evidence tiers formalize and strengthen the source's "distinguish claims from evidence" rule.
- Procurement cross-links (§8) keep the capacity-building POV primary rather than letting the checklist become a rival framework.
- The executive-summary structure and 5-6 key questions preserve the source's intent for the final report.
- The ban on tier labels is a clean, documented evolution of the source's Fortune-100 framing.

## Open questions for the human
1. How will the "Against your priorities" section be worded so that a "direct, cited verdict" does not read as a buy/don't-buy recommendation to a self-serve executive?
2. Will `shared/philosophy.md` carry forward the source's "What Excellent Vendors Look Like" bullets verbatim, or will they be evolved/replaced?
3. Will the report template include a visible, non-removable disclaimer that sentiment and priority scores are characterizations, not purchase recommendations?
4. How should the model switch between the gentle intake register and the blunt assessment register without confusing the user?
5. Should the final generated reports expose the original "Yes/No" semantics alongside the new "Met/Not Met" labels to preserve the analyst tone?
