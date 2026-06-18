diff --git a/docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md b/docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md
index 21cf0d4..ae7cc11 100644
--- a/docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md
+++ b/docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md
@@ -31,8 +31,9 @@ carries strategic weight.
   own stated criteria**. Name risks bluntly (e.g., *"This poses extreme risk."*).
 - **Never issue a buy/don't-buy verdict.** State where it falls and how severe the risk is; the
   executive draws the purchase conclusion.
-  - ✅ Allowed: *"Company XYZ uses a proprietary system unique to itself. This poses extreme risk."*
-  - ❌ Not allowed: *"…so don't buy it."*
+  - ✅ Allowed (negative): *"Company XYZ uses a proprietary system unique to itself. This poses extreme risk."*
+  - ✅ Allowed (positive): *"A strong fit for organizations prioritizing X, with limited capacity risk — the purchase decision remains yours."*
+  - ❌ Not allowed: *"…so don't buy it."* · *"…so we recommend purchasing."* · a single aggregate "Recommended" grade.
 
 ---
 
@@ -65,18 +66,22 @@ carries strategic weight.
 
 ### Pack structure
 ```
-feedforward-vendor-review/              # repo + plugin root (plugin name: vendor-review)
-├── .claude-plugin/plugin.json
+vendor-review/                          # plugin name & local dir (GitHub: feedforward/vendor-review · marketplace: feedforward)
+├── .claude-plugin/
+│   ├── plugin.json
+│   └── marketplace.json                # this repo doubles as the public marketplace
 ├── README.md
+├── commands/
+│   └── vendor-evaluation.md            # ENTRY POINT — namespaced slash command; orchestrates the flow
+├── agents/                             # bundled subagent defs (5 research streams + brand discovery)
+│   └── research-{vendor-surfaces,technical-docs,community,thirdparty,compliance}.md · discover-branding.md
 ├── skills/
-│   ├── vendor-evaluation/              # ORCHESTRATOR — entry point
-│   │   └── SKILL.md
 │   ├── vendor-intake/                  # Phase 1 — adaptive Q&A
 │   │   └── SKILL.md
 │   ├── vendor-research/                # Phase 2 — BYO materials + parallel web fan-out
 │   │   └── SKILL.md + references/{source-playbook, evidence-standards}.md
 │   ├── vendor-capacity-assessment/     # Phase 3 — the six criteria (CORE)
-│   │   └── SKILL.md + references/{see,use,learn,change,adapt,exit,scoring-rubric}.md
+│   │   └── SKILL.md + references/{see,use,learn,change,adapt,exit}.md + scoring-scale.md
 │   ├── vendor-procurement-review/      # Phase 4 — Gartner courtesy layer
 │   │   └── SKILL.md + references/procurement-checklist.md
 │   └── vendor-report/                  # Phase 5 — branded HTML + variants + custom outputs
@@ -85,8 +90,15 @@ feedforward-vendor-review/              # repo + plugin root (plugin name: vendo
 │   ├── philosophy.md                   # evolved system prompt / POV
 │   └── voice-and-guardrails.md         # all cross-cutting rules (single source of truth)
 └── (runtime, in user CWD) ./vendor-evaluations/<vendor-slug>/
-        ├── intake.md  ├── dossier.md  ├── capacity-assessment.md
-        ├── procurement-review.md  ├── report.html  └── custom-*.{md,html}
+        ├── state.json                  # run-manifest: phase status, timestamps, artifact hashes
+        ├── materials/                  # user-provided documents
+        ├── intake.md                   # immutable after its checkpoint
+        ├── derived-criteria.md         # RFP/policy-extracted criteria (separate from intake.md)
+        ├── dossier.md  ├── capacity-assessment.md  ├── procurement-review.md
+        ├── technical-issues.md         # appended by every phase; feeds the feedback step
+        ├── report.html                 # canonical Full Report
+        ├── {brief,procurement-memo,strategic-capacity-memo,technical-deep-dive}.html
+        └── custom-*.{md,html}
 ```
 
 Each skill is small and independently testable. The shared spine guarantees consistent POV/guardrails.
@@ -95,7 +107,7 @@ Each skill is small and independently testable. The shared spine guarantees cons
 
 ## 4. Phase Flow & State
 
-The orchestrator (`vendor-evaluation`) drives gated phases. **State passes as inspectable artifact
+The entry command (`commands/vendor-evaluation.md`) orchestrates gated phases (via its namespaced slash command). **State passes as inspectable artifact
 files on disk**, so each phase is resumable and the executive can read every intermediate.
 
 ```
@@ -112,7 +124,7 @@ files on disk**, so each phase is resumable and the executive can read every int
 
 At each **checkpoint** the orchestrator summarizes the phase output and asks the exec to confirm or
 adjust before continuing. The exec can stop after any phase and resume later (artifacts persist).
-Re-running a phase overwrites only its own artifact.
+Re-running a phase overwrites its artifact and marks downstream artifacts stale (tracked in `state.json`).
 
 ---
 
@@ -178,18 +190,19 @@ Before touching the web, ask gently (with examples) for anything the exec alread
   SOC 2 report they were handed, MSA/contract.
 
 **Hand-holding to get files in** (assume they've never done this). The skill creates and names the exact
-folder — `./vendor-evaluations/<vendor>/materials/` — and offers OS-aware paths:
+folder — `./vendor-evaluations/<vendor-slug>/materials/` — and offers OS-aware paths:
 1. Drag the files in ("On Mac, drag them into this Finder folder: `<absolute path>`" + Windows/Linux equiv).
 2. Paste the text into chat.
 3. Point me at a path or link.
 4. *"Don't have anything? Fine — I'll work from public sources."* (never blocks)
 
 Then it **confirms receipt**: lists the folder, reads each file, summarizes, and clearly flags anything
-unreadable (offering the paste fallback). Handles PDF, Word, text, and screenshots; converts when needed.
+unreadable (offering the paste fallback). Reads PDF, text/Markdown, and screenshots natively; `.docx` is
+converted only if a converter is enabled (see §11) — otherwise it asks for a PDF or pasted text.
 
 Payoffs: provided docs enter the dossier as **primary-source evidence** (often non-public); an RFP/policy
-doc **feeds back to enrich intake** (extract added criteria + the org's compliance bar) and is reflected
-back to confirm.
+doc's extracted criteria are written to **`derived-criteria.md`** (kept separate from the immutable
+`intake.md`) and reflected back to confirm.
 
 ### 6b. Web fan-out (five parallel streams)
 Dispatch **parallel subagents**, one per stream, each running many WebSearch/WebFetch calls, targeted by
@@ -264,7 +277,8 @@ the score and evidence stand.
 
 ### Layer 3 — Score against their stated priorities
 A dedicated **"How [vendor] measures against your priorities"** section gives each exec-stated criterion
-(intake #3 + RFP-derived) a direct, cited verdict. Most personalized, most opinionated part.
+(intake #3 + `derived-criteria.md`) a direct, cited **scored assessment** (the literal word "verdict" is
+avoided by design). Most personalized, most opinionated part.
 
 ### No false certainty
 When evidence won't support a confident call, say so plainly in one of two registers, **always naming the
@@ -327,12 +341,14 @@ Offer three paths, in order:
    **confirm before using** ("are these right?").
 2. **Fail loudly** if not found/unsure → fall back and ask.
 3. **Feedforward-branded** (default look) or **manual entry**.
-Never silently apply guessed branding. Captures org name, logo (inlined as **base64** so the HTML stays
-self-contained), primary/accent colors (CSS variables), and a themeable confidentiality footer line.
+Never silently apply guessed branding. **Default branding is a styled text wordmark + color palette**
+(CSS variables) — fully self-contained and `Bash`-free; a raster logo is inlined only when supplied as a
+data URI (see §12.4). Also captures org name and a themeable confidentiality footer line.
 
 ### 9b. Full Report (always generated — the canonical record)
-One **self-contained HTML** (inlined CSS + logo, zero external deps, opens anywhere, prints to PDF via an
-`@media print` block, no JS) at `./vendor-evaluations/<vendor>/report.html`. Structure:
+One **self-contained HTML** (inlined CSS, optional logo as a data URI, zero external deps, opens anywhere;
+*styled for clean PDF when printed from the browser* via an `@media print` block, no JS — no `.pdf` file is
+produced) at `./vendor-evaluations/<vendor-slug>/report.html`. Structure:
 1. Cover/header — vendor, category, report title, version, today's date, branding.
 2. Executive Summary — Key Takeaway box + sentiment + "what kind of org this suits / doesn't" (no buy/don't-buy).
 3. Evaluation Overview — scorecard (counts + six dimensions; a profile, not a grade).
@@ -403,29 +419,146 @@ Three rules keep it honest (it's a **repackaging**, never a new analysis or a di
 - **Per-skill smoke tests** — intake hits all objectives; dossier has citations + evidence tiers + gap
   flags; assessment scores all six + against-priorities; report renders valid self-contained HTML across
   all variants.
-- **Guardrail lint** — scan generated outputs for forbidden patterns: buy/don't-buy phrasing, tier labels
-  ("Fortune 100"), uncited claims.
+- **Guardrail lint** — scan ALL generated artifacts (including `custom-*`) after every phase, blocking
+  checkpoint advancement on failure. Full rule + the do-not-over-fire guard in §12.5.
 
 ### README & distribution
 Public marketplace repo with `marketplace.json` + `plugin.json`; README covers the POV, two-command
-install (+ git-clone fallback), how to run (`/vendor-evaluation`), the phases, what you get, and a
+install (+ git-clone fallback), how to run (the namespaced `vendor-evaluation` command), the phases, what you get, and a
 privacy note (everything local; feedback opt-in).
 
 ### Closing step — feedback opt-in (privacy-first)
 After the report, ask — clearly and optionally — whether they'd share **with the Feedforward team** to
 improve the tool, with **granular consent**: feedback only / feedback + report / nothing (default).
 If they opt in: a short guided feedback Q&A (useful? accurate? wrong or missing? experience?) plus the
-**technical-issues log** the run quietly collected (fetch failures, unreadable files, gaps). **Delivery is
-a prefilled `mailto:` email to a Feedforward address or a feedback-form link the exec reviews and sends**
+**`technical-issues.md`** the run quietly collected (fetch failures, unreadable files, gaps). **Delivery is
+a prefilled `mailto:` carrying a short summary + the local path to a generated `feedback.md`, or a
+feedback-form link, that the exec reviews and sends**
 — nothing leaves their machine without an explicit send. No silent telemetry; the confidential report is
 shared only on explicit consent.
 
 ---
 
-## 11. Open Items for Implementation Planning
-- Exact Feedforward marketplace repo name/slug and feedback email/form endpoint.
-- Default Feedforward theme values (hex palette, fonts) extracted from the existing report design.
-- Whether `.docx` conversion relies on a bundled approach (e.g., pandoc/textutil) or native Read support.
-- Final wording of `philosophy.md` and `voice-and-guardrails.md` (carry forward the existing
-  `vendor_system_prompt.md` verbatim where still accurate; evolve where needed).
-```
+## 11. Open Items Still Needing a Human Decision
+*(Most former open items are now resolved in §12.)*
+- **Two adopted defaults — confirm or override:** bundled `agents/` for subagents (§12.1) and the
+  `state.json` run-manifest state model (§12.1). Implemented as recommended; both reversible.
+- **`.docx` + `Bash` posture (decide before Phase 2 / Phase 5 finalization):** day-one default is
+  **no `Bash`** → `.docx` is scoped out (accept PDF / paste / screenshots; fail loudly asking for a PDF
+  or pasted text), and a raster logo inlines only from a data URI. Enabling a narrowly-scoped `Bash`
+  (textutil / pandoc / base64) would add one-step `.docx` ingestion and raster-logo encoding.
+- **Feedback endpoint:** the Feedforward feedback email address or form URL.
+- **Default Feedforward theme:** hex palette + fonts — to be extracted from the existing sample reports
+  during the build.
+
+---
+
+## 12. Decisions Resolved from Multi-LLM Review (2026-06-18)
+
+Source: `docs/evaluations/IMPLEMENTATION-BRIEF.md`. Its **§0 governing rule is adopted**: the product is
+*maximally opinionated about trade-offs* and **never writes the literal buy/don't-buy sentence.** The
+reviewers' "verdict-drift" softening of `sentiment`, the scorecard counts, the "Against your priorities"
+section, and the pointed tone is **rejected** — those structures are the product and stay sharp. The
+lexical and structural items below are adopted.
+
+### 12.1 Architecture & packaging
+- **Entry point:** a namespaced slash **command** `commands/vendor-evaluation.md` orchestrates the phased
+  flow (it *is* the orchestrator; there is no separate orchestrator skill). It invokes the phase skills
+  and references assets via `${CLAUDE_PLUGIN_ROOT}`. The README documents the real namespaced invocation;
+  bare `/vendor-evaluation` claims are dropped.
+- **Subagents → bundled `agents/` definitions** (adopted default, overridable): one per research stream
+  + brand discovery, each with a system prompt, its own `allowed-tools`, and a structured output contract
+  (finding · source URL · access date · evidence tier). Chosen for repeatability and golden-fixture testing.
+- **State → `state.json` run-manifest** per workspace: phase status, timestamps, source-artifact hashes,
+  current phase. Artifact existence is **not** the phase signal. Re-running a phase marks downstream
+  artifacts **stale** and prompts regeneration.
+- **Back-edge (Phase 3 → 2):** collect all blocked scores → present at the checkpoint → targeted
+  re-research appends a "Targeted follow-up" section to `dossier.md` → re-run assessment. **Loop cap: 2
+  rounds**, then remaining gaps escalate to "questions for vendor" / "What we couldn't verify."
+- **Naming frozen:** GitHub `feedforward/vendor-review` · marketplace `feedforward` · plugin name & local
+  dir `vendor-review`.
+- **Manifests:** `plugin.json` (name `vendor-review`, version, description, author, + the command, skills,
+  and agents) and `marketplace.json` (owner `feedforward`, lists the plugin). Field values finalized in
+  the plan.
+- **`allowed-tools` (tight, public-plugin posture):** command + skills use `Read, Write, Edit, WebSearch,
+  WebFetch, Task` only. **No `Bash` by default** (see §11 for the file-format consequence).
+
+### 12.2 Intake (Phase 1)
+- Adaptive interview with a **soft cap of ~12 questions**, a lightweight progress indicator, and an early
+  **pause/resume** prompt.
+- **Stop condition:** every objective answered or explicitly N/A — don't pad to the cap.
+- **Two-axis read** after each answer — *specificity* (vague ↔ precise) and *fluency* (low ↔ high) —
+  selects scaffold-vs-mirror behavior.
+- **RFP/policy feedback:** extracted criteria go to a separate **`derived-criteria.md`**, referenced at
+  scoring/report time. **`intake.md` is immutable after its checkpoint** — never mutate a checkpointed
+  artifact.
+
+### 12.3 Scoring & honesty
+- **Calibration matrix (Layer 2 — emphasis only, never the score or facts):**
+
+  | Intake value | Concrete textual effect |
+  |---|---|
+  | Journey = Exploring | Escalate severity language on SEE/LEARN/CHANGE; add "especially costly at your stage" |
+  | Journey = AI-native | Foreground CHANGE/EXIT/ADAPT; assume fluency, trim definitions |
+  | Intent = stopgap / short horizon | EXIT still scores Not Met; add "less decisive given your short horizon — risk if it slips" |
+  | Intent = strategic / long horizon | Escalate EXIT/ADAPT to headline risks |
+  | Risk posture = productivity-first | Lead with USE; still report capacity risks in full |
+  | Risk posture = capability-first | Sharpen SEE/LEARN/CHANGE framing |
+  | Regulated data = HIPAA / EU / financial | Deepen procurement (BAA, EU AI Act, residency) |
+
+  Calibration changes wording and emphasis only; it never alters a score, removes a finding, or hedges it.
+- **"Against your priorities" rubric:** for each exec/RFP criterion → search the dossier for relevance →
+  score Met/Partially/Not/Insufficient with cited evidence + tier — the same discipline as the six criteria.
+- **Lexical:** Layer 3's output is a **"scored assessment," not a "verdict."**
+- **Gap-routing protocol:** (1) *findable with sharper search* → one targeted re-research pass; (2) *exec
+  may have it* → ask for the specific named document; (3) *only the vendor can answer* → "questions for
+  vendor." Try re-research **once**, then escalate. Every `Insufficient`/`Withheld` names a **specific
+  artifact** — no vague "more research needed."
+- **Two status vocabularies are deliberate:** capacity = *Met / Partially Met / Not Met / Insufficient
+  Information* (an evaluative judgment); procurement = *Available / Partial / Absent / Insufficient* (a
+  factual presence check). Documented once; not a defect.
+- **`scoring-scale.md`** holds the shared 4-point scale + label semantics; each criterion file carries its
+  own Met/Partially/Not-Met **boundary notes**.
+
+### 12.4 Report, files, formats
+- **Self-contained HTML build:** read `${CLAUDE_PLUGIN_ROOT}/skills/vendor-report/assets/theme.css` →
+  inline into a `<style>` block. **Default branding = a styled text wordmark + color palette** (fully
+  self-contained, `Bash`-free). A raster logo inlines **only** when supplied as a data URI; otherwise
+  text branding.
+- **"Prints to PDF" reworded:** the HTML is *styled for clean PDF when printed from the browser*
+  (`@media print`); **no `.pdf` file is generated.**
+- **Preset variant filenames:** `brief.html`, `procurement-memo.html`, `strategic-capacity-memo.html`,
+  `technical-deep-dive.html`; custom outputs `custom-<slug>.{md,html}`.
+- **Brand discovery timing:** attempt extraction (WebFetch of homepage / CSS / favicon) during research;
+  **confirm immediately, with a visual preview, and block report generation until confirmed.** Frequent
+  failure is expected → fail loudly → manual entry is the norm.
+- **`technical-issues.md`:** every phase appends failures (fetch errors, unreadable files, gaps); the
+  **entry command owns the closing feedback step.**
+- **Feedback delivery:** the `mailto:` carries a short summary + the local path to a generated
+  `feedback.md` (which bundles `technical-issues.md`) — no giant URL-encoded bodies.
+- **Slug rule:** `<vendor-slug>` = lowercase, hyphenated vendor name, confirmed with the exec; used
+  consistently in every path.
+
+### 12.5 Guardrail lint (sharpens §10)
+Built to enforce the §0 rule, **not** to suppress opinionation:
+- **Catch literal strings:** `buy`, `don't buy`, `purchase`, `recommend`, `should (move
+  forward|proceed|adopt|pass|skip)`, `verdict`, `overall grade`, `score: A/B/C`, tier labels (`Fortune
+  100/500`), and uncited claims.
+- **Structural no-false-certainty:** every `Insufficient`/`Withheld` must be followed (within ~N
+  characters) by a named specific artifact.
+- **Fail-loudly completeness:** every gap in `dossier.md` / `capacity-assessment.md` /
+  `procurement-review.md` must appear in the report's "What we couldn't verify."
+- **Runs after every phase; blocks checkpoint advancement on failure; covers ALL artifacts including
+  `custom-*`.**
+- **Do-not-over-fire:** must pass the spec's ✅ examples — never flag `sentiment`, the counts, blunt
+  risk-naming, or "strong fit for orgs prioritizing X." The lint is tested against those examples.
+
+### 12.6 Carry-forward hygiene (`philosophy.md` / `voice-and-guardrails.md`)
+Evolving `source_docs/vendor_system_prompt.md`:
+- **Rename score labels** Yes/Partially/No/Insufficient → Met/Partially Met/Not Met/Insufficient
+  Information, with a one-line semantic-mapping note.
+- **Remove tier labels** ("Fortune 100" → "senior leaders").
+- **Keep verbatim:** "state conclusions first," "no corporate hedging," "do not infer or speculate,"
+  "present trade-offs, not verdicts," and the "What Excellent Vendors Look Like" bullets.
+- **Add** the §0 positive + negative opinionation examples and the adaptive-Q&A / fail-loudly /
+  no-false-certainty rules as the single source of truth.
