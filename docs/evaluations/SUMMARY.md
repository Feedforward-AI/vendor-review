# Vendor Evaluation Skill Pack — Consolidated Spec Review

**Spec:** `docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md` (431 lines)
**Date:** 2026-06-18
**Method:** 5 independent reviewers, one per model family, each with a distinct lens, all working from a shared brief (`evaluator-brief.md`). Per-lens findings: `A-mechanics.md`, `B-consistency.md`, `C-completeness.md`, `D-fidelity.md`, `E-guardrails.md`.

| Lens | Model (assigned) | File | Findings |
|---|---|---|---|
| A — Claude Code mechanics & feasibility | `openai-codex/gpt-5.5` | A-mechanics.md | 13 |
| B — Internal consistency & terminology | `zai/glm-5.2` | B-consistency.md | 15 |
| C — Completeness & implementability | `opencode-go/deepseek-v4-pro` | C-completeness.md | 19 |
| D — Source fidelity & POV drift | `opencode-go/kimi-k2.7-code` | D-fidelity.md | 15 |
| E — Guardrail coherence & UX safety | `opencode-go/qwen3.7-plus` | E-guardrails.md | 15 |

> Note: each reviewer's self-reported `Model:` line is unreliable (the agent can't introspect its own model). The model column above is what was actually assigned.

## Overall verdict
The product concept, POV architecture, and honesty rules are widely praised as **coherent and distinctive**. But the spec is **not yet implementation-ready** in its current form: three issues make the pack **unbuildable as literally described** (entry point, subagents, orchestrator), and a cluster of high-severity issues around the **no-verdict guardrail**, **guardrail enforcement**, and **naming/packaging** will produce real defects if implemented verbatim. Consensus across independently-assigned models was high on the top problems.

---

## 🔴 Blockers (spec is unimplementable / self-contradictory as written)

### BLK-1 — The `/vendor-evaluation` entry point has no command file  *(A-001, B-006, C-001 — 3 independent reviewers)*
The spec exposes `/vendor-evaluation` as the run command (§3, §4, §10) but the pack tree (§3) contains **only `skills/vendor-evaluation/SKILL.md`** and no `commands/vendor-evaluation.md`. In Claude Code a slash command requires a command file; a `SKILL.md` does **not** create `/foo`. The README install→run path is broken as specified.
**Fix:** add `commands/vendor-evaluation.md` (that drives the flow and references the skills/assets), and update §3/§4/§10.

### BLK-2 — Promised "parallel subagents" have no definitions *(A-004, B-005, C-002 — 3 reviewers)*
Phase 2 (§6b) "dispatches parallel subagents, one per stream," but §3's tree has **no `agents/` directory**. No system prompts, tool allowlists, or output contracts for the five research streams exist. An implementer has nothing concrete to build.
**Fix:** add `agents/` definitions for the streams (system prompt + tool allowlist + output format + evidence-tier tagging), **or** explicitly rewrite §6b to use inline Task-tool calls with inline prompts.

### BLK-3 — The orchestrator's phase-gating / resumability mechanism is undefined *(A-003, A-007, C-003, E-015 — 4 reviewers)*
The whole "guided phased evaluation with checkpoints, resume, and 3→2 back-edge" depends on an orchestrator behavior the spec never specifies: no state machine, no phase-status file, no checkpoint mechanics. Skills are **advisory** — they can't *guarantee* "re-running a phase overwrites only its own artifact" (§4/§10) or correct resume. Worse, the back-edge can make downstream artifacts silently stale (cites old dossier lines).
**Fix:** define a concrete mechanism (e.g., a `state.json`/run-manifest with phase status + artifact hashes + a staleness/invalidation rule on rerun + back-edge protocol with a loop cap).

---

## 🟠 High (will cause real defects / confusion)

### H-1 — Plugin command namespace not specified *(A-002)*
Even with a command file, `/vendor-evaluation` is wrong: plugin commands are **namespaced** to the plugin. The actual invocation users must type is never stated.

### H-2 — No `allowed-tools` defined anywhere *(A-006)*
The pack needs WebSearch/WebFetch/Task/Read/Write/Edit (and maybe Bash for docx/base64). No skill/command declares a tool matrix → permissions will block features or be dangerously broad.

### H-3 — Naming triple contradicts itself and is re-opened in §11 *(A-010, B-001, B-002, C-019)*
`feedforward/vendor-review` (marketplace-add) vs `feedforward-vendor-review` (repo dir) vs plugin name `vendor-review` (§3) vs §11 "marketplace repo name/slug still open." The single most user-facing artifact (install command) depends on an undecided name. Freeze a naming table; remove from §11.

### H-4 — Verdict-drift: the report's opening stack delivers a buy/don't-buy in everything but name *(D-002, D-009, E-001, E-002, E-009 — the single biggest theme)*
The spec bans a verdict (§1) then builds the structures that produce one:
- §7 Layer 3 literally calls its output a **"direct, cited verdict"** on the exec's own criteria.
- **Sentiment** (positive/neutral/negative), inherited from the source prompt, sits in the Key Takeaway box — its source definitions ("well-suited with minimal concerns") are verdict-adjacent.
- The **scorecard counts** ("4 Met, 1 Partial…") are psychologically a grade.
- Combined, Executive Summary + scorecard + "Against your priorities" = a de-facto recommendation to any non-technical exec.
**Fix:** rename "verdict"→"scored assessment"; either drop sentiment or redefine it to describe *evidence character* (not suitability); de-emphasize aggregate counts (radar/list + caption that "counts ≠ recommendation"); add a persistent "findings only — decision is yours" framing.

### H-5 — The guardrail lint (§10) is undefined and out of scope *(E-004, E-003, E-012)*
"Scan for forbidden patterns" is mentioned but has **no mechanism, no patterns, no scope, and no failure action**. It is described only for the canonical report, so custom outputs (H-6) escape it entirely. No-false-certainty and fail-loudly are LLM-self-policed with no structural check (e.g., that every "Insufficient" names a *specific* artifact, or that every gap reaches §9b #8).
**Fix:** define the lint concretely (forbidden-string regex; structural check that each Insufficient names an artifact; cross-check that gaps in dossier/assessment appear in "What we couldn't verify"); run after every phase, block checkpoint on failure; **extend to all artifacts including custom-*.***

### H-6 — "Unlimited" custom outputs are gameable for advocacy + have no format taxonomy *(C-008, E-003, E-012, C-018)*
"Write an email convincing my boss to buy this" is handled by a single prompt rule with no enforcement; a motivated exec iterates until they get advocacy-adjacent text, saved as `custom-*.md` outside the lint. Also: no taxonomy for choosing `.md` vs `.html` vs bullets (a "slide outline" fits none).
**Fix:** cap or soft-warn on repeated recommendation-framing; mandatory footer on every custom cut linking to the canonical report; define a format decision tree; extend lint to custom outputs.

### H-7 — Calibration rules are *effects*, not implementable rules *(C-006)*
"AI-journey stage → calibrates emphasis on SEE/LEARN/CHANGE" — but *how*? The one concrete example (6-month stopgap) is a single data point. Two implementers would diverge wildly.
**Fix:** provide a calibration matrix (intake dimension value → concrete textual modification per affected section).

### H-8 — 3-way gap routing has no decision criteria *(C-005, E-005)*
The table (§6b) names three buckets but never says how to classify a gap (is a missing SOC2 "findable," "exec might have," or "vendor-only"?). Misrouting breaks the user experience.
**Fix:** a decision protocol + "try re-research once, then escalate" fallback.

### H-9 — Brand-asset discovery mechanism unspecified + confirmation timing gap *(C-007, E-008)*
"Logo + colors from the company domain" with no method (WebFetch + parse? favicon? CSS vars?). Logos are often SVG/CSS background images → non-trivial. Also discovery (Phase 2) and confirmation (Phase 5) are phases apart, so late/weak confirmation is functionally "silent" — contradicting "never silently apply guessed branding."
**Fix:** specify an extraction approach (accept it fails often → make fail-loudly the norm), and move confirmation to immediately after discovery with a visual preview blocking report gen.

### H-10 — Adaptive intake is 100% outcome-described, 0% specified *(C-004, E-011)*
"Reasoned against after every answer," skip/drop/reorder — no question bank, no branching logic, no satisfaction criteria, no fluency rubric, **no question cap** → abandonment risk for first-time self-serve execs.
**Fix:** per-objective core questions + "I'm not sure" scaffolding; stop conditions; a fluency/specificity rubric; a soft question cap + progress indicator + early pause/resume prompt.

### H-11 — RFP-derived criteria feedback loop contradicts phase ordering *(C-009)*
§6a says BYO materials "feed back to enrich intake," but Intake (Phase 1) is checkpointed *before* Research (Phase 2). No loop-back in the flow; updating `intake.md` later violates "overwrite only own artifact."
**Fix:** either an explicit intake-enrichment sub-step (noted exception) or store derived criteria in a separate file referenced at report time (keep `intake.md` immutable post-checkpoint).

### H-12 — Score-label rename (Yes/No → Met/Not-Met) isn't flagged as a required evolution *(B-015, C-016, D-001, D-007 — 4 reviewers)*
§11 says carry `vendor_system_prompt.md` "verbatim where accurate" — but the source uses Yes/Partially/No, and the spec mandates Met/Not-Met. A literal carry re-imports retired labels into the "single source of truth."
**Fix:** §11 must explicitly enumerate required evolutions: label rename; Fortune-100 ban; and add a one-line mapping note in each criterion file + rubric.

---

## 🟡 Medium

- **M-1 — `scoring-rubric.md` defined two ways.** §3 lists it as a 7th reference file; §7 says each criterion file embeds its own rubric. *(B-003)*
- **M-2 — Preset report variants (§9c) have no filename convention** and aren't in the §3/§4 artifact manifest (only `report.html` + `custom-*`). The §10 smoke test has no targets. *(B-004)*
- **M-3 — Two colliding status vocabularies.** Capacity: Met/Partial/Not/Insufficient. Procurement: Available/Partial/Absent/Insufficient. "Partial"/"Insufficient" mean different things across them. *(B-007)*
- **M-4 — Self-contained HTML inlining step undefined.** "Zero external deps / inlined base64" but `theme.css` is separate and logos are remote; no build step that inlines them. *(A-009)*
- **M-5 — `.docx` / screenshot conversion unaddressed** (§6a promises it; §11 leaves docx open; Claude Code Read doesn't parse docx). *(A-008, C-011)*
- **M-6 — "`prints to PDF` via `@media print`" is misleading** — that styles browser printing, it doesn't produce a `.pdf`. *(C-013)*
- **M-7 — `mailto:` length limit** will truncate the feedback Q&A + technical-issues log. *(C-015)*
- **M-8 — Technical-issues log** (§10) isn't in the artifact tree and no component owns it; closing/feedback step has no owning skill. *(A-012, B-013)*
- **M-9 — `plugin.json` / `marketplace.json` contents unspecified;** marketplace-repo vs plugin-repo unclear. *(A-011)*
- **M-10 — Back-edge Phase 3→2 protocol undefined:** who triggers, where results land, no loop cap. *(C-017, E-015)*
- **M-11 — Two registers not reconciled:** gentle intake vs blunt analyst — both from the source; spec never says which applies where. *(D-004, D-015)*
- **M-12 — "Against your priorities" methodology undefined** for arbitrary exec criteria (no rubric like the six have). *(C-010)*
- **M-13 — Need-first / no-vendor-named path** is mentioned but has no flow or exit criteria (and §4 already requires name+URL before Phase 1). *(C-014)*
- **M-14 — No-tier-label rule scope ambiguous** (outputs only vs internal spine files); source still says "Fortune 100." *(E-010)*
- **M-15 — "Confirm or **adjust**" at checkpoints** invites adjusting *findings*, breaching the non-negotiable framework via the spec's own mechanism. *(E-007)*
- **M-16 — Framework "non-negotiable" has no structural backstop** — can be worn down conversationally; disagreements need to be recorded visibly, not silently absorbed. *(E-006)*
- **M-17 — Source "What Excellent Vendors Look Like" + several tone rules** not explicitly carried to the shared spine. *(D-003, D-008, D-015)*

---

## 🟢 Low / Nit (selected; full list in per-lens files)
- Workspace path drift: `<vendor-slug>` vs `<vendor>` used interchangeably *(B-008, C-012)*.
- "Gartner" trademark used as a generic adjective inconsistently; §10 lint doesn't cover it *(B-009)*.
- "Against your priorities" has 3 different names across §5/§7/§9b *(B-010)*.
- Strategic Capacity Memo silently omits USE/ADAPT (2 of 6) — needs justification as intentional scoping *(B-011)*.
- Smoke tests described for only 4 of 6 skills (orchestrator + procurement missing) *(B-014)*.
- Orphaned reference files `source-playbook.md` and `branding-guide.md` declared in §3 but never cited in §6/§9 *(B-012)*.
- AI-journey labels (Exploring/…/AI-native) function as a maturity hierarchy, lightly in tension with the no-hierarchy ethos *(E-013)*.
- "Quietly collected" technical-issues log is a minor privacy-trust tension for this audience *(E-014)*.
- Symmetric guardrail examples missing (only the negative ✅/❌ case is shown; no positive counter-example) *(D-012)*.

---

## What the reviewers agreed is **solid** (keep)
- POV-first architecture (capacity lens = core, procurement = courtesy) is coherent and traceable through every phase — all 5 reviewers.
- The six-criteria framework (SEE/USE/LEARN/CHANGE/ADAPT/EXIT) is count-consistent everywhere; criteria definitions faithfully match the source prompts' structure.
- Evidence tiers (Independent / Vendor claim / Provided doc) — clean, operational, lint-checkable; a genuine strengthening of the source's "claims ≠ evidence."
- Honesty rules (no false certainty, Tentative/Withheld, fail loudly, name the gap) are precisely worded — *if* enforced.
- Resumability via on-disk artifacts is the right foundation (the gap is the *mechanism*, not the design).
- Privacy-first feedback (opt-in, granular, explicit send, no telemetry) is correctly architected.
- The Layer-2 calibration *model* (emphasis flexes, scores don't) is elegant; the 6-month-stopgap example is concrete.
- Procurement cross-links back to the six criteria keep the courtesy layer from becoming a rival framework.

---

## Recommended order of operations
1. **Fix the 3 blockers first** — without them nothing runs: command file (BLK-1), subagent definitions or inline-Task rewrite (BLK-2), orchestrator/state mechanism (BLK-3).
2. **Resolve H-3 (naming) + H-1 (namespace) + H-2 (allowed-tools)** together — they're all "packaging/permissions" and block the install→run test.
3. **Confront H-4 (verdict-drift) head-on** — it's a product-identity decision (drop/redefine sentiment, rename "verdict," de-emphasize counts) and it's the most-reported issue.
4. **Make the guardrails structural (H-5) and extend to custom outputs (H-6).**
5. Then the Medium cluster: filename conventions (M-2), status vocab (M-3), inlining (M-4), docx (M-5), back-edge protocol (M-10), calibration matrix (H-7), gap-routing protocol (H-8).
6. Spec the intake (H-10) and brand discovery (H-9) enough to be implementable.
7. Sweep Low/Nit for terminology consistency once the above settle.

## Open questions for the human (highest-leverage)
1. Is the **sentiment label** a deliberate soft signal to keep, or a legacy to retire? (H-4 / E Q1) — single highest-impact product decision.
2. **Bundled subagents vs inline Task calls?** (BLK-2) — determines the §3 tree and whether `agents/` exists.
3. What is the **orchestrator state model**? (BLK-3) — state file, artifact-existence checks, or Task-driven sub-skills?
4. Should custom outputs be **shareable independently** of the canonical report? (H-6 / E Q4) — determines mandatory footer/link policy.
5. **`.docx` support on day one**, or scope it out with paste/PDF fallback? (M-5) — must be decided before Phase 2.
