# Vendor Review — Build Handoff & Roadmap

**Read this first** in any session that continues the build. It explains where things stand, the
build cadence, and exactly what each remaining plan must cover. Plans are written **just-in-time** —
one per clean session — so this doc is the connective tissue between them.

---

## Status (as of 2026-06-18)

- **Spec — approved & revised:** `docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md`.
  All resolved review decisions are in its **§12**; genuine open items in **§11**.
- **Plan 01 (Foundation) — written & committed**, not yet built:
  `docs/superpowers/plans/2026-06-18-vendor-review-01-foundation.md`.
- **Plans 02–04 — not yet written** (write them just-in-time; seeds below).
- **Repo:** git initialized on `main`. **Memory** auto-loads the POV, the no-tier-labels rule, and the
  opinionation rule.
- **Source material to evolve:** `source_docs/vendor_system_prompt.md`, the six criterion prompts, and
  the four sample reports (Glean / Harvey / Legora / Conveo) — these are the **golden fixtures**.

---

## The build loop (one plan per clean session)

For each plan **N**, starting where you are:

1. **Open a fresh Claude Code session** in `/Users/adamdavidson/Documents/vendor_analysis_skill`.
2. **Write plan N if it doesn't exist yet.** Plan 01 is already written, so skip to step 3 for it.
   For 02–04: *"Using superpowers:writing-plans, write Plan 0N (`<subsystem>`) from the spec and the
   seed in `docs/superpowers/plans/2026-06-18-vendor-review-00-handoff.md`."*
3. **Implement plan N:** *"Implement `docs/superpowers/plans/2026-06-18-vendor-review-0N-<name>.md`
   using superpowers:subagent-driven-development."*
4. **Run the per-plan acceptance check** (below). Fix anything red.
5. **Proceed to plan N+1 in a new session.**

Why fresh sessions: keeps context lean and cheap. The spec + the current plan + memory are the durable
handoff — no transcript needs to travel.

---

## Roadmap

| Plan | Subsystem | Consumes (from prior plans) | Produces — testable deliverable | Status |
|---|---|---|---|---|
| **01** | Foundation: manifests, slug, `state.json`, guardrail lint, shared spine, entry command | — | Plugin installs; command scaffolds `./vendor-evaluations/<slug>/` + `state.json`; `npm test` green | **Plan written (revised after 5-lens review); build pending** |
| **02** | Intake + Research (Phases 1–2) | `slugify`, `state.js`, shared spine, `lint()` | Dry-run → valid `intake.md` + cited `dossier.md` (evidence tiers + gaps) | Not started |
| **03** | Assessment + Procurement (Phases 3–4) | dossier/intake/derived-criteria artifacts, shared spine, `lint()` | Fixture dossier → valid `capacity-assessment.md` + `procurement-review.md`; lint green | Not started |
| **04** | Report (Phase 5 + closing) | all artifacts + brand assets | Fixture artifacts → self-contained branded `report.html` + 4 variants + a custom output; golden-fixture compare | Not started |

---

## What each remaining plan must cover (seeds for JIT planning)

### Plan 02 — Intake + Research
**Create:**
- `skills/vendor-intake/SKILL.md` — adaptive interview: the 8 objectives as a checklist (not a script),
  the two-axis *specificity × fluency* calibration, **soft cap ~12 questions** + progress + pause/resume,
  the "I'm not sure" scaffolding, need-first vs vendor-first. Writes `intake.md` (**immutable after its
  checkpoint**); captures the exec's company for brand discovery.
- `skills/vendor-research/SKILL.md` + `references/{source-playbook.md, evidence-standards.md}` — the
  **bring-your-own-materials** step (hand-holding, create `materials/`, format handling per the no-`Bash`
  decision: PDF/paste/screenshots native, `.docx` asks for PDF/paste), then the **parallel web fan-out**
  dispatching the agents; merges `dossier.md` (deduped, **cited URL + access date**, evidence-tier tagged,
  gaps flagged "insufficient → question for vendor"); extracts RFP criteria to `derived-criteria.md`;
  enforces **fail-loudly + 3-way gap routing**.
- `agents/research-{vendor-surfaces,technical-docs,community,thirdparty,compliance}.md` +
  `agents/discover-branding.md` — each with a system prompt, its own `allowed-tools`
  (`WebSearch, WebFetch, Read` typically; no `Bash`), and a **structured output contract**
  (finding · source URL · access date · evidence tier).
**Consumes (Plan 01):** `slugify`, `state.js` (mark `intake`/`research` complete), `shared/*`, `lint()`.
**Acceptance:** structural tests assert SKILL frontmatter + agent output contract; a fixture/dry-run
produces a valid `intake.md` and a `dossier.md` with citations, evidence tiers, and a gaps section; the
guardrail lint passes on the generated `dossier.md`.
**Spec:** §5, §6, §12.2, §12.4 (brand discovery timing).

### Plan 03 — Assessment + Procurement
**Create:**
- `skills/vendor-capacity-assessment/SKILL.md` + `references/{see,use,learn,change,adapt,exit}.md` +
  `references/scoring-scale.md` — six-criteria scoring (`Met / Partially Met / Not Met / Insufficient
  Information`), the **calibration matrix (emphasis only, never the score)**, the **"against your
  priorities" rubric**, the **no-false-certainty** two modes (tentative / withheld, always naming the
  specific artifact), and the **back-edge to research (loop cap 2)**. Writes `capacity-assessment.md`
  (scorecard = profile, not a grade).
- `skills/vendor-procurement-review/SKILL.md` + `references/procurement-checklist.md` — the Gartner
  checklist (`Available / Partial / Absent / Insufficient`), **capacity cross-links**, depth driven by
  intake #7. Writes `procurement-review.md` (status matrix, not a rival verdict-grade).
**Consumes:** `dossier.md`, `derived-criteria.md`, `intake.md`, `shared/*`, `lint()`, `state.js`.
**Acceptance:** a fixture dossier yields a `capacity-assessment.md` with all six criteria scored + an
"against your priorities" section, and a `procurement-review.md` with the status matrix + cross-links;
**lint green** (no verdict; every Insufficient names an artifact); structural tests check all six criteria
and the two distinct status vocabularies.
**Spec:** §7, §8, §12.3.

### Plan 04 — Report (+ closing feedback)
**Create:**
- `skills/vendor-report/SKILL.md` + `assets/{report-template.html, theme.css}` +
  `references/branding-guide.md` — the **self-contained HTML build** (inline `theme.css` into `<style>`;
  **default branding = styled text wordmark + palette**; raster logo only via data URI); the Full Report's
  11 sections including **"What we couldn't verify"**; the four preset variant files
  (`brief.html`, `procurement-memo.html`, `strategic-capacity-memo.html`, `technical-deep-dive.html`);
  **custom outputs** (`custom-<slug>.{md,html}`); the **branding confirm** (auto-discover → preview →
  block until confirmed); and the **privacy-first feedback opt-in** producing `feedback.md` (bundling
  `technical-issues.md`) + a `mailto:` with a short summary + local path.
- `tooling/html-validate.js` (+ tests) — asserts a report is **self-contained** (no `http(s)` external
  resource refs) and contains every required section.
- `tooling/golden-compare.js` (+ tests) — structural comparison of generated reports against the four
  sample reports (section presence + criteria coverage, not prose equality).
**Consumes:** all artifacts + brand assets from Plan 02, `lint()`, `state.js`.
**Acceptance:** fixture artifacts → `report.html` that passes `html-validate` (self-contained, all
sections); all four variants and one custom output render; **lint green across `report.html` and
`custom-*`**; golden-fixture structural compare passes for the four vendors.
**Spec:** §9, §10 (testing + feedback), §12.4, §12.5.

---

## Constraints every plan inherits (from spec §1, §2, §12)

- **§0 rule:** maximally opinionated about trade-offs; **never the literal buy/don't-buy sentence.**
- **No tier labels** ("Fortune 100/500"); use "senior leaders," "your organization."
- **No `Bash` in shipped command/skills.** Runtime `allowed-tools`: `Read, Write, Edit, WebSearch,
  WebFetch, Task`. (Dev tooling may use Node/Bash freely — it isn't shipped.)
- **"Consumes" means contract, not import.** `slug.js`, `state.js`, `guardrail-lint.js`, and
  `guardrail-rules.js` are exercised by **dev tests** and serve as **shape/rule contracts** for later
  plans' skills/command. The no-`Bash` markdown surfaces **re-express** those rules (e.g. the runtime
  guardrail checklist mirrors `guardrail-rules.js`); they never `require()` the modules at runtime.
- **Workspace** in the user's CWD at `./vendor-evaluations/<vendor-slug>/`.
- **Framework non-negotiable; no false certainty (name the specific artifact); fail loudly + 3-way
  routing; three evidence tiers; never fabricate.**
- **TDD + frequent commits.** Dev tests run via `node --test` / `npm test`. The guardrail `lint()` must
  pass on every generated artifact and must NOT over-fire on opinionated language.

## Three defaults still overridable (spec §11)

1. **Subagents** → bundled `agents/` (vs inline Task calls).
2. **State** → `state.json` run-manifest (vs artifact-existence signal).
3. **`.docx` + `Bash`** → no `Bash`, `.docx` scoped out (vs narrowly-scoped `Bash` for `.docx`/base64).

Flip any of these at the start of the relevant build session; update the spec §11/§12 note if you do.

---

## After Plan 01 is built — acceptance check

- `npm test` is green (manifest, slug, state, guardrail-lint, shared-spine, command).
- The plugin installs (`/plugin marketplace add feedforward/vendor-review` + install, or a local
  `/plugin install` from the cloned dir).
- Running `/vendor-review:vendor-evaluation` confirms a vendor, creates `./vendor-evaluations/<slug>/`,
  and writes a valid `state.json`.
- The guardrail lint flags a planted violation and passes the clean-opinionated fixture.

## Definition of done (whole pack)

A clean run on a real vendor walks all five phases with checkpoints, produces the Full Report + the four
cuts + at least one custom output as **self-contained branded HTML**, the lint is green across all
artifacts, "What we couldn't verify" reflects every gap, the feedback opt-in works, and the golden-fixture
structural compare passes for Glean / Harvey / Legora / Conveo.

## Sources of truth

- **Spec:** `docs/superpowers/specs/2026-06-18-vendor-evaluation-skill-pack-design.md` (decisions in §12).
- **Plans:** `docs/superpowers/plans/2026-06-18-vendor-review-0N-*.md`.
- **Review (reference catalog):** `docs/evaluations/` — note its `SUMMARY.md` "verdict-drift" advice is
  **overruled** by `IMPLEMENTATION-BRIEF.md` §0.
- **POV + criteria + golden fixtures:** `source_docs/`.
- **Durable facts:** project memory (`MEMORY.md` index).
