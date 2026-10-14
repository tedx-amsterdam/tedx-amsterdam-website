# Design audit: pages against Figma

How this site's pages compare with busy.studio's Figma designs. The design system has its own [Figma audit](https://github.com/tedx-amsterdam/tedx-amsterdam-design-system/blob/main/docs/figma-audit.md) for the tokens and components the pages are built from, and the patterns that still need a component; start there for anything that is not specific to one page. Update a row here in the pull request that changes the page.

**Checked**: October 2026, design system 1.3.1; the layout rows updated for 1.4.0, against the latest round of designs on the Figma page `review` (labelled "review", June 2025), looked at in Figma itself and side by side with the deployed pages. See [current-site.md](current-site.md#figma) for the file itself and decision 27 for which one leads.

**Scope**: styles and structure, not content. The designs carry the 2025 edition's theme and copy; those change every edition and are left out.

**Status**: ✅ matches, ⚠️ differs, — not in the designs.

## Figma frames

Desktop frames are 1400 wide; only home has a mobile design (375 wide). Open a frame with `https://www.figma.com/design/ZziwjkbIiAxIio7Pxuu8dA/TEDxAmsterdam--website?node-id=<id>`.

| Page | Frame | Node id | Site route |
| --- | --- | --- | --- |
| Home | `hero-desktop` | `6258-3449` | `/` (placeholder) |
| Home, mobile | `hero-mobile` | `6258-7028` | `/` |
| Speakers | `speakers-desktop` | `6258-7234` | `/speakers` (built) |
| Speaker detail | `speaker-desktop` (two variants) | `6258-6682`, `6258-6821` | `/speakers/[slug]` (built) |
| Team | `team-desktop` and `content` | `6258-4886`, `6258-5247` | not built |
| Partners | `partners-desktop` | `6258-5606` | not built (phase 2) |
| Gallery | `gallery-desktop` | `6258-5806` | not built |
| Blog | `blog-desktop` (two variants) | `6258-5266`, `6258-5439` | not built (phase 2) |
| Impact Program | `impact program-desktop` | `6258-6033` | not built |
| Impact teaser | `Frame 163` | `6258-6987` | part of home |

There is no design for `/events`, About Us or Event Program in the latest round.

## Pages on this site

| Route | Matches the design | Main differences |
| --- | --- | --- |
| `/speakers` | ⚠️ | Content column, header, title, intro and page glow match since design system 1.4.0. Still different: the card leads with the speaker's name, where Figma leads with the talk title and puts the name and role below it after a red dot |
| `/speakers/[slug]` | ⚠️ | Content column, header and page glow match since 1.4.0. Figma leads with a "Topic" eyebrow and the talk title (48px, words in red), then date and venue with red dots, the talk text, and "About" with the name (48px) and bio; the portrait carries the name in a black label, as on the site, with social links below it, and "Watch the talk" shows the video. The site leads with the speaker's name in red at 80px and adds a breadcrumb and previous and next links, which Figma does not have. Check first whether the CMS has talk titles for every speaker |
| `/events` | — | No design; it follows the speakers page, in the content column with the page glow |
| Footer on every page | ⚠️ | The site has the menu, social links, a small logo and the legal line. Figma adds the newsletter form (phase 3), sets the logo across the full column and puts the footer on a red to black glow |
