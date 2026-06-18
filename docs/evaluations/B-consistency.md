# Internal Consistency & Terminology Review — Vendor Evaluation Skill Pack
**Model:** Anthropic / Claude (consistency-lens review subagent)

## Summary
The spec is largely coherent within each section — phase numbering, the six-criteria framework, evidence tiers, and the "profile-not-verdict" guardrail are used consistently. However, it fails its own contract in a few high-impact places: the plugin/repo/marketplace naming triple is internally contradictory *and* quietly re-opened in §11 after being presented as copy-paste-ready in §3; the scoring-rubric file is defined two mutually exclusive ways (§3 vs §7); the four §9c preset report variants have no home in the §3/§4 artifact manifest; and a cluster of terminology tokens drift across sections (path placeholders, procurement-vs-capacity status labels, the "Gartner" qualifier, the "against your priorities" section name). None of these make the spec unimplementable, but several will produce real confusion or non-working install instructions if implemented verbatim.

## Findings

- **ID:** C-001
- **Severity:** High
- **Section(s):** §3 (lines 57–58, 68) vs §11 (line 426)
- **Issue:** The plugin/repo/marketplace naming triple contradicts itself and is then re-opened as undecided. §3 gives "copy-paste" install commands: `/plugin marketplace add feedforward/vendor-review` and `/plugin install vendor-review@feedforward`, which imply a marketplace repo path of `feedforward/vendor-review` (i.e. a repo named `vendor-review` under org `feedforward`) and a marketplace slug of `feedforward`. But the pack-structure tree on line 68 roots the repo at `feedforward-vendor-review/` — a *different* repo name — while annotating it "(plugin name: vendor-review)." So the marketplace-add argument (`feedforward/vendor-review`) and the repo directory (`feedforward-vendor-review`) imply two different repository names. Then §11 line 426 lists "Exact Feedforward marketplace repo name/slug … " as an unresolved open item, directly contradicting §3's presentation of these as settled, copy-paste install instructions.
- **Why it matters:** A reader implementing §3 verbatim would write install commands that do not resolve to the actual repo (or vice versa), and the "approved, ready for implementation" status is undermined because the single most user-facing artifact — the install command — depends on an explicitly undecided name.
- **Suggested fix:** Pick one repo name and use it in all three sites. E.g., repo = `feedforward-vendor-review`, marketplace slug = `feedforward`, plugin name = `vendor-review`, and change the marketplace-add command to `/plugin marketplace add feedforward/feedforward-vendor-review`. Then remove "marketplace repo name/slug" from §11 (it is decided), leaving only the feedback endpoint open.

- **ID:** C-002
- **Severity:** High
- **Section(s):** §11 (line 426) vs §3 (lines 57–58) and §10 (line 419)
- **Issue:** §11 open item #1 states the "feedback email/form endpoint" is still to resolve, but §10's closing step (line 419) already specifies the delivery mechanism concretely: "a prefilled `mailto:` email to a Feedforward address or a feedback-form link the exec reviews and sends." §3/§4 likewise present the marketplace endpoint as concrete. This is the §11-quietly-contradicts-an-approved-claim pattern: the body of the spec treats both the marketplace repo name/slug and the feedback endpoint as designed, while §11 lists both as open.
- **Why it matters:** It is unclear which is authoritative. If §11 is right, the README (§10) ships a `mailto:` to a non-existent address; if §3/§10 are right, §11 is stale.
- **Suggested fix:** Either resolve the endpoint and delete that clause from §11, or mark the §10 `mailto:`/form language explicitly as "(placeholder — see §11)" so the contradiction is not silently swallowed.

- **ID:** C-003
- **Severity:** Medium
- **Section(s):** §3 (line 79) vs §7 (line 246)
- **Issue:** The scoring rubric is defined two incompatible ways. §3's pack tree lists a standalone `scoring-rubric.md` as a seventh file alongside the six criterion files: `references/{see,use,learn,change,adapt,exit,scoring-rubric}.md`. §7 Layer 1 (line 246) instead says "Each criterion's reference file (`see.md` … `exit.md`) is the evolved source-doc prompt + **a scoring rubric** (what separates Met / Partially / Not Met)" — i.e., a rubric embedded in each of the six criterion files, with no mention of a shared `scoring-rubric.md`.
- **Why it matters:** An implementer cannot tell whether there is one shared rubric file, six per-criterion rubrics, or both — a real ambiguity in the deliverable structure that affects file creation and the "single source of truth" goal.
- **Suggested fix:** State the relationship explicitly. E.g., "Each criterion file embeds its own rubric; `scoring-rubric.md` holds the cross-criteria scoring scale and tier definitions they all reference," or delete `scoring-rubric.md` from §3 if per-criterion rubrics are intended.

- **ID:** C-004
- **Severity:** Medium
- **Section(s):** §9c (lines 351–360) vs §3 (line 87) and §4 (line 108)
- **Issue:** The four "preset audience cuts" (§9c: Executive Brief, Procurement Memo, Strategic Capacity Memo, Technical Deep-Dive) are each "its own self-contained, branded HTML," but they have no representation in the artifact manifests. §3's runtime tree (line 87) and §4's Phase 5 output line list only `report.html` and `custom-*.{md,html}`. The `custom-<slug>.{md,html}` pattern is defined in §9d as belonging to *custom (open-ended)* outputs, not the four presets. So the four preset HTML files have no specified filename convention, and it is ambiguous whether they share the `custom-*` namespace with §9d outputs or get their own (e.g., `executive-brief.html`).
- **Why it matters:** The artifact-on-disk invariant ("state passes as inspectable artifact files on disk," §4) cannot be honored for four of the deliverables because their filenames are undefined; resumability and the §10 smoke test ("report renders valid self-contained HTML across all variants") have no file targets to test.
- **Suggested fix:** Add preset filenames to §3/§4 (e.g., `brief.html`, `procurement-memo.html`, `strategic-capacity-memo.html`, `technical-deep-dive.html`) or explicitly state that presets are emitted using the `custom-<slug>.html` namespace.

- **ID:** C-005
- **Severity:** Medium
- **Section(s):** §6b (line 195), §4 Phase 3 back-edge (lines 110–111) vs §3 pack structure (lines 68–86)
- **Issue:** §6b says "Dispatch **parallel subagents**, one per stream," and §4's Phase 3 back-edge implies subagent-driven targeted research, but §3's pack structure contains no `agents/` directory and offers no subagent definitions. The spec never states whether these "parallel subagents" are inline Task-tool calls (which need no definitions) or require bundled `agents/<name>.md` files. The pack tree enumerates only `skills/` and `shared/`.
- **Why it matters:** Cross-section inconsistency between a promised mechanism (named "parallel subagents") and the pack structure that must carry it. If definitions are required, §3 is incomplete; if inline Task calls suffice, the term "subagent" is loose and the "five parallel" guarantee is overstated.
- **Suggested fix:** Add one sentence in §3 or §6b clarifying that fan-out uses inline Task-tool subagents (no bundled `agents/` files needed), or add the `agents/` directory to §3 if definitions are intended.

- **ID:** C-006
- **Severity:** Medium
- **Section(s):** §4 (line 102), §10 (line 411) vs §3 pack structure (lines 68–86)
- **Issue:** `/vendor-evaluation` is referenced throughout as the user-invoked entry command ("/vendor-evaluation → ask vendor name + URL," §4; "how to run (`/vendor-evaluation`)," §10 README), but §3's pack structure provides only `skills/vendor-evaluation/SKILL.md`. There is no `commands/vendor-evaluation.md`. Regardless of the underlying mechanics question, this is an internal inconsistency: the command-syntax references assume a command exists that the file structure does not define.
- **Why it matters:** A reader mapping the spec to files cannot locate what backs `/vendor-evaluation`; the §3 tree and the §4/§10 usage do not line up.
- **Suggested fix:** Either add a `commands/vendor-evaluation.md` to the §3 tree, or change §4/§10 to describe invocation via skill description (model discretion) rather than as a literal `/vendor-evaluation` slash command.

- **ID:** C-007
- **Severity:** Medium
- **Section(s):** §7 (lines 240, 281) vs §8 (line 302)
- **Issue:** Two different four-value status vocabularies drift into each other. Capacity (§7) uses **Met / Partially Met / Not Met / Insufficient Information** (line 240), then abbreviates to "Met/Partial/Not/Insufficient" in the scorecard (line 281). Procurement (§8) uses **Available / Partial / Absent / Insufficient** (line 302). The words "Partial" and "Insufficient" are therefore *abbreviations* of full capacity labels but *full labels* in procurement. The shared vocabulary with divergent meanings is a latent confusion source, and the spec never states these are intentionally two distinct scales.
- **Why it matters:** Downstream consumers (the report, the guardrail lint in §10, custom outputs) must distinguish two schemes that reuse the same tokens; "Insufficient" alone is ambiguous between "Insufficient Information" (capacity) and "Insufficient" (procurement).
- **Suggested fix:** Either rename procurement's overlapping tokens (e.g., Available / Limited / Missing / Unknown) or add an explicit note in §7/§8 that capacity and procurement use deliberately different scales and define each scale's full label set once.

- **ID:** C-008
- **Severity:** Low
- **Section(s):** §3 (lines 64, 87) vs §6a (line 181) and §9b (line 335)
- **Issue:** The workspace path placeholder drifts: §3 uses `./vendor-evaluations/<vendor-slug>/` (twice), while §6a uses `./vendor-evaluations/<vendor>/materials/` and §9b uses `./vendor-evaluations/<vendor>/report.html`. `<vendor-slug>` (the derived filesystem-safe token) and `<vendor>` (the raw name) denote different things, yet are used interchangeably for the same directory.
- **Why it matters:** Ambiguity about whether the directory is keyed on the raw vendor name or a slugified form; affects the §10 resumability/overwrite claims and any path logic.
- **Suggested fix:** Use `<vendor-slug>` consistently everywhere, and define the slug rule once (e.g., lowercased, hyphenated).

- **ID:** C-009
- **Severity:** Low
- **Section(s):** §1 (line 20), §3 (line 74), §8 (header), §9c (line 358)
- **Issue:** The "Gartner" qualifier on the procurement layer appears and disappears. §1 calls it a "Gartner-style procurement review"; §3 labels Phase 4 the "Gartner courtesy layer"; §9c's Procurement Memo lists a "Gartner checklist." But §8's own header and body drop "Gartner" entirely ("Procurement Review … — courtesy layer"). The layer is thus named four slightly different ways: "Gartner-style procurement review," "Gartner courtesy layer," "(Gartner) checklist," and bare "courtesy layer / secondary."
- **Why it matters:** Inconsistent naming of a named artifact/category, plus a trademark ("Gartner") used as a generic descriptor in some sections but avoided in others — the lint rule in §10 does not address this.
- **Suggested fix:** Pick one neutral internal name (e.g., "procurement courtesy layer") and use it everywhere; drop "Gartner" as a generic adjective or use it only where the actual Gartner Peer Insights source (§6b) is meant.

- **ID:** C-010
- **Severity:** Low
- **Section(s):** §5 (line 145), §7 Layer 3 (line 270), §9b item 4 (line 343)
- **Issue:** The personalized-scoring section is named three ways: §5 "the 'Against your priorities' scored section"; §7 Layer 3 "a dedicated **'How [vendor] measures against your priorities'** section"; §9b "★ Against your priorities — personalized scoring vs. the exec's own criteria." These refer to the same deliverable section.
- **Why it matters:** Minor, but for a spec that emphasizes a "single source of truth," a canonical named section should have one canonical name.
- **Suggested fix:** Choose one title (e.g., "Against your priorities") and reference it verbatim in §5, §7, and §9b.

- **ID:** C-011
- **Severity:** Low
- **Section(s):** §9c (line 359) vs §7 (lines 238, 252–258)
- **Issue:** The Strategic Capacity Memo (§9c) promises a "SEE/LEARN/CHANGE/EXIT story" — only four of the six criteria, omitting USE and ADAPT — with no explanation of the scoping. §7 defines all six (SEE/USE/LEARN/CHANGE/ADAPT/EXIT) as the non-negotiable framework, and §10's guardrail stance is that the framework cannot be selectively softened.
- **Why it matters:** Silent omission of two criteria in one variant could read as inconsistency with the "non-negotiable framework" invariant unless the omission is justified as legitimate audience scoping.
- **Suggested fix:** Add one clause stating the scoping is intentional (e.g., "strategic lens emphasizes the four capacity-transfer criteria; USE/ADAPT are product/agility details deferred to the Technical Deep-Dive").

- **ID:** C-012
- **Severity:** Low
- **Section(s):** §3 (lines 77, 83) vs §6 and §9
- **Issue:** Two bundled reference files are declared in §3 but never cited in the prose that should govern them. `references/source-playbook.md` (line 77, under vendor-research) is never referenced in §6 (only `evidence-standards.md` is, at line 210). `references/branding-guide.md` (line 83, under vendor-report) is never referenced in §9's branding discussion (§9a). By contrast `evidence-standards.md` is correctly cited in both §3 and §6, illustrating the expected pattern.
- **Why it matters:** Readers cannot infer the purpose or contents of `source-playbook.md` and `branding-guide.md` from the body; risk they are orphaned or duplicative of `shared/` files.
- **Suggested fix:** Add a one-line role for each where its phase is discussed (e.g., in §6b "source selection governed by `source-playbook.md`"; in §9a "rules in `branding-guide.md`"), or remove them from §3.

- **ID:** C-013
- **Severity:** Low
- **Section(s):** §4 (line 113) and §10 (lines 415–421) vs §3 pack structure
- **Issue:** The flow diagram (§4) includes a sixth, distinct step — "Closing Feedback opt-in" — after Phase 5, and §10 details it at length, but no skill in §3 owns it. The six skills map to orchestrator + Phases 1–5; the closing step has no owning component. §9 (Phase 5 / vendor-report) does not claim it either.
- **Why it matters:** An unattributed step in a phase-gated flow breaks the "each skill is small and independently testable" model and the §10 per-skill smoke-test coverage.
- **Suggested fix:** State explicitly that the orchestrator (`vendor-evaluation`) runs the closing step, or fold it into `vendor-report`.

- **ID:** C-014
- **Severity:** Low
- **Section(s):** §10 Testing (lines 398–403) vs §3 (six skills)
- **Issue:** "Per-skill smoke tests" (§10) describe only four of the six skills: intake, dossier (research), assessment, and report. The orchestrator `vendor-evaluation` and the procurement skill `vendor-procurement-review` have no smoke test described, even though procurement is a full phase (Phase 4) with its own artifact.
- **Why it matters:** Coverage gap that contradicts the "each skill is small and independently testable" claim; procurement's distinct status scale (C-007) especially warrants its own test.
- **Suggested fix:** Add smoke-test bullets for the orchestrator (gating/checkpoint/resume behavior) and procurement (status matrix + capacity cross-links).

- **ID:** C-015
- **Severity:** Low
- **Section(s):** §7 (line 240) vs source `vendor_system_prompt.md` (per brief §2) and §11 #4 (line 429)
- **Issue:** The spec cleanly renames the source's score labels from **Yes / Partially / No / Insufficient Information** to **Met / Partially Met / Not Met / Insufficient Information** (§7), and bans "Fortune 100/500" tier labels (§2). But §11 #4 instructs carrying `vendor_system_prompt.md` into `philosophy.md`/`voice-and-guardrails.md` "verbatim where still accurate; evolve where needed" *without explicitly enumerating* that the Yes/No→Met/Not-Met rename and the Fortune-100 ban are required evolutions. Since the source uses exactly those labels, a literal "verbatim where accurate" carry risks re-importing the banned/renamed terms into the shared spine.
- **Why it matters:** Potential dangling reference to retired labels inside the very files that are the "single source of truth" for scoring and tone — the opposite of consistency.
- **Suggested fix:** In §11 #4, explicitly list the required evolutions (score-label rename; Fortune-tier ban) so the verbatim-carry instruction cannot silently reintroduce them.

## Strengths
- The **six-criteria framework** (SEE/USE/LEARN/CHANGE/ADAPT/EXIT) is count-consistent everywhere it appears: "six criteria" (§6b, §7), six reference files (§3), six scored blocks (§7), "six dimensions" (§9b), and the six definitions in §7.
- **Evidence tiers** are stable: "Independent evidence / Vendor claim / Provided document" (§6) is referenced consistently as "evidence tier" downstream (§7, §9b) and as "the three evidence tiers" (§10) — no alternate names.
- **Phase numbering** (1–5 + orchestrator) is identical across §3, §4, and the §5–§9 section headers; no off-by-one or renumbering.
- The **"profile, not a grade/verdict"** guardrail is applied consistently across capacity (§7), procurement (§8), and the report scorecard (§9b) using the same vocabulary.
- The **five named runtime artifacts** (intake.md, dossier.md, capacity-assessment.md, procurement-review.md, report.html) are identical between the §3 manifest and the §4 flow diagram and each phase's "Output" line — the §3-vs-§4-vs-§9 filename check passes for these five.
- The **"no false certainty" two registers** (Tentative / Withheld) in §7 match the "two modes" referenced in §10.

## Open questions for the human
1. Is the procurement status scale (Available/Partial/Absent/Insufficient) intended to be deliberately different from the capacity scale (Met/Partially Met/Not Met/Insufficient Information), or should they be unified (C-007)?
2. Should the four §9c preset variants get dedicated filenames, or reuse the `custom-<slug>` namespace (C-004)?
3. Is the Strategic Capacity Memo's omission of USE/ADAPT intentional audience scoping (C-011)?
4. For the naming triple (C-001), which is authoritative — the `feedforward/vendor-review` marketplace-add argument or the `feedforward-vendor-review` repo directory?
5. Does the closing/feedback step belong to the orchestrator or to `vendor-report` (C-013)?
