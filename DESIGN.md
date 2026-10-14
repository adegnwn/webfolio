# ShowForge design direction

Status: proposed by Claude and approved by the product owner on 2026-10-14 ("ikuti semua saran"). Agent-written direction tends toward safe defaults, so treat this as a starting point and overwrite anything that does not feel like ShowForge.

Dial: ENERGY 2 / RHYTHM 1 / MOTION 1 for the editor. The video is the loud part; the tool around it stays quiet.

## Identity

ShowForge is a workbench for turning screenshots into a showreel. The editor behaves like a video tool (dark, neutral surfaces so colors in the user's media read true), with one hot accent borrowed from the name: the ember of a forge.

## Palette

| Token | Value | Use |
|---|---|---|
| `--sf-ink` | `#070708` | App background, default video background (PRD 4.2) |
| `--sf-panel` | `#0f0f11` | Side panels |
| `--sf-control` | `#18181b` | Inputs, list rows, slider tracks |
| `--sf-hover` | `#212125` | Hover state of controls |
| `--sf-line` | `#2a2a2f` | Dividers and borders |
| `--sf-paper` | `#f2efe9` | Main text, default video text color (PRD 4.2) |
| `--sf-muted` | `#9c978f` | Secondary text (5.5:1 or better on every surface) |
| `--sf-ember` | `#ff5b2e` | The one accent: the Export action, the selected template, the playhead |
| `--sf-danger` | `#ff7a6b` | Error states only |

Ember is reserved for "this is the thing that matters now". It never decorates.

## Type

- **Bricolage Grotesque** (display): headings, the product name, and the default end-card font. Its slightly irregular, inky shapes read as made-by-hand, which suits a tool for creative people.
- **Instrument Sans** (UI): panels, labels, values. Narrow and steady at 12 to 14 px, which dense settings panels need.
- Timecodes and slider values use tabular figures (`font-variant-numeric: tabular-nums`) so numbers do not jitter while the video plays.

## Identity motif

The timecode. `00:03 / 00:09` style readouts with tabular figures appear wherever time is shown, and a thin ember playhead marks the current moment.

## Shape

- Controls: 6 px radius. Panels: no radius, they meet the window edges.
- Media frames in the video use the user's `borderRadius` setting; the UI never imposes it.
- No shadows in the editor chrome: panels are separated by 1 px `--sf-line` borders. The only elevated surface is a modal.

## Motion

UI motion is limited to hover and focus changes (120 ms). All expressive motion lives in the rendered video.
