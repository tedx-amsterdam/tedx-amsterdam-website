# The Website Specification

We use [The Website Specification](https://specification.website) as the quality reference for this site. It lists about 170 requirements across ten categories, each marked Required, Recommended, Optional or Avoid.

How we apply it:

- **Required**: must be met before launch, unless marked not applicable with a reason.
- **Recommended**: the default. Skipping one needs a reason in this file.
- **Avoid**: must not appear in the site.
- **Optional**: adopted when useful; not tracked here.

This file maps each relevant requirement to its status. "Tested" means a test in `tests/headers.test.ts` (headers) or `tests/output/` (built HTML) fails if the requirement breaks. Update it in the same pull request that changes a status. The spec itself can be searched from Claude Code through the MCP server in `.mcp.json`.

**Status values**: **Done**, **Partial** (started, not complete), a roadmap phase (**Phase 1** to **Phase 6**), **Checks** (to be covered by automated checks), **Design system** (owned by the design system), **N/A** (does not apply, with reason).

Links point to `https://specification.website/spec/<category>/<slug>/`.

## Foundations

| Requirement | Level | Status | Notes |
| --- | --- | --- | --- |
| [Doctype](https://specification.website/spec/foundations/doctype/) | Required | Done | Rendered by Next.js; tested on every page |
| [lang on html](https://specification.website/spec/foundations/html-lang/) | Required | Done | `en` in the root layout; tested on every page |
| [meta charset](https://specification.website/spec/foundations/meta-charset/) | Required | Done | Rendered by Next.js; tested on every page |
| [meta viewport](https://specification.website/spec/foundations/meta-viewport/) | Required | Done | Rendered by Next.js; tested on every page |
| [title](https://specification.website/spec/foundations/title/) | Required | Partial | Tested to be present on every page; each page still needs its own title as it is built |
| [meta description](https://specification.website/spec/foundations/meta-description/) | Recommended | Phase 4 | |
| [Canonical URL](https://specification.website/spec/foundations/canonical-url/) | Recommended | Phase 4 | |
| [Favicons](https://specification.website/spec/foundations/favicons/) | Recommended | Phase 4 | None yet |
| [theme-color](https://specification.website/spec/foundations/theme-color/) | Recommended | Phase 4 | Black, matching the dark first design |
| [color-scheme](https://specification.website/spec/foundations/color-scheme/) | Recommended | Phase 4 | `dark` |
| [Open Graph](https://specification.website/spec/foundations/open-graph/) | Recommended | Phase 4 | |
| [Feed discovery](https://specification.website/spec/foundations/feed-discovery/), [feed hygiene](https://specification.website/spec/foundations/feed-hygiene/) | Recommended | Phase 2 | With the blog, once it has content |
| [Popover API](https://specification.website/spec/foundations/popover-api/), [anchor positioning](https://specification.website/spec/foundations/anchor-positioning/), [text-wrap](https://specification.website/spec/foundations/text-wrap/), [container queries](https://specification.website/spec/foundations/container-queries/) | Recommended | Design system | Component level CSS |

## SEO

| Requirement | Level | Status | Notes |
| --- | --- | --- | --- |
| [Redirects](https://specification.website/spec/seo/redirects/) | Required | Phase 4 | 301s for legacy Webflow URLs via Cloudflare `_redirects` |
| [Meta robots and X-Robots-Tag](https://specification.website/spec/seo/meta-robots/) | Required | Partial | `noindex` on all `pages.dev` deployments; production policy in phase 4 |
| [Heading hierarchy](https://specification.website/spec/seo/heading-hierarchy/) | Required | Partial | Exactly one `h1` per page is tested; deeper heading order is checked in review |
| [Soft 404s](https://specification.website/spec/seo/soft-404/) | Avoid | Done | `404.html` exists (tested) and Cloudflare serves it with status 404 |
| [robots.txt](https://specification.website/spec/seo/robots-txt/) | Recommended | Phase 4 | Generated from the content layer |
| [XML sitemaps](https://specification.website/spec/seo/xml-sitemaps/) | Recommended | Phase 4 | Generated from the content layer |
| [Sitemap index](https://specification.website/spec/seo/sitemap-index/) | Recommended | N/A | One sitemap is enough for a site of this size |
| [URL structure](https://specification.website/spec/seo/url-structure/) | Recommended | Phase 4 | Keep the existing Webflow URLs |
| [Server side rendering](https://specification.website/spec/seo/server-side-rendering/) | Recommended | Done | Static export: every page is complete HTML |
| [Internal linking](https://specification.website/spec/seo/internal-linking/) | Recommended | Partial | Header and footer navigation; grows with the pages |
| [Structured data](https://specification.website/spec/seo/structured-data/) | Recommended | Phase 1 | JSON-LD on speaker pages first |
| [Breadcrumbs](https://specification.website/spec/seo/breadcrumbs/) | Recommended | Phase 1 | Design system `Breadcrumb` on detail pages |

## Accessibility

| Requirement | Level | Status | Notes |
| --- | --- | --- | --- |
| [Colour contrast](https://specification.website/spec/accessibility/color-contrast/) | Required | Design system | Verified in Storybook; Lighthouse checks every preview |
| [Image alt text](https://specification.website/spec/accessibility/image-alt-text/) | Required | Partial | Webflow alt text is null on every speaker photo; the mapper falls back to the speaker name (tested). Per component alt text follows with the pages in 1c |
| [Form labels](https://specification.website/spec/accessibility/form-labels/) | Required | Phase 3 | Newsletter form |
| [Accessible form errors](https://specification.website/spec/accessibility/form-errors/) | Required | Phase 3 | Newsletter form |
| [Keyboard navigation](https://specification.website/spec/accessibility/keyboard-navigation/) | Required | Partial | Design system components are keyboard accessible; checked per page |
| [Visible focus indicators](https://specification.website/spec/accessibility/focus-indicators/) | Required | Done | Global focus ring from the design system |
| [Skip links](https://specification.website/spec/accessibility/skip-links/) | Required | Done | Every skip link has a target on every page (tested); fixed on the 404 page |
| [Semantic HTML and landmarks](https://specification.website/spec/accessibility/semantic-html/) | Required | Partial | `header`, `nav`, `main`, `footer` in place; checked per page |
| [Descriptive link text](https://specification.website/spec/accessibility/link-text/) | Required | Partial | Avoid "Learn more" without context, as used on the Webflow partners page |
| [Document and parts language](https://specification.website/spec/accessibility/document-language/) | Required | Done | `lang="en"`; Dutch passages get `lang="nl"` |
| [Reduced motion](https://specification.website/spec/accessibility/reduced-motion/) | Required | Done | Handled globally by the design system |
| [Captions and transcripts](https://specification.website/spec/accessibility/captions-and-transcripts/) | Required | Phase 3 | Only if a video has meaningful audio; the hero video is decorative |
| [Accessible data tables](https://specification.website/spec/accessibility/data-tables/) | Required | Phase 3 | Applies to the event timetable, if built as a table |
| [Touch target size](https://specification.website/spec/accessibility/touch-target-size/) | Required | Design system | |
| [Empty links and buttons](https://specification.website/spec/accessibility/empty-links-buttons/) | Avoid | Done | Lighthouse fails the pull request if one appears |
| [Accessibility overlays](https://specification.website/spec/accessibility/accessibility-overlays/) | Avoid | Done | Never add one |
| [Forced colours](https://specification.website/spec/accessibility/forced-colors/), [focus not obscured](https://specification.website/spec/accessibility/focus-not-obscured/), [native interactive elements](https://specification.website/spec/accessibility/native-interactive-elements/), [status messages](https://specification.website/spec/accessibility/status-messages/) | Recommended | Design system | |
| [ARIA: first rule of ARIA](https://specification.website/spec/accessibility/aria-usage/) | Recommended | Partial | Native elements first is a rule in CLAUDE.md; `a11y-reviewer` checks each change |
| [inert](https://specification.website/spec/accessibility/inert-attribute/), [hidden until found](https://specification.website/spec/accessibility/hidden-until-found/), [CSS state selectors](https://specification.website/spec/accessibility/css-state-selectors/) | Recommended | Design system | Overlays, collapsibles and form state live in components |
| [Consistent help](https://specification.website/spec/accessibility/consistent-help/) | Recommended | Phase 3 | Contact and social links stay in the site footer on every page |
| [Mobile-friendly form inputs](https://specification.website/spec/accessibility/mobile-form-inputs/) | Recommended | Phase 3 | Newsletter form: `type="email"`, `autocomplete`, input text at 16px or larger |
| [Accessible authentication](https://specification.website/spec/accessibility/accessible-authentication/), [redundant entry](https://specification.website/spec/accessibility/redundant-entry/), [dragging movements](https://specification.website/spec/accessibility/dragging-movements/) | Recommended | N/A | No login, no multi step forms and nothing to drag |

## Security

| Requirement | Level | Status | Notes |
| --- | --- | --- | --- |
| [HTTPS and TLS](https://specification.website/spec/security/https-tls/) | Required | Done | Cloudflare |
| [HSTS](https://specification.website/spec/security/hsts/) | Required | Partial | One year, tested; `includeSubDomains` and preload are decided at launch |
| [X-Content-Type-Options](https://specification.website/spec/security/x-content-type-options/) | Required | Done | Header in `_headers`, tested |
| [Clickjacking protection](https://specification.website/spec/security/frame-ancestors/) | Required | Done | `frame-ancestors 'none'` and `X-Frame-Options: DENY`, tested |
| [Cookie attributes](https://specification.website/spec/security/cookie-attributes/) | Required | N/A | The site sets no cookies; revisit with analytics in phase 4 |
| [X-XSS-Protection](https://specification.website/spec/security/x-xss-protection/) | Avoid | Done | Tested to stay absent |
| [Content Security Policy](https://specification.website/spec/security/content-security-policy/) | Recommended | Partial | `frame-ancestors`, `base-uri`, `object-src` and `form-action` set; a script policy needs hashes because Next.js inlines scripts |
| [Referrer-Policy](https://specification.website/spec/security/referrer-policy/) | Recommended | Done | `strict-origin-when-cross-origin`, tested |
| [Permissions-Policy](https://specification.website/spec/security/permissions-policy/) | Recommended | Done | Unused features disabled, tested |
| [security.txt](https://specification.website/spec/security/security-txt/) | Recommended | Checks | Needs a contact address of the foundation |
| [Mixed content](https://specification.website/spec/security/mixed-content/) | Recommended | Done | No plain HTTP resources, tested on every page |
| [Cross-origin isolation](https://specification.website/spec/security/cross-origin-isolation/) | Recommended | Partial | COOP `same-origin`, tested; COEP would block CMS images from other origins |
| [Subresource Integrity](https://specification.website/spec/security/subresource-integrity/) | Recommended | Phase 4 | Disappears as a concern once Google Fonts is self hosted |
| [Reporting API](https://specification.website/spec/security/reporting-endpoints/), [Trusted Types](https://specification.website/spec/security/trusted-types/) | Recommended | Phase 4 | After CSP is in place |
| [Fetch Metadata](https://specification.website/spec/security/fetch-metadata/) | Recommended | N/A | Needs server side request checks; the site is static |
| [CAA records](https://specification.website/spec/security/caa-records/) | Recommended | Phase 6 | When the domain moves to the foundation Cloudflare account |

## Well-Known URIs

| Requirement | Level | Status | Notes |
| --- | --- | --- | --- |
| [Well-known URIs](https://specification.website/spec/well-known/well-known-overview/) | Recommended | Checks | Starts with `security.txt` |
| [api-catalog](https://specification.website/spec/well-known/api-catalog/) | Recommended | N/A | The site offers no API |

## Agent Readiness

| Requirement | Level | Status | Notes |
| --- | --- | --- | --- |
| [Agent readiness](https://specification.website/spec/agent-readiness/agent-readiness-overview/) | Recommended | Phase 4 | Overview; covered by the rows below |
| [Stable URLs](https://specification.website/spec/agent-readiness/stable-urls/) | Required | Phase 4 | Keep Webflow URLs; redirect anything that changes |
| [llms.txt](https://specification.website/spec/agent-readiness/llms-txt/) | Recommended | Phase 4 | Generated from the content layer |
| [robots.txt for AI crawlers](https://specification.website/spec/agent-readiness/robots-for-ai-crawlers/) | Recommended | Phase 4 | Policy is a decision for the foundation |
| [Structured data for agents](https://specification.website/spec/agent-readiness/structured-data-for-agents/), [machine-readable formats](https://specification.website/spec/agent-readiness/machine-readable-formats/) | Recommended | Phase 4 | Follows from JSON-LD and the sitemap |
| [Markdown source endpoints](https://specification.website/spec/agent-readiness/markdown-source-endpoints/), [Link headers](https://specification.website/spec/agent-readiness/link-headers/) | Recommended | Phase 4 | Evaluate after the content pages exist |
| [Agent Skills discovery](https://specification.website/spec/agent-readiness/agent-skills-discovery/) | Recommended | N/A | The site offers no agent skills |

## Performance

| Requirement | Level | Status | Notes |
| --- | --- | --- | --- |
| [Core Web Vitals](https://specification.website/spec/performance/core-web-vitals/) | Required | Partial | Measured by Lighthouse on every preview; thresholds rise per phase |
| [Image optimisation](https://specification.website/spec/performance/image-optimization/) | Required | Phase 1 | Explicit dimensions and lazy loading on Webflow CDN images in 1c (decision 19). Modern formats and responsive `srcset` are not covered until the CMS migration (phase 7), after launch: an open decision in the roadmap |
| [Cache-Control](https://specification.website/spec/performance/cache-control/) | Required | Done | Hashed assets under `/_next/static/` are immutable for a year, tested |
| [Compression](https://specification.website/spec/performance/compression/) | Required | Done | Cloudflare |
| [HTTP/1.1 workarounds](https://specification.website/spec/performance/http1-workarounds/) | Avoid | Done | None used |
| [HTTP/2 and HTTP/3](https://specification.website/spec/performance/http3/) | Recommended | Done | Cloudflare |
| [Lazy loading](https://specification.website/spec/performance/lazy-loading/) | Recommended | Phase 1 | Speaker portraits |
| [Web font loading](https://specification.website/spec/performance/font-loading/) | Recommended | Phase 4 | Self host the fallback font instead of Google Fonts |
| [Critical CSS](https://specification.website/spec/performance/critical-css/), [script loading](https://specification.website/spec/performance/script-loading/) | Recommended | Done | Handled by Next.js; Lighthouse watches regressions |
| [Back/forward cache](https://specification.website/spec/performance/bfcache/) | Recommended | Done | Audited by Lighthouse on every preview |
| [Conditional requests](https://specification.website/spec/performance/conditional-requests/) | Recommended | Partial | Cloudflare sends an ETag and answers 304 for static assets, but sends no validator for HTML pages |
| [Vary](https://specification.website/spec/performance/vary/) | Recommended | Partial | The site does no content negotiation; compressed HTML comes without `Vary: Accept-Encoding`. Check with Cloudflare in phase 5 |
| [Speculation Rules](https://specification.website/spec/performance/speculation-rules/), [preload and preconnect](https://specification.website/spec/performance/preload-prefetch-preconnect/), [resource hints](https://specification.website/spec/performance/resource-hints/), [No-Vary-Search](https://specification.website/spec/performance/no-vary-search/) | Recommended | Phase 4 | |
| [Dynamic viewport units](https://specification.website/spec/performance/dynamic-viewport-units/), [scrollbar gutter](https://specification.website/spec/performance/scrollbar-gutter/) | Recommended | Design system | |

## Privacy

| Requirement | Level | Status | Notes |
| --- | --- | --- | --- |
| [Privacy policy](https://specification.website/spec/privacy/privacy-policy/) | Required | Phase 3 | Missing on the Webflow site too; needed before the newsletter form goes live |
| [Cookie consent](https://specification.website/spec/privacy/cookie-consent/) | Required | Phase 4 | Only needed if analytics sets cookies; cookieless analytics may avoid it |
| [Third-party scripts](https://specification.website/spec/privacy/third-party-scripts/) | Recommended | Phase 4 | Google Fonts is loaded from Google today |
| [Privacy-respecting analytics](https://specification.website/spec/privacy/analytics-privacy/) | Recommended | Phase 4 | Compare cookieless options with the current GA4 setup |
| [Global Privacy Control](https://specification.website/spec/privacy/global-privacy-control/), [data minimisation](https://specification.website/spec/privacy/data-minimization/) | Recommended | Phase 4 | |

## Resilience

| Requirement | Level | Status | Notes |
| --- | --- | --- | --- |
| [Custom error pages](https://specification.website/spec/resilience/error-pages/) | Required | Done | Site specific 404 page, tested. No 500 page: the site is static |
| [Graceful degradation](https://specification.website/spec/resilience/graceful-degradation/) | Recommended | Partial | Content is static HTML; the mobile menu needs JavaScript |
| [Web app manifest](https://specification.website/spec/resilience/pwa-manifest/) | Recommended | Phase 4 | With the favicons |
| [Monitoring and uptime](https://specification.website/spec/resilience/monitoring-uptime/) | Recommended | Phase 6 | |
| [Maintenance pages](https://specification.website/spec/resilience/maintenance-pages/) | Recommended | N/A | Static deploys are atomic; there is no maintenance state |
| [Redirect-By](https://specification.website/spec/resilience/redirect-by/) | Recommended | Phase 4 | With the redirects |

## Internationalisation

The site is English only. Most requirements in this category apply to multilingual sites and are N/A until a second language is added.

| Requirement | Level | Status | Notes |
| --- | --- | --- | --- |
| [lang on inline content](https://specification.website/spec/i18n/lang-attribute/) | Required | Partial | Dutch names and quotes get `lang="nl"` where they appear |
| [Automatic IP-based language redirects](https://specification.website/spec/i18n/avoid-auto-geo-redirects/) | Avoid | Done | None used |
| [Locale-aware content](https://specification.website/spec/i18n/locale-content/), [plural rules](https://specification.website/spec/i18n/plural-rules/) | Recommended | Phase 2 | Event dates through `Intl.DateTimeFormat`, counts through `Intl.PluralRules` |
| [RTL and bidirectional text](https://specification.website/spec/i18n/rtl-support/) | Recommended | N/A | English only, no right to left content |
| [hreflang](https://specification.website/spec/i18n/hreflang/), [international URLs](https://specification.website/spec/i18n/international-url-structure/), [language switcher](https://specification.website/spec/i18n/language-switcher/), [localised metadata](https://specification.website/spec/i18n/localised-metadata/) | Recommended | N/A | Single language |
