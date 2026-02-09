# LeafScan AI — Diagnose. Plan. Act.

LeafScan AI helps any grower diagnose plant diseases from a single scan and follow a clear 14‑day action plan—backed by step‑by‑step visuals. It’s designed for a fast, no‑friction demo: upload a leaf, get a plan, see exactly what to do, and locate nearby suppliers.

## Why Gemini 3
Gemini 3 powers the core reasoning:
- Streams concise, focused answers in chat for rapid guidance.
- Produces structured plans (timeline, costs, ROI, contingencies) to keep outputs grounded and reduce hallucinations.


## Visuals with “Banana Pro”
Treatment steps are turned into clean, 3‑panel diagrams so users can execute correctly the first time.
- Attempts Gemini’s image preview mode for polished visuals.
- Falls back to high‑quality SVG generation—either way, users always get a usable diagram.

## Core capabilities
- Scan a leaf image to get a likely disease, severity, and a short explanation.
- Generate a structured 14‑day action plan with timelines, costs, ROI, and contingencies.
- Visualize any treatment step as a 3‑panel diagram for clear execution.
- Keep everything together: chat, notes, PDF export, and nearby supplier lookup.
- Ask follow‑ups; streaming responses keep the flow fast.

## How it works (brief)
- Gemini 3 handles diagnosis reasoning and guidance using tight prompts focused on brevity and actionability.
- The plan engine asks Gemini 3 for strict JSON that the UI renders into a dependable timeline.
- Visuals try image preview first; if unavailable, a high‑quality SVG fallback ensures a diagram is always returned.
- Safety settings help keep content appropriate.

## How it improves accuracy
- Context‑aware prompts feed diagnosis, severity, and user constraints into Gemini 3 for precise, repeatable plans.
- A strict, structured schema (timeline, costs, ROI, contingencies) produces consistent outputs that are easier to verify.
- Visuals reduce misinterpretation and increase correct first‑try execution.

## Responsible use
Guidance is advisory; always follow local regulations and product labels. Safety settings are enabled for content moderation.
