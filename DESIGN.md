# ShowForge design direction

Status: proposed by Claude and approved by the product owner on 2026-10-14 ("ikuti semua saran"). Agent-written direction tends toward safe defaults, so treat this as a starting point and overwrite anything that does not feel like ShowForge.

Dial: ENERGY 2 / RHYTHM 1 / MOTION 1 for the editor. The video is the loud part; the tool around it stays quiet.

Themes: dark and light (requested by the product owner on 2026-10-17). Dark stays the default for a first visit when the system has no preference.

## Identity

ShowForge is a workbench for turning screenshots into a showreel. The editor behaves like a video tool (neutral surfaces in both themes, so colors in the user's media read true), with one hot accent borrowed from the name: the ember of a forge.

## Palette

Both themes use the same token names; only the values change (`app/globals.css`). The theme follows the system on the first visit and remembers the user's choice from the toggle in the navbar.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--sf-bg` | `#070708` | `#f3f0ea` | App background (`background`) |
| `--sf-panel` | `#0f0f11` | `#ebe7df` | Side panels |
| `--sf-control` | `#18181b` | `#e2ddd3` | Inputs, list rows, slider tracks |
| `--sf-hover` | `#212125` | `#d8d2c6` | Hover state of controls |
| `--sf-line` | `#2a2a2f` | `#cbc4b6` | Dividers and borders |
| `--sf-stage` | `#0b0b0d` | `#e4e0d8` | Area around the video preview |
| `--sf-fg` | `#f2efe9` | `#151311` | Main text (`foreground`) |
| `--sf-muted` | `#9c978f` | `#5e594f` | Secondary text (4.6:1 or better on every surface in both themes) |
| `--sf-ember` | `#ff5b2e` | `#c93d17` | The one accent: the main action, the selected template, the playhead, focus rings |
| `--sf-on-ember` | `#070708` | `#ffffff` | Text on ember (6.5:1 dark, 5.0:1 light) |
| `--sf-danger` | `#ff7a6b` | `#b3261e` | Error states only |

Ember is reserved for "this is the thing that matters now". It never decorates. Light mode uses a darker ember so it keeps 3:1 against every light surface.

The video itself does not follow the app theme: its background and text colors are part of the showreel (`settings.background`, `settings.textColor`), so the export looks the same whichever theme the editor is in.

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
