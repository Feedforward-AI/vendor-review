# Evidence Standards — how every finding is tagged and trusted

This file is **authoritative** for how `dossier.md` tags evidence. Every finding the research phase
records — from the web or from a document the exec provided — carries one **provenance tag** and a
citation.

## The three provenance tiers (the dossier tag)

Tag each finding with exactly one of:

1. **Independent** — third-party, community, or analyst sources the vendor does not control (G2,
   news, GitHub issues, forum reports). **The strongest provenance**, because the vendor can't
   author it.
2. **Vendor claim** — anything from the vendor's own surfaces, docs, or proposal. A **claim, not proof.** Record it, then look for Independent corroboration.
3. **Provided doc** — a primary-source document the exec supplied (contract, SOC 2 report, pricing
   quote). Primary source, but **may be confidential**: cite it by provenance only (file name +
   section), never paste confidential contents into the dossier or report.

### Provenance vs. reliability
The provenance tag says *who the source is*, not *how much to trust it*. **Reliability follows from independent corroboration**, not from who is speaking: a single anonymous forum post is `Independent`
but weak; a vendor's published status page is a `Vendor claim` you can rely on for *its reported
uptime last quarter*. This reconciles with the Tier 1/2/3 reliability scale in
`shared/voice-and-guardrails.md`: that scale weighs trust; these three tags record provenance. When
the two seem to disagree, **this file governs the dossier label.**

## Citation rule
Every finding cites its **source URL + access date** (ISO `YYYY-MM-DD`). Provided docs cite the
**file name + the relevant section** — **not** an access date (that web-finding shape doesn't apply to
a document the exec handed you). No citation → it does not go in the dossier.

## Claims vs. proof, and conflicts
Marketing and vendor statements are **claims, not evidence.** When a **vendor claim conflicts with
independent evidence, surface the conflict** explicitly in the dossier (don't pick a winner
silently) and route it to questions for the vendor.

## Never fabricate; default to insufficient
**Never fabricate** a source, quote, fact, or date. When the evidence is thin, mark the item
**insufficient** and name the specific artifact that would close it (e.g. "request their SOC 2 Type
II report") — never a bare "more research needed." Gap routing lives in the research skill.
