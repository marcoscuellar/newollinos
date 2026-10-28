# ŌLLIN OS — site handover

Single-page site. Working file: `index.html` — the fixed ŌLLIN OS page, kept in step with `main` of `marcoscuellar/OLLINOS` (same page, same rules). `api/contact.js` is the one serverless function: the signup pill POSTs to it and it emails marcos@ollinos.com through Resend. It needs `RESEND_API_KEY` set on this Vercel project; without it the pill falls back to showing the address.

## Hard rules (from the OLLINOS repo — do not violate)
- Sample data uses only the approved fictional roster: Verrida Health, Kestrelbrook Devices, Marrowfield Platforms, Aldervane Freight; Dana Rivera, Marcus Vale, Priya Anand, Leo Fontaine, Nadia Cole, Omar Reyes, Sofia Marin, Grace Kim. Sample emails use `.example`. `scripts/check-sample-data.sh` must PASS before a deploy.
- ŌLLIN always carries the macron. No hype language. No letter-scramble animation. The stamp reads VERIFIED.

## Brand + layout (Signal Pulse, Oct 28 2026)
- Brand book: `brand/ollin-signal-pulse-brand-book.md` in the ŌLLIN OS / GO project. Life is black and white; **yellow is the signal only** (Pulse, verified facts, the one action).
- Type: **Archivo** (display 800/700/500), **Inter** (text), **IBM Plex Mono** (labels, stats, sources only). Google Fonts.
- Colour tokens: Night Black `#181A1E`, White, Signal Yellow `#FFE14D`. No other accents.
- Layout: ELIPAN panels — rounded white / Night Black panels inset from the edges, rows of 2–3, shadows not outlines, no side-line accents.
- Hero: white, centred headline only (“The haystack is their product. The needle is ours.”). No buttons in the hero.
- One action: **Talk to us** (top bar, after the hero) + the contact form submit. Everything else is a text link.
- Photos: full colour, Pulse bars/squares scattered in the scene (from the brand guide library, `img/`). Founder photo stays black and white.
- Don't publish the method (no engine/pipeline diagram), no prices, no client logos or usage counters until real ones exist.
- Motion is vanilla JS + CSS (no Motion.dev). Pause motion + dark mode toggles live in the footer.

## Page order = the buyer's next question (do not reshuffle)
1. **Hero** — Is this relevant to me? (pill: "For sales and staffing teams" + headline + one line)
2. **Product demo** — Does it actually do what I need? (OS→GO hand-off, then the clickable GO card; no sign-up)
3. **Social proof** — Has it worked for people like me? (yellow banner, 3 sourced stats, Bullhorn quote, founder)
4. **Capabilities** — Can it handle my workflow? (bento: four checks big, "ready to use" beside it, Mushroom wide, then traditional vs Redeploy)
5. **Trust** — Can I safely rely on it? (three rules, It prepares. You decide., the statement)
6. **Plans + CTA** — Is it worth trying, and what happens next? (plans, then "Bring an account" with the 4 next steps and the one email field)
Each section earns the next step; don't add feature claims that don't answer that section's question.

## Research applied (AI product marketing pages, Oct 2026)
- Interactive proof right under the hero, ungated: OS→GO signal hand-off, four-check claim runner, Mushroom tap-a-person, GO card demo.
- GO card draft **streams in** (15–45 ms/char, cursor, “DRAFTING FROM VERIFIED FACTS…” → audit) with its space reserved so there's no layout shift.
- Reading progress bar is CSS scroll-driven (`animation-timeline`), off the main thread; hidden where unsupported.
- Images lazy + async decoded, sized to avoid layout shift.
- Not applied on purpose (conflict with site rules or need real data): hero sandbox buttons, reverse-trial pricing, SOC 2 / data-retention badges, logo wall, live telemetry counters.

## Direction
Graphite + signal-yellow identity. The site should feel like an intelligent operating system doing real work, not a generic AI/SaaS landing page. Motion explains the product; it is never decoration.

Core motion philosophy: **Data appears → gets checked → becomes useful → person decides.** Every animation should reinforce that progression.

## Motion already in place
- Hero entrance sequencing
- Hero headline emphasis (yellow highlight sweeps behind "The needle is ours.")
- Scroll-triggered section reveals
- Four-check verification progression
- Haystack → signal/needle treatment
- Animated Mushroom org-chart expansion
- ŌLLIN GO interactive/demo behavior
- Animated stat counters
- Subtle button/card interactions
- Scroll progress bar
- `prefers-reduced-motion` support (all content stays visible)

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
Keep: Night Black, signal yellow, white, Archivo / Inter / IBM Plex Mono, restrained product-motion aesthetic, evidence/verification language, human-control positioning, premium slightly-industrial feel.

Avoid: floating AI blobs, glowing orbs, parallax everywhere, excessive bounce, neon gradients, generic "AI circuitry", motion on every element, anything that reads as another AI sales-tool template.
