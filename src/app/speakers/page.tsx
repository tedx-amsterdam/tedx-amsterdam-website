import type { Metadata } from "next";
import { Tag } from "tedx-amsterdam-design-system";
import { JsonLd } from "@/components/JsonLd";
import { SpeakerCard } from "@/components/SpeakerCard";
import { OPEN_GRAPH_DEFAULTS, SITE_URL } from "@/config/site";
import { getSpeakers } from "@/content";
import styles from "./page.module.css";

// Same copy as the Webflow speakers page.
const INTRO = "TEDxAmsterdam invites speakers to inspire with powerful stories. Each year, a new theme sparks inspiration and ideas.";

export const metadata: Metadata = {
  title: "Speakers",
  description: INTRO,
  alternates: { canonical: "/speakers" },
  openGraph: { ...OPEN_GRAPH_DEFAULTS, title: "Speakers | TEDxAmsterdam", description: INTRO, url: "/speakers", type: "website" },
};

export default async function SpeakersPage() {
  const speakers = await getSpeakers();
  const prioritySlug = speakers.find((speaker) => speaker.photo)?.slug;

  return (
    <main id="main-content" className={styles.main}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "TEDxAmsterdam speakers",
          itemListElement: speakers.map((speaker, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: speaker.name,
            url: `${SITE_URL}/speakers/${speaker.slug}`,
          })),
        }}
      />
      <header className={styles.hero}>
        <h1 className={styles.title}>Speakers</h1>
        <div className={styles.intro}>
          <Tag>About speakers</Tag>
          <p className={styles.text}>{INTRO}</p>
        </div>
      </header>
      <ul className={styles.grid}>
        {speakers.map((speaker) => (
          <li key={speaker.slug}>
            <SpeakerCard speaker={speaker} priority={speaker.slug === prioritySlug} />
          </li>
        ))}
      </ul>
    </main>
  );
}
