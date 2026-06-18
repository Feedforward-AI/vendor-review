# Guardrail Coherence & UX/Self-Serve Safety Review — Vendor Evaluation Skill Pack
**Model:** anthropic/claude-sonnet-4-20250514

## Summary
The spec's guardrails are philosophically coherent but structurally under-enforced. The hardest behavioral constraints — no verdict, non-negotiable framework, no false certainty, fail loudly — rely almost entirely on LLM self-policing, with no structural or mechanical backstops. Several design choices (sentiment labels, scorecard aggregation, the word "verdict" in Layer 3, unlimited custom outputs) create internal tensions with the no-verdict rule that a non-technical self-serve exec will almost certainly experience as contradictory. The adaptive intake risks abandoning users before they reach value, and branding auto-discovery's timing creates a gap between the "never silently apply" promise and actual UX salience.

## Findings

- **ID:** G-001
- **Severity:** High
- **Section(s):** §7 (Layer 1 output / overview scorecard sentiment), §9b #2, source `Executive Summary.md`
- **Issue:** The spec carries forward a "sentiment" label (positive / neutral / negative) from the source `Executive Summary.md`, which explicitly defines "positive" as *"Tool is well-suited with minimal concerns"* and "negative" as *"Significant concerns that warrant careful consideration."* These definitions are functionally buy/don't-buy signals dressed in different language. A non-technical exec seeing "Sentiment: positive" in the Key Takeaway box of the final report (§9b #2) will read it as "buy this." The spec bans the verdict but preserves its shadow.
- **Why it matters:** This is the single most likely path for the no-verdict guardrail to silently fail. The sentiment label sits in the most prominent position in the report (the Key Takeaway box), is the most emotionally salient output, and its source definitions are unambiguously verdict-adjacent. A guardrail lint checking for "buy"/"don't buy" strings would miss this entirely.
- **Suggested fix:** Either (a) drop the sentiment label and replace it with a purely descriptive characterization of the trade-off profile (e.g., "Capacity-building profile: high transparency, high lock-in risk"), or (b) if keeping sentiment, redefine the three values to describe the *character of the evidence* (e.g., "strongly evidenced / mixed evidence / largely aspirational") rather than the vendor's suitability. Update `philosophy.md` (§11) to carry the evolved definition forward and remove the source prompt's suitability-based definitions.

---

- **ID:** G-002
- **Severity:** High
- **Section(s):** §7 Layer 3, §1
- **Issue:** §7 Layer 3 ("Score against their stated priorities") explicitly calls its per-criterion output a *"direct, cited **verdict**."* This is the spec's own word, in its own design, for the section it simultaneously calls *"the most personalized, most opinionated part."* Section 1's opinionation guardrail says "Never issue a buy/don't-buy verdict." The spec is using the banned concept to design its most verdict-prone section — the one where the exec's own criteria are scored, creating a natural "meets X of your top 5 → therefore buy/don't buy" aggregation path.
- **Why it matters:** Language shapes generation. When the model is instructed to produce "a verdict" for each of the exec's top criteria, the natural output is for-or-against language, even if the word "buy" never appears. Combined with the scorecard count (G-009), this section can produce "Meets 4 of 5 priorities" — which is a verdict in everything but name.
- **Suggested fix:** Rename "verdict" to "scored assessment" or "criterion evaluation" throughout Layer 3. Add explicit instruction in the Layer 3 reference: *"State where the vendor falls on each criterion; do not aggregate into an overall recommendation or imply that meeting N of M criteria yields a conclusion."*

---

- **ID:** G-003
- **Severity:** High
- **Section(s):** §9d, §1
- **Issue:** §9d's three rules say *"repackaging, never a new analysis"* and *"write an email convincing my boss to buy this → an honest summary, not advocacy."* But the rule is a prompt-level instruction with no structural enforcement. A self-serve exec who wants a buy-recommendation can simply rephrase: *"Write an email to my boss laying out why this vendor is the right choice for us."* The LLM must refuse each rephrasing individually. There is no output filter, no secondary check, and no escalation path. The spec says "unlimited" custom outputs (§9d closing line), which means unlimited *attempts* to extract a quasi-verdict.
- **Why it matters:** This is the most gameable surface in the spec. A motivated exec (or their assistant) can iterate until the LLM produces something advocacy-adjacent. The output then becomes a `custom-*.md` file they can share externally — outside the guardrail lint's reach (the lint is described only for the canonical report in §10 Testing).
- **Suggested fix:** (1) Extend the guardrail lint (§10) to scan **all** generated artifacts, not just the canonical report. (2) Add an explicit instruction that custom outputs must include a brief disclaimer line when the output is a communication to a third party (e.g., *"This summary reflects findings from [vendor] evaluation; the full report contains additional context and trade-offs."*). (3) Cap custom outputs or add a soft warning after N attempts that narrows toward the same framing: *"I notice you've asked for several outputs framing this as a recommendation. My role is to present findings, not conclusions — here's what I can offer."*

---

- **ID:** G-004
- **Severity:** High
- **Section(s):** §7 (No false certainty), §8, §10 Testing
- **Issue:** The "no false certainty" rule (Tentative / Withheld modes, always naming the specific missing artifact) is enforced only by LLM instruction. There is no structural check that (a) every Insufficient Information score names a *specific* missing artifact, (b) every Tentative assessment names what would firm it up, or (c) the final report's "What we couldn't verify" section (§9b #8) is actually complete relative to the assessment. The "guardrail lint" in §10 is mentioned but completely undefined — no pattern, no mechanism, no specification of what it checks or what happens when it fires.
- **Why it matters:** Without enforcement, "no false certainty" degrades to "no *blatant* false certainty." An LLM under generation pressure can produce "Insufficient Information — more research needed" (vague, no specific artifact named) and pass a naive lint. The exec gets a report that *looks* candid but actually papers over gaps with placeholder language.
- **Suggested fix:** Define the guardrail lint concretely: (a) regex/pattern check for forbidden strings (buy/don't-buy, tier labels); (b) structural check that every "Insufficient Information" score is followed within N characters by a specific artifact name (e.g., "SOC 2 Type II report," "current sub-processor list"); (c) cross-check that every gap flagged in `capacity-assessment.md` and `dossier.md` appears in the report's "What we couldn't verify" section. Specify that the lint runs after each phase and blocks checkpoint advancement on failure.

---

- **ID:** G-005
- **Severity:** Medium
- **Section(s):** §6 (fail-loudly gap routing), §7 (back-edge), §8, §9b #8
- **Issue:** "Fail loudly" is invoked in four sections but has no structural enforcement mechanism parallel to the no-false-certainty problem. The 3-way gap routing table (§6) is an instruction to the LLM, not a checkable invariant. A gap could be "routed" to "targeted re-research" that then also fails, and the gap silently drops. The report's §9b #8 ("What we couldn't verify") is a partial backstop, but there's no requirement that this section be *exhaustive* — gaps identified in Phase 2 or 3 could be resolved loosely during Phase 5 narrative generation without re-surfacing.
- **Why it matters:** The spec's credibility claim ("candor lives in the deliverable, not just the chat" — §9b #8) depends on completeness of the gap section. If the LLM omits a gap it identified earlier, the report silently lies by omission.
- **Suggested fix:** Require each artifact (`dossier.md`, `capacity-assessment.md`, `procurement-review.md`) to maintain a machine-parseable gap list (e.g., a markdown table with columns: gap, routing, status). The report builder must pull from these lists, not re-derive them from narrative text. The guardrail lint verifies the gap list is carried through to the report.

---

- **ID:** G-006
- **Severity:** Medium
- **Section(s):** §7 Layer 2
- **Issue:** "The framework is non-negotiable" means the exec can reject a conclusion (recorded as disagreement) but cannot soften a finding. This is purely an LLM instruction with no structural safeguard. In a multi-turn conversation with a persistent executive, an LLM can be gradually worn down — "but look, we're only using it for 3 months, so surely EXIT should be Partially Met, not Not Met?" — and the model may comply, especially if it's been instructed to "meet people where they are" (§5). The two instructions (meet-them-where-they-are vs. framework-is-non-negotiable) are in genuine tension, and the spec provides no decision procedure for which wins.
- **Why it matters:** This is the core product promise (the Feedforward lens is non-negotiable) and it's the most fragile guardrail. A self-serve exec who disagrees with a finding has a direct conversational path to override it, and the LLM has been told to be accommodating on everything else.
- **Suggested fix:** Add a structural constraint: when an exec challenges a score, the skill should record the challenge as a *structured disagreement block* appended to the assessment (e.g., "Executive disagreement: believes EXIT should be Partially Met because [reason]. Analyst response: [original evidence stands / evidence re-evaluated with explanation]"). The score itself should not change unless new *evidence* is provided. This makes the disagreement visible in the final report rather than silently absorbed.

---

- **ID:** G-007
- **Severity:** Medium
- **Section(s):** §4
- **Issue:** At each checkpoint, the orchestrator "summarizes the phase output and asks the exec to confirm or **adjust** before continuing." The word "adjust" is ambiguous: does it mean adjust their *input/context* (fine — adding a criterion, clarifying a goal) or adjust the *findings* (violates the non-negotiable framework)? A non-technical self-serve exec will not distinguish these. If they say "adjust the EXIT score to Partially Met because we're only using it for 6 months," and the LLM complies, the guardrail has been breached through the checkpoint mechanism the spec itself designed.
- **Why it matters:** The checkpoint — intended as a transparency feature — becomes the backdoor through which the non-negotiable framework is negotiated away. The word "adjust" invites the exec to modify findings, not just context.
- **Suggested fix:** Replace "confirm or adjust" with "confirm or add context." Explicitly scope what's adjustable: *"You can add information, correct facts, or flag disagreements — but the scores and findings themselves reflect the evidence and cannot be softened."* If the exec wants to register a disagreement, route it through the structured mechanism in G-006.

---

- **ID:** G-008
- **Severity:** Medium
- **Section(s):** §6b, §9a
- **Issue:** Brand-asset discovery runs silently during Phase 2 research (§6b: "Also runs the small brand-asset discovery task"). Exec confirmation happens only in Phase 5 (§9a: "show the logo + colors found during research and confirm before using"). This creates a gap of multiple phases between discovery and confirmation. A non-technical exec who said "yes, Acme Corp" in Phase 1 and then answered 30 minutes of intake + research questions may have little memory of the branding step. If auto-discovery misidentified the company (e.g., picked up a subsidiary's logo, or grabbed a cached/old brand), the exec sees unfamiliar branding in the final report and either (a) doesn't notice and ships a misbranded report, or (b) is confused and loses trust.
- **Why it matters:** The spec promises "never silently apply guessed branding" (§9a) — and technically it doesn't, since there's a confirmation step. But the UX timing undermines the spirit of the promise. Confirmation that arrives too late or in too much context is functionally silent.
- **Suggested fix:** Move brand-asset confirmation to immediately after discovery (end of Phase 2 checkpoint or early Phase 5 before report generation begins), with a visual preview. Add: *"If the logo or colors don't look right, tell me now — I'll fall back to manual entry or Feedforward branding."* Make the confirmation a blocking gate for report generation, not an inline prompt within a long report-building phase.

---

- **ID:** G-009
- **Severity:** High
- **Section(s):** §7 (output / overview scorecard), §9b #3
- **Issue:** The overview scorecard presents "counts of Met/Partial/Not/Insufficient" and the spec calls this *"a profile, not a single grade that implies a verdict."* But count-based aggregation is psychologically identical to a grade. An exec who sees "4 Met, 1 Partially Met, 1 Not Met" will compute "B+" in their head. The report places this scorecard prominently (§9b #3 — Evaluation Overview, right after the Executive Summary). Combined with the sentiment label (G-001) and the Against-Your-Priorities section (G-002), the report's first three sections form a de facto verdict stack even though no single element technically violates the rule.
- **Why it matters:** The no-verdict guardrail is a *product* guardrail, not a *word* guardrail. Checking for forbidden strings is insufficient when the structural composition of the report's opening pages delivers the same message. A non-technical exec's first 60 seconds with the report will produce a buy/don't-buy conclusion from these aggregated signals.
- **Suggested fix:** (1) Remove or de-emphasize the aggregate count; present the six dimensions as a visual radar/spider chart or a list of dimension-level one-liners instead, which resists mental arithmetic. (2) If keeping counts, add a caption: *"These counts describe the shape of the evidence, not an overall recommendation. A vendor with 5 Met and 1 Not Met may pose more risk than one with 3 Met and 3 Partially Met, depending on which criteria matter most to you."* (3) Ensure the Executive Summary, scorecard, and Against-Your-Priorities sections cannot collectively be read as a recommendation by adding a framing sentence: *"The following pages present findings. The purchase decision is yours."*

---

- **ID:** G-010
- **Severity:** Medium
- **Section(s):** §2, §3 (shared/philosophy.md), §10 Testing (guardrail lint), §11 Open Items
- **Issue:** §2 states "No tier labels anywhere in the tool — never 'Fortune 100,' 'Fortune 500,' or similar." But the source `vendor_system_prompt.md` opens with *"You are an expert analyst helping Fortune 100 executives evaluate B2B AI-powered SaaS software vendors."* The spec's §11 open items say `philosophy.md` should *"carry forward the existing vendor_system_prompt.md verbatim where still accurate."* If "Fortune 100" is carried forward verbatim (even into internal shared files that are never user-facing), the guardrail lint has a landmine. More importantly, the spec doesn't specify whether the no-tier-label rule applies to *user-visible output only* or to *all files including internal shared spine files*. The guardrail lint in §10 would flag a violation in `philosophy.md` that the exec never sees.
- **Why it matters:** Ambiguous scope for a hard rule creates implementation confusion. If the lint scans all generated text (including intermediate artifacts that reference the philosophy), and the philosophy contains "Fortune 100," the lint either false-positives or needs an exclusion list — neither of which is specified.
- **Suggested fix:** (1) Explicitly state in §2 that the no-tier-label rule applies to all user-visible outputs and intermediate artifacts, not to internal developer-facing files. (2) Explicitly require that `philosophy.md` replace "Fortune 100 executives" with neutral language (e.g., "senior leaders") so no downstream reference carries the tier label. (3) Add this to §11 open items: "Reconcile vendor_system_prompt.md's 'Fortune 100' framing with §2 no-tier-label rule in philosophy.md."

---

- **ID:** G-011
- **Severity:** Medium
- **Section(s):** §5 (adaptive intake)
- **Issue:** The intake has 8 information objectives with emergent questions, re-gauging after every answer, and branching for "I'm not sure." The spec says it *"stops when every objective is answered or explicitly N/A"* and mentions *"light guardrails prevent over-interviewing."* But there is no defined upper bound on question count, no maximum session length, and the "keep it quick" compression is described only as something the exec can say — not a default behavior. For a non-technical exec evaluating their first vendor, the intake could easily span 20-30 exchanges. There is no progress indicator, no estimated time, and no "you can stop and come back later" prompt until the first checkpoint (after all 8 objectives are satisfied).
- **Why it matters:** Self-serve means unsupervised. If the intake feels like an interrogation, the exec will abandon the tool before reaching any value. The spec's value proposition (polished branded report) is downstream of intake; there's nothing to show for the time invested until Phase 1 completes.
- **Suggested fix:** (1) Define a soft cap (e.g., 12 questions max before the intake must check in: *"We've covered a lot — would you like to proceed with what we have, or continue?"*). (2) Show a progress indicator after every 3rd question (e.g., *"We've captured your goal and criteria — a few more questions and we'll be ready to research."*). (3) Surface the stop/resume option earlier: after the first 3 objectives are satisfied, mention *"You can pause here and come back later, or continue to fill in more context."* (4) Default "keep it quick" to on for first-time users (detectable by no prior `intake.md` in the workspace).

---

- **ID:** G-012
- **Severity:** Medium
- **Section(s):** §9d
- **Issue:** §9d promises *"Unlimited; any time after the assessment exists"* for custom outputs. Each custom output is governed by three rules, but these are LLM instructions with no structural enforcement (same issue class as G-003). Beyond the advocacy-bypass risk in G-003, there is a coherence risk: two custom outputs generated from the same artifacts could emphasize different subsets and effectively contradict each other (e.g., a "Strategic Capacity Memo" that reads as strongly negative and an "Executive Brief" for the same vendor that reads as cautiously positive, because the LLM weighted different evidence). The spec says *"Narrowing is fine; distorting isn't"* but provides no test for where narrowing ends and distortion begins.
- **Why it matters:** A self-serve exec could generate multiple custom outputs, find the one that supports their preferred conclusion, and share it — while the canonical report tells a more nuanced story. The spec's honesty promise depends on the canonical report being the reference, but custom outputs can be shared independently.
- **Suggested fix:** (1) Every custom output should carry a footer: *"Derived from the full evaluation of [vendor] dated [date]. The complete report at [path] contains additional context."* (2) Add a fourth rule to §9d: *"Every custom output must reference or link to the canonical report."* This preserves the canonical report's role as the record of truth even when cuts are shared independently.

---

- **ID:** G-013
- **Severity:** Low
- **Section(s):** §5 objective #5
- **Issue:** Intake objective #5 captures AI-journey stage as one of four labels: **Exploring / Piloting / Scaling / AI-native.** While these aren't "Fortune 100/500" tier labels, they function as a maturity hierarchy. The spec's §5 calibration table says this *"Calibrates emphasis on SEE/LEARN/CHANGE"* — meaning the stage directly affects which criteria get more weight. Combined with the no-tier-label rule (§2) and the principle of meeting people where they are, the four labels risk making an "Exploring" exec feel their evaluation is less rigorous than an "AI-native" exec's, or that the tool has a built-in preference for more advanced organizations.
- **Why it matters:** Minor, but the spec is sensitive to hierarchy language elsewhere. If the tool implicitly communicates "you're not advanced enough to care about SEE," it contradicts the universalist premise of the framework.
- **Suggested fix:** Reframe as a descriptive question rather than a label selection: *"How would you describe your organization's experience with AI tools today?"* with example descriptions instead of named tiers. Keep the four categories as internal classification for calibration but don't surface them as labels the exec self-selects into.

---

- **ID:** G-014
- **Severity:** Low
- **Section(s):** §10 (closing step / feedback)
- **Issue:** The feedback section says the run *"quietly collected"* a technical-issues log (fetch failures, unreadable files, gaps) that is offered to the exec as part of optional feedback sharing. The word "quietly" means the exec is not informed at the start of the run that operational issues are being logged. This is a minor tension with the "privacy-first" positioning. The spec does say *"nothing leaves their machine without an explicit send,"* which is honored — but silent logging, even local-only, is a trust issue for privacy-sensitive executives (the exact target audience).
- **Why it matters:** Low risk, but the spec's audience is executives at organizations with real data sensitivity. Even local-only logging that the user didn't consent to could erode trust if discovered.
- **Suggested fix:** Add a one-line disclosure at the start of the run (Phase 1 opening or the workspace-creation step): *"I'll keep a local log of any technical issues (failed web fetches, unreadable files) so we can address them. Nothing leaves your machine."* This is transparent without being burdensome.

---

- **ID:** G-015
- **Severity:** Medium
- **Section(s):** §4 (state flow), §6 (back-edge)
- **Issue:** §4 states *"Re-running a phase overwrites only its own artifact."* But the phase flow has a back-edge from Phase 3 → Phase 2 (when a confident score is blocked). If Phase 2 re-runs and updates `dossier.md`, the existing `capacity-assessment.md` may reference evidence from the *old* dossier that has changed or been superseded. The spec doesn't specify whether downstream artifacts are invalidated, flagged as stale, or silently become inconsistent. The exec could read a capacity assessment that cites evidence that no longer appears in the dossier.
- **Why it matters:** Stale cross-references undermine the "every line cited" discipline (§6b) and the "inspectable artifact" promise (§4). A non-technical exec won't notice the inconsistency; a technical one will lose trust.
- **Suggested fix:** When Phase 2 re-runs (via back-edge or manual re-run), flag all downstream artifacts (`capacity-assessment.md`, `procurement-review.md`, `report.html`) as potentially stale. At the next checkpoint after the re-run, explicitly inform the exec: *"The research has been updated. Your capacity assessment and report may need to be regenerated to reflect the new findings. Would you like to re-run them?"* Alternatively, add a `last-updated` timestamp to each artifact and a staleness check before report generation.

## Strengths (brief)
- **The non-negotiable framework concept is well-designed.** The Layer 2 calibration model (emphasis flexes, scores don't) is a genuinely elegant solution to the "exec wants to customize but the framework is the product" tension. The example (6-month stopgap doesn't soften EXIT) is concrete and implementable.
- **Evidence tiers (Independent / Vendor claim / Provided doc) are clean and enforceable.** The three-tier model is simple enough for a lint to check and meaningful enough for the exec to understand. The conflict-surfacing rule (vendor claim vs. independent evidence) is a strong design choice.
- **The fail-loudly routing table (§6) is well-structured.** The 3-way routing (re-research / ask exec / questions for vendor) gives the model clear decision criteria and ensures gaps produce actions, not just admissions.
- **Privacy-first feedback is correctly architected.** Opt-in, granular consent, explicit send, no silent telemetry — this is right for the audience.
- **The "courtesy layer" framing for procurement (§1, §8) is honest.** Explicitly telling the exec that the capacity assessment is the core and the procurement checklist is secondary prevents the report from reading as a generic Gartner-style review.
- **The source-document fidelity is generally well-handled.** The scoring label evolution (Yes/No → Met/Not Met) is a clear improvement and the spec documents the change.

## Open questions for the human
1. **Sentiment label intent:** Was the positive/neutral/negative sentiment carried forward deliberately as a soft signal, or is it a legacy from the source prompt that should have been retired? This is the single highest-impact design decision for the no-verdict guardrail.
2. **Guardrail lint scope:** Is the guardrail lint (§10 Testing) intended to run only on the canonical report, or on all generated artifacts including custom outputs? The spec is silent on this and it materially affects G-003 and G-012.
3. **Exec disagreement recording:** When an exec rejects a conclusion (§7 Layer 2), is the disagreement surfaced in the final report or recorded only in the intermediate artifact? If it's invisible in the report, the non-negotiable framework claim is invisible to the report's audience.
4. **Custom output sharing norms:** Is the spec comfortable with custom outputs being shared independently of the canonical report, or should there be a harder link back (e.g., mandatory footer, watermarked "excerpt")? This affects whether the "canonical report as record" promise holds in practice.
5. **Intake time budget:** What is the intended maximum intake duration for a first-time user? The spec's adaptive design has no ceiling, and self-serve abandonment risk is real. Is 12 questions / ~10 minutes a reasonable target, or is the design intentionally open-ended?
