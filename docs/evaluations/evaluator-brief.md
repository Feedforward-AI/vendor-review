# Evaluator Brief — Vendor Evaluation Skill Pack (Design Spec Review)

You are one of several independent reviewers evaluating a **design specification** for a Claude Code
plugin called the **"Vendor Evaluation Skill Pack."** Each reviewer runs on a different model and a
different lens. Work independently — do not assume other reviewers will catch what you find.

Your job: identify **issues, errors, ambiguities, omissions, contradictions, and risks** in the spec.
Be specific and cite section numbers / line content. It is fine to confirm something is well-designed;
do not manufacture problems. Distinguish **real defects** from **tastes**.

---

## 0. What "Claude Code" actually is (accurate mechanics — verify the spec against these)

Claude Code is Anthropic's agentic coding CLI. Relevant mechanics for this spec:

- **Agent Skills.** A skill is a directory containing a `SKILL.md` with YAML frontmatter (`name`,
  `description`, optionally `allowed-tools`). Skills live in `.claude/skills/<name>/` (project) or
  `~/.claude/skills/` (user), or bundled inside a plugin at `<plugin>/skills/<name>/`. Skills use
  **progressive disclosure**: the `description` is always in the model's context; the full `SKILL.md`
  body is loaded only when the model judges it relevant. Skills are **not** invoked by an explicit
  user slash command — they are triggered by model discretion based on the description, though a skill
  can also be invoked explicitly in some surfaces. Skills cannot *force* the model to take an action;
  they are instructions the model is asked to follow.

- **Slash commands.** User-invoked commands live in `.claude/commands/<name>.md` (or a plugin's
  `commands/` dir) and produce `/project:<name>` / `/user:<name>` (plugin commands are namespaced to
  the plugin). **A command and a skill are different mechanisms.** A `/foo` command requires a command
  file, not merely a `SKILL.md`.

- **Plugins.** A plugin is a distributable bundle with a `.claude-plugin/plugin.json` manifest. It can
  contain `skills/`, `commands/`, `agents/`, `hooks/`, and MCP server config. Installed via
  `/plugin install`. A **marketplace** is a git repo with a `.claude-plugin/marketplace.json`; added
  via `/plugin marketplace add <repo>`; installed via `/plugin install <name>@<marketplace>`.
  `${CLAUDE_PLUGIN_ROOT}` is an env var pointing at the installed plugin root, usable inside skill/
  command bodies to resolve bundled assets (templates, css, reference files).

- **Subagents / Task tool.** Claude Code can spawn subagents via the **Task tool** (built-in) and can
  load custom subagent definitions from `.claude/agents/<name>.md` (or a plugin's `agents/` dir). A
  subagent has its own system prompt and tool allowlist and runs in a separate context. Parallel
  subagent invocations are requested via multiple Task calls; whether they truly run concurrently and
  how many is **not guaranteed by the platform** — it is a request the model/harness may serialize.
  Importantly: a `SKILL.md` can *instruct* the model to spawn subagents, but a skill cannot itself
  "be" a subagent dispatcher as a hard guarantee.

- **Plugins are installed read-only.** Installed plugin contents are cache; a plugin should not expect
  to write into its own tree at runtime. Per-run artifacts belong in the user's working directory.

- **No persistent cross-session memory is guaranteed** unless the plugin writes files to disk (which
  is exactly why this spec uses on-disk artifact files for resumability).

Use these as the ground truth for mechanics. Where the spec conflicts with them, that is a finding.

---

## 1. The artifact under review

- **File:** `docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md` (431 lines).
- **What it is:** an approved *design* spec (not yet implemented) for a self-serve Claude Code plugin
  that walks an executive through a 5-phase vendor evaluation and emits branded HTML reports.
- **Status stated in spec:** "Approved design → ready for implementation planning." Section 11 lists
  open items still to resolve.

Read it in full before writing findings.

## 2. Source materials the spec was derived from (use to check fidelity)

In `source_docs/`:
- `vendor_system_prompt.md` — the *original* system prompt this pack evolves from. **Note:** it
  explicitly addresses "Fortune 100 executives" and uses score labels **Yes / Partially / No /
  Insufficient Information**. The spec bans tier labels (§2) and renames scores to
  **Met / Partially Met / Not Met / Insufficient Information** (§7). Reconciling these is an intended
  evolution — flag if the spec leaves any contradiction or dangling reference.
- `See/Use/Learn/Change/Adapt/Exit - *.md` — the six criteria prompts the spec's
  `vendor-capacity-assessment/references/*.md` must carry forward and evolve.
- `Executive Summary.md`, `Key Questions.md` — structure the spec's report sections must honor.
- Four reference reports: `glean/harvey/legora/conveo-evaluation-report.{pdf,docx}` — the "golden
  fixtures" (§10 Testing) the pack must reproduce in spirit. You do not need to open the binaries; use
  the `.md` prompts as the fidelity reference.

## 3. The spec's own stated invariants (check for internal consistency)

- **Point of view is the core product**; procurement is a secondary "courtesy" layer (§1).
- **Never issue a buy/don't-buy verdict**; state where it falls + severity of risk (§1 tone rule).
- **No tier labels** ("Fortune 100/500") anywhere (§2).
- **Framework is non-negotiable:** calibration tunes emphasis, never facts/scores; an exec may
  *reject* a conclusion (recorded as disagreement) but cannot soften a finding (§7 Layer 2).
- **No false certainty** — Tentative / Withheld modes, always naming the specific missing artifact
  (§7, §8).
- **Fail loudly** — surface gaps/conflicts; 3-way routing (re-research / ask exec / questions-for-vendor)
  (§6, §8).
- **Evidence tiers:** Independent / Vendor claim / Provided doc (§6).
- **Everything local**; feedback opt-in, explicit send only (§10 closing).

## 4. Watch areas (verify against mechanics + invariants; do NOT assume a bug — determine it)

These are the intersections most likely to harbor issues. Investigate each, then conclude.

1. **Skill vs command vs entry point.** Spec makes `skills/vendor-evaluation/SKILL.md` the "entry
   point" exposed as `/vendor-evaluation` (§3, §4, §10). Is a slash command backed only by a SKILL.md
   valid in Claude Code? Is anything missing (e.g., a `commands/` file)?
2. **Parallel subagent fan-out.** Phase 2 promises "five parallel streams" / "dispatch parallel
   subagents" (§6b) and Phase 3 implies a research back-edge driven by subagents. Are subagent
   definitions provided anywhere in the pack structure? Is "guaranteed parallel" a safe promise?
3. **POV evolution vs fidelity.** Does anything in the spec contradict `vendor_system_prompt.md`
   without reconciling (e.g., the "Fortune 100" framing, Yes/No vs Met/Not-Met labels)?
4. **Non-negotiable framework vs "no verdict."** Are there places where the opinionated scoring,
   "sentiment," or "against your priorities" phrasing could read as (or accidentally produce) a
   buy/don't-buy verdict, violating §1?
5. **State/resumability claims.** "State passes as inspectable artifact files on disk" (§4) and
   "re-running a phase overwrites only its own artifact" — are these implementable given skills can't
   force behavior? Any race/overwrite ambiguity?
6. **Plugin packaging claims.** Plugin name vs repo name vs marketplace slug (§3 install commands:
   `feedforward/vendor-review`, plugin name `vendor-review`, repo `feedforward-vendor-review`).
   Consistent? `${CLAUDE_PLUGIN_ROOT}` usage correct? Read-only plugin vs writing to user CWD handled?
7. **Report/self-contained HTML.** "zero external deps … no JS … inlined base64 logo" (§9b) vs the
   "prints to PDF via `@media print`" claim and interactive "who will see this?" generation (§9c).
   Any contradictions (e.g., needs JS elsewhere)?
8. **Terminology drift.** Same concept named differently across sections (artifact filenames, phase
   names, scoring labels, evidence-tier names, variant names).
9. **Scope/feasibility of the adaptive intake** (§5) and the "unlimited custom outputs" (§9d) given
   skills are advisory — over-promised?
10. **Section 11 open items** — are any of them actually blocking enough that "ready for implementation
    planning" is premature?

## 5. Output format (REQUIRED)

Write your findings to your assigned output file as Markdown:

```
# <Lens Name> Review — Vendor Evaluation Skill Pack
**Model:** <provider/model-id you actually ran as>

## Summary
2–4 sentences: overall health of the spec from your lens.

## Findings
For each finding:
- **ID:** L-001 (prefix with your lens initial)
- **Severity:** Blocker | High | Medium | Low | Nit
- **Section(s):** e.g., §6b, §3
- **Issue:** one-paragraph, concrete.
- **Why it matters:** impact on implementation or product.
- **Suggested fix:** concrete, minimal.

(Use Blocker = spec is unimplementable/contradictory as written; High = will cause real bugs/confusion;
Medium = ambiguity or likely defect; Low = minor; Nit = style.)

## Strengths (brief)
What this lens confirms is solid (3–6 bullets max).

## Open questions for the human
Things you couldn't determine from the materials (max 5).
```

Be concrete. Prefer 8–20 high-quality findings over 40 shallow ones. Cite the spec. Do not repeat
generic praise. Do not invent Claude Code mechanics that aren't in §0.
