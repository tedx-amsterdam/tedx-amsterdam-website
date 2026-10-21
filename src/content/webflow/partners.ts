import type { Partner } from "@/content/types";
import { text } from "./fields";
import { PARTNER_STATUS_OPTIONS, type WebflowPartnerItem } from "./schemas";

export const PARTNERS_COLLECTION_ID = "68ee2b4f5c07668c00af87d7";

// Maps one live Webflow partner to the domain type. The quirks handled here
// are listed in docs/webflow-content-model.md under Partners.
export function mapPartner({ fieldData: fields }: WebflowPartnerItem): Partner {
  // Kept as entered: slips such as a trailing comma are fixed in Webflow.
  const name = fields.name.trim();
  const image = fields.image;
  return {
    slug: fields.slug,
    name,
    status: PARTNER_STATUS_OPTIONS[fields["partner-status"]],
    description: text(fields.description),
    url: fields.website ?? undefined,
    logo: image ? { url: image.url, alt: text(image.alt) ?? `${name} logo` } : undefined,
    order: fields.order ?? undefined,
  };
}
