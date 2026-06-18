# Research Dossier — Acme Co.

Vendor: Acme Co. · Primary URL: https://acme.example · Compiled 2026-06-18.
Evidence tiers per `skills/vendor-research/references/evidence-standards.md`:
[Independent] / [Vendor claim] / [Provided doc].
Personalized criteria for this exec are tracked in `derived-criteria.md`, extracted from their RFP.

## SEE — Transparency
- [Vendor claim] Acme states it "shows every system prompt" — https://acme.example/docs/transparency (accessed 2026-06-18). A claim, not proof.
- [Independent] A developer write-up reports system prompts are not exposed via the API, contradicting Acme's "shows every system prompt" claim above; the conflict is surfaced, not resolved, and routed to questions for the vendor — https://news.example/acme-review (accessed 2026-06-18).

## USE — Genuine Utility
- [Independent] G2 reviewers report a real reduction in NDA turnaround, with mixed results on complex agreements — https://www.g2.com/products/acme (accessed 2026-06-18).

## LEARN — Transferable Knowledge
- [Independent] A community thread notes users learn Acme's interface but report little transferable prompt skill — https://news.example/acme-learn (accessed 2026-06-18).

## CHANGE — Customizability
- [Vendor claim] Acme's docs state system prompts and model choice are fixed on standard plans — https://acme.example/docs/config (accessed 2026-06-18). A claim, not proof.

## ADAPT — Vendor Agility
- [Independent] Coverage shows Acme shipped support for a new frontier model within two months of its release — https://news.example/acme-models (accessed 2026-06-18).

## EXIT — Portability
- [Independent] Multiple reviewers describe export limited to a proprietary JSON format — https://www.trustradius.com/products/acme (accessed 2026-06-18).
- [Provided doc] The exec-provided MSA, §7.3, returns data only in the vendor's format — materials/acme-msa.pdf (provided document; confidential — cited by provenance only).

## Procurement topics
- [Provided doc] A SOC 2 Type II report supplied by the exec covers the application tier — materials/acme-soc2.pdf (provided document; §scope statement).

## Gaps & questions for the vendor
- Encryption key management: Insufficient — request their SOC 2 Type II report scope statement and a BAA. (Route: ask vendor.)
- Data residency: Insufficient — ask the exec whether their RFP names a region, else request the vendor's data processing agreement. (Route: ask exec.)
- Model-serving audit scope: Insufficient — request an audit report covering the model-serving layer; otherwise it is unverifiable from public sources. (Route: unverifiable.)
