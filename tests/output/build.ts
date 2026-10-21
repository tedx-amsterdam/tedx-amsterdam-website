import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

export const OUT_DIR = join(process.cwd(), "out");

export function assertBuildExists(): void {
  if (!existsSync(OUT_DIR)) {
    throw new Error("No build found in out/. Run `npm run build` before `npm run test:output`.");
  }
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

export type HtmlPage = {
  path: string;
  source: string;
  document: Document;
};

export function htmlPages(): HtmlPage[] {
  assertBuildExists();
  return walk(OUT_DIR)
    .filter((file) => file.endsWith(".html"))
    .map((file) => {
      const source = readFileSync(file, "utf8");
      return {
        path: relative(OUT_DIR, file),
        source,
        document: new DOMParser().parseFromString(source, "text/html"),
      };
    });
}

export function outFileExists(path: string): boolean {
  assertBuildExists();
  return existsSync(join(OUT_DIR, path));
}

// A file in the build, or an empty buffer when it is missing, so checks on
// its bytes fail with the path instead of throwing.
export function outFile(path: string): Buffer {
  return outFileExists(path) ? readFileSync(join(OUT_DIR, path)) : Buffer.alloc(0);
}
