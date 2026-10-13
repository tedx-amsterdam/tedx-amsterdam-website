// Checks commit messages and branch names against "Git Workflow" in
// AGENTS.md. CI runs it on every pull request:
//
//   node scripts/git-workflow.ts <base sha> <head sha> <branch>
//
// Written without dependencies: commitlint would add two packages for the
// handful of rules below, and its defaults differ from ours (decision 25).

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TYPES = ["feat", "fix", "perf", "refactor", "style", "test", "docs", "build", "ci", "chore", "revert"];
const HEADER = new RegExp(`^(${TYPES.join("|")})(\\([a-z0-9-]+\\))?!?: (.+)$`);
const BRANCH = /^(feature|bugfix|hotfix|chore)\/[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_HEADER = 72;

export function checkCommitMessage(message: string): string[] {
  const [header = "", second] = message.split("\n");
  if (/^(fixup|squash|amend)! /.test(header)) return ["squash fixups before review: git rebase -i --autosquash main"];
  const match = HEADER.exec(header);
  if (!match) return [`start with "type(scope): subject", where type is one of ${TYPES.join(", ")}`];
  const problems: string[] = [];
  const subject = match[3]!;
  if (/^[A-Z]/.test(subject)) problems.push("start the subject in lowercase");
  if (subject.endsWith(".")) problems.push("end the subject without a period");
  if (header.length > MAX_HEADER) problems.push(`keep the first line within ${MAX_HEADER} characters (now ${header.length})`);
  if (second !== undefined && second.trim() !== "") problems.push("leave a blank line after the first line");
  return problems;
}

export function checkBranchName(branch: string): string[] {
  return BRANCH.test(branch)
    ? []
    : ["name the branch <type>/<description>: feature/, bugfix/, hotfix/ or chore/, then lowercase words joined by hyphens"];
}

function commits(base: string, head: string): { sha: string; message: string }[] {
  const log = execFileSync("git", ["log", "--format=%H%x1f%B%x00", `${base}..${head}`], { encoding: "utf8" });
  return log
    .split("\0")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [sha = "", message = ""] = entry.split("\x1f");
      return { sha, message: message.trim() };
    });
}

function main([base, head, branch]: string[]): number {
  if (!base || !head || !branch) {
    console.error("usage: node scripts/git-workflow.ts <base sha> <head sha> <branch>");
    return 2;
  }
  const failures = [
    ...checkBranchName(branch).map((problem) => `branch ${branch}: ${problem}`),
    ...commits(base, head).flatMap(({ sha, message }) =>
      checkCommitMessage(message).map((problem) => `${sha.slice(0, 7)} ${message.split("\n")[0]}\n  ${problem}`),
    ),
  ];
  for (const failure of failures) console.error(failure);
  if (failures.length > 0) console.error('\nSee "Git Workflow" in AGENTS.md.');
  return failures.length > 0 ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
