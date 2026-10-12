import { z } from "zod";

// Zod schemas for the Webflow Data API v2. Field slugs are Webflow's own
// (see docs/webflow-content-model.md) and must not appear outside this folder.
// Unknown fields are stripped, not rejected: editors may add a field in
// Webflow without breaking the build, while a missing or mistyped field we
// rely on still fails it.

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
