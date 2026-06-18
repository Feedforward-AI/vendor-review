# Claude Code Mechanics & Technical Feasibility Review — Vendor Evaluation Skill Pack
**Model:** OpenAI model ID not exposed by runtime

## Summary
The spec has a coherent product flow, but several core Claude Code mechanics are mis-modeled. The most serious issue is that it documents `/vendor-evaluation` as if a `SKILL.md` creates a slash command; in Claude Code, a command file is required, and plugin commands are namespaced. The design also over-promises parallel subagent behavior, file conversion, deterministic resumability, and manifest/install details without specifying the concrete plugin assets needed to make those claims buildable.

## Findings

- **ID:** A-001
- **Severity:** Blocker
- **Section(s):** §3, §4, §10
- **Issue:** The primary entry point is described as `/vendor-evaluation`, but the pack structure only includes `skills/vendor-evaluation/SKILL.md` as the “ORCHESTRATOR — entry point” (§3) and the flow/README both tell users to run `/vendor-evaluation` (§4, §10). A Claude Code skill directory does not create a slash command; a slash command requires a command file under `commands/`.
- **Why it matters:** As written, the documented run path will not exist after installation. Users following the README would not be able to start the product through the promised command.
- **Suggested fix:** Add a plugin command file, e.g. `commands/vendor-evaluation.md`, that starts the workflow and instructs Claude to use the bundled skills/assets. Update the pack structure, README requirements, and flow diagram accordingly.

- **ID:** A-002
- **Severity:** High
- **Section(s):** §3, §4, §10
- **Issue:** Even if a command file is added, the spec repeatedly documents a bare `/vendor-evaluation` command (§4, §10). The mechanics brief states plugin commands are namespaced to the plugin. The spec does not state the actual installed command name/syntax users should invoke.
- **Why it matters:** The command UX and README copy may be wrong even after adding `commands/vendor-evaluation.md`, causing install/run confusion and failed smoke tests.
- **Suggested fix:** Specify the exact plugin command invocation for Claude Code’s plugin namespace, and make every mention consistent. If a bare command is required, document an explicit project-level shim as a separate optional step.

- **ID:** A-003
- **Severity:** High
- **Section(s):** §3, §4, §5–§9
- **Issue:** The spec says the `vendor-evaluation` skill “drives gated phases” (§4) and that each phase is a separate skill (§3), but skills are advisory instructions loaded by model discretion; one skill cannot reliably force another skill to load or behave like a programmatic dispatcher.
- **Why it matters:** The phased orchestration, checkpoints, and handoffs are the product backbone. If implemented only as a collection of skills, phase execution can be inconsistent and hard to test.
- **Suggested fix:** Put the orchestration contract in the new command file: explicitly read/consult the relevant `SKILL.md` and reference files by `${CLAUDE_PLUGIN_ROOT}` path for each phase, define the artifact inputs/outputs, and require checkpoint prompts before continuing.

- **ID:** A-004
- **Severity:** High
- **Section(s):** §3, §6b, §10
- **Issue:** Phase 2 promises “Dispatch parallel subagents, one per stream” (§6b), but the pack structure includes no `agents/` directory or subagent definition files (§3). The only bundled assets are `skills/` and `shared/`.
- **Why it matters:** Without bundled agent definitions, there is no concrete system prompt/tool allowlist for the five research streams, and the implementation cannot deliver the claimed stream-specific subagents in a repeatable way.
- **Suggested fix:** Either add `agents/` definitions for the five research streams plus the brand-discovery task, or rewrite the spec to say the command/skill may use generic Task calls with inline prompts rather than bundled custom subagents.

- **ID:** A-005
- **Severity:** Medium
- **Section(s):** §6b, §7, §10
- **Issue:** The spec treats “parallel” fan-out as a capability guarantee (§6b), while Claude Code can request multiple Task invocations but the platform/harness may serialize them and does not guarantee true concurrency.
- **Why it matters:** Runtime, UX expectations, failure handling, and tests may be designed around a concurrency guarantee the platform does not provide.
- **Suggested fix:** Rephrase to “request up to five Task-based research streams, which may run concurrently or be serialized,” and make tests assert merged output quality rather than true parallel execution.

- **ID:** A-006
- **Severity:** High
- **Section(s):** §3, §6b, §10
- **Issue:** The spec does not define `allowed-tools` for any skill or command, despite requiring WebSearch/WebFetch, Task subagents, file reads, directory listing, artifact writes, and possibly shell-based conversion/base64 operations (§6a, §6b, §9). 
- **Why it matters:** Claude Code permissions are part of buildability. Missing tool allowlists can prevent research, artifact creation, or subagent fan-out, and overbroad implicit permissions create a security/product risk.
- **Suggested fix:** Add a per-skill/per-command tool matrix. At minimum specify whether the entry command and research skill need `Task`, `WebSearch`, `WebFetch`, `Read`, `Write`/`Edit`, and whether `Bash` is allowed for conversion/base64; avoid `Bash` unless required and tightly justified.

- **ID:** A-007
- **Severity:** High
- **Section(s):** §4, §10
- **Issue:** “The exec can stop after any phase and resume later” and “Re-running a phase overwrites only its own artifact” (§4, repeated in §10) are stated as deterministic guarantees, but the spec defines no state manifest, phase status file, stale-output invalidation, backup behavior, or concurrency/partial-write strategy.
- **Why it matters:** Artifact files make resumability possible, but not automatically safe. Re-running intake or research can make downstream `capacity-assessment.md`, `procurement-review.md`, and `report.html` stale while still present.
- **Suggested fix:** Add a small state file such as `state.json` or `run-manifest.md` containing phase status, timestamps, source artifact hashes, and current phase. On phase rerun, mark downstream artifacts stale or require explicit regeneration; write via temp files then rename where possible.

- **ID:** A-008
- **Severity:** Medium
- **Section(s):** §6a, §11
- **Issue:** Phase 2 says the skill “Handles PDF, Word, text, and screenshots; converts when needed” (§6a), but §11 leaves `.docx` conversion unresolved and does not address screenshot OCR. Claude Code/plugin mechanics do not provide a guaranteed bundled conversion/OCR pipeline by default.
- **Why it matters:** This is a user-facing promise at the materials-ingestion step. If conversion fails, the workflow can lose key evidence or appear broken to nontechnical executives.
- **Suggested fix:** Downgrade the promise unless implementation planning selects supported mechanisms. Specify supported file types, fallbacks, and dependencies: native read where available, paste fallback for unsupported documents, optional local tools if detected, and explicit “unreadable” routing.

- **ID:** A-009
- **Severity:** Medium
- **Section(s):** §9a, §9b
- **Issue:** The report is promised as self-contained HTML with inlined CSS and base64 logo (§9b), while the bundle stores `report-template.html` and separate `theme.css` (§3, §9b) and auto-discovers external logos/colors (§9a). The spec does not define the build step that inlines CSS or converts the logo to a data URI.
- **Why it matters:** The “zero external deps, opens anywhere” guarantee depends on exact asset handling. Without a concrete generation procedure and tool permissions, outputs may accidentally reference plugin-local CSS, remote logos, or unreadable assets.
- **Suggested fix:** Specify that the report builder reads `${CLAUDE_PLUGIN_ROOT}/skills/vendor-report/assets/theme.css`, embeds it in a `<style>` block, and only uses a logo if it has been copied to the workspace and encoded as a data URI; otherwise use text branding or a confirmed manual asset.

- **ID:** A-010
- **Severity:** Medium
- **Section(s):** §3, §10, §11
- **Issue:** Naming and install metadata are not settled: §3 shows marketplace add `feedforward/vendor-review`, install `vendor-review@feedforward`, repo/plugin root `feedforward-vendor-review`, and plugin name `vendor-review`; §11 still lists the exact marketplace repo name/slug as open.
- **Why it matters:** Marketplace slug, plugin name, repository name, command namespace, and README install commands are coupled. Leaving them unresolved while claiming “Approved design → ready for implementation planning” risks implementing manifests and docs that do not install as documented.
- **Suggested fix:** Resolve and freeze a naming table before implementation: GitHub repo, marketplace name, plugin `name`, install command, command namespace, artifact folder default slug, and any display name.

- **ID:** A-011
- **Severity:** Medium
- **Section(s):** §3, §10
- **Issue:** The spec names `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` (§3, §10) but does not specify their required contents or how the marketplace points at the plugin. It also says the marketplace is public but does not distinguish the marketplace repo from the plugin repo.
- **Why it matters:** Plugin installability is a central requirement. A design that omits manifest requirements can pass product review but fail at the first `/plugin marketplace add` or `/plugin install` test.
- **Suggested fix:** Add an implementation-ready packaging subsection with the intended `plugin.json` fields, marketplace entry, versioning policy, and whether the marketplace repo is the same as or separate from the plugin repo.

- **ID:** A-012
- **Severity:** Medium
- **Section(s):** §10
- **Issue:** The closing step references a “technical-issues log the run quietly collected” (§10), but the runtime artifact tree (§3) does not include such a file and no phase specifies how issues are appended, summarized, or shared.
- **Why it matters:** Feedback and debugging depend on persistent cross-phase state. Without an explicit artifact, issues discovered by research/file conversion may be lost between phases or sessions.
- **Suggested fix:** Add `technical-issues.md` or include an `issues` section in the run manifest. Require every phase to append fetch failures, unreadable files, conversion failures, and research-stream failures there.

- **ID:** A-013
- **Severity:** Medium
- **Section(s):** §9d
- **Issue:** Custom outputs are described as “Unlimited; any time after the assessment exists” (§9d). In Claude Code this can only mean the command/skill can generate more files when invoked again with the existing workspace; there is no persistent daemon or automatic availability after the original conversation ends.
- **Why it matters:** Users may expect a durable app-like feature rather than a re-invocable Claude Code workflow. It also affects resumability and command design.
- **Suggested fix:** Rephrase to “Users can re-run the report command against an existing workspace to request additional custom outputs,” and define how the command discovers/selects the workspace.

## Strengths (brief)
- The spec correctly keeps runtime artifacts in the user CWD and treats installed plugin contents as read-only (§3).
- `${CLAUDE_PLUGIN_ROOT}` is the right mechanism for reading bundled shared files/templates from an installed plugin (§3).
- The use of disk artifacts for intake, dossier, assessment, procurement review, and report is the right foundation for resumability (§4).
- The privacy model avoids silent telemetry and requires explicit user send via mail/form (§10).
- The self-contained no-JS HTML target is mechanically feasible if the asset inlining process is specified (§9b).

## Open questions for the human
- What is the exact installed plugin command syntax Claude Code will expose for this plugin?
- Should the five research streams be custom bundled subagents, generic Task calls with inline prompts, or sequential searches inside the research skill?
- Is `Bash` acceptable for local conversion/base64 tasks, or must the pack operate without shell access?
- Are the marketplace repo and plugin repo the same repository or separate repositories?
- What file formats must be supported on day one versus routed to paste/manual fallback?
