// Takes screenshots of production and of a pull request's preview, compares
// them pixel by pixel and prints a pull request comment that shows before
// and after for every page that changed. CI runs it once the Cloudflare
// preview is up (.github/workflows/screenshots.yml):
//
//   node scripts/screenshots.ts <production url> <preview url> <out dir> <image url base> <path>...
//
// It uses the Chrome installed on the machine (playwright-core downloads no
// browser) and compares the images inside that browser, so it needs no
// image libraries. It reports only and never fails the pull request.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Page } from "playwright-core";

export const MARKER = "<!-- pr-screenshots -->";

export const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

// Share of pixels that may differ before a page counts as changed. Above
// zero, because text and images are rasterised slightly differently between
// two loads.
export const CHANGED_ABOVE = 0.002;

export type Result = { path: string; viewport: string; changed: boolean; ratio: number; before: string; after: string };

export function slugFor(path: string): string {
  const slug = path.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return slug || "home";
}

export function formatComment(results: Result[], imageBase: string): string {
  const changed = results.filter((result) => result.changed);
  const unchanged = results.filter((result) => !result.changed);
  const lines = [MARKER];
  if (changed.length === 0) {
    lines.push("**No visible change** on the pages checked, desktop and mobile, compared with production.");
  } else {
    lines.push(`**${changed.length} visible ${changed.length === 1 ? "change" : "changes"}** compared with production. Production left, this pull request right.`);
    for (const result of changed) {
      lines.push(
        "",
        `#### \`${result.path}\` on ${result.viewport} (${(result.ratio * 100).toFixed(1)}% of pixels)`,
        "",
        "| Production | This pull request |",
        "| --- | --- |",
        `| <img src="${imageBase}/${result.before}" width="380"> | <img src="${imageBase}/${result.after}" width="380"> |`,
      );
    }
  }
  if (unchanged.length > 0 && changed.length > 0) {
    lines.push("", `No visible change: ${unchanged.map((result) => `\`${result.path}\` on ${result.viewport}`).join(", ")}.`);
  }
  lines.push("", "<sub>Updated on every push by `scripts/screenshots.ts`. Full page screenshots; the images are removed when the pull request closes.</sub>");
  return lines.join("\n");
}

async function settle(page: Page): Promise<void> {
  // Scroll through the page so lazy images load, then return to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
}

async function capture(browser: Browser, url: string, viewport: (typeof VIEWPORTS)[number]) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  await page.goto(url, { waitUntil: "load" });
  await settle(page);
  const png = await page.screenshot({ fullPage: true, animations: "disabled" });
  const jpeg = await page.screenshot({ fullPage: true, animations: "disabled", type: "jpeg", quality: 70 });
  await page.close();
  return { png, jpeg };
}

// Compares two PNGs in the browser: the share of pixels that differ, or 1
// when the sizes differ (the layout moved).
async function difference(browser: Browser, a: Buffer, b: Buffer): Promise<number> {
  const page = await browser.newPage();
  const ratio = await page.evaluate(
    async ([first, second]) => {
      const load = (data: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = `data:image/png;base64,${data}`;
        });
      const [x, y] = await Promise.all([load(first), load(second)]);
      if (x.width !== y.width || x.height !== y.height) return 1;
      const pixels = (image: HTMLImageElement) => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, image.width, image.height).data;
      };
      const [p, q] = [pixels(x), pixels(y)];
      let differing = 0;
      for (let i = 0; i < p.length; i += 4) {
        if (Math.abs(p[i]! - q[i]!) + Math.abs(p[i + 1]! - q[i + 1]!) + Math.abs(p[i + 2]! - q[i + 2]!) > 30) differing++;
      }
      return differing / (p.length / 4);
    },
    [a.toString("base64"), b.toString("base64")] as const,
  );
  await page.close();
  return ratio;
}

async function main([production, preview, outDir, imageBase, ...paths]: string[]): Promise<number> {
  if (!production || !preview || !outDir || !imageBase || paths.length === 0) {
    console.error("usage: node scripts/screenshots.ts <production url> <preview url> <out dir> <image url base> <path>...");
    return 2;
  }
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });
  const results: Result[] = [];
  try {
    for (const path of paths) {
      for (const viewport of VIEWPORTS) {
        const before = await capture(browser, production + path, viewport);
        const after = await capture(browser, preview + path, viewport);
        const ratio = await difference(browser, before.png, after.png);
        const name = `${slugFor(path)}-${viewport.name}`;
        writeFileSync(join(outDir, `${name}-before.jpg`), before.jpeg);
        writeFileSync(join(outDir, `${name}-after.jpg`), after.jpeg);
        results.push({ path, viewport: viewport.name, changed: ratio > CHANGED_ABOVE, ratio, before: `${name}-before.jpg`, after: `${name}-after.jpg` });
      }
    }
  } finally {
    await browser.close();
  }
  process.stdout.write(`${formatComment(results, imageBase)}\n`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
