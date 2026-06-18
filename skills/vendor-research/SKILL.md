---
name: vendor-research
description: Phase 2 of a vendor evaluation. Collects the exec's own materials, dispatches parallel web research, and merges a cited, evidence-tiered dossier.md with gaps routed and RFP criteria extracted to derived-criteria.md.
allowed-tools: Read, Write, Edit, WebSearch, WebFetch, Task
---

# Vendor Research — materials + parallel web fan-out (Phase 2)

Load the binding context first if needed: `${CLAUDE_PLUGIN_ROOT}/shared/philosophy.md` and
`${CLAUDE_PLUGIN_ROOT}/shared/voice-and-guardrails.md`. Read `intake.md` for what to target. Tag all
evidence per `${CLAUDE_PLUGIN_ROOT}/skills/vendor-research/references/evidence-standards.md`, and use
`${CLAUDE_PLUGIN_ROOT}/skills/vendor-research/references/source-playbook.md` as the map of where to
look.

## Step A — Bring-your-own materials (before touching the web)
Ask gently, with examples, for anything the exec already has — **internal:** security/procurement/
data-handling policies, an **RFP/requirements doc**, prior eval notes; **from the vendor:**
proposal/SOW, pricing quote, a completed security questionnaire (SIG/CAIQ), a SOC 2 report, MSA.

Hand-hold (assume they've never done this). Create and name the exact folder
`./vendor-evaluations/<vendor-slug>/materials/` and offer OS-aware paths:
1. **Drag the files in** — "On Mac, drag them into this Finder folder: `<absolute path>`" (give the
   Windows/Linux equivalents too).
2. **Paste the text** into chat.
3. **Point me at a path or link.**
4. *"Don't have anything? Fine — I'll work from public sources."* (never blocks)

Then **confirm receipt:** list the folder, read each file, summarize it, and clearly flag anything
unreadable. **Formats (no-`Bash` posture):** read **PDF**, text/Markdown, and screenshots natively.
**`.docx` is not supported** — fail loudly and ask for a **PDF** or **pasted** text instead; never
pretend to read it.

**Payoffs:** provided docs enter the dossier as **Provided doc** evidence (primary source, often
non-public — cite by provenance only). An RFP/policy doc's extracted criteria are written to
`./vendor-evaluations/<vendor-slug>/derived-criteria.md` (kept **separate** from the immutable
`intake.md`) and reflected back to confirm.

## Step B — Parallel web fan-out
Dispatch the research subagents **in parallel** with the Task tool, one per stream, each targeted by
intake criteria and by what provided docs claim (verify independently; don't echo the vendor):
`research-vendor-surfaces` · `research-technical-docs` · `research-community` ·
`research-thirdparty` · `research-compliance`. Also dispatch `discover-branding` against the exec's
company domain so branding is ready by report time — it returns *candidates* to confirm later, and
frequent failure is expected (manual entry is the norm).

## Step C — Merge into dossier.md
Write `./vendor-evaluations/<vendor-slug>/dossier.md`:
- **Deduped** across streams, **organized by the six criteria** (SEE / USE / LEARN / CHANGE / ADAPT /
  EXIT) **plus procurement topics**. A finding that spans criteria (e.g. a proprietary export format
  touches both EXIT and CHANGE) is filed under its **primary** criterion and cross-referenced under
  the secondary; if it's genuinely unclear, place it under **Procurement**.
- **Every line cited.** Web findings carry **URL + access date**; **Provided doc** findings carry the
  **file name + section** (no access date), with confidential contents cited by provenance only. Tag
  every finding by provenance — **Independent / Vendor claim / Provided doc**.
- When a **vendor claim conflicts with independent evidence, surface the conflict** inline.
- Gaps flagged **"insufficient → question for vendor"**, each naming the **specific artifact** that
  would close it (e.g. "request their SOC 2 Type II report").

## Fail loudly + gap routing
Surface gaps and conflicts; never paper over them. Routing is two stages:

**Stage 1 (optional pre-pass):** if a gap is **findable with sharper searching**, run **one targeted re-research** pass on that single question before routing it. One pass only — don't loop.

**Stage 2 (terminal label):** label every gap that remains with **exactly one** of these three routes
— the same set the agents emit:
- **`ask exec`** — the exec may have the specific named document (back to Step A).
- **`ask vendor`** — only the vendor can answer; goes to **"questions for vendor."**
- **`unverifiable`** — no source can close it; carry it to the report's "What we couldn't verify."

## Checkpoint
Show the exec what each stream found, the gaps, and any claim-vs-reality conflicts; let them add
materials or point research at a specific worry before scoring. On approval the orchestrator runs the
runtime guardrail check and marks research complete.
