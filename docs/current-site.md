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
| Fonts | Google Fonts (Arimo fallback), loaded by the design system tokens | Done: the design system ships Arimo since 1.3.1, so nothing loads from Google |
| Search Console | Verified with a meta tag | Keep the verification when switching DNS |

## SEO details to carry over

- Canonical, Open Graph and Twitter metadata on every page.
- JSON-LD on `/speakers`.
- Speaker detail pages on Webflow all have the title "TEDxAmsterdam" and no description: the new site improves on this.

## Design reference

The target designs are in busy.studio's Figma file (below), and the design system turns their styles into tokens and components. The designs were made for the 2025 edition: take the layout and styles from them, not that year's theme or copy, which come from the CMS or the maintainer. Build pages from design system components, CSS Modules and tokens.

[design-audit.md](design-audit.md) compares the design system and this site's pages with the designs, component by component.

The design system used to have a click-through prototype of these designs in `ui_kits/website/`; it was removed because it held the 2025 theme (tedx-amsterdam-design-system#31). It is still in that repository's git history.

### Figma

busy.studio designed the site in 2025 in a Figma file named "TEDxAmsterdam: website". The design system's tokens were taken from it. The maintainer has a `.fig` export of October 2026 (441 MB); ask for it. Never commit it: it is too large for git and holds reference images and photography whose rights are not cleared.

What it contains, read from that export:

- **Pages**: `prototype`, `work`, `review` (the latest designs, with done, in progress and review labels), `archive`, `ui kit`, `tools` and `cover`. `final` is empty, so no page is marked final.
- **Page designs** at 1400 wide: home (`hero-desktop`, also `hero-mobile` at 375), speakers, speaker detail, team, partners, gallery, blog and impact program, plus event page sections ("Event page: latest version") and dated rounds (11.07, 23.07, "mvp — 6.08", "homepage — 7.08"). Only home has a mobile design.
- **ui kit**: favicon (32), webclip (256), Open Graph image (1200 × 630) and the logo.
- **Styles**: text styles for desktop and mobile in Helvetica Regular and Bold, the red `#EB0028`, the gradients and the neutrals. Almost nothing is a Figma component; the designs are plain frames.
- **Fonts besides Helvetica Regular and Bold**: Helvetica Light and Helvetica Neue Condensed (Bold, Black) in a few frames; TT Norms, Inter and Montserrat only in early prototypes.

The export is a zip with a binary `canvas.fig`. Coding agents can decode it with [`kiwi-schema`](https://www.npmjs.com/package/kiwi-schema) to read structure, text and styles, but cannot render frames. To compare a page visually, export the frame as PNG from Figma.

## Ownership and accounts

| What | Where | Note |
| --- | --- | --- |
| Domain `tedxamsterdam.nl` | Registrar to be confirmed | Must be registered to the foundation; TEDx rules require handing it over if the license ends |
| Webflow | "TEDx's Workspace", free Starter workspace with one Premium site plan | Renews 7 August 2027; cancel before then |
| GitHub | Organisation `tedx-amsterdam` | Add a second owner |
| Cloudflare | Personal account of the current maintainer | Move to a foundation account before launch |
