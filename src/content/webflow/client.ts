import type { z } from "zod";
import { itemsPageSchema } from "./schemas";

// Read only client for the Webflow Data API v2. It only sends GET requests:
// the live site still runs on Webflow, and this project never writes to it.

const API_BASE = "https://api.webflow.com/v2";
// The maximum Webflow allows per request.
const PAGE_SIZE = 100;
const MAX_RETRIES = 3;
// Used when a 429 response has no usable Retry-After header. The Premium
// plan allows 120 requests per minute, so a minute always clears the limit.
const DEFAULT_RETRY_AFTER_SECONDS = 60;
// A longer wait would make the build look frozen; waiting less only risks
// another 429, which counts as a retry.
const MAX_RETRY_AFTER_SECONDS = 120;
// Without a timeout a connection that never answers hangs the build
// until CI kills it, with no error to read.
const REQUEST_TIMEOUT_MS = 30_000;

export type WebflowClient = {
  // Every published item of a collection, each parsed with itemSchema.
  getLiveItems<Item extends z.ZodType>(collectionId: string, itemSchema: Item): Promise<z.infer<Item>[]>;
};

export type WebflowClientOptions = {
  token: string;
  // Injectable so tests run without network access or real waiting.
  fetch?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
};

export function createWebflowClient({
  token,
  fetch: fetchImpl = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}: WebflowClientOptions): WebflowClient {
  async function getJson(path: string): Promise<unknown> {
    const url = `${API_BASE}${path}`;
    for (let attempt = 0; ; attempt++) {
      let response: Response;
      try {
        response = await fetchImpl(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
      } catch (error) {
        throw new Error(`Could not reach the Webflow API (GET ${path}).`, { cause: error });
      }

      if (response.status === 429 && attempt < MAX_RETRIES) {
        await sleep(retryAfterSeconds(response.headers.get("Retry-After")) * 1000);
        continue;
      }
      if (!response.ok) throw await responseError(response, path);

      try {
        return await response.json();
      } catch (error) {
        throw new Error(`The Webflow API returned invalid JSON (GET ${path}).`, { cause: error });
      }
    }
  }

  return {
    async getLiveItems(collectionId, itemSchema) {
      const pageSchema = itemsPageSchema(itemSchema);
      const items: z.infer<typeof itemSchema>[] = [];
      let offset = 0;
      for (;;) {
        const path = `/collections/${collectionId}/items/live?limit=${PAGE_SIZE}&offset=${offset}`;
        const raw = await getJson(path);
        const result = pageSchema.safeParse(raw);
        if (!result.success) {
          const problems = result.error.issues.map(
            (issue) => `- ${issue.path.join(".") || "response"}${describeItem(raw, issue.path)}: ${issue.message}`,
          );
          throw new Error(
            [
              `The Webflow response for collection ${collectionId} does not match the expected schema (GET ${path}):`,
              ...problems,
              "Check the collection fields in Webflow against docs/webflow-content-model.md.",
            ].join("\n"),
          );
        }
        const page = result.data;
        if (page.pagination.offset !== offset) {
          throw new Error(`Webflow returned offset ${page.pagination.offset} for GET ${path}, so its pages cannot be trusted.`);
        }
        items.push(...page.items);
        offset += page.items.length;
        // An empty page ends the loop even if total is off, so a wrong
        // total can never make the build loop forever.
        if (page.items.length === 0 || offset >= page.pagination.total) return items;
      }
    },
  };
}

function retryAfterSeconds(header: string | null): number {
  // Webflow sends seconds. An HTTP date or anything else falls back to the default.
  const seconds = Number(header);
  return header !== null && header.trim() !== "" && Number.isFinite(seconds) && seconds >= 0
    ? Math.min(seconds, MAX_RETRY_AFTER_SECONDS)
    : DEFAULT_RETRY_AFTER_SECONDS;
}

// Names the item behind a schema problem by its slug or id, because the
// index in the path counts from the start of the page, not the collection.
function describeItem(raw: unknown, path: readonly PropertyKey[]): string {
  const [key, index] = path;
  if (key !== "items" || typeof index !== "number") return "";
  const item: unknown = (raw as { items?: unknown[] }).items?.[index];
  if (typeof item !== "object" || item === null) return "";
  const { id, fieldData } = item as { id?: unknown; fieldData?: { slug?: unknown } };
  const name = typeof fieldData?.slug === "string" ? fieldData.slug : typeof id === "string" ? id : undefined;
  return name ? ` (item ${name})` : "";
}

async function responseError(response: Response, path: string): Promise<Error> {
  const request = `GET ${path} returned HTTP ${response.status}`;
  if (response.status === 401 || response.status === 403) {
    return new Error(
      `Webflow rejected the token (${request}). WEBFLOW_API_TOKEN must be a site token for the TEDxAmsterdam site with CMS read permission.`,
    );
  }
  if (response.status === 429) {
    return new Error(`Webflow kept rate limiting the build after ${MAX_RETRIES} retries (${request}). Try again in a few minutes.`);
  }
  // Webflow error bodies explain the problem (for example an unknown
  // collection ID) and never contain the token.
  const body = (await response.text().catch(() => "")).slice(0, 500);
  return new Error(`The Webflow API request failed (${request})${body ? `: ${body}` : "."}`);
}
