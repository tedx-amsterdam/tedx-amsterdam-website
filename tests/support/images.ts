import sharp from "sharp";

// A grey JPEG of the size of the Webflow speaker photos, so the image
// pipeline has something real to decode without reaching the network.
export const PHOTO = await sharp({ create: { width: 1365, height: 2048, channels: 3, background: "#888888" } })
  .jpeg()
  .toBuffer();

// fetch for tests that read from Webflow: the API answers with body(url),
// every other URL (the CDN) with PHOTO.
export function webflowFetch(body: (url: string) => unknown) {
  return async (url: string | URL | Request) => {
    const href = String(url);
    return href.startsWith("https://api.webflow.com/") ? new Response(JSON.stringify(body(href))) : new Response(new Uint8Array(PHOTO));
  };
}
