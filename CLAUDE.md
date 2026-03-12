# Cadillac F1 Hub — Mission Tracker

> **Version:** `1.1.0-rigor` | **App:** Cadillac F1 Hub | **Author:** Shawn Blackman

---

## Mission Brief

Build a production-grade, responsive **Cadillac Formula 1 Watch-Along Event Hub** that celebrates Cadillac's 2026 F1 debut at the Australian Grand Prix. The hub integrates live telemetry, interactive visualizations, and a community RSVP experience — all anchored to the Cadillac V-Series brand identity.

This document is the authoritative reference for Claude CLI sessions. It exists to mitigate LLM memory drift across conversations by encoding the full mission state derived from `mission_interfaces.ts`.

---

## Project Philosophy

### Chatbot Rigor → F1 Implementation

The `-rigor` suffix in `version: "1.1.0-rigor"` is intentional. It binds the engineering discipline established in the **IBM SkillsBuild Chatbot Lab** to this project. The three pillars of Chatbot Rigor — Accuracy, Robustness, and Information Architecture — map directly to F1 hub requirements:

---

### Pillar 1: Accuracy → Telemetry Fidelity

**Chatbot origin:** The chatbot engine computes a weighted confidence score per intent (`len(keyword) * intent.priority`), producing a `confidence` value in `[0.0, 1.0]`. When confidence falls below `ESCALATION_THRESHOLD = 0.25`, the response is flagged `escalate: True` — meaning "do not trust this output without human review."

**F1 mapping:**
- Every telemetry data point rendered in the UI must carry a **provenance tag** identifying its `TelemetryProvider` source (`'OpenF1' | 'FastF1' | 'Ergast' | 'F1-Telemetry-Client'`).
- Data age is tracked via `ITelemetryService.isDataStale(lastUpdate: Date)`. Any stream exceeding the **30-second threshold** must be visually flagged — the F1 equivalent of `escalate: True`.
- Plotly visualizations must accurately reflect the underlying `TelemetryStream` arrays (`timestamp`, `speedKmh`, `throttlePercentage`, `drsActive`) without interpolation artifacts.
- **Rule:** Never display unverified data silently. Flag it, just as the chatbot escalates low-confidence responses.

---

### Pillar 2: Robustness → Defensive Programming

**Chatbot origin:** The chatbot normalizes every input (lowercase, strip punctuation, collapse whitespace) before scoring. It handles empty strings, whitespace-only input, `KeyboardInterrupt`, and `EOFError` — never crashing, always returning a valid `Response`.

**F1 mapping:**
- `ITelemetryService.handleConnectionGuard()` is a hard contract: API failures must be caught and handled without crashing the UI. No unhandled promise rejections.
- Edge cases that must be handled explicitly: API timeout, DRS data gaps in `TelemetryStream.drsActive[]`, empty `activeServices[]` array at startup, and partial data responses.
- Form validation in the RSVP module mirrors input normalization: names require 2+ words with valid characters; email must pass regex; location requires 4+ characters. Validation runs on submit, not silently on blur.
- Dark mode and reduced-motion preferences are persisted to `localStorage` — state survives page reload, just as the chatbot's REPL survives `KeyboardInterrupt`.
- **Rule:** Every external boundary (API, user input, localStorage) must be defended. Assume failure; handle gracefully.

---

### Pillar 3: Information Architecture → Phase-Gated Execution

**Chatbot origin:** The chatbot pipeline is strictly layered: `normalize input → detect frustration → score intents → return Response`. No step is skipped. Intents carry explicit `priority` tiers (1–3) that govern scoring weight. The pipeline never short-circuits past the frustration check.

**F1 mapping:**
- The `ExecutionPhase[1–4]` protocol enforces the same discipline. Each phase has a defined `terminalCommand`, `description`, and `validationCriteria[]` that **must pass** before advancing to the next phase — analogous to passing the frustration check before scoring.
- `validationCriteria` arrays are the F1 equivalent of the chatbot's `ESCALATION_THRESHOLD`: a formal gate that prevents proceeding on bad state.
- The UI's section order (Hero → Schedule → Predictions → RSVP → Links) reflects a deliberate information hierarchy — users move through a funnel, not a flat page.
- **Rule:** Execution is sequential and gate-checked. Do not advance a phase with a `failed` or unvalidated predecessor.

---

## Execution Protocol

Phases are derived from `ExecutionPhase` in `mission_interfaces.ts`. Update `status` as work progresses.

| # | Title | Status | Terminal Command |
|---|-------|--------|-----------------|
| 1 | Foundation & Branding | `pending` | `open index.html` |
| 2 | Telemetry Integration | `pending` | TBD per provider |
| 3 | Interactive Lab (Plotly) | `pending` | TBD |
| 4 | Validation & Deployment | `pending` | TBD |

**Validation gate:** All `validationCriteria` for a phase must be met before `status` advances to `completed`. A phase marked `failed` blocks all downstream phases.

---

## Technical Constraints

Derived from `F1HubMissionProfile.constraints`. These are non-negotiable:

| Constraint | Value | Reason |
|------------|-------|--------|
| `noSVG` | `true` | Use raster images or CSS shapes only |
| `noMermaid` | `true` | Diagrams via ASCII or Plotly only |
| `useTailwind` | `true` | All styling via Tailwind utility classes |
| `usePlotly` | `true` | All data visualizations via Plotly.js |
| `mobileFirst` | `true` | Design at 375px, scale up |

---

## Branding & Design Tokens

Derived from `BrandingConfig` in `mission_interfaces.ts`:

| Token | Value | Usage |
|-------|-------|-------|
| Primary (V-Red) | `#dc2626` | CTAs, active states, accent borders |
| Obsidian | `#000000` | Backgrounds (dark mode base) |
| Silver | `#C0C0C0` | Secondary text, dividers |
| V-Blue | `#2563eb` | Links, info states |
| V-Yellow | `#eab308` | Warnings, highlights |
| Typography | `Inter, sans-serif` | All body text |
| Theme | `dark` / `light` | Persisted via `localStorage` |

Headers use **Oswald** (declared in `styles.css`); body uses **Inter**.

---

## Telemetry Services

Derived from `ITelemetryProvider` and `ITelemetryService`:

| Provider | Best For | Live Latency | Data Depth |
|----------|----------|-------------|------------|
| `OpenF1` | Real-time session data | High | Medium |
| `FastF1` | Historical lap data | Low | High |
| `Ergast` | Season/standings data | Low | High |
| `F1-Telemetry-Client` | UDP telemetry (sim) | Very High | Low |

**TelemetryStream shape:**
```ts
{
  timestamp:          number[];   // Unix ms
  speedKmh:           number[];   // 0–350
  throttlePercentage: number[];   // 0–100
  drsActive:          boolean[];  // per-timestamp DRS state
}
```

**Stale data rule:** `isDataStale(lastUpdate)` returns `true` if `Date.now() - lastUpdate > 30_000`. Stale streams must display a visual indicator and pause rendering until fresh data arrives.

---

## Performance Targets

Derived from `PerformanceMetrics` (all scores 0–100):

| Metric | Target | Description |
|--------|--------|-------------|
| `liveLatency` | ≥ 80 | Time from event to UI render |
| `dataDepth` | ≥ 70 | Richness of telemetry fields per lap |
| `historicalRange` | ≥ 75 | Seasons of historical data accessible |
| `apiUptime` | ≥ 95 | Provider availability over rolling 7 days |

---

## Active Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-12 | Version pinned to `1.1.0-rigor` | Explicitly binds chatbot engineering discipline to F1 hub |
| 2026-03-12 | Plotly mandated over D3/Chart.js | Aligns with `usePlotly` constraint; better mobile touch support |
| 2026-03-12 | No SVG assets | Constraint from `noSVG`; use JPEG/PNG from `/img/` |
