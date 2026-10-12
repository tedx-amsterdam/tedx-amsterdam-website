import type { Speaker } from "@/content/types";
import { sanitizeHtml, type SafeHtml } from "@/lib/sanitize-html";
import type { WebflowSpeakerItem } from "./schemas";

export const SPEAKERS_COLLECTION_ID = "6874c72605e8d57abb48e751";

// Maps one live Webflow speaker to the domain type. The quirks handled here
// are listed in docs/webflow-content-model.md under Speakers.
// show-hide-speaker is ignored on purpose: editors do not set it
// consistently, and only published items reach this function anyway.
export function mapSpeaker({ fieldData: fields }: WebflowSpeakerItem): Speaker {
  // 2026 items hold the speaker name in `name` and leave `name-of-speaker`
  // empty. 2025 items hold the session title in `name` and the speaker
  // name in `name-of-speaker`.
  const title = fields.name.trim();
  const speakerName = text(fields["name-of-speaker"]);
  const name = speakerName ?? title;
  const photo = fields.photo;

  return {
    slug: fields.slug,
    name,
    sessionTitle: speakerName && speakerName !== title ? title : undefined,
    role: text(fields.occupation),
    tedxRole: text(fields["role-for-tedx"]),
    pronouns: text(fields.pronounce),
    sessionBlurb: richText(fields["session-blurb-2"]),
    bio: richText(fields["speaker-bio-2"]),
    // Webflow alt text is null on every current photo; the name describes a portrait.
    photo: photo ? { url: photo.url, alt: text(photo.alt) ?? name } : undefined,
    order: fields.order ?? undefined,
  };
}

function text(value: string | null | undefined): string | undefined {
  return value?.trim() || undefined;
}

function richText(value: string | null | undefined): SafeHtml | undefined {
  // sanitizeHtml drops empty paragraphs, including <p>&zwj;</p>, so rich
  // text that held only those becomes undefined instead of an empty string.
  return value ? sanitizeHtml(value) || undefined : undefined;
}
