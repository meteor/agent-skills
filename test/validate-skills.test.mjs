import { describe, it, expect, beforeAll } from "@rstest/core";
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateSkills } from "../scripts/validate-skills.mjs";

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
});
