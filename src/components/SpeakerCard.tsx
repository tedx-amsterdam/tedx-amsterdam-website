import type { Speaker } from "@/content";
import { sizesFor, srcSet } from "./src-set";
import styles from "./SpeakerCard.module.css";

type SpeakerCardProps = {
  speaker: Speaker;
  // The first photo is the largest contentful paint, and on a phone the only
  // one in view. It loads eagerly with high priority and may use every
  // variant. The others load lazily, but the next few still start while it
  // downloads, as they sit just below the fold; they stop at the 500px
  // variant so they take less of its bandwidth. In these soft portraits,
  // enlarged at most 1.4 times on a phone, the difference does not show.
  priority?: boolean;
};

// The card's width in the grid of the speakers page, where the photos sit
// side by side without gaps: one column on phones (15px gutters), two on
// tablets (gutters of 15px, then 40px), four in the 1080px content column,
// where a card is 270px wide.
const SIZES =
  "(max-width: 479px) calc(100vw - 30px), (max-width: 767px) calc(50vw - 15px), (max-width: 1023px) calc(50vw - 40px), min(calc(25vw - 20px), 270px)";

// Overview card that links to the speaker page. The portrait has alt="":
// the link text already names the speaker, so the name would be read twice.

export function SpeakerCard({ speaker, priority = false }: SpeakerCardProps) {
  return (
    <a className={styles.card} href={`/speakers/${speaker.slug}`}>
      {speaker.photo ? (
        // Webflow returns no image dimensions (decision 19): width and height
        // give the 4:5 frame, object-fit crops the photo into it.
        // oxlint-disable-next-line nextjs/no-img-element -- next/image cannot optimise in a static export
        <img
          className={styles.photo}
          src={speaker.photo.url}
          srcSet={srcSet(speaker.photo, priority ? undefined : 500)}
          sizes={sizesFor(speaker.photo, SIZES)}
          alt=""
          width={400}
          height={500}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
        />
      ) : (
        <div className={styles.placeholder} />
      )}
      <h2 className={styles.name}>{speaker.name}</h2>
      {speaker.role && <p className={styles.role}>{speaker.role}</p>}
    </a>
  );
}
