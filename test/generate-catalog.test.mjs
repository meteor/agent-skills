import { describe, it, expect, beforeEach } from "@rstest/core";
import { copyFileSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { generateCatalog } from "../scripts/generate-catalog.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = join(here, "fixtures/catalog");

const fixtureBundles = {
  bundles: { essentials: ["meteor-foo"] },
};

beforeEach(() => {
  copyFileSync(
    join(fixtureRoot, "README.input.md"),
    join(fixtureRoot, "README.work.md"),
  );
});

describe("generateCatalog", () => {
  it("rewrites README to match the golden file (--write)", async () => {
    await generateCatalog({
      skillsRoot: join(fixtureRoot, "skills"),
      bundles: fixtureBundles,
      readmePath: join(fixtureRoot, "README.work.md"),
      mode: "write",
      repoSlug: "meteor/agent-skills",
    });
    const got = readFileSync(join(fixtureRoot, "README.work.md"), "utf8");
    const want = readFileSync(join(fixtureRoot, "README.golden.md"), "utf8");
    expect(got).toEqual(want);
  });

  it("returns ok=true when README is already in sync (--check)", async () => {
    copyFileSync(
      join(fixtureRoot, "README.golden.md"),
      join(fixtureRoot, "README.work.md"),
    );
    const result = await generateCatalog({
      skillsRoot: join(fixtureRoot, "skills"),
      bundles: fixtureBundles,
      readmePath: join(fixtureRoot, "README.work.md"),
      mode: "check",
      repoSlug: "meteor/agent-skills",
    });
    expect(result.ok).toBe(true);
    expect(result.drift).toEqual("");
  });

  it("returns ok=false with a drift message when README is stale (--check)", async () => {
    writeFileSync(
      join(fixtureRoot, "README.work.md"),
      "# stale\n<!-- SKILLS:BEGIN -->\n<!-- SKILLS:END -->\n<!-- BUNDLES:BEGIN -->\n<!-- BUNDLES:END -->\n",
      "utf8",
    );
    const result = await generateCatalog({
      skillsRoot: join(fixtureRoot, "skills"),
      bundles: fixtureBundles,
      readmePath: join(fixtureRoot, "README.work.md"),
      mode: "check",
      repoSlug: "meteor/agent-skills",
    });
    expect(result.ok).toBe(false);
    expect(result.drift.length).toBeGreaterThan(0);
  });
});
