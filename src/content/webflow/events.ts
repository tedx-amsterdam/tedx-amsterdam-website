import type { TedxEvent } from "@/content/types";
import { text } from "./fields";
import type { WebflowEventItem } from "./schemas";

export const EVENTS_COLLECTION_ID = "68763edeb9e4be2376b75976";

// Maps one live Webflow event to the domain type. The quirks handled here
// are listed in docs/webflow-content-model.md under Upcoming events.
// show-hide is ignored, like show-hide-speaker: publishing decides.
export function mapEvent({ fieldData: fields }: WebflowEventItem): TedxEvent {
  const title = fields.name.trim();
  const image = fields.image;
  return {
    slug: fields.slug,
    title,
    startsAt: new Date(fields["event-date"]).toISOString(),
    location: text(fields.location),
    description: text(fields.descpiption),
    url: fields.link ?? undefined,
    tag: text(fields.tag),
    image: image ? { url: image.url, alt: text(image.alt) ?? title } : undefined,
  };
}
