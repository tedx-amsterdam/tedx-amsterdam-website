import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb, Tag } from "tedx-amsterdam-design-system";
import { JsonLd } from "@/components/JsonLd";
import { RichText } from "@/components/RichText";
import { sizesFor, srcSet } from "@/components/src-set";
import { OPEN_GRAPH_DEFAULTS, SITE_URL } from "@/config/site";
import { getSpeaker, getSpeakers, type Image, type Speaker } from "@/content";
import { toPlainText, truncate } from "@/lib/plain-text";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

// Static export: every speaker page is built from the CMS, and any other
// slug is a 404 instead of a page rendered on request.
export const dynamicParams = false;

export async function generateStaticParams() {
  const speakers = await getSpeakers();
  // A static export needs at least one page per dynamic route. Without this,
  // Next.js reports a missing generateStaticParams instead of the real cause.
  if (speakers.length === 0) {
    throw new Error("No published speakers in the CMS. The site needs at least one to build /speakers/[slug].");
  }
  return speakers.map((speaker) => ({ slug: speaker.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const speaker = await getSpeaker((await params).slug);
  if (!speaker) return {};
  const path = `/speakers/${speaker.slug}`;
  const description = describe(speaker);
  return {
    title: speaker.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...OPEN_GRAPH_DEFAULTS,
      title: `${speaker.name} | TEDxAmsterdam`,
      description,
      url: path,
      type: "profile",
      images: speaker.photo ? [{ url: shareImage(speaker.photo), alt: speaker.photo.alt }] : undefined,
    },
  };
}

export default async function SpeakerPage({ params }: Props) {
  const { slug } = await params;
  const speakers = await getSpeakers();
  const index = speakers.findIndex((s) => s.slug === slug);
  const speaker = speakers[index];
  if (!speaker) notFound();

  // Previous and next wrap around, like the carousel in the design. With
  // two speakers both would be the same person, so only next is shown.
  const next = speakers.length > 1 ? speakers[(index + 1) % speakers.length] : undefined;
  const previous = speakers.length > 2 ? speakers[(index - 1 + speakers.length) % speakers.length] : undefined;
  const url = `${SITE_URL}/speakers/${speaker.slug}`;

  return (
    <main id="main-content" className={styles.main}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": `${url}#person`,
              name: speaker.name,
              url,
              jobTitle: speaker.role,
              description: describe(speaker),
              image: speaker.photo?.url,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
                { "@type": "ListItem", position: 2, name: "Speakers", item: `${SITE_URL}/speakers` },
                { "@type": "ListItem", position: 3, name: speaker.name, item: url },
              ],
            },
          ],
        }}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Speakers", href: "/speakers" }, { label: speaker.name }]} />

      <article className={styles.layout}>
        <div className={styles.text}>
          <Tag>{speaker.tedxRole ?? "Speaker"}</Tag>
          <h1 className={styles.name}>{speaker.name}</h1>
          {speaker.sessionTitle && <p className={styles.session}>{speaker.sessionTitle}</p>}
          {(speaker.role || speaker.pronouns) && (
            <p className={styles.role}>
              {speaker.role}
              {speaker.role && speaker.pronouns && " · "}
              {speaker.pronouns}
            </p>
          )}
          {speaker.sessionBlurb && <RichText html={speaker.sessionBlurb} headingsFrom={2} />}
          {speaker.bio && (
            <section className={styles.about} aria-labelledby="about">
              <h2 id="about" className={styles.aboutHeading}>
                <Tag>About</Tag>
              </h2>
              <RichText html={speaker.bio} headingsFrom={3} className={styles.bio} />
            </section>
          )}
        </div>

        <div className={styles.aside}>
          <div className={styles.portrait}>
            {speaker.photo && (
              // Above the fold, so loaded eagerly. Explicit dimensions keep
              // the 3:4 frame while it loads (decision 19).
              // oxlint-disable-next-line nextjs/no-img-element -- next/image cannot optimise in a static export
              <img
                className={styles.photo}
                src={speaker.photo.url}
                srcSet={srcSet(speaker.photo)}
                // At most 480px wide above the text, 640px beside it in the frame.
                sizes={sizesFor(speaker.photo, "(max-width: 1023px) min(100vw, 480px), 640px")}
                alt={speaker.photo.alt}
                width={600}
                height={800}
                fetchPriority="high"
                decoding="async"
              />
            )}
            {/* Repeats the h1 as a visual label, so screen readers skip it. */}
            <span className={styles.label} aria-hidden="true">
              {speaker.name}
            </span>
          </div>
          {next && (
            <nav className={styles.pager} aria-label="More speakers">
              {previous && (
                <a className={styles.pagerLink} href={`/speakers/${previous.slug}`} rel="prev">
                  <span className={styles.pagerHint}>Previous speaker</span>{" "}
                  {previous.name}
                </a>
              )}
              <a className={`${styles.pagerLink} ${styles.pagerNext}`} href={`/speakers/${next.slug}`} rel="next">
                <span className={styles.pagerHint}>Next speaker</span>{" "}
                {next.name}
              </a>
            </nav>
          )}
        </div>
      </article>
    </main>
  );
}

// Meta description: the short bio reads best, the session blurb is the
// fallback, and a speaker without either still gets a unique description.
function describe(speaker: Speaker): string {
  const text = [speaker.bio, speaker.sessionBlurb].map((html) => (html ? toPlainText(html) : "")).find(Boolean);
  return truncate(text ?? `${speaker.name}, speaker at TEDxAmsterdam.`, 160);
}

// Social previews download the image, and some drop anything over about
// 300 KB, so a 1080 pixel variant is preferred over the original.
function shareImage(photo: Image): string {
  return photo.variants?.find((variant) => variant.width === 1080 && variant.url !== photo.url)?.url ?? photo.url;
}
