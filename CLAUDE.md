# ŌLLIN OS — site handover

Single-page site. Working file: `index.html` — the fixed ŌLLIN OS page, kept in step with `main` of `marcoscuellar/OLLINOS` (same page, same rules). `api/contact.js` is the one serverless function: the signup pill POSTs to it and it emails marcos@ollinos.com through Resend. It needs `RESEND_API_KEY` set on this Vercel project; without it the pill falls back to showing the address.

## Hard rules (from the OLLINOS repo — do not violate)
- Sample data uses only the approved fictional roster: Verrida Health, Kestrelbrook Devices, Marrowfield Platforms, Aldervane Freight; Dana Rivera, Marcus Vale, Priya Anand, Leo Fontaine, Nadia Cole, Omar Reyes, Sofia Marin, Grace Kim. Sample emails use `.example`. `scripts/check-sample-data.sh` must PASS before a deploy.
- ŌLLIN always carries the macron. No hype language. No letter-scramble animation. The stamp reads VERIFIED.

## Direction
Graphite + signal-yellow identity. The site should feel like an intelligent operating system doing real work, not a generic AI/SaaS landing page. Motion explains the product; it is never decoration.

Core motion philosophy: **Data appears → gets checked → becomes useful → person decides.** Every animation should reinforce that progression.

## Motion already in place
- Hero entrance sequencing
- Animated verification flow inside the hero intelligence card
- Hero headline emphasis (the yellow underline device on "now.")
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
1. Aldervane Freight — Omar Reyes, VP, Operations
2. Verrida Health — Sofia Marin, VP, Talent Acquisition
3. Kestrelbrook Devices — Dana Rivera, Director, Supply Chain

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
