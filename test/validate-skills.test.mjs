import { describe, it, expect, beforeAll } from "@rstest/core";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  inspectPublishedContent,
  validateAuditReports,
  validateMaintainerSkills,
  validateSkills,
} from "../scripts/validate-skills.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, "fixtures");

beforeAll(() => {
  // Hydrate the oversize-body fixture to 9 KB.
  const target = join(fixturesDir, "invalid/oversize-body/SKILL.md");
  const original = readFileSync(target, "utf8");
  const padded = original.replace(
    "<!-- Test runner writes 9000 bytes of body here at fixture-load time -->",
    "x".repeat(9000),
  );
  writeFileSync(target + ".hydrated", padded, "utf8");
});

describe("validateSkills", () => {
  it("accepts a valid fixture", async () => {
    const findings = await validateSkills({
      root: join(fixturesDir, "valid"),
    });
    expect(findings).toEqual([]);
  });

  it("accepts bundle metadata that matches bundles.json", async () => {
    const findings = await validateSkills({
      root: join(fixturesDir, "valid"),
      bundles: { bundles: { essentials: ["good-skill"] } },
    });
    expect(findings).toEqual([]);
  });

  it("rejects an unknown catalog area", async () => {
    await withTempRoot(async (root) => {
      const skillDir = join(root, "meteor-example");
      mkdirSync(join(skillDir, "references"), { recursive: true });
      writeFileSync(
        join(skillDir, "SKILL.md"),
        `---
name: meteor-example
description: Use when testing catalog classification. Triggers on an unknown skill area.
metadata:
  author: meteor
  version: "0.1.0"
  kind: knowledge
  meteor: ">=3.0"
  area: unknown
  tagline: "Test rejection of an unknown catalog area."
---

# Example
`,
      );
      writeFileSync(join(skillDir, "references", "eval-cases.md"), "# Cases\n");
      const findings = await validateSkills({
        root: skillDir,
        singleSkill: true,
      });
      expect(findings.map((finding) => finding.code)).toContain("E_SCHEMA");
    });
  });

  it("rejects missing name with E_SCHEMA", async () => {
    const findings = await validateSkills({
      root: join(fixturesDir, "invalid/missing-name"),
      singleSkill: true,
    });
    expect(findings.map((f) => f.code)).toContain("E_SCHEMA");
  });

  it("rejects folder/name mismatch with E_FOLDER_MISMATCH", async () => {
    const findings = await validateSkills({
      root: join(fixturesDir, "invalid/bad-folder-name"),
      singleSkill: true,
    });
    expect(findings.map((f) => f.code)).toContain("E_FOLDER_MISMATCH");
  });

  it("rejects single-trigger description with E_TRIGGER_PHRASES", async () => {
    const findings = await validateSkills({
      root: join(fixturesDir, "invalid/one-trigger"),
      singleSkill: true,
    });
    expect(findings.map((f) => f.code)).toContain("E_TRIGGER_PHRASES");
  });

  it("rejects oversize body with E_BODY_TOO_LARGE", async () => {
    const findings = await validateSkills({
      root: join(fixturesDir, "invalid/oversize-body"),
      singleSkill: true,
      skillFileName: "SKILL.md.hydrated",
    });
    expect(findings.map((f) => f.code)).toContain("E_BODY_TOO_LARGE");
  });

  it("rejects a published skill without evaluation cases", async () => {
    const findings = await validateSkills({
      root: join(fixturesDir, "invalid/missing-eval-cases"),
      singleSkill: true,
    });
    expect(findings.map((f) => f.code)).toContain("E_MISSING_EVAL_CASES");
  });

  it("rejects unexpected top-level entries in a published skill", async () => {
    await withTempRoot(async (root) => {
      const skillDir = join(root, "meteor-example");
      mkdirSync(join(skillDir, "references"), { recursive: true });
      writeFileSync(
        join(skillDir, "SKILL.md"),
        `---
name: meteor-example
description: Use when testing a valid Meteor example skill. Triggers on example validation.
metadata:
  author: meteor
  version: "0.1.0"
  kind: knowledge
  meteor: ">=3.0"
  area: testing
  tagline: "Validate an example Meteor skill fixture."
---

# Example
`,
      );
      writeFileSync(join(skillDir, "references", "eval-cases.md"), "# Cases\n");
      writeFileSync(join(skillDir, "audit-report.md"), "# Audit report\n");
      const findings = await validateSkills({
        root: skillDir,
        singleSkill: true,
      });
      expect(findings.map((f) => f.code)).toContain(
        "E_UNEXPECTED_SKILL_ENTRY",
      );
    });
  });

  it("rejects bundle metadata that differs from bundles.json", async () => {
    const findings = await validateSkills({
      root: join(fixturesDir, "valid"),
      bundles: { bundles: { fullstack: ["good-skill"] } },
    });
    expect(findings.map((f) => f.code)).toContain("E_BUNDLE_MISMATCH");
  });

  it("rejects unknown skills in bundles.json", async () => {
    const findings = await validateSkills({
      root: join(fixturesDir, "valid"),
      bundles: {
        bundles: { essentials: ["good-skill", "unknown-skill"] },
      },
    });
    expect(findings.map((f) => f.code)).toContain("E_BUNDLE_UNKNOWN_SKILL");
  });

  it("rejects tracked ZIP artifacts", async () => {
    const findings = await validateSkills({
      root: join(fixturesDir, "valid"),
      trackedFiles: ["skills/good-skill.zip"],
    });
    expect(findings.map((f) => f.code)).toContain("E_TRACKED_ZIP");
  });

  it("detects placeholders and prohibited em-dash characters", () => {
    const text = `TODO${String.fromCodePoint(0x2014)}replace this`;
    const codes = inspectPublishedContent(text).map((f) => f.code);
    expect(codes).toContain("E_PLACEHOLDER");
    expect(codes).toContain("E_PROHIBITED_EM_DASH");
  });
});

async function withTempRoot(run) {
  const root = mkdtempSync(join(tmpdir(), "maintainer-skills-"));
  try {
    return await run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function writeMaintainerSkill(root, folder, frontmatter, body = "# Test skill") {
  const dir = join(root, folder);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "SKILL.md"), `---\n${frontmatter}\n---\n\n${body}\n`);
}

describe("validateMaintainerSkills", () => {
  it("accepts a valid internal maintainer skill", async () => {
    await withTempRoot(async (root) => {
      writeMaintainerSkill(
        root,
        "skill-review",
        "name: skill-review\ndescription: Use when reviewing internal skills for repository consistency.",
      );
      expect(await validateMaintainerSkills({ root })).toEqual([]);
    });
  });

  it("rejects a maintainer folder and name mismatch", async () => {
    await withTempRoot(async (root) => {
      writeMaintainerSkill(
        root,
        "skill-review",
        "name: different-name\ndescription: Use when reviewing internal skills for repository consistency.",
      );
      const findings = await validateMaintainerSkills({ root });
      expect(findings.map((f) => f.code)).toContain("E_FOLDER_MISMATCH");
    });
  });

  it("rejects invalid maintainer descriptions", async () => {
    await withTempRoot(async (root) => {
      writeMaintainerSkill(
        root,
        "skill-review",
        "name: skill-review\ndescription: Reviews skills without a routing trigger.",
      );
      const findings = await validateMaintainerSkills({ root });
      expect(findings.map((f) => f.code)).toContain(
        "E_MAINTAINER_DESCRIPTION",
      );
    });
  });

  it("checks maintainer Markdown content", async () => {
    await withTempRoot(async (root) => {
      writeMaintainerSkill(
        root,
        "skill-review",
        "name: skill-review\ndescription: Use when reviewing internal skills for repository consistency.",
        `TODO${String.fromCodePoint(0x2014)}replace this`,
      );
      const findings = await validateMaintainerSkills({ root });
      const codes = findings.map((f) => f.code);
      expect(codes).toContain("E_PLACEHOLDER");
      expect(codes).toContain("E_PROHIBITED_EM_DASH");
    });
  });
});

const validAuditReport = `# Meteor skill gap audit

Agent-skills revision: abc123
Meteor remote: https://github.com/meteor/meteor.git
Meteor revision: def456
Meteor release context: 3.x
Audit mode: full
Previous audit report: none

## Source coverage

Current documentation and source.

## Skill claim matrix

No claims in this fixture.

## Maintenance handoff

No implementation authorized.
`;

describe("validateAuditReports", () => {
  it("accepts a reproducible audit report", async () => {
    await withTempRoot(async (root) => {
      writeFileSync(join(root, "2026-08-20-meteor-3.md"), validAuditReport);
      expect(await validateAuditReports({ root })).toEqual([]);
    });
  });

  it("rejects an audit report without baseline context", async () => {
    await withTempRoot(async (root) => {
      writeFileSync(join(root, "2026-08-20-meteor-3.md"), "# Incomplete audit\n");
      const findings = await validateAuditReports({ root });
      expect(findings.map((f) => f.code)).toContain("E_AUDIT_REPORT_FORMAT");
    });
  });
});
