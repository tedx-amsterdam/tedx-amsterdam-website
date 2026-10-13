import type { Metadata } from "next";
import { Tag } from "tedx-amsterdam-design-system";
import { EventCard } from "@/components/EventCard";
import { JsonLd } from "@/components/JsonLd";
import { OPEN_GRAPH_DEFAULTS, SITE_URL } from "@/config/site";
import { getEvents, splitEvents, type TedxEvent } from "@/content";
import styles from "./page.module.css";

// Same copy as the Webflow events page.
const INTRO = "Check out our upcoming events, talks, and community experiences. Don’t miss out on what’s next at TEDxAmsterdam.";
const PAST_INTRO = "A look back at the talks, open mics and community gatherings we’ve hosted so far.";
// Upcoming and past are split at build time (decision 22): an event moves to
// past events on the first build after its day ends.
const BUILT_AT = new Date();

export const metadata: Metadata = {
  title: "Events",
  description: INTRO,
  alternates: { canonical: "/events" },
  openGraph: { ...OPEN_GRAPH_DEFAULTS, title: "Events | TEDxAmsterdam", description: INTRO, url: "/events", type: "website" },
};

export default async function EventsPage() {
  const { upcoming, past } = splitEvents(await getEvents(), BUILT_AT);
  // The first image on the page may be visible on load, so it is not lazy
  // loaded; that would delay the largest contentful paint.
  const eagerSlug = [...upcoming, ...past].find((event) => event.image)?.slug;

  return (
    <main id="main-content" className={styles.main}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "TEDxAmsterdam events",
          itemListElement: [...upcoming, ...past].map((event, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: toJsonLd(event),
          })),
        }}
      />
      <header className={styles.hero}>
        <h1 className={styles.title}>Events</h1>
        <div className={styles.intro}>
          <Tag>About events</Tag>
          <p className={styles.text}>{INTRO}</p>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="upcoming">
        <h2 id="upcoming" className={styles.heading}>
          Upcoming events
        </h2>
        {upcoming.length > 0 ? (
          <EventList events={upcoming} eagerSlug={eagerSlug} />
        ) : (
          <p className={styles.text}>New events are announced here. Check back soon.</p>
        )}
      </section>

      {past.length > 0 && (
        <section className={styles.section} aria-labelledby="past">
          <h2 id="past" className={styles.heading}>
            Past events
          </h2>
          <p className={styles.text}>{PAST_INTRO}</p>
          <EventList events={past} eagerSlug={eagerSlug} />
        </section>
      )}
    </main>
  );
}

function EventList({ events, eagerSlug }: { events: readonly TedxEvent[]; eagerSlug?: string }) {
  return (
    <ul className={styles.list}>
      {events.map((event) => (
        <li key={event.slug}>
          <EventCard event={event} eager={event.slug === eagerSlug} />
        </li>
      ))}
    </ul>
  );
}

// Events have no address in the CMS, only a venue name, so the Place has a
// name only. Search engines need an address for event rich results.
function toJsonLd(event: TedxEvent) {
  return {
    "@type": "Event",
    name: event.title,
    startDate: event.startsAt,
    description: event.description,
    url: event.url,
    image: event.image?.url,
    location: event.location ? { "@type": "Place", name: event.location } : undefined,
    organizer: { "@type": "Organization", name: "TEDxAmsterdam", url: SITE_URL },
  };
}
