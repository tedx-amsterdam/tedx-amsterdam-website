import { readFileSync } from "node:fs";
import { join } from "node:path";

export type HeaderRule = {
  pattern: string;
  headers: Map<string, string>;
};

// Parses Cloudflare Pages' _headers format: an unindented URL pattern,
// followed by indented `Name: value` lines. Lines starting with # are
// comments.
export function parseHeaders(source: string): HeaderRule[] {
  const rules: HeaderRule[] = [];
  for (const line of source.split("\n")) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      rules.push({ pattern: line.trim(), headers: new Map() });
      continue;
    }
    const rule = rules.at(-1);
    const separator = line.indexOf(":");
    if (!rule || separator === -1) throw new Error(`Invalid _headers line: ${line}`);
    rule.headers.set(line.slice(0, separator).trim().toLowerCase(), line.slice(separator + 1).trim());
  }
  return rules;
}

export function loadHeaders(): HeaderRule[] {
  return parseHeaders(readFileSync(join(process.cwd(), "public", "_headers"), "utf8"));
}

export function headersFor(rules: HeaderRule[], pattern: string): Map<string, string> {
  const rule = rules.find((candidate) => candidate.pattern === pattern);
  if (!rule) throw new Error(`No _headers rule for ${pattern}`);
  return rule.headers;
}
