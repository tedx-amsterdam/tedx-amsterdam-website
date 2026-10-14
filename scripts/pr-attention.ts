// Lists what in a pull request needs a person's judgment rather than a
// check: dependencies, decisions, thresholds, security headers, CI and the
// rules for agents. CI posts the list as one comment on the pull request,
// so the maintainer sees it without reading the whole diff:
//
//   node scripts/pr-attention.ts <base sha> <head sha>
//
// It only reports; the checks that can fail a pull request live in ci.yml.

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const MARKER = "<!-- pr-attention -->";

type Dependencies = Record<string, string>;
type PackageJson = { dependencies?: Dependencies; devDependencies?: Dependencies };
type LighthouseRc = { ci?: { assert?: { assertions?: Record<string, [string, { minScore?: number }?]> } } };
export type ChangedFile = { status: string; path: string };

const major = (version: string) => /\d+/.exec(version)?.[0];

export function dependencyChanges(base: PackageJson, head: PackageJson): string[] {
  const notes: string[] = [];
  for (const field of ["dependencies", "devDependencies"] as const) {
    const before = base[field] ?? {};
    const after = head[field] ?? {};
    const kind = field === "dependencies" ? "dependency" : "dev dependency";
    for (const [name, version] of Object.entries(after)) {
      const old = before[name];
      if (old === undefined) notes.push(`New ${kind} \`${name}\` ${version}: is the reason in the commit message?`);
      else if (major(old) !== major(version)) notes.push(`Major update of \`${name}\`: ${old} → ${version}`);
    }
    for (const name of Object.keys(before)) {
      if (!(name in after)) notes.push(`Removed ${kind} \`${name}\``);
    }
  }
  return notes;
}

export function loweredThresholds(base: LighthouseRc, head: LighthouseRc): string[] {
  const before = base.ci?.assert?.assertions ?? {};
  const after = head.ci?.assert?.assertions ?? {};
  return Object.entries(before).flatMap(([audit, [, options]]) => {
    const old = options?.minScore;
    const now = after[audit]?.[1]?.minScore;
    if (old === undefined) return [];
    if (now === undefined) return [`Lighthouse threshold \`${audit}\` removed (was ${old})`];
    return now < old ? [`Lighthouse threshold \`${audit}\` lowered from ${old} to ${now}: thresholds only go up`] : [];
  });
}

export function decisionChanges(diff: string): string[] {
  return [...diff.matchAll(/^\+## (\d+\. .+)$/gm)].map(([, heading]) => `Decision added or retitled: **${heading}**`);
}

export function fileNotes(files: ChangedFile[]): string[] {
  const notes: string[] = [];
  const paths = files.map((file) => file.path);
  const changed = (test: (path: string) => boolean) => paths.filter(test);
  if (paths.includes("docs/decisions.md")) notes.push("`docs/decisions.md` changed: read the decision, it outlives this pull request");
  if (paths.includes("public/_headers")) notes.push("`public/_headers` changed: security headers, caching or `noindex`");
  if (paths.includes(".env.example")) notes.push("`.env.example` changed: does Cloudflare need a new variable?");
  const workflows = changed((path) => path.startsWith(".github/"));
  if (workflows.length > 0) notes.push(`CI or GitHub settings changed: ${workflows.map((path) => `\`${path}\``).join(", ")}`);
  const rules = changed((path) => path === "AGENTS.md" || path === "CLAUDE.md" || path.startsWith(".claude/"));
  if (rules.length > 0) notes.push(`Rules for coding agents changed: ${rules.map((path) => `\`${path}\``).join(", ")}`);
  // "Now" and the checklists must follow every change (AGENTS.md, "Start here").
  const changesProject = paths.some((path) => !path.startsWith("docs/") && !path.endsWith(".md"));
  if (changesProject && !paths.includes("docs/roadmap.md")) notes.push("`docs/roadmap.md` not updated: does \"Now\", \"Next\" or a checklist change with this pull request?");
  const removedTests = files.filter((file) => file.status.startsWith("D") && file.path.startsWith("tests/"));
  if (removedTests.length > 0) notes.push(`Tests removed: ${removedTests.map((file) => `\`${file.path}\``).join(", ")}`);
  return notes;
}

export function formatComment(notes: string[]): string {
  const body =
    notes.length > 0
      ? ["**Needs your judgment.** The checks cannot assess these:", "", ...notes.map((note) => `- ${note}`)]
      : ["**Nothing beyond what the checks cover.** Open the preview to see the result."];
  return [MARKER, ...body, "", "<sub>Updated on every push by `scripts/pr-attention.ts`.</sub>"].join("\n");
}

const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" });

function fileAt(sha: string, path: string): string | undefined {
  try {
    return git("show", `${sha}:${path}`);
  } catch {
    return undefined; // the file does not exist at that commit
  }
}

const json = <T>(text: string | undefined): T => (text ? (JSON.parse(text) as T) : ({} as T));

function main([base, head]: string[]): number {
  if (!base || !head) {
    console.error("usage: node scripts/pr-attention.ts <base sha> <head sha>");
    return 2;
  }
  const files = git("diff", "--name-status", `${base}...${head}`)
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [status = "", ...rest] = line.split("\t");
      return { status, path: rest.at(-1) ?? "" };
    });
  const paths = files.map((file) => file.path);
  const notes = [
    ...(paths.includes("package.json")
      ? dependencyChanges(json(fileAt(base, "package.json")), json(fileAt(head, "package.json")))
      : []),
    ...(paths.includes("lighthouserc.json")
      ? loweredThresholds(json(fileAt(base, "lighthouserc.json")), json(fileAt(head, "lighthouserc.json")))
      : []),
    ...fileNotes(files),
  ];
  // A named decision says more than the generic note about decisions.md.
  const decisions = paths.includes("docs/decisions.md") ? decisionChanges(git("diff", `${base}...${head}`, "--", "docs/decisions.md")) : [];
  const all = decisions.length > 0 ? [...decisions, ...notes.filter((note) => !note.startsWith("`docs/decisions.md`"))] : notes;
  process.stdout.write(`${formatComment(all)}\n`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
