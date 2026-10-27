# Analytics and tracking

What the live Webflow site measures, and what this site has to reproduce at launch so the reports in Google Analytics keep working. Set up on 26 and 27 October 2026. All tracking lives in Google Tag Manager: the site only loads the container.

## Accounts

| What | Where | Note |
| --- | --- | --- |
| Google Tag Manager | Account "TEDxAmsterdam", container `GTM-M3V88B7H` (www.tedxamsterdam.nl) | In the foundation's Google account. Edit tracking here, not in the site's code |
| Google Analytics 4 | Account 385396749, property 525714553, web stream `G-PVYRFDNXB9` | The same property as before the move to Tag Manager, so history continues |
| Search Console | URL prefix property `https://www.tedxamsterdam.nl/`, linked to the GA4 property | Two owners: the foundation's Google account (meta tag, below) and the maintainer's personal account (DNS record) |

## What the site has to load

- **The Tag Manager snippet** in the `<head>` of every page, with the container ID `GTM-M3V88B7H`. Nothing else: no `gtag.js` and no second GA4 tag, or every page view counts twice.
- **Only on the production domain.** Preview deployments on `pages.dev` must not load the container, or test visits land in the real reports. Load it based on the hostname or an environment variable.
- **The Search Console verification tag** on the home page: `<meta name="google-site-verification" content="j10S7sStJ6MXpD9H0dcO5swaviJkl3jQUobmjbT5r7Q" />`. Without it the foundation's account loses Search Console. The personal account's DNS verification survives the switch.
- **A content security policy that allows it.** `public/_headers` sets no `script-src` or `connect-src` today. When it does, allow `https://www.googletagmanager.com` for scripts and `https://*.google-analytics.com` and `https://*.analytics.google.com` for connections.

## Events

| Event | Fires when | Depends on | On this site |
| --- | --- | --- | --- |
| `page_view` | Every page | The Google tag in the container | Works with the snippet |
| `ticket_click` (key event) | A click on a link whose URL contains `eventbrite.` | The link URL. Its `placement` parameter is `header` inside `.navbar1_component`, `footer` inside `footer` or `.footer`, otherwise `content` | Pushed to the data layer, with `placement` read from the `header` and `footer` landmarks |
| `sign_up` (key event) | The newsletter form is submitted | Form ID `wf-form-EMAIL` | Breaks unless the newsletter form (phase 3) uses that ID |
| `application_click` | A click on a link to `docs.google.com/forms` | The link URL | Pushed to the data layer |
| `partner_contact` | A click on a `mailto:partners@` link | The link URL | Pushed to the data layer |
| `speaker_profile_open` | A click on a speaker photo that opens the profile modal, with `speaker_name` | `.speaker-photo-button` and its `aria-label` "Open profile of {name}", made by the Webflow footer script | Breaks: this site has speaker pages instead of a modal. The speaker page views replace it |
| `page_not_found` | The 404 page loads, with `referrer_url` | The page title equals "Not Found" | Pushed to the data layer by the 404 page, whose title here is "Page not found" |
| `js_error` | A JavaScript error on the page | Nothing | Works |
| `scroll_depth` | Scrolling past 25, 50 and 75% (GA4 sends 90% itself) | Nothing | Works |

Visitors who open any page with `?tedx_internal=1` get a cookie for a year, and Tag Manager sends `traffic_type=internal` for them. GA4 leaves those visits out (the "Internal Traffic" data filter), so team members can browse without skewing the numbers. `?tedx_internal=0` removes the cookie. This keeps working after launch, because the cookie belongs to the domain.

### The data layer on this site

Instead of copying Webflow class names, this site pushes the events to `window.dataLayer` itself, with the same names and parameters as the live site. Events then survive changes to markup and class names, which stay private to the design system.

- `src/lib/analytics.ts` holds `trackEvent`, the link rules and `placement`, read from the `header` and `footer` landmarks.
- `AnalyticsEvents` in the root layout listens for clicks on the whole page and pushes `ticket_click`, `application_click` and `partner_contact` with `link_url`, `link_text`, `placement` and `page_location_path`.
- `PageNotFoundEvent` on the 404 page pushes `page_not_found` with `page_location_path` and `referrer_url`.

This site does not load Tag Manager yet (phase 4): until it does, the pushes stay in the page and reach nobody. On the day of the DNS switch, replace these triggers in Tag Manager with Custom Event triggers of the same names, and read the parameters with Data Layer Variables:

| Trigger on the live site | Replace with |
| --- | --- |
| Click - Eventbrite ticket link | Custom Event `ticket_click` |
| Click - Application form (Google Forms) | Custom Event `application_click` |
| Click - Email partners@ | Custom Event `partner_contact` |
| DOM Ready - 404 page | Custom Event `page_not_found` |

`sign_up` follows with the newsletter form (phase 3). `speaker_profile_open` has no counterpart: this site has speaker pages instead of a modal.

## Settings in Google Analytics

These live in Google Analytics, not in the site, and carry over unchanged:

- Key events: `ticket_click` and `sign_up`.
- Custom dimensions (event scope): `placement`, `speaker_name`, `referrer_url`, `error_message`.
- Data filter "Internal Traffic" is active.
- Unwanted referrals: `pay.ideal.nl`.
- Data sharing with Google is off (all four account settings), ads personalisation is off in every region, and Google signals and granular location and device data are off. Data retention: events 2 months, users 14 months. The privacy policy on the live site says data sharing and advertising features are off, so keep it that way or change the policy with it.
- Enhanced measurement is on, except site search: the site has no search.
- The exploration "Ticket funnel: visit, event page, ticket click" expects the event page at a URL that contains `/after-growth`. Update its second step when the event page moves.
- An annotation on 26 October 2026 marks the move to Tag Manager.

## Launch checklist

- [ ] The Tag Manager snippet is in the layout, on the production domain only, and no `gtag.js` loads
- [ ] The Search Console verification tag is on the home page
- [ ] The triggers in Tag Manager are switched to the custom events above, and in Tag Manager's preview mode every event fires on the new site
- [ ] Publish the Tag Manager changes and the DNS switch together, and add an annotation in GA4 for the day
- [ ] The day after, page views and users per day are in line with the week before
- [ ] Submit the new `sitemap.xml` in Search Console
