# Webflow content model

What the Webflow CMS contains, how the fields map to our domain types, and the quirks the mappers must handle. Read this before working in `src/content/`.

Snapshot taken in October 2026 through the Webflow Data API v2. Field slugs never change on the Webflow side without breaking the live site, so they are stable; item counts are not.

## Site

| Property | Value |
| --- | --- |
| Site | TEDxAmsterdam (`tedxamsterdam2025` in the Webflow dashboard), Premium plan, paid yearly until 7 August 2027 |
| Site ID | `6870c1bbb9cc2e2f1226b6c0` |
| Live domain | `www.tedxamsterdam.nl` |
| Images | `https://cdn.prod.website-files.com/...` (Webflow CDN, stops working when the plan ends) |

The workspace also contains an older project, `tedxamsterdam-43f866` (the 2025 site, Starter plan). It is not used.

## API

- Read published content from `GET https://api.webflow.com/v2/collections/{collection_id}/items/live`. Only published items are returned, so drafts never reach the site.
- Paginate with `limit` (max 100) and `offset`; the response contains `pagination.total`.
- Authenticate with a site API token in the `Authorization: Bearer` header. The token used by the site has **CMS read** only.
- Rate limit on the Premium plan: 120 requests per minute per token. A full build needs fewer than 20 requests.
- `api-cdn.webflow.com` serves the same live items from a cache and does not count towards the rate limit; usable as an optimisation later.
- Response shape: `{ items: Item[], pagination: { limit, offset, total } }`.
- Item shape: `{ id, isDraft, isArchived, lastPublished, fieldData: { ...fields } }`. Images in `fieldData` are `{ fileId, url, alt }`, with `alt` often `null`. Rich text is an HTML string.

## Collections

### Speakers

Speakers of the current edition. Shown on `/speakers` and `/after-growth`, with a detail page per speaker at `/speakers/{slug}`.

| | |
| --- | --- |
| Collection ID | `6874c72605e8d57abb48e751` |
| Collection slug | `speakers` |
| Items | 17: 9 published (2026 speakers), 8 drafts (2025 speakers) |

| Webflow field | Type | Domain field | Notes |
| --- | --- | --- | --- |
| `name` | PlainText, required | see quirks | Labelled "Session Title" in Webflow, but holds the speaker name in 2026 items |
| `slug` | PlainText, required | `slug` | Keep as is: it is the public URL |
| `name-of-speaker` | PlainText | `name` | Often empty in 2026 items |
| `occupation` | PlainText | `role` | Labelled "Speaker Role" |
| `role-for-tedx` | PlainText | `tedxRole` | For example "2026 TEDxAmsterdam Impact Pioneer Winner" |
| `session-blurb-2` | RichText | `sessionBlurb` | About 50 words |
| `speaker-bio-2` | RichText | `bio` | About 25 words, usually one italic paragraph |
| `photo` | Image | `photo` | `alt` is always `null` in the current data |
| `pronounce` | PlainText | `pronouns` | Despite the slug, holds pronouns such as "she/her" |
| `order` | Number | `order` | Lower number shows higher; empty on old items |
| `show-hide-speaker` | Switch | not mapped | Set to `true` on speakers that are visible on the live site; not used consistently |

**Quirks**

- Speaker name: use `name-of-speaker` when filled, otherwise `name`. Trim it: some names end in a space.
- Session title: only when `name-of-speaker` is filled and differs from `name` (the 2025 pattern). 2026 items have no session title.
- Do not filter on `show-hide-speaker`; publishing state decides visibility.
- Rich text contains empty paragraphs, including `<p>&zwj;</p>` (zero width joiner). Drop them.
- Sort by `order` ascending, items without `order` last.
- Alt text fallback: the speaker name.

### Past speakers

Talks from earlier editions, shown in the "past speakers" section of `/speakers`. The Webflow detail pages at `/speakers-copy/{slug}` exist but are empty.

| | |
| --- | --- |
| Collection ID | `687a3b5098160df3232c2eb2` |
| Collection slug | `speakers-copy` |
| Items | 16 |

| Webflow field | Type | Domain field | Notes |
| --- | --- | --- | --- |
| `name` | PlainText, required | `title` | Labelled "Topic": the talk title |
| `slug` | PlainText, required | `slug` | |
| `name-of-speaker` | PlainText | `speakerName` | |
| `occupation` | PlainText | `speakerRole` | |
| `photo` | Image | `photo` | |
| `link` | Link | `videoUrl` | "Watch the talk" link; empty on several items, which the live site renders as `#` |
| `show-hide-speaker` | Switch | not mapped | |

**Quirks**: hide the watch link when `link` is empty. Decide in phase 2 whether past talks get detail pages; if not, redirect `/speakers-copy/*` (see `docs/current-site.md`).

### Upcoming events

All events, upcoming and past. Shown on `/events`; links go to Eventbrite or ted.com.

| | |
| --- | --- |
| Collection ID | `68763edeb9e4be2376b75976` |
| Collection slug | `upcoming-events` |
| Items | 8 (1 featured main event, 7 others) |

| Webflow field | Type | Domain field | Notes |
| --- | --- | --- | --- |
| `name` | PlainText, required | `title` | |
| `slug` | PlainText, required | `slug` | No detail pages |
| `event-date` | DateTime | `date` | The only reliable date; use it for sorting and the upcoming/past split |
| `date` | PlainText | not mapped | Free text duplicate of the date; ignore |
| `descpiption` | PlainText | `description` | Typo in the slug is real; do not fix it in Webflow |
| `location` | PlainText | `location` | |
| `link` | Link | `url` | Ticket or event page |
| `tag` | PlainText | `tag` | |
| `image` | Image | `image` | |
| `show-hide` | Switch | not mapped | |

### Partners

Shown on `/partners` as a list and two logo marquees.

| | |
| --- | --- |
| Collection ID | `68ee2b4f5c07668c00af87d7` |
| Collection slug | `partners` |
| Items | 17 |

| Webflow field | Type | Domain field | Notes |
| --- | --- | --- | --- |
| `name` | PlainText, required | `name` | |
| `slug` | PlainText, required | `slug` | No detail pages |
| `image` | Image | `logo` | Alt text fallback: partner name |
| `description` | PlainText | `description` | |
| `website` | Link | `url` | |
| `partner-status` | Option: `Current`, `Past` | `status` | Map to `"current"` or `"past"` |
| `order` | Number | `order` | Lower number shows higher |

### Pioneers

Impact Program participants, shown on `/impact`.

| | |
| --- | --- |
| Collection ID | `6a32a1e3523cd17b41a2a218` |
| Collection slug | `pioneers` |
| Items | 8 |

| Webflow field | Type | Domain field | Notes |
| --- | --- | --- | --- |
| `name` | PlainText, required | `name` | |
| `slug` | PlainText, required | `slug` | No detail pages |
| `company` | PlainText | `organisation` | |
| `bio` | RichText | `bio` | |
| `portrait` | Image | `portrait` | |
| `link` | Link | `url` | Organisation website |
| `instagram` | Link | `instagramUrl` | |
| `linkedin` | Link | `linkedinUrl` | |

No `order` field: keep the API order.

### Blogs

Standard Webflow blog collection, shown on `/blog`. **Empty**: build the blog only once it has content.

| | |
| --- | --- |
| Collection ID | `6a0708b18eef3918b2c9feda` |
| Collection slug | `blog` |
| Items | 0 |

Fields: `name`, `slug`, `post-body` (RichText), `post-summary`, `main-image`, `thumbnail-image`, `featured` (Switch), `color` (Color).

## Content that is not in the CMS

The homepage, After Growth, About Us and the top of Impact are typed directly into the Webflow Designer. The API only exposes them as loose text nodes, so they are rebuilt in code (phase 3). The design system's UI kit has the target designs for these pages (see `docs/current-site.md`).
