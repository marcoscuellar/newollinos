# ŌLLIN OS — site handover

Single-page site. Working file: `index.html` (from `ollin-os-motion-yellow-line-fixed.html`).

## Direction
Graphite + signal-yellow identity. The site should feel like an intelligent operating system doing real work, not a generic AI/SaaS landing page. Motion explains the product; it is never decoration.

Core motion philosophy: **Data appears → gets checked → becomes useful → person decides.** Every animation should reinforce that progression.

## Motion already in place
- Hero entrance sequencing
- Animated verification flow inside the hero intelligence card
- "Stop the noise" emphasis
- Scroll-triggered section reveals
- Four-check verification progression
- Haystack → signal/needle treatment
- Animated Mushroom org-chart expansion
- ŌLLIN GO interactive/demo behavior
- Animated stat counters
- Subtle button/card interactions
- Scroll progress bar
- `prefers-reduced-motion` support (all content stays visible)
- Motion.dev pinned (`motion@13.2.0`), never `latest`

## Trigger rule (do not regress)
Animations originally fired too early. Triggers were moved so a section enters the visitor's visible reading area **before** it animates. The visitor should see the section, understand it, then see it animate. Do not move `inView` margins/amounts back upward unless intentionally testing.

## ŌLLIN GO section
Headline: **ŌLLIN OS finds it. ŌLLIN GO runs it.**

"Up Next" shows three separate company scenarios (not three contacts at one company):
1. Meridian Logistics — VP, Operations
2. Northstar Health — VP, Talent Acquisition
3. ForgeWorks Manufacturing — Director, Supply Chain

Selecting a company swaps the white intelligence card: contact, company, signal, timing/money event, buyer context, secondary signal, why this person, hook, outreach draft. Profiles auto-rotate once the GO section is visible and are also clickable. **Keep this behavior** — it proves ŌLLIN is not producing a canned template.

## Fixed bugs — do not reintroduce
- "A person hits Let's go. Always." had `<i>` inheriting the yellow circular check-icon style. Only real list icons get the yellow circle. Never add broad `.elist li i` styling that hits inline italic text.

## Proof / statistics section
"Same hustle. / No wasted swings." is a strong yellow horizontal banner/line, not gray text with a small accent.

## Bullhorn testimonial (exact)
> "The AI is smart on this one, and the data it finds—and how it validates itself—this is one of a kind."
> — Sr. Executive at Bullhorn

Do not add "name withheld", competitor language, or "anonymous executive" language. Identified by seniority + company only.

## Creative guardrails
Keep: graphite, signal yellow, white/off-white, Archivo / IBM Plex Mono, restrained product-motion aesthetic, evidence/verification language, human-control positioning, premium slightly-industrial feel.

Avoid: floating AI blobs, glowing orbs, parallax everywhere, excessive bounce, neon gradients, generic "AI circuitry", motion on every element, anything that reads as another AI sales-tool template.
