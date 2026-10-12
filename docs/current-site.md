# The current Webflow site

An inventory of www.tedxamsterdam.nl as built in Webflow, taken in October 2026. Use it to reach parity before launch and to plan redirects. Design: busy.studio. Language: English.

## Pages

| URL | Content source | New site |
| --- | --- | --- |
| `/` | Designer only (hero, intro, event teaser, header video) | Phase 3 |
| `/after-growth` | Designer, plus the Speakers collection | Phase 3 |
| `/speakers` | Speakers and Past speakers collections | Phase 1 (current), phase 2 (past) |
| `/speakers/{slug}` | Speakers collection, one page per speaker | Phase 1 |
| `/speakers-copy/{slug}` | Past speakers collection; pages exist but are empty | Phase 2: detail pages or redirects |
| `/events` | Upcoming events collection | Phase 2 |
| `/impact` | Designer, plus the Pioneers collection | Phase 2 and 3 |
| `/partners` | Partners collection (list and two marquees) | Phase 2 |
| `/blog` | Blogs collection (empty) | Phase 2, once it has content |
| `/about-us` | Designer only | Phase 3 |
| `/old-home` | Leftover; in the sitemap but returns 404 | Redirect to `/` |
| `/speakers-new` | Public draft page titled "Speakers New (draft)", duplicates `/speakers` | Redirect to `/speakers` |
| `/partners-old` | Leftover, linked from the footer | Redirect to `/partners` |

## Navigation

- **Header**: After Growth, Impact Program, Events, Speakers, Partners, Blog, About Us, and a "Get tickets" button to Eventbrite. Rebuilt in `src/config/site.ts`.
- **Footer menu** on Webflow links Impact Program to `/old-home` and Partners to `/partners-old`. The new footer links to the real pages.
- **Socials**: Instagram, LinkedIn and Facebook. The design system has no Facebook icon yet, so the new footer leaves it out.
- **Legal line**: the TEDx license disclaimer, "Copyright Stichting TEDxAmsterdam, {year}", "All Rights Reserved", a "Privacy policy" link that points to `#` (there is no privacy page), and "Design busy.studio".

## Integrations

| What | How it works on Webflow | Plan for the new site |
| --- | --- | --- |
| Tickets | Plain link to Eventbrite | Link in `src/config/site.ts`; later from the featured event in the CMS |
| Newsletter | Mailchimp embedded form in the footer (email field and a GDPR consent checkbox), posting to `list-manage.com` | Phase 3: same Mailchimp list, plus a privacy policy; extend the CSP `form-action` for Mailchimp |
| Analytics | Google Analytics 4 (`G-PVYRFDNXB9`) without a consent banner | Phase 4: decide between GA4 with consent or cookieless analytics |
| Bot protection | Cloudflare Turnstile script loaded on every page | Only needed if a form needs it |
| Carousel | Swiper loaded from jsDelivr | Only if a design needs a carousel; prefer CSS |
| Fonts | Google Fonts (Arimo fallback), loaded by the design system tokens | Phase 4: self host |
| Search Console | Verified with a meta tag | Keep the verification when switching DNS |

## SEO details to carry over

- Canonical, Open Graph and Twitter metadata on every page.
- JSON-LD on `/speakers`.
- Speaker detail pages on Webflow all have the title "TEDxAmsterdam" and no description: the new site improves on this.

## Design reference

The target designs live in the design system repository, not in Webflow:

- `ui_kits/website/` in [tedx-amsterdam-design-system](https://github.com/tedx-amsterdam/tedx-amsterdam-design-system) has page level prototypes: `Home.jsx` and `HomeSections.jsx`, `SpeakerPage.jsx`, `EventProgram.jsx`, `BlogPage.jsx`, `Pages.jsx` and `Pages2.jsx` (About, Impact, Partners, Team, Gallery), `Header.jsx` and `Footer.jsx`.
- These prototypes use inline styles and hardcoded copy. Rebuild them with design system components, CSS Modules and tokens, and take copy from the CMS where it exists.

## Ownership and accounts

| What | Where | Note |
| --- | --- | --- |
| Domain `tedxamsterdam.nl` | Registrar to be confirmed | Must be registered to the foundation; TEDx rules require handing it over if the license ends |
| Webflow | "TEDx's Workspace", free Starter workspace with one Premium site plan | Renews 7 August 2027; cancel before then |
| GitHub | Organisation `tedx-amsterdam` | Add a second owner |
| Cloudflare | Personal account of the current maintainer | Move to a foundation account before launch |
