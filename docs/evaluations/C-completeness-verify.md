# Completeness Verification — Vendor Evaluation Skill Pack Revision
**Model:** Claude (Anthropic)

## Verdict on the revision
The revision resolves 15 of 19 findings completely, partially addresses 2 (C-004, C-018), misses 1 (C-008), and leaves 1 pre-empted by a revised flow (C-014 — effectively resolved). The diff is dense and surgical: every blocker (C-001, C-002, C-003) is properly addressed with concrete decisions — a `commands/` entry point, bundled `agents/` definitions, and a `state.json` run-manifest with stale-marking and back-edge loop caps. The 5 high-severity findings (C-004 through C-010 minus C-008) all received specific, implementable resolutions: a calibration matrix, a gap-routing protocol, brand-discovery mechanics, an "Against your priorities" rubric, separate `derived-criteria.md`, and the `docx` scope-out decision. No regression toward over-softening is present; all five INTENTIONALLY-REJECTED items from IMPLEMENTATION-BRIEF §0 are preserved intact. Two new minor gaps are introduced (unlisted `feedback.md`, unenumerated per-agent `allowed-tools`), neither blocking. The sole missed finding — C-008's custom-output format taxonomy — is a specification gap but not a correctness issue; the existing three honesty rules keep the feature bounded.

## Findings checklist (your earlier findings, each classified)

- **C-001** [Blocker]: No `commands/` entry-point file; `/vendor-evaluation` may not work
  - **Status:** RESOLVED
  - **Evidence:** Diff adds `commands/vendor-evaluation.md` to the pack tree (§3) with annotation "ENTRY POINT — namespaced slash command; orchestrates the flow." §12.1 confirms: "Entry point: a namespaced slash **command** `commands/vendor-evaluation.md` orchestrates the phased flow (it *is* the orchestrator; there is no separate orchestrator skill)." §4 reworded to "The entry command (`commands/vendor-evaluation.md`) orchestrates gated phases." README (§10) updated to reference "the namespaced `vendor-evaluation` command."

- **C-002** [Blocker]: "Parallel subagents" promised but no `agents/` definitions
  - **Status:** RESOLVED
  - **Evidence:** Diff adds `agents/` directory to §3 tree: `research-{vendor-surfaces,technical-docs,community,thirdparty,compliance}.md` and `discover-branding.md`. §12.1 specifies: "bundled `agents/` definitions: one per research stream + brand discovery, each with a system prompt, its own `allowed-tools`, and a structured output contract (finding · source URL · access date · evidence tier)."

- **C-003** [Blocker]: Orchestrator gating mechanism entirely undescribed
  - **Status:** RESOLVED
  - **Evidence:** Diff adds `state.json` to the runtime artifact tree (§3) described as "run-manifest: phase status, timestamps, artifact hashes." §12.1 specifies: "`state.json` run-manifest per workspace: phase status, timestamps, source-artifact hashes, current phase. Artifact existence is **not** the phase signal. Re-running a phase marks downstream artifacts **stale** and prompts regeneration." §4 updated: "Re-running a phase overwrites its artifact and marks downstream artifacts stale (tracked in `state.json`)."

- **C-004** [High]: Adaptive intake has no decision framework, question bank, or fluency/specificity rubric
  - **Status:** PARTIALLY
  - **Evidence:** §12.2 adds: soft cap of ~12 questions, lightweight progress indicator, early pause/resume prompt, stop condition ("every objective answered or explicitly N/A — don't pad to the cap"), and a two-axis read after each answer (specificity vague↔precise, fluency low↔high) selecting scaffold-vs-mirror behavior. **Still missing:** per-objective core questions and "I'm not sure" scaffolding text for each of the 8 objectives. The structural framework is now specified; the content-level specification (what exact questions to ask) remains delegated to LLM judgment.

- **C-005** [High]: 3-way gap routing provides no decision criteria
  - **Status:** RESOLVED
  - **Evidence:** §12.3 adds explicit gap-routing protocol: "(1) *findable with sharper search* → one targeted re-research pass; (2) *exec may have it* → ask for the specific named document; (3) *only the vendor can answer* → 'questions for vendor.' Try re-research **once**, then escalate. Every `Insufficient`/`Withheld` names a **specific artifact** — no vague 'more research needed.'"

- **C-006** [High]: Calibration rules are effects, not implementable rules
  - **Status:** RESOLVED
  - **Evidence:** §12.3 adds a concrete calibration matrix mapping each intake-dimension value to specific textual instructions:

    | Intake value | Concrete textual effect |
    |---|---|
    | Journey = Exploring | Escalate severity language on SEE/LEARN/CHANGE; add "especially costly at your stage" |
    | Journey = AI-native | Foreground CHANGE/EXIT/ADAPT; assume fluency, trim definitions |
    | Intent = stopgap / short horizon | EXIT still scores Not Met; add "less decisive given your short horizon — risk if it slips" |
    | Intent = strategic / long horizon | Escalate EXIT/ADAPT to headline risks |
    | Risk posture = productivity-first | Lead with USE; still report capacity risks in full |
    | Risk posture = capability-first | Sharpen SEE/LEARN/CHANGE framing |
    | Regulated data = HIPAA / EU / financial | Deepen procurement (BAA, EU AI Act, residency) |

    Plus the governing rule: "Calibration changes wording and emphasis only; it never alters a score, removes a finding, or hedges it."

- **C-007** [High]: Brand-asset discovery mechanism completely unspecified
  - **Status:** RESOLVED
  - **Evidence:** §12.4 specifies extraction: "attempt extraction (WebFetch of homepage / CSS / favicon) during research; **confirm immediately, with a visual preview, and block report generation until confirmed.** Frequent failure is expected → fail loudly → manual entry is the norm." §9a updated: "Default branding is a styled text wordmark + color palette (CSS variables) — fully self-contained and `Bash`-free; a raster logo is inlined only when supplied as a data URI."

- **C-008** [High]: Custom outputs have no format taxonomy; "unlimited" framing
  - **Status:** MISSED
  - **Evidence:** The diff adds preset variant filenames to §12.4 (`brief.html`, `procurement-memo.html`, `strategic-capacity-memo.html`, `technical-deep-dive.html`) and the output file convention `custom-<slug>.{md,html}`, but §9d still says "Unlimited; any time after the assessment exists" and provides no decision tree for format selection (email→plain text, memo→branded HTML, slide outline→bullet MD, etc.). The three honesty rules remain the only constraints. An implementer must still invent format-detection logic from natural-language requests.

- **C-009** [High]: RFP-feedback loop contradicts Phase 1 checkpoint immutability
  - **Status:** RESOLVED
  - **Evidence:** §6a now reads: "an RFP/policy doc's extracted criteria are written to **`derived-criteria.md`** (kept separate from the immutable `intake.md`) and reflected back to confirm." §12.2 confirms: "RFP/policy feedback: extracted criteria go to a separate **`derived-criteria.md`**, referenced at scoring/report time. **`intake.md` is immutable after its checkpoint** — never mutate a checkpointed artifact." The `derived-criteria.md` file appears in the §3 artifact tree.

- **C-010** [High]: "Against your priorities" has no scoring methodology
  - **Status:** RESOLVED
  - **Evidence:** §12.3 adds: "for each exec/RFP criterion → search the dossier for relevance → score Met/Partially/Not/Insufficient with cited evidence + tier — the same discipline as the six criteria." This provides a lightweight but concrete methodology.

- **C-011** [Medium]: `.docx` reading may not exist; BYO-materials depends on it
  - **Status:** RESOLVED
  - **Evidence:** §6a updated: "`.docx` is converted only if a converter is enabled (see §11) — otherwise it asks for a PDF or pasted text." §11 sets the day-one default: "**no `Bash`** → `.docx` is scoped out (accept PDF / paste / screenshots; fail loudly asking for a PDF or pasted text)." §12.1: "**No `Bash` by default**." The decision is made; the fallback is specified; the implementer knows what to do.

- **C-012** [Medium]: `<vendor-slug>` undefined; inconsistent with `<vendor>` usage
  - **Status:** RESOLVED
  - **Evidence:** §12.4 defines: "`<vendor-slug>` = lowercase, hyphenated vendor name, confirmed with the exec; used consistently in every path." The diff replaces `<vendor>` with `<vendor-slug>` consistently (e.g., §6a path `./vendor-evaluations/<vendor-slug>/materials/`, §9b path `./vendor-evaluations/<vendor-slug>/report.html`, §3 tree heading).

- **C-013** [Medium]: "prints to PDF" implies PDF generation, not browser print
  - **Status:** RESOLVED
  - **Evidence:** §9b now reads: "*styled for clean PDF when printed from the browser* via an `@media print` block, no JS — **no `.pdf` file is produced.**" §12.4 explicitly calls this out as a reword.

- **C-014** [Medium]: Need-first/no-vendor path has no mechanism
  - **Status:** RESOLVED (by pre-emption)
  - **Evidence:** §4 flow diagram now begins with "`/vendor-evaluation → ask vendor name + URL, create workspace`" — the orchestrator asks for vendor name+URL **before** Phase 1 begins. This effectively pre-empts the "no vendor named yet" branch in §5. While §5 still mentions "Need-first vs vendor-first," the operational flow now requires a vendor name upfront, which is one of the two fixes C-014 suggested ("remove this path and require a vendor name upfront"). The residual mention in §5 is a minor editorial inconsistency, not an implementation hazard.

- **C-015** [Medium]: `mailto:` length limit may truncate feedback payload
  - **Status:** RESOLVED
  - **Evidence:** §10 closing step now says: "Delivery is a prefilled `mailto:` carrying a short summary + the local path to a generated `feedback.md`, or a feedback-form link." §12.4 confirms: "the `mailto:` carries a short summary + the local path to a generated `feedback.md` (which bundles `technical-issues.md`) — no giant URL-encoded bodies."

- **C-016** [Medium]: Score label inconsistency (source docs say "yes/partially/no"; spec says "Met/Partially Met/Not Met")
  - **Status:** RESOLVED
  - **Evidence:** §12.6 explicitly enumerates required evolutions of `vendor_system_prompt.md`: "Rename score labels Yes/Partially/No/Insufficient → Met/Partially Met/Not Met/Insufficient Information, with a one-line semantic-mapping note." §12.3 adds: "`scoring-scale.md` holds the shared 4-point scale + label semantics; each criterion file carries its own Met/Partially/Not-Met **boundary notes**."

- **C-017** [Medium]: Back-edge protocol unspecified (trigger, scope, output destination, loop limit)
  - **Status:** RESOLVED
  - **Evidence:** §12.1 specifies the full protocol: "Back-edge (Phase 3 → 2): collect all blocked scores → present at the checkpoint → targeted re-research appends a 'Targeted follow-up' section to `dossier.md` → re-run assessment. **Loop cap: 2 rounds**, then remaining gaps escalate to 'questions for vendor' / 'What we couldn't verify.'" This addresses all four sub-questions from C-017.

- **C-018** [Low]: Slide-outline doesn't fit the {md,html} format taxonomy
  - **Status:** PARTIALLY
  - **Evidence:** §9d now lists "slide outline" as one of the format interpretations: "The skill interprets **audience, format** (email / memo / bullet brief / slide outline / branded HTML)." It is now a recognized format. However, because C-008 (format taxonomy) remains MISSED, there is still no specification for which file extension (`.md` vs `.html`) a slide outline produces, or how the skill determines format from natural language. An implementer would reasonably infer `.md` but has no spec-level confirmation.

- **C-019** [Low]: Naming triple inconsistent (marketplace, repo, plugin names)
  - **Status:** RESOLVED
  - **Evidence:** §12.1 freezes naming: "GitHub `feedforward/vendor-review` · marketplace `feedforward` · plugin name & local dir `vendor-review`." The §3 pack tree root is now `vendor-review/` (was `feedforward-vendor-review/`). Install commands in §3 are now consistent with this scheme.

## New issues introduced by the revision (if any)

- **C-N01:** `feedback.md` referenced but absent from artifact tree — **Severity:** Low, **Section:** §10 / §12.4, **Issue:** Both the closing step (§10) and §12.4 reference a generated `feedback.md` file that "bundles `technical-issues.md`." The `mailto:` carries the local path to this file. However, the runtime artifact tree in §3 lists `technical-issues.md` but not `feedback.md`. An implementer must guess whether `feedback.md` is written to the same workspace directory, overwrites `technical-issues.md`, or lives elsewhere. **Fix:** Add `feedback.md` to the §3 artifact tree (e.g., alongside `technical-issues.md`).

- **C-N02:** Per-agent `allowed-tools` not enumerated — **Severity:** Low, **Section:** §12.1, **Issue:** §12.1 says each bundled agent has "its own `allowed-tools`" and specifies the command+skills tool set (`Read, Write, Edit, WebSearch, WebFetch, Task`). The research agents presumably need subsets (e.g., `WebSearch, WebFetch, Read`; the brand-discovery agent may only need `WebFetch`). The specific per-agent tool allowlists are not specified. An implementer must infer them. **Fix:** Enumerate `allowed-tools` per agent type in §12.1 or in each agent definition file's spec.

## Anything still genuinely open
- **C-008 (custom-output format taxonomy):** The three honesty rules constrain content but not format selection. Without a taxonomy or decision tree for choosing `.md` vs `.html` (or other output shapes) from a natural-language request, the feature's implementability depends entirely on LLM judgment. Low implementation risk (the model usually gets it right), but the spec's "unlimited" framing remains over-broad.
- **C-004 (per-objective intake content):** The structural framework (cap, progress, stop condition, two-axis gauge) is now specified, but the 8 objectives still lack core question text and "I'm not sure" scaffolding. Two implementations may produce meaningfully different intake conversations. Not blocking, but the "testable" claim in §10 would benefit from at least anchoring the question bank.
