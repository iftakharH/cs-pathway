# Design system

This is the incumbent visual system for cs-pathway. Preserve it unless the product is
deliberately rebranded. It is a reading-first field manual, not a dashboard of cards.

## Mode

- Public pages: **Read**. The visitor is here to understand a module or look up one command.
- Tracker, account and tools: **Operate**. Scanability and predictable controls outrank expression.
- Home: **Persuade**, but with the same typographic voice as the reading pages.

## World

Warm paper, dark ink, one emerald accent. Ruled sections instead of floating cards. A single
authored motion: the phase explorer panel wipe. Everything else changes state quickly and quietly.

## Type

| Role | Family | Notes |
| --- | --- | --- |
| Display and headings | Fraunces Variable | Self-hosted Latin subset, optical sizing, weight 500 |
| Body, labels, controls | Instrument Sans Variable | 16px floor, line height 1.6 |
| Code, data, timestamps | System monospace | Tabular numerals where values align |

- Prose measure: 45–75 characters. Long notes and proof copy use `max-w-[68ch]`.
- Headings: `text-wrap: balance`; paragraphs and list items: `text-wrap: pretty`.
- No eyebrow or kicker label above a heading. The heading carries its own weight.
- Display tracking never goes below `-0.04em`.

## Colour

| Token | Light | Dark |
| --- | --- | --- |
| `--bg` | `#f5f4ef` | `#0c100f` |
| `--surface` | `#fffefa` | `#141917` |
| `--surface-2` | `#edede4` | `#1b221f` |
| `--ink` | `#14181a` | `#e9ede8` |
| `--muted` | `#56615c` | `#a2aca6` |
| `--faint` | `#5f6963` | `#98a39d` |
| `--line` | `#dcdcd1` | `#29312d` |
| `--accent` | `#0e6552` | `#5cccad` |
| `--warn` | `#8a4b00` | `#e3a75a` |
| `--danger` | `#9b2c2c` | `#f08a8a` |

Body and placeholder text stay at 4.5:1 or better. Evidence labels use text plus an icon, never
colour alone. Selection and caret use the accent.

## Layout

- Page container: 76rem maximum, 1.25rem inline padding, 2rem from `768px`.
- Page header: breadcrumb, title, lede, then actions. Actions sit below the lede on mobile and to the
  right on desktop.
- Prefer full-width ruled rows over grids of equal cards. Cards are for a single repeated tool
  surface, not for page structure.
- Corners are square or near-square (`0.25rem`). No large soft cards, no nested cards.
- Spacing is tight inside a group and generous between groups. More space above a heading than
  below it.

## Components

- **Phase explorer:** horizontal tabs on desktop and a scrollable tab strip on mobile. Arrow,
  Home and End keys move the selected tab. The panel uses a clip-path wipe and respects reduced
  motion.
- **Module page:** single reading column plus a sticky section rail. Sections are ruled with
  `border-t`; no card stack.
- **Cheatsheet index:** ruled rows with title, when-to-use, phase, tags and version stamp.
- **Cheatsheet detail:** code first, then Do/Avoid, then source. The right rail is one ruled column:
  version, phase, tags, trust.
- **Agent brief:** every module and cheatsheet can copy a Markdown brief for an AI agent. The brief
  includes the source, version and date, and tells the agent not to invent facts.
- **Dashboard:** a ledger of four stats, then ruled sections. The next proof is the focal block.

## Motion

- One authored moment: the phase panel wipe, 420ms exponential ease-out.
- Everything else is a state change, not an entrance.
- `prefers-reduced-motion` sets durations to `0.001ms`.
- No scroll reveals, parallax, gradient text, glass decoration or zero-offset glows.

## Copy

- Controls name their action: “Save this browser to account”, not “Sync”.
- Errors name the problem and the recovery.
- Never promise an outcome, a job, a salary or funding.
- A forecast is labelled a forecast. A stale claim says “Needs re-check”.

## Browser surfaces

Theme the selection background, caret, scrollbar, focus ring and link underline offset. These are
part of the design, not browser leftovers.

## Accessibility floor

- 0 serious or critical axe findings on every route in both themes.
- Visible keyboard focus on every control.
- 44px minimum target for primary controls.
- No colour-only status. Text and icon carry the meaning.
- Tables keep a caption or accessible name and a mobile alternative where columns would overflow.
