import type { Speaker } from "@/content";
import { sizesFor, srcSet } from "./src-set";
import styles from "./SpeakerCard.module.css";

type SpeakerCardProps = {
  speaker: Speaker;
  // Cards in the first row are visible on load; loading them lazily would
  // delay the largest contentful paint.
  eager?: boolean;
};

// Overview card that links to the speaker page. The portrait has alt="":
// the link text already names the speaker, so the name would be read twice.
export function SpeakerCard({ speaker, eager = false }: SpeakerCardProps) {
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
          loading={eager ? "eager" : "lazy"}
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
