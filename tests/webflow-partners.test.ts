import { describe, expect, it, vi } from "vitest";
import { createWebflowClient } from "@/content/webflow/client";
import { mapPartner, PARTNERS_COLLECTION_ID } from "@/content/webflow/partners";
import { itemsPageSchema, partnerItemSchema, type WebflowPartnerItem } from "@/content/webflow/schemas";
import broken from "./fixtures/webflow/partners-broken.json";
import live from "./fixtures/webflow/partners-live.json";

const liveItems = itemsPageSchema(partnerItemSchema).parse(live).items;
const raw = (slug: string) => live.items.find((item) => item.fieldData.slug === slug)!.fieldData;
const mapped = (slug: string) => mapPartner(liveItems.find((item) => item.fieldData.slug === slug)!);

const item = (fieldData: Partial<WebflowPartnerItem["fieldData"]>): WebflowPartnerItem => ({
  id: "1",
  fieldData: { name: "Zoku", slug: "zoku", "partner-status": "ae25899025683fce5ec6cef47b02f470", ...fieldData },
});

describe("Webflow partners on the recorded response", () => {
  it("parses and maps every published partner", () => {
    expect(liveItems).toHaveLength(live.items.length);
    for (const partner of liveItems.map(mapPartner)) {
      expect(partner.name).toBe(partner.name.trim());
      if (partner.logo) expect(partner.logo.alt.trim()).not.toBe("");
    }
  });

  it("maps every field of a current partner", () => {
    const fields = raw("zoku");
    expect(mapped("zoku")).toEqual({
      slug: "zoku",
      name: "Zoku",
      status: "current",
      description: fields.description!.trim(),
      url: fields.website,
      logo: { url: fields.image!.url, alt: fields.image!.alt },
      order: fields.order,
    });
  });

  it("maps the status option ids to current and past", () => {
    const statuses = liveItems.map(mapPartner).map((partner) => partner.status);
    expect(new Set(statuses)).toEqual(new Set(["current", "past"]));
    expect(mapped("zoku").status).toBe("current");
    expect(mapped("busy-studio").status).toBe("past");
  });

  it("falls back to '{name} logo' when the logo has no alt text", () => {
    expect(live.items.find((i) => i.fieldData.slug === "youplant")!.fieldData.image!.alt).toBeNull();
    expect(mapped("youplant").logo?.alt).toBe("Youplant logo");
    expect(mapped("zoku").logo?.alt).toBe("Zoku logo");
  });

  it("leaves out the website and order of past partners that have none", () => {
    expect(mapped("busy-studio")).toMatchObject({ url: undefined, order: undefined });
  });

  it("keeps names as entered, editing slips included", () => {
    expect(mapped("holies-pizza").name).toBe("Holie’s pizza,");
    expect(mapped("jeroen-van-der-most").name).toBe("Jeroen van der MOST");
  });

  it("fails with a readable error that names the partner with an unknown status", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(JSON.stringify(broken)));
    const client = createWebflowClient({ token: "t", fetch });
    await expect(client.getLiveItems(PARTNERS_COLLECTION_ID, partnerItemSchema)).rejects.toThrow(
      new RegExp(`- items\\.1\\.fieldData\\.partner-status \\(item ${broken.items[1]!.fieldData.slug}\\): must be the option id of Current or Past`),
    );
  });
});

describe("mapPartner", () => {
  it("maps a partner with only the required fields", () => {
    expect(mapPartner(item({}))).toEqual({
      slug: "zoku",
      name: "Zoku",
      status: "current",
      description: undefined,
      url: undefined,
      logo: undefined,
      order: undefined,
    });
  });

  it("trims the name and description and drops a blank description", () => {
    expect(mapPartner(item({ name: " Zoku ", description: " Hotel " }))).toMatchObject({ name: "Zoku", description: "Hotel" });
    expect(mapPartner(item({ description: "  " })).description).toBeUndefined();
  });

  it("treats a cleared website as no website", () => {
    const parsed = partnerItemSchema.parse(item({ website: " " }));
    expect(mapPartner(parsed).url).toBeUndefined();
  });

  it("rejects a website that is not http or https, as it becomes a link", () => {
    expect(partnerItemSchema.safeParse(item({ website: "javascript:alert(1)" })).success).toBe(false);
  });

  it("requires a status", () => {
    const { "partner-status": _, ...withoutStatus } = item({}).fieldData;
    expect(partnerItemSchema.safeParse({ id: "1", fieldData: withoutStatus }).success).toBe(false);
  });
});
