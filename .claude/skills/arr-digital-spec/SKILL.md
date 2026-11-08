---
name: arr-digital-spec
description: Turn a WHY.md (customer, pain point, novel angle) into a token-efficient SPEC.md plus a brand package (colors.json, fonts.md, logo.svg). Use when starting a new product build from a one-page problem statement, before any code is scaffolded.
---

# arr-digital-spec

Converts a short, informal problem statement (`docs/WHY.md`) into two durable artifacts
that everything downstream reads from:

1. `docs/SPEC.md` — the spec. Short, dense, no filler. This is the contract the
   `arr-digital-proto` skill scaffolds code against.
2. `brand/` — a tiny brand package (`colors.json`, `fonts.md`, `logo.svg`) so the
   prototype doesn't ship with default black-on-white UI.

## When to use this skill

Use it once, at the start of a project, when you have a `docs/WHY.md` (or equivalent:
a paragraph describing the customer, their pain, and the proposed angle) and need to
turn it into something buildable. Re-run it if the WHY materially changes.

## Process

### Step 1 — Read the WHY

Read `docs/WHY.md` in full. Extract, explicitly:
- the customer (who, specifically — not "users")
- the pain point (what breaks today, and why existing tools don't fix it)
- the novel angle (the one mechanic that makes this product different)

If `docs/WHY.md` does not exist yet, write it first from whatever problem statement
the user gave you, in plain prose, 1 short paragraph per bullet above. Do not skip
this — SPEC.md should never be written directly from a verbal prompt without a WHY
file existing first, because the WHY is the artifact a human reviews and signs off on.

### Step 2 — Write `docs/SPEC.md`

Token-efficiency rule: every sentence in SPEC.md must do work. No restating the WHY,
no marketing language, no filler transitions. Use exactly this section structure
(omit nothing, pad nothing):

```markdown
# SPEC: <product name>

## Problem
2-4 sentences. The gap in existing tools, stated as a mechanism, not a feeling.

## Target User
1-2 sentences. Specific enough that a feature request can be tested against it
("would a <target user> actually hit this?").

## User Stories
5-10 bullets, "As a <user>, I want <action>, so that <outcome>." Order by priority,
v1 stories first. Mark later-only stories with "(v2)".

## Data Model
One entity per heading. For each: fields with types, constraints (nullable, enum
values, defaults), and relationships. This block is what the proto skill turns
directly into ORM models — keep field names final here, not provisional.

## API Surface
One line per endpoint: `METHOD /path` — purpose — key query/body params — response
shape in one clause. Group by resource.

## UI States
List the distinct screens/modes the UI must render (empty state, loaded state,
toggled/mode state, error state). One line each: what's visible, what's hidden.

## v1 Scope cut-line
Two lists: "v1 ships" and "explicitly not v1 (why / revisit when)". Be ruthless —
a spec that ships everything has no scope cut and isn't done.
```

### Step 3 — Generate the brand package

Create `brand/colors.json`, `brand/fonts.md`, `brand/logo.svg`. These exist so a
prototype has a point of view instead of defaulting to black-on-white. They should
take a few minutes, not a design sprint.

**`brand/colors.json`** — a small palette, hex values, each with a one-line usage
note. Pick colors that reflect the product's core mechanic (e.g. a product about
splitting attention into two modes should have two colors that read as visually
distinct, not just a generic accent + neutral set). Schema `arr-digital-proto`
expects (see "Consumption contract" below):

```json
{
  "name": "<palette name>",
  "colors": {
    "primary":    { "hex": "#RRGGBB", "usage": "..." },
    "secondary":  { "hex": "#RRGGBB", "usage": "..." },
    "accent":     { "hex": "#RRGGBB", "usage": "..." },
    "background": { "hex": "#RRGGBB", "usage": "..." },
    "surface":    { "hex": "#RRGGBB", "usage": "..." },
    "text":       { "hex": "#RRGGBB", "usage": "..." },
    "muted":      { "hex": "#RRGGBB", "usage": "..." }
  }
}
```

**`brand/fonts.md`** — exactly 2 fonts, both real, free families on Google Fonts:
one heading font, one body font. For each: name, Google Fonts URL, and a 1-sentence
rationale tying it back to the product's personality (not "it looks clean").

**`brand/logo.svg`** — hand-author real SVG markup (`<svg>` with `<path>`/`<circle>`/
`<rect>`/`<text>` etc.) representing a simple, clean geometric mark. Never use a
placeholder `<img>`, external URL, or base64 blob — the whole point is a logo that
renders correctly with zero dependencies. Keep the viewBox square (e.g. `0 0 100
100`) so it scales cleanly as a favicon or nav mark. Use the palette from
`colors.json` for its fill/stroke colors so the two files agree with each other.

## Consumption contract (read by `arr-digital-proto`)

So the two skills compose without a human re-typing anything, `arr-digital-proto`
reads these exact paths and fields — keep them stable:

- `docs/SPEC.md` → section `## Data Model` is parsed informally (headings = entity
  names, bullet lines = `field: type (constraints)`) to generate ORM models and
  Pydantic schemas. Section `## API Surface` lines are parsed 1:1 into FastAPI
  routes. Section `## UI States` lines become the list of frontend view states to
  scaffold placeholders for.
- `brand/colors.json` → `colors.primary.hex`, `colors.secondary.hex`,
  `colors.background.hex`, `colors.surface.hex`, `colors.text.hex` are read
  directly into the frontend's CSS custom properties (`--color-primary`, etc).
  `colors.accent.hex` and `colors.muted.hex` are optional; if absent, proto skill
  derives them from `primary`/`text` rather than failing.
- `brand/fonts.md` → the skill looks for two `### <Role>: <Font Name>` style
  headings (role = "Heading" or "Body") and a Google Fonts URL on the next line or
  inside a markdown link; it wires that URL into `index.html` and maps the two font
  names to `--font-heading` / `--font-body` CSS variables.
- `brand/logo.svg` → copied as-is into `frontend/src/assets/logo.svg` and inlined
  in the nav bar.

## Output checklist

Before finishing, confirm all four files exist and are non-empty:
`docs/WHY.md`, `docs/SPEC.md`, `brand/colors.json`, `brand/fonts.md`,
`brand/logo.svg`. Report which were created vs. already present.
