# Vendor Evaluation Skill Pack — Design Spec

**Date:** 2026-06-18
**Owner:** Feedforward (Adam Davidson)
**Status:** Approved design → ready for implementation planning

---

## 1. Purpose & Point of View

A downloadable **Claude Code plugin** that walks a self-serve executive through a phased,
research-heavy, interactive evaluation of a B2B AI-powered SaaS vendor and produces a polished,
branded report.

The product has a **distinctive, non-negotiable point of view** (the Feedforward lens): the central
question about any AI vendor is *"Are you outsourcing your thinking to a vendor, or bringing the
learning and understanding internally to strengthen your organization?"* This capacity-building lens
is the **core product**. A conventional Gartner-style procurement review is offered as a **courtesy**
layer, secondary in priority, and cross-linked back to the capacity lens wherever a procurement fact
carries strategic weight.

### Foundational philosophy (carried from the existing system prompt, evolved)
- **The economics have changed** — AI SaaS has real COGS (inference), creating misaligned incentives.
- **The moat has eroded** — core capability rests on commodity foundation models, so vendors
  manufacture lock-in.
- **The stakes are organizational** — durable advantage comes from organizational AI fluency; a quick
  vendor win can delay the learning that matters more.

### Opinionation guardrail (the defining tone rule)
- Be **maximally explicit** about where the vendor falls on every criterion **and on the executive's
  own stated criteria**. Name risks bluntly (e.g., *"This poses extreme risk."*).
- **Never issue a buy/don't-buy verdict.** State where it falls and how severe the risk is; the
  executive draws the purchase conclusion.
  - ✅ Allowed: *"Company XYZ uses a proprietary system unique to itself. This poses extreme risk."*
  - ❌ Not allowed: *"…so don't buy it."*

---

## 2. Audience & Operator

- **The executives themselves run the tool** (self-serve), not Feedforward consultants.
- The audience is **heterogeneous** — large enterprises, hedge funds, PE firms — with widely varying
  technical fluency and ability to articulate what they need.
- **No tier labels anywhere in the tool** — never "Fortune 100," "Fortune 500," or similar. Use neutral
  language ("senior leaders," "your organization").
- Tone for self-serve: guide gently, explain jargon in one line, never condescend, never overwhelm.

---

## 3. Distribution & Packaging

- Shipped as a **single Claude Code plugin**, distributed through a **public** Feedforward-hosted
  marketplace (a git repo containing `.claude-plugin/marketplace.json`). Public so people can share
  and test it.
- Install (documented copy-paste in README):
  ```
  /plugin marketplace add feedforward/vendor-review   # one time
  /plugin install vendor-review@feedforward           # installs the pack
  ```
  Fallback: `git clone` + local `/plugin install`.
- Packaging as a plugin (not loose `~/.claude/skills/` copies) keeps `skills/` + `shared/` bundled as
  one unit and lets sub-skills resolve shared files and the HTML template via `${CLAUDE_PLUGIN_ROOT}`.
- **Workspace lives in the user's project, not the plugin.** Installed plugins are read-only cache;
  per-evaluation artifacts are written to the user's CWD at `./vendor-evaluations/<vendor-slug>/`.

### Pack structure
```
feedforward-vendor-review/              # repo + plugin root (plugin name: vendor-review)
├── .claude-plugin/plugin.json
├── README.md
├── skills/
│   ├── vendor-evaluation/              # ORCHESTRATOR — entry point
│   │   └── SKILL.md
│   ├── vendor-intake/                  # Phase 1 — adaptive Q&A
│   │   └── SKILL.md
│   ├── vendor-research/                # Phase 2 — BYO materials + parallel web fan-out
│   │   └── SKILL.md + references/{source-playbook, evidence-standards}.md
│   ├── vendor-capacity-assessment/     # Phase 3 — the six criteria (CORE)
│   │   └── SKILL.md + references/{see,use,learn,change,adapt,exit,scoring-rubric}.md
│   ├── vendor-procurement-review/      # Phase 4 — Gartner courtesy layer
│   │   └── SKILL.md + references/procurement-checklist.md
│   └── vendor-report/                  # Phase 5 — branded HTML + variants + custom outputs
│       └── SKILL.md + assets/{report-template.html, theme.css} + references/branding-guide.md
├── shared/
│   ├── philosophy.md                   # evolved system prompt / POV
│   └── voice-and-guardrails.md         # all cross-cutting rules (single source of truth)
└── (runtime, in user CWD) ./vendor-evaluations/<vendor-slug>/
        ├── intake.md  ├── dossier.md  ├── capacity-assessment.md
        ├── procurement-review.md  ├── report.html  └── custom-*.{md,html}
```

Each skill is small and independently testable. The shared spine guarantees consistent POV/guardrails.

---

## 4. Phase Flow & State

The orchestrator (`vendor-evaluation`) drives gated phases. **State passes as inspectable artifact
files on disk**, so each phase is resumable and the executive can read every intermediate.

```
/vendor-evaluation → ask vendor name + URL, create workspace
   ├─ Phase 1  Intake (adaptive Q&A)        → intake.md              → ✅ checkpoint
   ├─ Phase 2  Research (BYO + web fan-out)  → dossier.md (cited)     → ✅ checkpoint
   ├─ Phase 3  Capacity assessment          → capacity-assessment.md → ✅ checkpoint
   │            ▲   └─ back-edge: if a confident score is blocked, name the
   │            └──── specific gap and re-enter targeted research (Phase 2)
   ├─ Phase 4  Procurement review           → procurement-review.md  → ✅ checkpoint
   ├─ Phase 5  Branding + report + variants  → report.html / custom-* → done
   └─ Closing  Feedback opt-in (privacy-first)
```

At each **checkpoint** the orchestrator summarizes the phase output and asks the exec to confirm or
adjust before continuing. The exec can stop after any phase and resume later (artifacts persist).
Re-running a phase overwrites only its own artifact.

---

## 5. Phase 1 — Intake (`vendor-intake`)

### Adaptive objectives, not a fixed script
Eight **information objectives** the intake must satisfy — reasoned against after every answer, not
marched through linearly. The skill **skips** what's already answered, **drops** irrelevant branches,
**asks emergent** questions when an answer opens a material thread, **reorders** for natural flow, and
**stops when every objective is answered or explicitly N/A** (not after a fixed count). Light guardrails
prevent over-interviewing; the exec can say "keep it quick" to compress to essentials.

Objectives:
1. **Vendor** — name + primary URL + what it claims to do.
2. **Goal** — the problem to solve; what success looks like in 6–12 months.
3. **Their own top criteria** — the 3–5 things *they* care about most (drives personalized scoring).
4. **Alternatives** — other vendors/approaches considered, including **build-internally** and **do-nothing**.
5. **AI-journey stage** — Exploring / Piloting / Scaling / AI-native.
6. **Intent + horizon** — quick win / strategic capability / stopgap, and how long they expect to rely on it.
7. **Regulated/sensitive data** — HIPAA / GDPR-EU / financial / none-unsure (sets procurement depth).
8. **Risk posture** — immediate productivity vs. long-term capability & avoiding lock-in.

Also captures **their company** (used later for auto-branding discovery).

### Meet people where they are (calibration)
Opens wide and low-pressure ("In your own words, what are you hoping to evaluate, and what's prompting
it?"). Continuously gauges (a) how *specific* the need is and (b) how *fluent* they are, and re-gauges
after every answer (never locks; someone can be precise on compliance and fuzzy on "agent").
- **Precise/fluent input** → mirror precision, no definitions, capture criteria verbatim, move fast,
  pressure-test where useful.
- **Vague input** → scaffold: concrete options, examples, inline definitions, help them *discover*
  criteria, then **reflect back** a crisper articulation to confirm. Turning a fuzzy desire into real
  criteria is itself part of the value.
- **Never condescend, never overwhelm.** Match their vocabulary.
- **Need-first vs vendor-first** — if no vendor is named yet, help them name the one(s) they're weighing
  (tool evaluates one named vendor at a time); if undecided, help pick a first candidate.

### "I'm not sure" path
Every question offers an "I'm not sure — help me think about this" branch that explains the concept,
then re-asks.

### Output
`intake.md` — structured context that personalizes all downstream phases.

### How intake answers personalize the report
| Intake answer | Effect |
|---|---|
| Their top criteria (#3) + RFP-derived criteria | Adds the "Against your priorities" scored section; reweights the exec summary |
| AI-journey stage (#5) | Calibrates emphasis on SEE/LEARN/CHANGE; tunes jargon level |
| Intent + horizon (#6) | Sets how severe EXIT/lock-in reads |
| Regulated data (#7) | Sets procurement depth (HIPAA/BAA, EU AI Act, residency) |
| Alternatives (#4) | Competitive framing + the "have you weighed building internally?" capacity question |
| Risk posture (#8) | Tunes how pointed the capacity warnings are |

---

## 6. Phase 2 — Research (`vendor-research`)

### 6a. Bring-your-own materials (opening step)
Before touching the web, ask gently (with examples) for anything the exec already has:
- **Internal:** security/procurement/data-handling policies, an **RFP/requirements doc**, prior eval notes.
- **From the vendor:** proposal/SOW, pricing quote, completed security questionnaire (SIG/CAIQ), a
  SOC 2 report they were handed, MSA/contract.

**Hand-holding to get files in** (assume they've never done this). The skill creates and names the exact
folder — `./vendor-evaluations/<vendor>/materials/` — and offers OS-aware paths:
1. Drag the files in ("On Mac, drag them into this Finder folder: `<absolute path>`" + Windows/Linux equiv).
2. Paste the text into chat.
3. Point me at a path or link.
4. *"Don't have anything? Fine — I'll work from public sources."* (never blocks)

Then it **confirms receipt**: lists the folder, reads each file, summarizes, and clearly flags anything
unreadable (offering the paste fallback). Handles PDF, Word, text, and screenshots; converts when needed.

Payoffs: provided docs enter the dossier as **primary-source evidence** (often non-public); an RFP/policy
doc **feeds back to enrich intake** (extract added criteria + the org's compliance bar) and is reflected
back to confirm.

### 6b. Web fan-out (five parallel streams)
Dispatch **parallel subagents**, one per stream, each running many WebSearch/WebFetch calls, targeted by
intake criteria and by what provided docs claim (web is used to **independently verify**, not echo):
1. **Vendor-owned surfaces** — homepage, product/docs, pricing, security/trust portal, blog, changelog, status.
2. **Technical & developer docs** — API refs, SDKs, integration/OAuth docs, model disclosures, GitHub.
   *High-signal: where you learn what the vendor truly can/can't do, beneath the marketing.*
3. **Community & social** — Reddit, Hacker News, X, LinkedIn, YouTube demos.
4. **Third-party & analyst** — G2, TrustRadius, Gartner Peer Insights, news, funding/Crunchbase, layoffs/health.
5. **Compliance & legal** — SOC2/ISO trust center, DPA, sub-processors, ToS/privacy, HIPAA/BAA, GDPR, EU AI Act.

Also runs the small **brand-asset discovery** task (logo + brand colors from the exec's company domain)
so branding is ready by report time.

Merge into **`dossier.md`** — deduped, organized by the six criteria + procurement topics, **every line
cited (URL + access date)**, gaps marked *"insufficient → question for vendor."*

### Evidence discipline (`evidence-standards.md`)
Every finding tagged with one of three tiers, visible downstream:
1. **Independent evidence** (third-party/community/analyst) — strongest.
2. **Vendor claim** (their own surfaces/proposal) — a *claim*, not proof.
3. **Provided document** (primary source, may be confidential).

Rules: never fabricate; default to *insufficient* when uncertain; cite everything; and when a **vendor
claim conflicts with independent evidence, surface the conflict explicitly.**

### Fail loudly + gap routing
Finding the exact doc is hard and the web is full of confounding/conflicting signal. **Surface gaps and
conflicts; never paper over them.** Each gap is routed one of three ways:
| Missing info is… | Action |
|---|---|
| Findable with sharper searching | **Targeted re-research** on that one question |
| Something the exec might have | **Ask them** for the specific document (back to materials intake) |
| Only the vendor can answer | Goes into **questions for vendor** |

### Checkpoint
Exec sees what each stream found, the gaps, and claim-vs-reality conflicts; can add materials or point
research at a specific worry before scoring.

---

## 7. Phase 3 — Capacity Assessment (`vendor-capacity-assessment`) — the core

Reads `intake.md` + `dossier.md` + shared spine. Three layers.

### Layer 1 — Score the six criteria
For each of **SEE · USE · LEARN · CHANGE · ADAPT · EXIT**:
- **Score:** Met / Partially Met / Not Met / Insufficient Information.
- **2–4 sentence assessment**, grounded in specific citations, with evidence tier visible.
- **Trade-off** (what you gain / what you give up).
- **2–3 pointed questions** for the vendor where gaps exist.

Each criterion's reference file (`see.md` … `exit.md`) is the evolved source-doc prompt + a **scoring
rubric** (what separates Met / Partially / Not Met) and a requirement that every score cite dossier
evidence. *Insufficient Information* is a first-class, respectable outcome.

Criterion definitions:
- **SEE** — Transparency: can you see prompts (incl. system), model selection logic, context/RAG strategy, inference params?
- **USE** — Genuine utility: measurably better outcomes vs. alternatives (incl. simpler ones); real vs. felt productivity; case studies.
- **LEARN** — Transferable knowledge: does usage build portable AI skills, or only teach this tool's UI?
- **CHANGE** — Customizability: can you modify system prompts, models, retrieval, inference params?
- **ADAPT** — Vendor agility: how fast they adopt new models/techniques vs. frontier cadence.
- **EXIT** — Portability: proprietary formats/lock-in; can data & workflows be exported in standard formats?

### Layer 2 — Calibrate to this exec (emphasis, never facts)
Calibration tunes how a finding is **contextualized**, never whether it appears or what it scores.
**The framework is non-negotiable.** The exec can *reject a conclusion* (recorded as their stated
disagreement) but cannot make a finding soften away. Example: for a 6-month stopgap, EXIT still scores
**Not Met** and the lock-in is fully described; calibration only adds *"less decisive given your short
horizon — but here's the risk if that horizon slips."* The relevance narrative flexes both directions;
the score and evidence stand.

### Layer 3 — Score against their stated priorities
A dedicated **"How [vendor] measures against your priorities"** section gives each exec-stated criterion
(intake #3 + RFP-derived) a direct, cited verdict. Most personalized, most opinionated part.

### No false certainty
When evidence won't support a confident call, say so plainly in one of two registers, **always naming the
specific missing artifact**:
- **Tentative:** *"Here's our assessment — provisional; here's specifically what would firm it up."*
- **Withheld:** *"Not enough information to assess — here's specifically what we'd need."*

### Back-edge to research
When a confident score is blocked, name the exact gap and re-enter **targeted research** (often with the
exec's help) before finalizing.

### Output & checkpoint
`capacity-assessment.md` — six scored blocks + "against your priorities" + an **overview scorecard**
(counts of Met/Partial/Not/Insufficient, presented as a **profile, not a single grade that implies a
verdict**) + a draft key-takeaway and sentiment (positive/neutral/negative describing the *character of
the trade-offs*, not a recommendation). Exec can challenge any score or add context.

---

## 8. Phase 4 — Procurement Review (`vendor-procurement-review`) — courtesy layer

Opens with an explicit frame: *conventional due diligence offered for completeness; the strategic core is
the capacity assessment above.* Depth driven by intake #7 (regulated data triggers deep dives).

### Checklist
| Category | Items |
|---|---|
| Security & compliance | SOC 2 Type II, ISO 27001, GDPR, **HIPAA/BAA**, data residency, encryption & key mgmt (BYOK), SBOM, pen-test/audit cadence, **data-training/IP terms** |
| Legal & regulatory | DPA, sub-processor list, ToS (auto-renewal, termination penalties), **EU AI Act** risk classification & posture |
| Reliability & ops | published **runtime SLA**, uptime/status history, incident response, support tiers |
| Commercial | pricing model & transparency, contract flexibility, **financial stability** (funding, runway, layoffs, pre-IPO risk) |
| Enterprise-readiness | SSO/SAML, SCIM, RBAC, audit logging, deployment & governance controls |
| Integration & scale | connector ecosystem, **API maturity** (read-only vs write, webhooks), reference deployments at scale |

Each item gets a cited status (Available / Partial / Absent / Insufficient).

### Capacity cross-links (the distinctive move)
Wherever a procurement fact carries strategic weight, tag it back to the six criteria:
- Vendor-proprietary OAuth/connector model → deepens **EXIT** lock-in.
- Opaque architecture / model not in SOC 2 scope → reinforces **SEE** opacity.
- "We may use your data to improve our models" → data-control + **LEARN/EXIT** risk.
- Auto-renewal + early-termination penalty → raises **EXIT** switching cost.
- Read-only API, writes require enterprise negotiation → limits **CHANGE/EXIT**.

### Same honesty rules
No false certainty, fail loudly. A missing SOC 2/DPA → tentative/withheld status that names the specific
artifact ("request their SOC 2 Type II report and current sub-processor list") and routes it.

### Output & checkpoint
`procurement-review.md` — a categorized status matrix (a checklist **profile, not a rival verdict-grade**)
+ cross-links + gap questions. Exec can flag a compliance must-have to dig deeper on.

---

## 9. Phase 5 — Report Builder (`vendor-report`)

### 9a. Branding (themeable; auto-discover → confirm)
Offer three paths, in order:
1. **Auto-discovered from their company site** — show the logo + colors found during research and
   **confirm before using** ("are these right?").
2. **Fail loudly** if not found/unsure → fall back and ask.
3. **Feedforward-branded** (default look) or **manual entry**.
Never silently apply guessed branding. Captures org name, logo (inlined as **base64** so the HTML stays
self-contained), primary/accent colors (CSS variables), and a themeable confidentiality footer line.

### 9b. Full Report (always generated — the canonical record)
One **self-contained HTML** (inlined CSS + logo, zero external deps, opens anywhere, prints to PDF via an
`@media print` block, no JS) at `./vendor-evaluations/<vendor>/report.html`. Structure:
1. Cover/header — vendor, category, report title, version, today's date, branding.
2. Executive Summary — Key Takeaway box + sentiment + "what kind of org this suits / doesn't" (no buy/don't-buy).
3. Evaluation Overview — scorecard (counts + six dimensions; a profile, not a grade).
4. **★ Against your priorities** — personalized scoring vs. the exec's own criteria (placed prominently).
5. Detailed capacity evaluation — six criteria (cited assessment, trade-offs, vendor questions, score
   badge); **claim-vs-evidence conflicts shown inline**.
6. Trade-off summary table.
7. Procurement Assessment (courtesy) — status matrix + capacity cross-links, clearly framed as secondary.
8. **What we couldn't verify** — the *insufficient / failed-loudly* gaps + the specific info that would
   resolve each (candor lives in the deliverable, not just the chat).
9. Key questions for your decision — 5–6, personalized.
10. References — numbered, URL + access date, evidence tier flagged; provided docs cited by provenance
    only (no confidential contents leaked).
11. Footer — themeable confidentiality line + framework attribution + version.

Template in `vendor-report/assets/report-template.html` + `theme.css`, filled from the artifacts.

### 9c. Preset audience cuts (projections of the same artifacts — built on demand)
The report phase asks **"Who will see this?"** and recommends/generates the matching cut(s):
| Variant | Length | Audience | Contents |
|---|---|---|---|
| **Executive Brief** | ~1 pg | A busy senior sponsor (or at-a-glance) | Key takeaway, sentiment, scorecard, top 3 strengths + 3 risks, headline "against your priorities," top 3 questions |
| **Procurement Memo** | ~2–4 pg | Procurement/security/legal/vendor-mgmt | Gartner checklist with capacity cross-links, gaps-to-resolve, consolidated vendor questions; compressed capacity context |
| **Strategic Capacity Memo** | ~2 pg | Board/strategy/CEO long-term | Pure Feedforward POV applied to this vendor; SEE/LEARN/CHANGE/EXIT story; no checklist, no product detail |
| **Technical Deep-Dive** | ~3–5 pg | Architects/AI-leads who'd implement | Developer-doc findings, real customizability, transparency mechanics, API maturity, portability specifics |

Each cut is its own self-contained, branded HTML.

### 9d. Custom outputs (open-ended)
The exec describes any output in plain language (e.g., *"a short email to my boss," "a detailed memo on
just the EU AI Act exposure," "a slide outline for the steering committee"*). The skill interprets
**audience, format** (email / memo / bullet brief / slide outline / branded HTML), **length, focus**, and
renders it — emails as copy-paste text, formal docs as branded HTML — saved as `custom-<slug>.{md,html}`.
Unlimited; any time after the assessment exists.

Three rules keep it honest (it's a **repackaging**, never a new analysis or a different posture):
1. **Draws only from the artifacts.** If a request needs depth we lack, **fail loudly**, name the gap,
   offer targeted re-research before writing.
2. **Same guardrails carry over** — cited, no false certainty, **no buy/don't-buy verdict**. "Write an
   email convincing my boss to buy this" → an honest summary, not advocacy.
3. **Narrowing is fine; distorting isn't.** Scoping to one topic/audience is legitimate (the full report
   remains the record); cherry-picking to mislead is not.

---

## 10. Cross-Cutting Concerns

### Shared spine
- **`shared/philosophy.md`** — evolved system prompt: foundational POV, what excellent vendors look like,
  analyst-not-decision-maker stance, scoring methodology.
- **`shared/voice-and-guardrails.md`** — single source of truth for: pointed/declarative tone; no
  buy/don't-buy; no tier labels; explain jargon; adaptive Q&A / meet-them-where-they-are; framework is
  non-negotiable; no false certainty (two modes); fail loudly + name the gap + 3-way routing; the three
  evidence tiers; never fabricate.

### Error handling & edge cases
- Web fetch fails/blocked/paywalled → retry, alternate source, then mark insufficient + name gap.
- Vendor ambiguous (same-name companies) → confirm identity/URL.
- Conflicting online info → surface conflict, ask exec to refine (may loop to research).
- Unreadable file → tell them, offer paste fallback, convert when possible.
- A research stream dies → degrade gracefully; note the missing stream in "what we couldn't verify."
- Resumability → artifacts on disk; stop/resume any phase; re-running a phase overwrites only its artifact.

### Testing
- **Golden fixtures** — the four existing reports (Glean, Harvey, Legora, Conveo) anchor regression: run
  the pack on each and compare structure, criteria coverage, key findings to known-good outputs.
- **Offline/fixture mode** — cache a dossier so intake→assessment→report runs without live web.
- **Per-skill smoke tests** — intake hits all objectives; dossier has citations + evidence tiers + gap
  flags; assessment scores all six + against-priorities; report renders valid self-contained HTML across
  all variants.
- **Guardrail lint** — scan generated outputs for forbidden patterns: buy/don't-buy phrasing, tier labels
  ("Fortune 100"), uncited claims.

### README & distribution
Public marketplace repo with `marketplace.json` + `plugin.json`; README covers the POV, two-command
install (+ git-clone fallback), how to run (`/vendor-evaluation`), the phases, what you get, and a
privacy note (everything local; feedback opt-in).

### Closing step — feedback opt-in (privacy-first)
After the report, ask — clearly and optionally — whether they'd share **with the Feedforward team** to
improve the tool, with **granular consent**: feedback only / feedback + report / nothing (default).
If they opt in: a short guided feedback Q&A (useful? accurate? wrong or missing? experience?) plus the
**technical-issues log** the run quietly collected (fetch failures, unreadable files, gaps). **Delivery is
a prefilled `mailto:` email to a Feedforward address or a feedback-form link the exec reviews and sends**
— nothing leaves their machine without an explicit send. No silent telemetry; the confidential report is
shared only on explicit consent.

---

## 11. Open Items for Implementation Planning
- Exact Feedforward marketplace repo name/slug and feedback email/form endpoint.
- Default Feedforward theme values (hex palette, fonts) extracted from the existing report design.
- Whether `.docx` conversion relies on a bundled approach (e.g., pandoc/textutil) or native Read support.
- Final wording of `philosophy.md` and `voice-and-guardrails.md` (carry forward the existing
  `vendor_system_prompt.md` verbatim where still accurate; evolve where needed).
```
