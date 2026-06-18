# Claude Code Mechanics & Feasibility Verification — Vendor Evaluation Skill Pack Revision
**Model:** OpenAI model ID not exposed by runtime

## Verdict on the revision
The revision resolves most of the mechanics/blocking issues: it adds a command-file entry point, bundled `agents/`, `state.json`, explicit no-`Bash` posture, HTML inlining, naming, variant filenames, and `technical-issues.md`, while preserving the intentionally sharp/opinionated product posture from IMPLEMENTATION-BRIEF §0. A few mechanics gaps remain: the spec still contains a bare `/vendor-evaluation` flow reference despite saying bare claims were dropped, still promises “parallel” execution as a guarantee, leaves one stale-output sentence in §10, does not fully specify manifest contents, and leaves the custom-output “unlimited/any time” wording app-like rather than re-invocation-based. One new regression was introduced: the tight allowed-tools list omits a directory-listing/discovery tool even though §6a requires listing the materials folder.

## Findings checklist (your earlier findings, each classified)
- **A-001** [Blocker]: Entry point was modeled as a skill instead of a slash command file.
  - **Status:** RESOLVED
  - **Evidence:** Current spec adds `commands/vendor-evaluation.md` in the pack tree as “ENTRY POINT” (lines 74-75) and states the command orchestrates phases (lines 110-111, 465-468).

- **A-002** [High]: Bare `/vendor-evaluation` and missing exact namespaced invocation.
  - **Status:** PARTIALLY
  - **Evidence:** The revision adds namespaced-command language in the tree and README section (lines 75, 425-428) and §12.1 says bare `/vendor-evaluation` claims are dropped (lines 465-468). But the phase-flow diagram still starts with bare `/vendor-evaluation` (line 114), and the README wording still does not show the exact installed namespaced slash syntax.
  - **Note:** This is still the main README/run-command consistency issue.

- **A-003** [High]: Orchestration was assigned to a skill rather than a reliable command contract.
  - **Status:** RESOLVED
  - **Evidence:** The spec now says the entry command orchestrates gated phases (lines 110-111) and §12.1 clarifies it is the orchestrator, invokes phase skills, and references assets via `${CLAUDE_PLUGIN_ROOT}` (lines 465-468).

- **A-004** [High]: Promised subagents were not bundled as concrete agent definitions.
  - **Status:** RESOLVED
  - **Evidence:** The pack tree now includes `agents/` with five research streams plus brand discovery (lines 76-77), and §12.1 specifies bundled agent definitions with system prompts, per-agent `allowed-tools`, and structured output contracts (lines 469-471).

- **A-005** [Medium]: “Parallel” fan-out was stated as a platform guarantee.
  - **Status:** MISSED
  - **Evidence:** §6b still says “Dispatch **parallel subagents**” (lines 207-209). The revision adds bundled agents but does not reword the guarantee to allow Task execution to be concurrent or serialized.

- **A-006** [High]: `allowed-tools` were undefined.
  - **Status:** PARTIALLY
  - **Evidence:** §12.1 now defines a tight command/skills allowlist: `Read, Write, Edit, WebSearch, WebFetch, Task`, with no `Bash` by default (lines 483-484), and agent definitions are required to have their own allowlists (lines 469-471). However, the resulting allowlist appears too narrow for §6a’s required folder listing; see A-N01.

- **A-007** [High]: Resumability lacked a manifest/stale-output model.
  - **Status:** PARTIALLY
  - **Evidence:** The runtime tree now includes `state.json` with phase status, timestamps, and artifact hashes (lines 92-99), §4 says rerunning marks downstream artifacts stale (lines 125-127), and §12.1 says artifact existence is not the phase signal (lines 472-474). But §10 still repeats the old weaker rule: “re-running a phase overwrites only its artifact” (lines 412-413), leaving an internal contradiction.

- **A-008** [Medium]: `.docx`/screenshot ingestion over-promised conversion/OCR support.
  - **Status:** RESOLVED
  - **Evidence:** §6a now limits day-one ingestion to PDF, text/Markdown, and screenshots, and says `.docx` is converted only if a converter is enabled; otherwise the user is asked for PDF or pasted text (lines 199-201). §11 explicitly adopts no `Bash` by default and scopes `.docx` out unless a converter is enabled (lines 446-449).

- **A-009** [Medium]: Self-contained HTML did not define CSS/logo inlining mechanics.
  - **Status:** RESOLVED
  - **Evidence:** §9a/§9b now limit default branding to text/CSS and data-URI logos only (lines 344-350), and §12.4 specifies reading `theme.css` from `${CLAUDE_PLUGIN_ROOT}` and inlining it into `<style>` with raster logos only when already supplied as data URIs (lines 523-527).

- **A-010** [Medium]: Naming/install metadata was inconsistent and unresolved.
  - **Status:** RESOLVED
  - **Evidence:** The tree freezes plugin/local dir and marketplace naming (line 69), install commands use `feedforward/vendor-review` and `vendor-review@feedforward` (lines 56-60), §12.1 freezes GitHub `feedforward/vendor-review`, marketplace `feedforward`, and plugin/local dir `vendor-review` (lines 478-479), and §11 no longer lists the marketplace slug as open (lines 442-452).

- **A-011** [Medium]: `plugin.json`/`marketplace.json` contents were not implementation-ready.
  - **Status:** PARTIALLY
  - **Evidence:** The tree now includes both manifest files (lines 70-72), and §12.1 says `plugin.json` includes name, version, description, author, command, skills, and agents, while `marketplace.json` has owner `feedforward` and lists the plugin (lines 480-481). It still defers field values to “the plan” rather than specifying the actual manifest entries/versioning in this spec (line 481).

- **A-012** [Medium]: The technical-issues log was referenced but not defined as an artifact.
  - **Status:** RESOLVED
  - **Evidence:** The runtime tree now includes `technical-issues.md` (line 98), the feedback step references it directly (lines 433-436), and §12.4 requires every phase to append failures and assigns feedback ownership to the entry command (lines 535-536).

- **A-013** [Medium]: “Unlimited; any time” custom outputs implied a persistent app/daemon rather than re-invocation.
  - **Status:** MISSED
  - **Evidence:** §9d still says custom outputs are “Unlimited; any time after the assessment exists” (lines 380-385). The revision adds filenames in §12.4 (lines 530-531) but does not define re-running the command against an existing workspace or how the workspace is discovered/selected.

## New issues introduced by the revision (if any)
- **ID:** A-N01, **Severity:** High, **Section:** §6a / §12.1, **Issue:** The new tight allowed-tools posture appears to block a required materials-ingestion operation. §6a requires the skill to “lists the folder” after the user adds materials (lines 199-201), but §12.1 allows only `Read, Write, Edit, WebSearch, WebFetch, Task` for command + skills (lines 483-484). In Claude Code, listing/discovering directory contents requires an explicit directory/discovery tool such as `LS`/`Glob` or `Bash`; `Read` alone is not enough to enumerate an unknown folder. **Fix:** add `LS` and likely `Glob` to the command/research/report allowlist, or rewrite §6a to require users to provide exact file paths instead of folder listing.

## Anything still genuinely open
- Specify the exact installed namespaced slash command syntax everywhere; remove the remaining bare `/vendor-evaluation` in §4.
- Reword “parallel subagents” so tests/UX do not depend on true concurrency.
- Propagate the `state.json` stale-downstream rule into §10’s resumability bullet.
- Fill in actual `plugin.json` / `marketplace.json` field values or point to a concrete manifest plan.
- Rephrase custom outputs as re-invocable against an existing workspace, including workspace discovery/selection.
