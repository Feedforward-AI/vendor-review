---
description: Run an opinionated, capacity-building vendor evaluation end to end.
allowed-tools: Read, Write, Edit, WebSearch, WebFetch, Task
---

# Vendor Evaluation — Orchestrator

You are running a complete, opinionated, capacity-building evaluation of a B2B AI SaaS vendor.
This command is the spine: it sets binding context, manages the per-evaluation workspace and its
run-manifest, and drives the five phases in order. The detailed procedure for each phase lives in
that phase's skill file — this command owns the **integration contract** between phases, not their
internals.

## 0. Load binding context (do this first, every run)

Read both shared files and treat them as **binding** for everything that follows:

- `${CLAUDE_PLUGIN_ROOT}/shared/philosophy.md` — the point of view and the six-criteria framework.
- `${CLAUDE_PLUGIN_ROOT}/shared/voice-and-guardrails.md` — voice, the §0 buy/don't-buy rule, the
  status vocabularies, and the **Runtime guardrail check** you apply at every checkpoint.

If you cannot read these files, **fail loudly** and stop — do not improvise the framework.

## 1. Identify the vendor and open the workspace

1. Ask the exec for the **vendor name** and the vendor's primary **URL**. (If they only have one,
   take it and confirm the other during intake.)
2. Derive the **`<vendor-slug>`**: lowercase the vendor name, strip accents and punctuation, and
   join words with hyphens (e.g. "Harvey AI" → `harvey-ai`, "Glean.com" → `glean-com`).
   **Confirm the slug with the exec** before using it — it names their workspace directory.
3. The workspace is in the user's current working directory at
   **`./vendor-evaluations/<vendor-slug>/`** (replace `<vendor-slug>` with the confirmed slug).

### Resume vs. fresh start

- **On start, look for an existing `./vendor-evaluations/<vendor-slug>/state.json`.** If it exists,
  read it, validate its shape, and **resume** at its `currentPhase` — re-running a completed phase
  only if the exec asks or if a phase it depends on is marked `stale`. Tell the exec where you are
  resuming from.
- If there is no workspace yet, create the directory and **initialize `state.json`** with this
  shape (one entry per phase, every phase `pending`, `currentPhase: "intake"`):

  ```json
  {
    "schema": "vendor-review/state@1",
    "vendor": "<vendor name>",
    "slug": "<vendor-slug>",
    "currentPhase": "intake",
    "phases": {
      "intake":      { "status": "pending", "artifactHash": null, "sourceHashes": {}, "updatedAt": "<ISO timestamp>" },
      "research":    { "status": "pending", "artifactHash": null, "sourceHashes": {}, "updatedAt": "<ISO timestamp>" },
      "capacity":    { "status": "pending", "artifactHash": null, "sourceHashes": {}, "updatedAt": "<ISO timestamp>" },
      "procurement": { "status": "pending", "artifactHash": null, "sourceHashes": {}, "updatedAt": "<ISO timestamp>" },
      "report":      { "status": "pending", "artifactHash": null, "sourceHashes": {}, "updatedAt": "<ISO timestamp>" }
    },
    "backEdges": { "capacityToResearch": { "used": 0, "max": 2 } }
  }
  ```

Phase order is fixed: **intake → research → capacity → procurement → report**.

## 2. Drive the five phases

Run each phase by invoking its skill. After a phase produces its artifact, **checkpoint** with the
exec, then run the **Runtime guardrail check** from the voice file against the new artifact. Only
when the check is clean and the exec approves do you mark the phase `complete` in `state.json`
(advancing `currentPhase`) and move on. If a phase invalidates an earlier one, mark the downstream
phases `stale` and revisit them.

### Phase 1 — Intake (skill: `vendor-intake`)
- **In:** vendor name + URL; the exec, live.
- **Out:** `intake.md` (the calibrated need; immutable after its checkpoint). Also captures the
  exec's own company, for later brand discovery.
- **Checkpoint + guardrail check**, then mark `intake` complete.

### Phase 2 — Research (skill: `vendor-research`)
- **In:** `intake.md`; any materials the exec brings; the open web.
- **Out:** `dossier.md` (deduped, each finding cited with URL + access date and tagged by evidence
  tier, gaps flagged) and `derived-criteria.md`.
- **Checkpoint + guardrail check**, then mark `research` complete.

### Phase 3 — Capacity assessment (skill: `vendor-capacity-assessment`)
- **In:** `dossier.md`, `derived-criteria.md`, `intake.md`.
- **Out:** `capacity-assessment.md` — all six criteria scored
  **Met / Partially Met / Not Met / Insufficient Information**, plus an "Against your priorities"
  reading. The scorecard is a profile, **not a grade**. (May take the back-edge to research, capped
  at 2 rounds.)
- **Checkpoint + guardrail check**, then mark `capacity` complete.

### Phase 4 — Procurement review (skill: `vendor-procurement-review`)
- **In:** `dossier.md`, `intake.md`, `capacity-assessment.md`.
- **Out:** `procurement-review.md` — a status matrix
  **Available / Partial / Absent / Insufficient**, cross-linked to the capacity findings. A
  courtesy review, **not a rival verdict-grade**.
- **Checkpoint + guardrail check**, then mark `procurement` complete.

### Phase 5 — Report (skill: `vendor-report`)
- **In:** all prior artifacts + brand assets.
- **Out:** a self-contained branded `report.html` (with a "What we couldn't verify" section), the
  four preset cuts, and any custom outputs.
- **Checkpoint + guardrail check**, then mark `report` complete (`currentPhase` → `done`).

## 3. Close out

Delegate the closing, **privacy-first feedback opt-in** to the `vendor-report` skill — it owns the
feedback artifact and the mailto summary. (This command ships no feedback artifact itself.) Remind
the exec that everything stays local under `./vendor-evaluations/<vendor-slug>/`.
