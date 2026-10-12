import { z } from "zod";

// Zod schemas for the Webflow Data API v2. Field slugs are Webflow's own
// (see docs/webflow-content-model.md) and must not appear outside this folder.
// Unknown fields are stripped, not rejected: editors may add a field in
// Webflow without breaking the build, while a missing or mistyped field we
// rely on still fails it.

// Webflow sends null for an empty field, and leaves out fields that were
// never filled in on older items.
const optionalText = z.string().nullish();

const image = z.object({
  // https only: the URL ends up in <img src>, and http would be mixed content.
  url: z.url({ protocol: /^https$/ }),
  alt: z.string().nullish(),
});

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase URL segment");

// Speakers collection (6874c72605e8d57abb48e751).
export const speakerItemSchema = z.object({
  id: z.string(),
  fieldData: z.object({
    name: z.string().trim().min(1),
    slug,
    "name-of-speaker": optionalText,
    occupation: optionalText,
    "role-for-tedx": optionalText,
    "session-blurb-2": optionalText,
    "speaker-bio-2": optionalText,
    photo: image.nullish(),
    pronounce: optionalText,
    order: z.number().nullish(),
  }),
});

export type WebflowSpeakerItem = z.infer<typeof speakerItemSchema>;

// One page of GET /v2/collections/{id}/items/live.
export function itemsPageSchema<Item extends z.ZodType>(item: Item) {
  return z.object({
    items: z.array(item),
    pagination: z.object({
      limit: z.number().int().nonnegative(),
      offset: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
    }),
  });
}
