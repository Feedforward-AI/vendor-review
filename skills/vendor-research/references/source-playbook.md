# Source Playbook — where to look, per research stream

The research phase dispatches one subagent per stream (plus brand discovery). Each agent's file
holds its own contract; this playbook is the shared map of *where to look and what's worth finding*.
Targets are tuned by the exec's intake criteria and by what any provided documents claim — the web
is used to **independently verify**, not to echo the vendor.

## 1. Vendor-owned surfaces  (agent: research-vendor-surfaces)
Homepage, product pages, public docs, pricing, the **marketing/overview** of the security/trust
portal, blog, changelog, status. Everything here is a **Vendor claim.** Capture what they say about
product, security, and roadmap. (Leave the actual audit reports and certifications on the trust portal
to the compliance stream — see stream 5.)

## 2. Technical & developer docs  (agent: research-technical-docs)
API references, SDKs, integration/OAuth docs, model disclosures, GitHub. **High-signal: this is
where you learn what the vendor truly can and can't do, beneath the marketing.** Vendor docs are
Vendor claims; GitHub issues and third-party integration write-ups are Independent.

## 3. Community & social  (agent: research-community)
Reddit, Hacker News, X, LinkedIn, YouTube demos. Independent provenance, but often anecdotal —
weight by corroboration; a single post is a lead, not a fact.

## 4. Third-party & analyst  (agent: research-thirdparty)
G2, TrustRadius, Gartner Peer Insights, news, funding/Crunchbase, layoffs and company-health
signals. Independent provenance; the backbone of corroboration.

## 5. Compliance & legal  (agent: research-compliance)
The **audit reports, certifications, and legal documents themselves** (not the marketing overview):
SOC 2 / ISO trust center artifacts, DPA, sub-processor list, ToS/privacy, HIPAA/BAA, GDPR, EU AI Act
posture. Trust-center pages are Vendor claims unless they link an audited report; third-party
confirmations are Independent. Go deep here when intake flags regulated/sensitive data.

## Brand-asset discovery  (agent: discover-branding)
Separately, discover the **exec's own** company logo + brand colors from their company domain, so
branding is ready by report time. Frequent failure is expected — fail loudly, then manual entry.

## Cross-stream rules
Dedupe across streams; organize findings by the six criteria (SEE/USE/LEARN/CHANGE/ADAPT/EXIT) plus
procurement topics; cite every line; mark gaps insufficient and route them. Tagging follows
`evidence-standards.md`.
