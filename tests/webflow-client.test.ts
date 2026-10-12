import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createWebflowClient } from "@/content/webflow/client";

const TOKEN = "test-token-123";
const itemSchema = z.object({ id: z.string() });

const page = (ids: string[], offset: number, total: number) => ({
  items: ids.map((id) => ({ id })),
  pagination: { limit: 100, offset, total },
});
const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" }, ...init });

function setup(...responses: (Response | Error)[]) {
  const fetch = vi.fn<typeof globalThis.fetch>();
  for (const response of responses) {
    if (response instanceof Error) fetch.mockRejectedValueOnce(response);
    else fetch.mockResolvedValueOnce(response);
  }
  const sleep = vi.fn((_ms: number) => Promise.resolve());
  const client = createWebflowClient({ token: TOKEN, fetch, sleep });
  return { client, fetch, sleep };
}

describe("Webflow client", () => {
  it("reads live items with a read only GET request and the token", async () => {
    const { client, fetch } = setup(json(page(["a", "b"], 0, 2)));
    expect(await client.getLiveItems("col1", itemSchema)).toEqual([{ id: "a" }, { id: "b" }]);
    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://api.webflow.com/v2/collections/col1/items/live?limit=100&offset=0");
    expect(init?.method).toBe("GET");
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("follows pagination until every item is read", async () => {
    const first = Array.from({ length: 100 }, (_, i) => `a${i}`);
    const { client, fetch } = setup(json(page(first, 0, 150)), json(page(["b0", "b1"], 100, 150)), json(page([], 102, 150)));
    const items = await client.getLiveItems("col1", itemSchema);
    expect(items).toHaveLength(102);
    expect(fetch.mock.calls.map(([url]) => String(url).split("?")[1])).toEqual([
      "limit=100&offset=0",
      "limit=100&offset=100",
      "limit=100&offset=102",
    ]);
  });

  it("waits for Retry-After on HTTP 429 and tries again", async () => {
    const { client, sleep } = setup(new Response("", { status: 429, headers: { "Retry-After": "2" } }), json(page(["a"], 0, 1)));
    expect(await client.getLiveItems("col1", itemSchema)).toEqual([{ id: "a" }]);
    expect(sleep).toHaveBeenCalledExactlyOnceWith(2000);
  });

  it("waits 60 seconds when a 429 has no usable Retry-After", async () => {
    const { client, sleep } = setup(
      new Response("", { status: 429 }),
      new Response("", { status: 429, headers: { "Retry-After": "Wed, 21 Oct 2026 07:28:00 GMT" } }),
      json(page(["a"], 0, 1)),
    );
    await client.getLiveItems("col1", itemSchema);
    expect(sleep.mock.calls).toEqual([[60_000], [60_000]]);
  });

  it("waits at most two minutes, whatever Retry-After asks", async () => {
    const { client, sleep } = setup(new Response("", { status: 429, headers: { "Retry-After": "3600" } }), json(page(["a"], 0, 1)));
    await client.getLiveItems("col1", itemSchema);
    expect(sleep).toHaveBeenCalledExactlyOnceWith(120_000);
  });

  it("gives up after three retries", async () => {
    const limited = () => new Response("", { status: 429, headers: { "Retry-After": "1" } });
    const { client, fetch } = setup(limited(), limited(), limited(), limited());
    await expect(client.getLiveItems("col1", itemSchema)).rejects.toThrow(/rate limiting the build after 3 retries/);
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("explains a rejected token without revealing it", async () => {
    const { client } = setup(json({ message: "Request not authorized" }, { status: 401 }));
    const error: unknown = await client.getLiveItems("col1", itemSchema).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect(String(error)).toMatch(/Webflow rejected the token .*HTTP 401.*CMS read/);
    expect(String(error)).not.toContain(TOKEN);
  });

  it("includes the Webflow error message for other failures", async () => {
    const { client } = setup(json({ message: "Collection not found" }, { status: 404 }));
    await expect(client.getLiveItems("nope", itemSchema)).rejects.toThrow(/HTTP 404.*Collection not found/);
  });

  it("fails when Webflow ignores the requested offset", async () => {
    const first = Array.from({ length: 100 }, (_, i) => `a${i}`);
    const { client } = setup(json(page(first, 0, 150)), json(page(first, 0, 150)));
    await expect(client.getLiveItems("col1", itemSchema)).rejects.toThrow(/returned offset 0 .*offset=100/);
  });

  it("reports a network failure", async () => {
    const { client } = setup(new TypeError("fetch failed"));
    await expect(client.getLiveItems("col1", itemSchema)).rejects.toThrow(/Could not reach the Webflow API/);
  });

  it("reports invalid JSON", async () => {
    const { client } = setup(new Response("<html>", { status: 200 }));
    await expect(client.getLiveItems("col1", itemSchema)).rejects.toThrow(/invalid JSON/);
  });

  it("fails with the path of every field that does not match the schema", async () => {
    const { client } = setup(json({ items: [{ id: "a" }, { id: 42 }], pagination: { limit: 100, offset: 0, total: 2 } }));
    await expect(client.getLiveItems("col1", itemSchema)).rejects.toThrow(
      /collection col1 does not match the expected schema[\s\S]*- items\.1\.id: /,
    );
  });

  it("names the broken item by slug, because the index counts from the page start", async () => {
    const body = { items: [{ id: "a" }, { id: 7, fieldData: { slug: "ada-lovelace" } }], pagination: { limit: 100, offset: 0, total: 2 } };
    const { client } = setup(json(body));
    await expect(client.getLiveItems("col1", itemSchema)).rejects.toThrow(/- items\.1\.id \(item ada-lovelace\): /,
    );
  });
});
