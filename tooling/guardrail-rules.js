// tooling/guardrail-rules.js
// One source of truth for the §0 guardrails. Imported by the dev lint AND asserted
// against the runtime checklist in shared/voice-and-guardrails.md (see shared-spine.test.js).
const RULES = ['recommendation', 'tier-label', 'false-certainty'];

// Deliberately-allowed opinionated phrases: the lint must NEVER flag these and the voice
// file must list them as allowed.
const ALLOWED_EXAMPLES = [
  'the purchase decision remains yours',
  'this poses extreme risk',
  'we recommend you ask the vendor',
];

// Literal purchase-VERDICT statements (all global for full-text scanning).
const RECOMMENDATION = [
  /\b(?:do ?n['’]?t|do not)\s+(?:buy|purchase)\b/gi,
  /\byou\s+should\s+(?:buy|purchase|adopt|procure|sign|proceed|move\s+forward|pass|skip)\b/gi,
  /\b(?:buy|purchase)\s+(?:this|it|the\s+(?:tool|product|vendor|deal|platform)|[A-Z][\w-]+)\b/g, // "buy Acme", "purchase the product"
  /\b(?:strongly\s+)?recommend(?:s|ed|ing)?\s+(?:buying|purchasing|adopting|procuring|signing|proceeding|moving\s+forward|this|it|the\s+(?:tool|product|vendor|purchase|deal))\b/gi,
  // "we/I recommend ..." EXCEPT investigative guidance ("we recommend you ask/confirm/...")
  // and EXCEPT the purchase-verb forms already caught by the specific regex above (avoids
  // double-counting "we recommend buying" as both this rule and the one above).
  /\b(?:we|i|our\s+team)\s+recommend(?:s|ed)?\b(?!\s+(?:that\s+)?(?:you\s+)?(?:ask|confirm|verify|clarify|request|require|evaluate|review|investigate|press|push|buying|purchasing|adopting|procuring|signing|proceeding|moving\s+forward)\b)/gi,
  /\b(?:our\s+)?recommendation(?:\s+is)?:?\s+(?:to\s+)?(?:buy|purchas\w+|adopt|proceed|pass|skip|do ?n['’]?t)/gi,
  /\boverall\s+grade\b/gi,
  /\boverall:\s*(?:not\s+)?recommended\b/gi,
  /\bscore:\s*[A-F][+-]?\b/gi,
];

const TIER = /\bFortune[\s-]*(?:100|500)\b/gi;

// Bare "verdict" is a violation UNLESS negated in the preceding window.
const VERDICT_MARKER = /\bverdict\b/gi;
const NEGATION_BEFORE = /\b(?:not|without|no|never|isn['’]?t|do ?n['’]?t|avoid)\b/i;

const CERTAINTY_MARKER = /\b(?:Insufficient(?:\s+Information)?|Withheld)\b/gi;
// A SPECIFIC named artifact (deliberately excludes bare "report"/"document").
const NAMED_ARTIFACT = /\b(?:SOC\s?2(?:\s+Type\s+I{1,2})?|ISO\s?27001|DPA|BAA|sub-?processor\s+list|pen[-\s]?test\s+report|pricing\s+quote|SLA|SIG|CAIQ|HECVAT|certificat\w+|audit\s+report|MSA|data\s+processing\s+agreement)\b/i;

module.exports = { RULES, ALLOWED_EXAMPLES, RECOMMENDATION, TIER, VERDICT_MARKER, NEGATION_BEFORE, CERTAINTY_MARKER, NAMED_ARTIFACT };
