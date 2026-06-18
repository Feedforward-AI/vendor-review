# Completeness Review — Vendor Evaluation Skill Pack
**Model:** Claude (Anthropic)

## Summary
The spec is conceptually rich and internally coherent but has significant under-specification in three areas that would force an implementer to invent core logic: the adaptive intake has no decision framework, the orchestrator mechanism for phase gating is entirely undescribed, and several key algorithms (gap routing, calibration, brand-asset discovery) state desired outcomes without defining how to reach them. Additionally, the spec relies on a slash-command invocation model (`/vendor-evaluation`) that may not work with only a `SKILL.md` and no `commands/` file. The open items in §11 are not individually blocking, but their collective weight — particularly `.docx` conversion and the unwritten shared-spine files — means "ready for implementation planning" is optimistic without resolving them first.

## Findings

- **ID:** C-001
- **Severity:** Blocker
- **Section(s):** §3, §4, §10
- **Issue:** The spec presents `/vendor-evaluation` as the user-facing entry point and shows only `skills/vendor-evaluation/SKILL.md` as its backing file. The pack structure (§3) contains no `commands/` directory. Per the Claude Code mechanics in the evaluator brief §0: *"A slash command requires a command file, not merely a SKILL.md. A command and a skill are different mechanisms."* The spec never clarifies whether this is a skill explicitly invoked by name (which may or may not be supported in all surfaces) or a proper slash command. Without a `commands/vendor-evaluation.md`, the `/vendor-evaluation` invocation may silently fail or be unavailable.
- **Why it matters:** If the entry point doesn't work, the entire pack is unreachable. An implementer would have to guess whether to create a `commands/` file, rely on explicit skill invocation (which the brief says works only "in some surfaces"), or use a different invocation pattern entirely. The install instructions in the README (§10) would be wrong.
- **Suggested fix:** Either (a) add a `commands/vendor-evaluation.md` that loads or references the orchestrator skill, or (b) explicitly document that the pack relies on explicit skill-name invocation and validate that this works for plugin-bundled skills across all target surfaces.

---

- **ID:** C-002
- **Severity:** Blocker
- **Section(s):** §6b, §3
- **Issue:** Phase 2 promises "parallel subagents" dispatched across five research streams. The pack structure (§3) contains no `agents/` directory and defines zero subagent configurations. The evaluator brief §0 states subagent definitions live in `.claude/agents/<name>.md` or a plugin's `agents/` dir. Without subagent definitions, the orchestrator skill must construct ad-hoc Task tool invocations with inline instructions — but the spec gives no guidance on what those instructions should contain, what tool allowlists each subagent needs, or how results are collected and merged.
- **Why it matters:** An implementer has no specification for what each research-stream subagent should do, what tools it can use, or how it should format its output for merging into `dossier.md`. The parallel fan-out is the engine of Phase 2; without defined subagents, the entire research phase is underspecified.
- **Suggested fix:** Add an `agents/` directory with one subagent definition per research stream (or a single parameterized research subagent definition), specifying system prompt, tool allowlist (WebSearch, WebFetch, Read), output format contract, and evidence-tier tagging instructions.

---

- **ID:** C-003
- **Severity:** Blocker
- **Section(s):** §4
- **Issue:** The spec describes a gated 5-phase flow with checkpoints, resumability, and a Phase-3→Phase-2 back-edge, but never specifies *how* the orchestrator enforces this. Does the orchestrator skill use the Task tool to invoke sub-skills? Does it instruct the model to prompt the user at each checkpoint? Does it rely on model discretion to read artifact files and determine what phase to run next? The spec says "re-running a phase overwrites only its own artifact" — but skills are advisory (evaluator brief §0) and cannot force this behavior. There is no state machine, no phase-tracking file, and no description of checkpoint mechanics beyond "the orchestrator summarizes the phase output and asks the exec to confirm or adjust before continuing."
- **Why it matters:** The entire experience of a "guided, phased evaluation" depends on phase gating working reliably. Without a defined mechanism, the model could skip phases, run them out of order, or fail to resume correctly. The resumability claim ("stop after any phase and resume later") is untestable without knowing what artifact or state the orchestrator reads to determine resumption point.
- **Suggested fix:** Define a concrete orchestrator mechanism. Options: (a) a `state.json` file in the workspace that tracks completed phases (updated by the orchestrator at each checkpoint) and is read on startup to determine where to resume; (b) the orchestrator reads artifact-file existence as phase-completion signals; (c) phase invocation via explicit Task-tool calls to sub-skills, with the orchestrator maintaining the sequence. Document the checkpoint interaction pattern explicitly.

---

- **ID:** C-004
- **Severity:** High
- **Section(s):** §5
- **Issue:** The adaptive intake is described entirely in terms of desired behaviors — "reasoned against after every answer," "skips what's already answered, drops irrelevant branches, asks emergent questions, reorders for natural flow, stops when every objective is answered or explicitly N/A" — but provides zero implementation framework. There is no decision tree, no question bank, no branching logic, and no specification of what "reasoned against" means mechanically. The spec also says the intake "continuously gauges (a) how specific the need is and (b) how fluent they are, and re-gauges after every answer" but provides no rubric or thresholds for these gauges or how they alter question selection. The "I'm not sure — help me think about this" branch is mentioned but its content for each objective is unspecified.
- **Why it matters:** An implementer would have to write the entire intake conversation from scratch as an LLM prompt with only outcome descriptions as guidance. Two different implementers would produce radically different intake behaviors. The claim that the intake "skips" and "drops" and "reorders" is entirely dependent on the LLM's judgment with no specified constraints, making the behavior unpredictable and untestable against the eight objectives.
- **Suggested fix:** At minimum, provide: (a) for each of the eight objectives, the core question(s) and the "I'm not sure" scaffolding text; (b) decision rules for when an objective is satisfied vs. needs follow-up; (c) explicit stop conditions (e.g., "all 8 objectives answered OR exec explicitly says 'that's enough'"); (d) the fluency/specificity gauge as a simple two-axis rubric with example behaviors at each level.

---

- **ID:** C-005
- **Severity:** High
- **Section(s):** §6b, §10 (fail loudly + gap routing)
- **Issue:** The three-way gap routing table (§6b) defines three buckets — "Findable with sharper searching," "Something the exec might have," "Only the vendor can answer" — but provides no decision criteria for classifying a gap. How does the system determine that a missing SOC 2 report is "findable" (maybe it's behind a trust center login) vs. "exec might have" (they might have been handed it) vs. "vendor-only" (only the vendor can provide a current copy)? The spec offers no rubric, no decision tree, and no heuristics. The model must guess.
- **Why it matters:** Misrouting a gap changes the entire user experience. A gap routed to "re-research" when it's actually vendor-only wastes time and produces no result. A gap routed to "ask the exec" when it's publicly available makes the tool look incompetent. The routing logic is a core value proposition ("fail loudly") that is left entirely to LLM discretion.
- **Suggested fix:** Provide a decision protocol: e.g., (1) has re-search with different query terms been attempted? → if no, try re-research first; (2) is the artifact typically shared in procurement (security questionnaire, contract, RFP)? → ask exec; (3) is the artifact something only the vendor can generate or disclose (internal architecture, roadmap)? → questions-for-vendor. Add a "try re-research once, then escalate" fallback chain.

---

- **ID:** C-006
- **Severity:** High
- **Section(s):** §5 (intake personalization table), §7 (Layer 2)
- **Issue:** The spec states calibration "tunes how a finding is contextualized, never whether it appears or what it scores" (§7 Layer 2) and provides a table mapping intake answers to effects (§5), but these are effects, not implementable rules. For example: "AI-journey stage (#5) → Calibrates emphasis on SEE/LEARN/CHANGE." How? What emphasis does "Exploring" produce vs. "AI-native"? "Risk posture (#8) → Tunes how pointed the capacity warnings are." What does "pointed" mean mechanically — stronger adjectives? More warnings? Different placement? The one concrete example (short-horizon stopgap softens EXIT relevance) is a single data point, not a specification.
- **Why it matters:** An implementer must invent the entire calibration logic — mapping from six intake dimensions to specific textual modifications across six criteria assessments, an executive summary, and a trade-off table. Without rules, calibration will be inconsistent across runs and reviewers, undermining the "non-negotiable framework" claim.
- **Suggested fix:** Provide a calibration matrix: for each intake dimension value → concrete instruction for how it modifies each affected output section. Example: "Exploring" → SEE/LEARN emphasis: add 1–2 sentences per criterion explaining what to look for as they mature; EXIT: flagged as lower immediate concern. "Scaling" → SEE emphasis: normal; EXIT emphasis: elevated; add data-portability specifics.

---

- **ID:** C-007
- **Severity:** High
- **Section(s):** §6b, §9a
- **Issue:** The brand-asset discovery task (§6b) is described as "logo + brand colors from the exec's company domain" but the spec never says *how* to perform this extraction. Does the skill WebFetch the company homepage and parse HTML/CSS for logo `<img>` tags and `--color` CSS variables? Does it look for a `favicon.ico`? Does it use a third-party service? The spec says the HTML report has "zero JS" (§9b), so any extraction logic must happen server-side (via WebFetch) or via model reasoning about fetched page content. The auto-discovery claim in §9a ("Auto-discovered from their company site") is presented as the primary path, but the mechanism to achieve it is completely unspecified.
- **Why it matters:** Brand extraction from arbitrary company websites is technically non-trivial — logos may be SVG inline, background images in CSS, or referenced by relative URLs that need resolution. Color extraction from CSS requires parsing stylesheets that may be minified or dynamically generated. Without a specified approach, an implementer may discover this is infeasible with available Claude Code tools, making the auto-discovery promise undeliverable.
- **Suggested fix:** Either (a) specify a concrete extraction approach using WebFetch + model-driven analysis of the homepage with explicit instructions for finding logo URLs and color values, and accept that it will fail for some sites (making "fail loudly → fall back and ask" the norm rather than the exception), or (b) reduce scope to asking the exec for their brand assets with the auto-discovery as a best-effort bonus.

---

- **ID:** C-008
- **Severity:** High
- **Section(s):** §9d
- **Issue:** Custom outputs are described as "unlimited" — "The exec describes any output in plain language…The skill interprets audience, format…length, focus, and renders it." This is presented as an open-ended natural-language-to-document feature with no taxonomy of supported formats, no limits on what can be requested, and no specification of how interpretation works. The only format guidance is "emails as copy-paste text, formal docs as branded HTML" — but example requests include "a slide outline" which fits neither category cleanly. The three honesty rules are necessary but not sufficient: they don't tell an implementer what output formats to support, how to detect format from natural language, or what to do when a request is ambiguous ("make me a deck" — slides? HTML? markdown?).
- **Why it matters:** The "unlimited" framing sets expectations the implementation may not meet. An implementer needs to know: what output formats are supported? How does the skill choose between .md and .html for a given request? What happens when the exec asks for something the artifacts genuinely can't support (Rule 1 says "fail loudly" — but how does the skill determine sufficiency for an arbitrary request)? Without constraints, this feature is a prompt-engineering black box.
- **Suggested fix:** Define a supported format taxonomy (at minimum: branded HTML, plain markdown, plain text email, bulleted outline). Specify a decision tree for format selection: if "email" or "message" → plain text .md; if "memo," "report," "brief" → branded HTML; if "slide outline" or "talking points" → bulleted .md. Document that anything outside the taxonomy defaults to branded HTML with a caveat. Remove "unlimited" and replace with "wide range of common formats."

---

- **ID:** C-009
- **Severity:** High
- **Section(s):** §5 (personalization table), §6a, §4 (phase flow)
- **Issue:** The spec describes a feedback loop where BYO materials in Phase 2 (specifically "an RFP/requirements doc") can "feed back to enrich intake (extract added criteria + the org's compliance bar)" (§6a). The personalization table in §5 lists "Their top criteria (#3) + RFP-derived criteria" as inputs to the personalized report. However, the phase flow (§4) places Intake (Phase 1) and its checkpoint *before* Research (Phase 2). The intake checkpoint implies the intake is complete and confirmed before materials are collected. There is no loop-back shown in the flow diagram, and no mechanism described for updating `intake.md` after it has been checkpointed.
- **Why it matters:** An implementer must decide: (a) can Phase 2 append to `intake.md` (violating the "re-running a phase overwrites only its own artifact" rule)? (b) does the orchestrator re-enter Phase 1 after materials are collected? (c) are RFP-derived criteria stored elsewhere and only used at report time? Each choice has different implications for the checkpoint/resumability model. The spec is internally contradictory on this point.
- **Suggested fix:** Either (a) add an explicit "intake enrichment" sub-step after BYO materials collection that augments `intake.md` (with a new section for RFP-derived criteria), noting this as an exception to the overwrite rule; or (b) store RFP-derived criteria in `dossier.md` or a separate `derived-criteria.md` and reference them from there during assessment, keeping `intake.md` immutable after its checkpoint.

---

- **ID:** C-010
- **Severity:** High
- **Section(s):** §7 (Layer 3)
- **Issue:** The "Against your priorities" scoring section says each exec-stated criterion gets "a direct, cited verdict." But the spec provides no methodology for mapping arbitrary exec criteria (e.g., "must integrate with our existing Salesforce instance," "needs to support our 50-language customer base") to the dossier evidence or to a Met/Partially-Met/Not-Met scale. The six framework criteria have detailed scoring rubrics and reference files; exec criteria have no such structure. How does the system search the dossier for relevance to an arbitrary priority? How does it determine what constitutes "Met" for a criterion the framework never anticipated?
- **Why it matters:** An implementer must invent an entire ad-hoc scoring methodology for unstructured criteria. This is the spec's "most personalized, most opinionated" section — it's also the least specified. The quality of this section will vary wildly based on LLM judgment with no guardrails.
- **Suggested fix:** Provide a lightweight methodology: (a) for each exec criterion, search the dossier for direct mentions or related concepts; (b) classify evidence as directly-addressing, tangentially-related, or absent; (c) score: Met = cited evidence of capability, Partially Met = partial evidence or workaround, Not Met = evidence of inability or absence of capability, Insufficient = no information found; (d) cite specific dossier lines for every verdict, using the same evidence-tier tags.

---

- **ID:** C-011
- **Severity:** Medium
- **Section(s):** §6a, §11
- **Issue:** The spec says Phase 2 "Handles PDF, Word, text, and screenshots; converts when needed" (§6a) and §11 lists as an open item: "Whether `.docx` conversion relies on a bundled approach (e.g., pandoc/textutil) or native Read support." The evaluator brief §0 notes Claude Code's built-in `Read` tool supports text files and images — it does not natively parse `.docx`. Pandoc or textutil may not be available in the Claude Code execution environment. This is not just an open item; it's a capability the entire BYO-materials step depends on that may not exist.
- **Why it matters:** If `.docx` cannot be read, the "hand-holding to get files in" step fails silently for the most common procurement document format. The exec would receive "unreadable" errors for their RFP, security questionnaire, or contract, undermining the BYO-materials value proposition. An implementer cannot finalize Phase 2 without resolving this.
- **Suggested fix:** Resolve the open item before implementation planning: test whether `pandoc` or `textutil` is available in the target Claude Code environment. If not, specify a fallback (e.g., instruct the exec to export as PDF or paste text, or include a bundled `.docx`-to-text converter in the plugin's `shared/` directory that can be executed via bash).

---

- **ID:** C-012
- **Severity:** Medium
- **Section(s):** §3, §4
- **Issue:** The workspace path in §3 is `./vendor-evaluations/<vendor-slug>/` but §4 says the orchestrator "ask[s] vendor name + URL, create workspace." The term "vendor-slug" is never defined — is it derived from the vendor name (lowercased, hyphenated)? From the domain? Does the exec provide it? The spec also uses `<vendor>` (without "slug") in §9b: `./vendor-evaluations/<vendor>/report.html`. An implementer must guess the slug derivation logic and whether these two path references are meant to be the same component.
- **Why it matters:** Inconsistent or undefined path derivation will cause files to be written to different directories than expected, breaking resumability (the orchestrator looks for artifacts in one place, they were written to another). The spec uses both `<vendor-slug>` and `<vendor>` for what appears to be the same directory component.
- **Suggested fix:** Define vendor-slug derivation explicitly (e.g., "lowercase vendor name, spaces→hyphens, strip non-alphanumeric except hyphens; confirm with exec before creating"). Use a single consistent placeholder (`<vendor-slug>`) throughout the spec.

---

- **ID:** C-013
- **Severity:** Medium
- **Section(s):** §9b
- **Issue:** The spec says the full report "prints to PDF via an `@media print` block." An `@media print` CSS rule controls how an HTML page renders when the user manually prints it from a browser — it does *not* generate a PDF file. The spec doesn't promise PDF *generation*, but the phrasing "prints to PDF via" implies the report *becomes* a PDF, which is not what `@media print` accomplishes. An implementer reading this might think they need to produce a `.pdf` artifact (which would require headless Chrome, wkhtmltopdf, or similar — none mentioned or available).
- **Why it matters:** If stakeholders expect a PDF file as an artifact, the spec over-promises. If `@media print` styling is the intent (the HTML is print-ready when the user hits Ctrl+P), the language should say that. The ambiguity could lead to wasted implementation effort on PDF generation.
- **Suggested fix:** Clarify: "prints to PDF" → "styled for clean PDF output when printed from the browser via `@media print` CSS rules." If a `.pdf` artifact file is intended, specify the generation tool and validate it's available in the Claude Code environment.

---

- **ID:** C-014
- **Severity:** Medium
- **Section(s):** §5 ("Need-first vs vendor-first")
- **Issue:** The intake spec says "if no vendor is named yet, help them name the one(s) they're weighing (tool evaluates one named vendor at a time); if undecided, help pick a first candidate." No mechanism is described for "help pick a first candidate." Is the skill expected to search for vendors in the exec's problem space? Ask discovery questions to narrow options? The entire intake is scoped for evaluating *one named vendor*; the un-named-vendor path has no objectives, no question flow, and no exit criteria.
- **Why it matters:** An implementer doesn't know whether to build a vendor-discovery conversation (which is a different product), reject the request with a message ("please name a vendor to evaluate"), or do something in between. This path is mentioned but completely unelaborated.
- **Suggested fix:** Either (a) specify a lightweight vendor-naming sub-flow: ask the problem space, suggest the exec name 2–3 vendors they've heard of or are considering, help them pick the most urgent one; or (b) remove this path and require a vendor name upfront — the orchestrator already "ask[s] vendor name + URL" (§4) before entering Phase 1.

---

- **ID:** C-015
- **Severity:** Medium
- **Section(s):** §10 (Closing step — feedback opt-in)
- **Issue:** The feedback delivery mechanism is "a prefilled `mailto:` email to a Feedforward address or a feedback-form link." A `mailto:` URI has practical length limits (~2000 characters in most clients) that will be exceeded by the guided feedback Q&A responses plus the technical-issues log. The spec doesn't address this limitation or specify how the content is truncated/compressed for `mailto:` delivery. The "feedback-form link" alternative is mentioned but not specified — is it a URL the exec opens? How does the content get into the form?
- **Why it matters:** The feedback mechanism may silently truncate data, losing the technical-issues log that is the most actionable artifact for improving the tool. The "nothing leaves their machine without an explicit send" guarantee is undermined if the delivery mechanism can't actually carry the payload.
- **Suggested fix:** Specify: (a) for `mailto:`, include only a summary and a note that full log is available locally at a specified path, or (b) use a feedback-form link with the content encoded in the URL (if length permits) or instruct the exec to paste from a local file, or (c) generate a `feedback.md` file the exec can attach to an email manually. Document the length constraint explicitly.

---

- **ID:** C-016
- **Severity:** Medium
- **Section(s):** §7 (Layer 1), source_docs/ (six criteria prompts)
- **Issue:** The spec says the six criteria reference files (`see.md` … `exit.md`) are "the evolved source-doc prompt + a scoring rubric." The source docs (`source_docs/See - Transparency Prompt.md`, etc.) use score labels "yes / partially / no / insufficient." The spec (§7) mandates "Met / Partially Met / Not Met / Insufficient Information." The spec never explicitly states that the reference files must be rewritten to use the new labels, nor does it address whether the scoring logic changes when the labels change. An implementer copying the source docs verbatim into reference files would introduce a labeling inconsistency.
- **Why it matters:** If the reference files retain "yes/partially/no" labels but the spec and scoring rubric say "Met/Partially Met/Not Met," the model will receive conflicting terminology and may produce inconsistent outputs. The "single source of truth" claim in §10 would be violated.
- **Suggested fix:** Add an explicit note in §7 or §11: "The reference files in `vendor-capacity-assessment/references/` must be rewritten to use 'Met / Partially Met / Not Met / Insufficient Information' labels and must include a scoring rubric defining the boundary between each score level for that criterion. The source docs in `source_docs/` are the starting point for this rewrite, not the final content."

---

- **ID:** C-017
- **Severity:** Medium
- **Section(s):** §4 (flow diagram), §7 ("Back-edge to research")
- **Issue:** The Phase 3→Phase 2 back-edge is described as "When a confident score is blocked, name the exact gap and re-enter targeted research before finalizing." But the spec never says: (a) who triggers the back-edge — does the capacity-assessment skill autonomously re-enter research, or does it present gaps to the exec and ask permission? (b) what is the scope of targeted research — one criterion, one question, full re-search? (c) where do the re-research results land — do they update `dossier.md` (which was checkpointed), append to `capacity-assessment.md`, or create a new file? (d) can the back-edge loop multiple times for different criteria?
- **Why it matters:** Without these details, an implementer might build an infinite loop (research → assessment → gap → research → assessment → new gap → …), miss the exec-confirmation step (violating the checkpoint model), or corrupt checkpointed artifacts with partial updates.
- **Suggested fix:** Specify the back-edge protocol: (1) capacity-assessment collects all blocked scores with specific gap descriptions; (2) at its checkpoint, it presents gaps to the exec and asks which to pursue; (3) for each pursued gap, a targeted research subagent runs with the specific question; (4) results are appended to `dossier.md` in a new "Targeted follow-up" section; (5) capacity-assessment re-runs (overwriting its own artifact) incorporating the new evidence. Add a maximum loop count (e.g., 2 rounds) to prevent infinite cycling.

---

- **ID:** C-018
- **Severity:** Low
- **Section(s):** §9d
- **Issue:** The custom-output examples include "a slide outline for the steering committee" but the output formats specified are only `custom-<slug>.{md,html}`. A "slide outline" doesn't cleanly fit either format — it could be markdown bullets, an HTML list, or something else. The spec's format taxonomy (email = plain text, formal docs = branded HTML) doesn't account for this category, leaving an implementer to guess.
- **Why it matters:** Minor, but contributes to the overall fuzziness of the custom-output feature. Combined with C-008, it reinforces that the custom-output section needs a format taxonomy.
- **Suggested fix:** Add "slide outline / talking points → bulleted Markdown" to the format taxonomy recommended under C-008.

---

- **ID:** C-019
- **Severity:** Low
- **Section(s):** §3 (marketplace install commands), §3 (pack structure)
- **Issue:** The marketplace add command uses `feedforward/vendor-review` (implying GitHub org `feedforward`, repo `vendor-review`), the install command uses `vendor-review@feedforward` (marketplace `feedforward`, plugin `vendor-review`), and the repo root directory is named `feedforward-vendor-review`. These three naming conventions are inconsistent: is the marketplace name `feedforward` or `vendor-review`? Is the repo name `vendor-review` or `feedforward-vendor-review`? An implementer must reconcile these before publishing.
- **Why it matters:** If the marketplace slug, repo name, and plugin name don't align, the install commands in the README will fail, and users won't be able to install the pack. This is acknowledged as an open item in §11 ("Exact Feedforward marketplace repo name/slug") but is actually a cross-reference inconsistency within the spec itself.
- **Suggested fix:** Choose one consistent naming scheme. Example: marketplace repo = `feedforward/vendor-review` (GitHub), marketplace name = `feedforward`, plugin name = `vendor-review`, local directory name = `vendor-review` (not `feedforward-vendor-review`). Update all three references to match.

---

## Strengths (brief)

- **The POV-first architecture is well-defined and internally consistent.** The Feedforward lens as core product, procurement as courtesy layer, and the six-criteria framework are clearly articulated and traceable through every phase.
- **The evidence-tier system (Independent / Vendor claim / Provided doc) is concrete and actionable.** Every downstream phase references it, and it provides a clear chain from raw research to scored assessment.
- **The honesty rules (no false certainty, fail loudly, two registers for uncertainty, always naming the specific missing artifact) are precisely specified and consistently applied across phases.** An implementer can build guardrail checks directly from the spec text.
- **The resumability model via on-disk artifacts is well-conceived.** Even though the orchestrator mechanism is underspecified (C-003), the artifact-per-phase design is clean and the overwrite semantics (once clarified) are sensible.
- **The customization/personalization architecture is sound.** Separating the non-negotiable framework (Layer 1) from calibration (Layer 2) from exec-stated priorities (Layer 3) is a strong design that prevents personalization from corrupting objective scoring.

## Open questions for the human

1. **Is explicit skill-name invocation (`/vendor-evaluation` for a skill in a plugin's `skills/` directory) supported and reliable across all Claude Code surfaces?** If not, should the pack include a `commands/vendor-evaluation.md` as a guaranteed entry point? (relates to C-001)
2. **What is the intended orchestrator mechanism?** A state file? Artifact-existence checks? Task-tool sub-skill invocation? The spec needs a decision here before any implementation can begin. (relates to C-003)
3. **Is `.docx` reading available in the target Claude Code environment (via pandoc, textutil, or native Read)?** If not, what is the fallback for the most common procurement document format? This must be resolved before Phase 2 can be implemented. (relates to C-011)
4. **How much of the adaptive intake behavior should be explicitly scripted vs. left to LLM judgment?** The spec currently describes 100% desired outcomes. The implementer needs to know the acceptable bounds of LLM discretion — particularly for question ordering, branch dropping, and the "I'm not sure" scaffolding. (relates to C-004)
5. **Should the `philosophy.md` and `voice-and-guardrails.md` shared spine files be finalized before implementation begins, or can implementation proceed with the existing `vendor_system_prompt.md` as a placeholder?** These files are the single source of truth for cross-cutting rules; building phases without them risks inconsistency that will need to be unwound later. (relates to §11)
