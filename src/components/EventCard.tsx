import type { TedxEvent } from "@/content";
import { formatLongDate } from "@/lib/dates";
import { ArrowLink, Tag } from "tedx-amsterdam-design-system";
import { sizesFor, srcSet } from "./src-set";
import styles from "./EventCard.module.css";

type EventCardProps = {
  event: TedxEvent;
  // For the first image on the page, which may be visible on load.
  eager?: boolean;
};

// One event in a list, under a section h2. Events have no pages of their own: the link goes to
// tickets or the event page on another site.
export function EventCard({ event, eager = false }: EventCardProps) {
  return (
    <article className={styles.card}>
      {event.image && (
        // Webflow returns no image dimensions (decision 19): width and height
        // give the 16:9 frame, object-fit crops the image into it.
        // oxlint-disable-next-line nextjs/no-img-element -- next/image cannot optimise in a static export
        <img
          className={styles.image}
          src={event.image.url}
          srcSet={srcSet(event.image)}
          // Full width on phones, the left column of the 1400px frame beside the text.
          sizes={sizesFor(event.image, "(max-width: 767px) 100vw, 440px")}
          alt={event.image.alt}
          width={800}
          height={450}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      )}
      <div className={styles.text}>
        {/* Heading first, so screen reader users who jump between headings
            also hear the date; CSS shows the date above it. */}
        <h3 className={styles.title}>{event.title}</h3>
        <time className={styles.date} dateTime={event.startsAt}>
          {formatLongDate(event.startsAt)}
        </time>
        {(event.location || event.tag) && (
          <p className={styles.meta}>
            {event.tag && <Tag>{event.tag}</Tag>}
            {/* A real space, so assistive tech does not read "Main eventZoku". */}
            {event.tag && event.location && " "}
            {event.location}
          </p>
        )}
        {event.description && <p className={styles.description}>{event.description}</p>}
        {event.url && (
          // Every card has the same link text; the label names the event, so
          // a list of links stays meaningful. It starts with the visible text
          // (WCAG 2.5.3, label in name).
          <ArrowLink href={event.url} aria-label={`Learn more about ${event.title}`}>
            Learn more
          </ArrowLink>
        )}
      </div>
    </article>
  );
}
