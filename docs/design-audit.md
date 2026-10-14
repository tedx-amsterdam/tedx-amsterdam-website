# Design audit: Figma, design system and site

How the design system and this site compare with busy.studio's Figma designs, component by component and page by page. Use it as the checklist for the design system work in the [roadmap](roadmap.md#design-system); update a row in the pull request that changes it.

**Checked**: October 2026, design system 1.3.1, against the latest round of designs on the Figma page `review` (labelled "review", June 2025). Every page was looked at in Figma itself; text, color, size and spacing values come from the `.fig` export, counting only layers that are visible (each home section hides copies of other sections' layers, which otherwise skew the numbers). The components were compared with their stories in the design system's Storybook. See [current-site.md](current-site.md#figma) for the file itself.

**Scope**: styles and structure, not content. The designs carry the 2025 edition's theme and copy ("Amsterdam Reimagined", its dates and the condensed type in the mobile hero); those change every edition and are left out.

**Status**: ✅ matches, ⚠️ differs, ❌ missing, — not in the designs.

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

## Foundations

| Area | Figma | Design system | Status |
| --- | --- | --- | --- |
| Colors | Red `#EB0028`, black, white; text in white at 100, 70, 60, 50 and 40%; warm tone `#FF7919` | Red, black, white, white at 60 and 40%; `--tedx-orange` is `#F36C21` | ⚠️ no tokens for 70% and 50%; `#F36C21` unused, `#FF7919` is the one in use |
| Content column | 1080px column: 12 columns, 20px gutters, 160px side margins at 1400px; header and footer in the same column | `--content-max` (1080px) and `--gutter-wide` (160px) exist; no column or gutter tokens | ⚠️ the site uses the full width with 40px gutters |
| Mobile grid | 6 columns, 15px gutters and margins | none | ❌ |
| Display headline (home hero) | Bold 115px, line height 0.9, −3% | `--fs-display` 121px, line height 1 | ⚠️ |
| Page title | Bold 80px, line height 1.1, no tracking, uppercase | `--text-h1`: 80px, line height 1, −3% | ⚠️ |
| Section heading | Bold 48px, line height 1.1, −3%, uppercase, often with words in red | `--text-h2` is 56px with line height 1.2; 56px does not appear in the designs | ⚠️ no 48px token |
| h3 and h4 | Bold 32px (1.2, −3%) and Bold 20px (1.2), uppercase | `--text-h3`, `--text-h4` | ✅ |
| Body | Regular 20px: 1.3 in long text, 1.2 in intros next to titles | `--text-body` (1.3) | ✅ long text, ⚠️ intros |
| Small text | Regular 16px (1.2) for meta, Regular 14px for navigation and card excerpts, Regular 12px for fine print, Light 12 and 16px for names on photos | `--fs-body-sm` (16px), `--fs-caption` (12px); no Regular 14px or Light | ⚠️ |
| Tags and links | Bold 14px uppercase, line height 1 | `--text-tag` (line height 1.2) | ✅ |
| Mobile type | Title 55px (0.9), headings 30px, stat numbers 60px, names Bold 16px | `--fs-h1-m` (55px), `--fs-h2-m` (30px) | ⚠️ line height 0.9 is only a comment; no 60px |
| Glows | Red and orange shapes with a 100 to 200px blur, including 220px bars along both edges of every page and a red to black footer | Gradient tokens (`--glow-edge`, `--glow-corner`, `--glow-radial`) that approximate them | ⚠️ the site has no page glow yet |
| Radius | 10px on buttons; everything else square | `--radius-button` 10px; `--radius-card` 12px | ✅ (`--radius-card` is only used by `Modal` and `Toast`) |
| Lines | 1px white at 40% between rows, 1px white on inputs | `--border-hairline` | ✅ |

## Design system components

| Component | Where in Figma | What differs | Status |
| --- | --- | --- | --- |
| `NavigationBar` | Every page | Figma: links in Regular 14px, sentence case, the active one red, logo and links within the 1080px column, no button. Component: Bold uppercase links with wide tracking, a "Get tickets" button, full width | ⚠️ |
| `Logo` | Header, footer (full column width) | Same artwork and colors | ✅ |
| `Button` | Hero, event info, CTA blocks, forms | Figma: fixed size from the grid, 74 to 80px high (66px on mobile), label Bold 14px uppercase; red (primary) and white (forms). Component: about 38 to 60px high, sentence case labels | ⚠️ |
| `ArrowLink` | "Check out our past speakers", "Watch the talk", "View all", "Join us", "Learn more" | Figma: uppercase Bold 14px with a long arrow. Component: sentence case | ⚠️ |
| `Tag` | Eyebrows above headings ("Speakers", "About", "Topic") | Figma eyebrows are white, the component's default is red | ⚠️ default color |
| `Tag` with `dot` | Meta lines: a red dot before a name, date or venue | Figma: red dot, text in white or white at 40%, Regular. Component: the text is red and uppercase | ⚠️ |
| `Badge` | Labels on photos: "Event", "Soon", "News", "Podcast", "Sign-ups closed" | Figma: square black label with white uppercase text. Component: red pill | ⚠️ |
| `SectionHeader` | Above most sections | Figma: white eyebrow, 48px heading with words in red, white text, uppercase arrow link. Component: red eyebrow, 56px heading, text at 60%; no way to set words in red without inline markup | ⚠️ |
| `Stat` | Home ("2009", "20K") | Figma: Bold 80px without tracking, white label beside the number, stats separated by a line. Component: −3% tracking, label at 60% | ⚠️ |
| `MediaCard` | Upcoming events (home), blog | Figma: photo with a `Badge` in the corner, title Bold uppercase, excerpt at 40%, date with a red dot. Component: shows the category as plain text and draws the image as a CSS background, so the image has no alt text and cannot load lazily | ⚠️ |
| `Tabs` | Team filter (All, Exec, Communications, …) | Figma: Bold 14px uppercase, active one red, no underline. Component: active one white with a red underline | ⚠️ |
| `Input` | Newsletter and partner forms | Underlined field with a small "Email" label | ✅ |
| `Checkbox` | Consent line under each form | Small square box with small text | ✅ |
| `SocialLink` | Footer, speaker detail | Icon and label | ✅ (no Facebook icon) |
| `Accordion`, `Breadcrumb`, `Modal`, `Toast`, `Select`, `Radio`, `RadioGroup`, `CheckboxGroup`, `Textarea`, `FormField` | Not in the latest designs | Designed by the design system itself | — keep |

## Patterns in Figma without a component

Patterns that appear on two or more pages belong in the design system (decision 23); one-page patterns stay in this site until a second page needs them.

| Pattern | Pages | Notes | Belongs in |
| --- | --- | --- | --- |
| Page hero: title (last word red) with an "About …" text and optional arrow link beside it | Speakers, team, partners, gallery, blog, impact | Already copied in `/speakers` and `/events` (`PageHero` in stage B) | Design system |
| Speaker card: photo on red (upcoming) or grayscale (past), talk title, red dot with name, role at 40%, optional "Watch the talk" link | Home, speakers | The site's `SpeakerCard` leads with the name instead of the talk title | Design system |
| Person card: photo, name Bold uppercase, role or description; team photos are grayscale with a LinkedIn link on hover | Team, impact (pioneers) | | Design system |
| CTA band: red full-width section with a heading, text and the email form | Home (newsletter), partners, impact | The footer has the same form on black | Design system |
| Detail rows: label and value separated by lines | Home (event date, time, place), impact (criteria), timetable | Values Bold 32px red, labels Regular 20px | Design system |
| Carousel arrows (← →) under a row of cards | Home (speakers, upcoming events), gallery | | Design system |
| Footer: menu, social links, newsletter form, logo at full column width, legal line, red to black glow | Every page | The site's `SiteFooter` has the legal line and socials | Site (one footer) |
| Logo wall: partner logos in white on black | Partners | | Site until a second use |
| Gallery albums: title, "View all", a row of photos | Gallery, home (snapshots, on red) | | Site until a second use |
| Timetable | Home | Rows with time, session (red), description and speaker portraits | Site |
| Video embed ("Watch the talk") | Speaker detail | YouTube | Site |
| List with red bullets | Impact | | Site |
| Edge glow background | Every page | See Foundations | Design system (layout) |

## Pages on this site

| Route | Matches the design | Main differences |
| --- | --- | --- |
| `/speakers` | ⚠️ | Full width instead of the 1080px column, navigation style, title tracking, intro in gray instead of white, card leads with the name, no page glow, divider line under the hero that Figma does not have |
| `/speakers/[slug]` | ⚠️ | Same foundations. Figma leads with a "Topic" eyebrow and the talk title (48px, words in red), then date and venue with red dots, the talk text, and "About" with the name (48px) and bio; the portrait carries the name in a black label, as on the site, with social links below it, and "Watch the talk" shows the video. The site leads with the speaker's name in red at 80px and adds a breadcrumb and previous and next links, which Figma does not have. Check first whether the CMS has talk titles for every speaker |
| `/events` | — | No design; follow the speakers page |
| Footer on every page | ⚠️ | The site has the menu, social links, a small logo and the legal line. Figma adds the newsletter form (phase 3), sets the logo across the full column and puts the footer on a red to black glow |
