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

// Trimmed like every text field; Webflow sends an empty string for a
// cleared link.
const optionalLink = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() || null : value),
  z.url({ protocol: /^https?$/ }).nullish(),
);

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

// Upcoming events collection (68763edeb9e4be2376b75976). The plain text
// `date` field duplicates event-date in free text and is left out.
export const eventItemSchema = z.object({
  id: z.string(),
  fieldData: z.object({
    name: z.string().trim().min(1),
    slug,
    // Required: without it an event cannot be sorted or placed as upcoming
    // or past, so a missing date fails the build and names the event.
    "event-date": z.iso.datetime({ offset: true }),
    // The typo is Webflow's own field slug.
    descpiption: optionalText,
    location: optionalText,
    link: optionalLink,
    tag: optionalText,
    image: image.nullish(),
  }),
});

export type WebflowEventItem = z.infer<typeof eventItemSchema>;

// Partners collection (68ee2b4f5c07668c00af87d7). Webflow sends an Option
// field as the id of the chosen option; the ids and their names come from
// GET /v2/collections/{id}.
const partnerStatus = z.enum(["ae25899025683fce5ec6cef47b02f470", "1dfa59a092239bd83aaecdcf410892ff"], {
  error: "must be the option id of Current or Past (see docs/webflow-content-model.md)",
});

export const PARTNER_STATUS_OPTIONS: Record<z.infer<typeof partnerStatus>, "current" | "past"> = {
  ae25899025683fce5ec6cef47b02f470: "current",
  "1dfa59a092239bd83aaecdcf410892ff": "past",
};

export const partnerItemSchema = z.object({
  id: z.string(),
  fieldData: z.object({
    name: z.string().trim().min(1),
    slug,
    // Required, although Webflow allows it empty: without it a partner
    // cannot be placed as current or past. A new option in Webflow fails
    // the build too, until it is added above.
    "partner-status": partnerStatus,
    description: optionalText,
    website: optionalLink,
    image: image.nullish(),
    order: z.number().nullish(),
  }),
});

export type WebflowPartnerItem = z.infer<typeof partnerItemSchema>;

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
