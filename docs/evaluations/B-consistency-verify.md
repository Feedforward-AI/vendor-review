# Internal Consistency & Terminology Verification — Vendor Evaluation Skill Pack Revision
**Model:** Anthropic / Claude (consistency-lens review subagent)
**Lens:** Internal consistency & terminology (earlier file `B-consistency.md`, IDs C-001..C-015)
**Inputs:** `verification-brief.md`, `SPEC-DIFF.md`, current spec, earlier `B-consistency.md`, `IMPLEMENTATION-BRIEF.md` §0.

## Verdict on the revision
The revision resolved **9 of 15** of my earlier findings cleanly (all the structural/naming ones — the
naming triple, the orphaned `vendor-evaluation` orchestrator skill, the preset filenames, the `agents/`
directory, the `scoring-rubric` ownership, the `<vendor-slug>` path token, the feedback-step ownership,
the carry-forward label enumeration, and the two-status-vocabulary documentation) and correctly **did not
soften** any of the §0 do-not-re-litigate structures. The new §12 "Decisions Resolved" is on the whole
internally consistent with the earlier sections and is a net improvement. However, the revision **left
5 low-severity terminology findings untouched** (C-009 Gartner drift, C-010 section-name variants, C-011
USE/ADAPT omission, C-012 orphaned reference files, C-014 smoke-test coverage), and it **introduced one
genuine new contradiction** (B-N01): §4 and §12.1 now say re-running a phase *marks downstream artifacts
stale*, while §10's resumability bullet still says re-running *overwrites only its own artifact* — the diff
updated the former sites and forgot the latter. One other minor loose end (the bare `/vendor-evaluation`
token in the §4 diagram, despite §12.1 saying bare claims are dropped) also survives.

## Findings checklist (my earlier findings, each classified)

- **C-001** [High]: Plugin/repo/marketplace naming triple contradicts itself and is re-opened in §11.
  - **Status:** RESOLVED
  - **Evidence:** §3 pack-tree root is now `vendor-review/ … (GitHub: feedforward/vendor-review · marketplace: feedforward)` (spec L68); §3 install commands unchanged and consistent with that (L57–58: `marketplace add feedforward/vendor-review`, `install vendor-review@feedforward`); §12.1 freezes it: "Naming frozen: GitHub `feedforward/vendor-review` · marketplace `feedforward` · plugin name & local dir `vendor-review`" (L477); and "marketplace repo name/slug" is **removed** from §11 (§11 L451–457 no longer lists it). All four sites (install args, local dir, GitHub path, marketplace slug) now agree.

- **C-002** [High]: §11 lists feedback endpoint as open while §10 specifies a `mailto:` to a Feedforward address concretely.
  - **Status:** RESOLVED
  - **Evidence:** The contradiction is dissolved by separating *mechanism* (settled) from *endpoint* (still open). §10's revised closing step (L437–441) now reads "a prefilled `mailto:` carrying a short summary + the local path to a generated `feedback.md`, or a feedback-form link" — the prior phrase "to a Feedforward address" is **gone** (diff `SPEC-DIFF.md` §10 hunk). §11 (rewritten, L455) correctly lists only the actual "Feedback endpoint: the Feedforward feedback email address or form URL" as open. §12.4 (L536–537) confirms the mechanism. Mechanism described, endpoint deferred — no longer contradictory.

- **C-003** [Medium]: `scoring-rubric.md` defined two mutually exclusive ways (§3 seventh file vs §7 per-criterion rubrics).
  - **Status:** RESOLVED
  - **Evidence:** §3 tree renamed the file and lifted it out of the criteria brace list: `references/{see,use,learn,change,adapt,exit}.md + scoring-scale.md` (L84). §12.3 (L521–522) states the relationship explicitly: "`scoring-scale.md` holds the shared 4-point scale + label semantics; each criterion file carries its own Met/Partially/Not-Met boundary notes." §7 Layer 1's "each criterion file … + a scoring rubric (what separates Met/Partially/Not Met)" (L254–256) is now consistent with "each criterion file carries its own boundary notes."
  - **Note:** Minor residual wording drift — §7 L255 still calls the per-criterion content "a scoring rubric" while §12.3 calls it "boundary notes." Same referent, two labels; not a contradiction, but for a "single source of truth" doc pick one noun.

- **C-004** [Medium]: The four §9c preset variants have no home in the §3/§4 artifact manifest.
  - **Status:** RESOLVED
  - **Evidence:** §3 runtime tree now lists `{brief,procurement-memo,strategic-capacity-memo,technical-deep-dive}.html` (L100); §12.4 (L531–533) formally declares "Preset variant filenames: `brief.html`, `procurement-memo.html`, `strategic-capacity-memo.html`, `technical-deep-dive.html`; custom outputs `custom-<slug>.{md,html}`." The four presets now have distinct filenames separate from the `custom-<slug>` namespace, exactly as suggested.

- **C-005** [Medium]: "Parallel subagents" promised in §6b/§4 but no `agents/` dir in §3.
  - **Status:** RESOLVED
  - **Evidence:** §3 pack tree now has `agents/` with `research-{vendor-surfaces,technical-docs,community,thirdparty,compliance}.md · discover-branding.md` (L74–75); §12.1 (L469–472) defines them: "Subagents → bundled `agents/` definitions … one per research stream + brand discovery, each with a system prompt, its own `allowed-tools`, and a structured output contract." §6b's "Dispatch parallel subagents" (L206) is now backed by the tree.

- **C-006** [Medium]: `/vendor-evaluation` referenced as a command but §3 only had `skills/vendor-evaluation/SKILL.md`.
  - **Status:** RESOLVED (with one minor residual — see B-N02 note)
  - **Evidence:** §3 tree now has `commands/vendor-evaluation.md` as "ENTRY POINT — namespaced slash command" (L72–73) and `skills/vendor-evaluation/` is **removed** (grep for `skills/vendor-evaluation` → no matches). §4 prose (L110) and §12.1 (L465–468) both establish the command *is* the orchestrator. §10 README updated to "the namespaced `vendor-evaluation` command" (L431). The structural mismatch that was the finding is fixed.

- **C-007** [Medium]: Two status vocabularies (capacity vs procurement) reuse overlapping tokens with no statement they're deliberate.
  - **Status:** RESOLVED
  - **Evidence:** §12.3 (L518–520) now states it explicitly: "Two status vocabularies are deliberate: capacity = Met / Partially Met / Not Met / Insufficient Information (an evaluative judgment); procurement = Available / Partial / Absent / Insufficient (a factual presence check). Documented once; not a defect." This is exactly the "document both as deliberate, once" option from my suggested fix. §7 (L240) and §8 (L327) scales are unchanged and consistent with this.

- **C-008** [Low]: Path placeholder drifts between `<vendor-slug>` and `<vendor>`.
  - **Status:** RESOLVED
  - **Evidence:** §6a and §9b were corrected: §6a now `./vendor-evaluations/<vendor-slug>/materials/` (L193), §9b now `./vendor-evaluations/<vendor-slug>/report.html` (L351). A grep for `vendor>/` returns no bare `<vendor>/` tokens anywhere. §12.4 (L538–539) defines the slug rule once: "`<vendor-slug>` = lowercase, hyphenated vendor name, confirmed with the exec; used consistently in every path." Consistent everywhere now.

- **C-009** [Low]: "Gartner" qualifier appears and disappears (§1 "Gartner-style", §3 "Gartner courtesy layer", §9c "Gartner checklist", §8 drops it).
  - **Status:** MISSED
  - **Evidence:** The diff did not touch any Gartner-naming line. Current spec still has four forms: §1 L18 "Gartner-style procurement review"; §3 L85 "Phase 4 — Gartner courtesy layer"; §9c L374 "Gartner checklist"; while §8's header/body (L305+) still drops "Gartner" entirely ("Procurement Review … — courtesy layer"). (§6b L214 "Gartner Peer Insights" is a legit source name, not part of the drift.) §12.5's lint catches tier labels (`Fortune 100/500`) but does not address "Gartner" as a generic adjective. Finding stands, unchanged.

- **C-010** [Low]: The personalized-scoring section is named 3+ ways.
  - **Status:** MISSED
  - **Evidence:** The diff only edited §7 Layer 3's *output* noun ("verdict" → "scored assessment"), not the section *title*. The same deliverable is still named: §5 L175 "'Against your priorities' scored section"; §7 L279 "How [vendor] measures against your priorities"; §9b L355 "★ Against your priorities"; and now also §12.3 L510 "'Against your priorities' rubric." Canonical heading lives in §9b, but the descriptive forms still vary. (Note: the §0 do-not-re-litigate list protects the *section's existence and sharpness*, not its naming consistency, so this remains a fair consistency ask.) Finding stands.

- **C-011** [Low]: Strategic Capacity Memo (§9c) promises a "SEE/LEARN/CHANGE/EXIT story" — 4 of 6 criteria — with no scoping rationale.
  - **Status:** MISSED
  - **Evidence:** §9c L375 is unchanged: "Pure Feedforward POV applied to this vendor; SEE/LEARN/CHANGE/EXIT story; no checklist, no product detail." Neither the diff nor §12 adds a clause justifying the USE/ADAPT omission as intentional audience scoping. §12.3's calibration matrix mentions USE/ADAPT but does not explain the §9c scoping. Finding stands.

- **C-012** [Low]: `references/source-playbook.md` (vendor-research) and `references/branding-guide.md` (vendor-report) declared in §3 but never cited in §6/§9 prose.
  - **Status:** MISSED
  - **Evidence:** §3 still declares both (L82 `references/{source-playbook, evidence-standards}.md`; L88 `references/branding-guide.md`). §6's "Evidence discipline" heading cites only `evidence-standards.md` (L223) — `source-playbook.md` still has no role statement in §6. §9a's branding discussion (L343–348) was rewritten for the text-wordmark default but still does **not** cite `branding-guide.md`. Both files remain orphaned relative to the prose that should govern them. Finding stands.

- **C-013** [Low]: Closing/feedback step (§4, §10) has no owning component in §3.
  - **Status:** RESOLVED
  - **Evidence:** §12.4 (L535) assigns ownership explicitly: "`technical-issues.md`: every phase appends failures … the **entry command owns the closing feedback step.**" §12.1 (L465–468) establishes that the `commands/vendor-evaluation.md` entry command *is* the orchestrator (there is no separate orchestrator skill). The previously-unattributed sixth step now has a named owner.

- **C-014** [Low]: §10 "Per-skill smoke tests" cover only 4 of 6 skills (intake, research, assessment, report); orchestrator + procurement untested.
  - **Status:** MISSED
  - **Evidence:** §10 Testing (L419–421) is unchanged: "intake hits all objectives; dossier has citations …; assessment scores all six + against-priorities; report renders valid self-contained HTML across all variants." Still no smoke-test bullet for procurement (a full Phase 4 with its own artifact and the distinct status scale from C-007) nor for the entry command's gating/checkpoint/resume behavior. The "orchestrator skill" framing is now N/A (folded into the entry command), but the *substance* — testing the command's phase-gating + procurement's status matrix — is still absent.
  - **Note:** The orchestrator-skill half of this finding is N/A by virtue of the C-006 restructure; the procurement-coverage half stands.

- **C-015** [Low]: §11 #4 carries `vendor_system_prompt.md` "verbatim where accurate" without enumerating required evolutions (score-label rename, Fortune-100 ban).
  - **Status:** RESOLVED
  - **Evidence:** §11's old open item is gone; §12.6 "Carry-forward hygiene" (L556–564) enumerates the evolutions precisely: "Rename score labels Yes/Partially/No/Insufficient → Met/Partially Met/Not Met/Insufficient Information, with a one-line semantic-mapping note"; "Remove tier labels ('Fortune 100' → 'senior leaders')"; plus an explicit "Keep verbatim" list and an "Add" list. Matches the suggested fix.

## New issues introduced by the revision

- **ID:** B-N01, **Severity:** Medium, **Section:** §10 "Error handling & edge cases" (L413) vs §4 (L127) and §12.1 (L473–475)
  - **Issue:** A new **resumability contradiction** was introduced. §4 now reads "Re-running a phase overwrites its artifact and marks downstream artifacts stale (tracked in `state.json`)" (L127), and §12.1 confirms "Re-running a phase marks downstream artifacts stale and prompts regeneration" (L473–475). But §10's resumability bullet was left as "re-running a phase overwrites **only** its artifact" (L413). Before this diff, §4 ("overwrites only its own artifact") and §10 ("overwrites only its artifact") agreed; the diff rewrote §4 to the new stale-marking model and forgot §10, so the two now directly contradict. An implementer cannot tell whether rerun touches only one artifact or also marks downstream stale.
  - **Fix:** Change §10 L413 to match, e.g. "re-running a phase overwrites its artifact and marks downstream artifacts stale (per §4 / §12.1)."

- **ID:** B-N02, **Severity:** Low, **Section:** §4 flow diagram (L114) vs §12.1 (L468)
  - **Issue:** Minor residual from the C-006/P1 namespacing work. §12.1 states "bare `/vendor-evaluation` claims are dropped" and §10 README was updated to "the namespaced `vendor-evaluation` command" — but the §4 flow diagram's first line still shows the bare token: `/vendor-evaluation → ask vendor name + URL, create workspace` (L114). One bare reference survives the sweep.
  - **Fix:** Render the diagram's entry line as the namespaced form (or annotate it as shorthand), e.g. `vendor-evaluation (namespaced command) → …`.

## Anything still genuinely open
- **C-009 (Gartner drift)** — untouched by the diff; §8 still drops "Gartner" while §1/§3/§9c use it. Pick one neutral internal name ("procurement courtesy layer") and apply it everywhere.
- **C-011 (USE/ADAPT omission in the Strategic Capacity Memo)** — still unexplained; add one clause that the strategic-lens scoping is intentional (e.g., USE/ADAPT deferred to the Technical Deep-Dive).
- **C-012 (orphaned `source-playbook.md` / `branding-guide.md`)** — still declared in §3, still uncited in §6/§9; add a one-line role each, or drop them from §3.
- **C-014 (procurement + entry-command smoke tests)** — §10 still covers only 4 of the phase surfaces; add bullets for the entry command's gating/resume and procurement's status matrix.
- **C-010 + C-003 micro-drift** — low-impact naming hygiene: unify the "Against your priorities" section title across §5/§7/§9b/§12.3, and pick one noun ("rubric" vs "boundary notes") for the per-criterion scoring content (§7 L255 vs §12.3 L522).
