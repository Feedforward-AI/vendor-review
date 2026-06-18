# vendor-review

**Opinionated, capacity-building evaluation of B2B AI vendors for senior leaders.** It runs a phased
interview and research pass, scores the vendor against a six-criteria framework, adds a courtesy
procurement review, and produces a self-contained branded report — all without ever making the
buy/don't-buy call for you. The point of view: *are you outsourcing your thinking to a vendor, or
bringing the learning internally to strengthen your organization?*

## Install

```
/plugin marketplace add Feedforward-AI/vendor-review
/plugin install vendor-review@feedforward
```

### Fallback: install from a local clone

If you'd rather run from source (or the marketplace isn't reachable):

```
git clone https://github.com/Feedforward-AI/vendor-review
```

Then point Claude Code at the cloned directory — either `claude --plugin-dir ./vendor-review`, or
add it as a local marketplace and `/plugin install vendor-review@feedforward`.

## Run

```
/vendor-review:vendor-evaluation
```

The command asks for the vendor's name and URL, confirms a workspace slug, and walks you through
five phases — pausing at a checkpoint after each so you stay in control:

1. **Intake** — an adaptive interview that meets you where you are and captures what you actually need.
2. **Research** — your own materials plus a web fan-out, merged into a cited dossier with evidence tiers and flagged gaps.
3. **Capacity assessment** — all six criteria (See, Use, Learn, Change, Adapt, Exit) scored, with an "Against your priorities" reading.
4. **Procurement review** — a courtesy status matrix cross-linked to the capacity findings.
5. **Report** — a self-contained branded report, including a "What we couldn't verify" section.

## What you get

A **Full Report** plus four ready-made cuts (brief, procurement memo, strategic-capacity memo,
technical deep-dive) and any **custom outputs** you ask for — each a self-contained, branded HTML
file. The scorecard is a **profile, not a grade**: it never collapses into a single recommendation.

## Privacy

Everything stays **local**, written under `./vendor-evaluations/<vendor-slug>/` in your current
directory. Nothing is sent anywhere unless you choose to. At the end you're offered a **feedback
opt-in** — strictly optional, and you see exactly what it would share before anything leaves your
machine.

## Development

This repo doubles as the plugin and its dev tooling. Tests are plain Node.js with zero
dependencies:

```
npm test
```
