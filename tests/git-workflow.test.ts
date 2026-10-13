import { describe, expect, it } from "vitest";
import { checkBranchName, checkCommitMessage } from "../scripts/git-workflow";

describe("checkCommitMessage", () => {
  it.each([
    "feat(speakers): add speaker detail page",
    "docs: explain fixture mode\n\nBody explaining why.",
    "feat(content)!: rename the speaker type",
    "revert: feat(speakers): add speaker detail page",
    "docs(spec): update The Website Specification checklist\n\nWeekly snapshot.",
  ])("accepts %j", (message) => {
    expect(checkCommitMessage(message)).toEqual([]);
  });

  it.each([
    ["Add speaker page", /type\(scope\): subject/],
    ["feature(speakers): add page", /type\(scope\): subject/],
    ["feat(Speakers): add page", /type\(scope\): subject/],
    ["Merge branch 'main' into feature/x", /type\(scope\): subject/],
    ["feat: Add page", /lowercase/],
    ["feat: add page.", /period/],
    [`docs: ${"a".repeat(70)}`, /72 characters \(now 76\)/],
    ["docs: explain\nno blank line", /blank line/],
    ["fixup! feat: add page", /autosquash/],
  ])("rejects %j", (message, problem) => {
    expect(checkCommitMessage(message)).toEqual([expect.stringMatching(problem)]);
  });
});

describe("checkBranchName", () => {
  it.each(["feature/speaker-pages", "feature/12-speaker-pages", "chore/spec-checklist-update", "hotfix/x"])(
    "accepts %s",
    (branch) => {
      expect(checkBranchName(branch)).toEqual([]);
    },
  );

  it.each(["main", "feat/speaker-pages", "feature/Speaker-Pages", "feature/speaker_pages", "release/1.0", "chore/a--b"])(
    "rejects %s",
    (branch) => {
      expect(checkBranchName(branch)).toHaveLength(1);
    },
  );
});
