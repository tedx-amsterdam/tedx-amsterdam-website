import type { Speaker } from "@/content";
import { sizesFor, srcSet } from "./src-set";
import styles from "./SpeakerCard.module.css";

type SpeakerCardProps = {
  speaker: Speaker;
  // The first photo is the largest contentful paint, and on a phone the only
  // one in view. It loads eagerly with high priority; all others load
  // lazily, so they do not compete with it for bandwidth. On wider screens
  // the rest of the first row is in view and loads right after layout.
  priority?: boolean;
};

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
          srcSet={srcSet(speaker.photo)}
          // One column on phones, two on tablets, four in the 1400px frame.
          sizes={sizesFor(speaker.photo, "(max-width: 479px) 100vw, (max-width: 1023px) 50vw, 340px")}
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
