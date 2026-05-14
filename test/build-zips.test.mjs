import { describe, it, expect, beforeEach, afterEach } from "@rstest/core";
import { mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import yauzl from "yauzl-promise";
import { buildZips } from "../scripts/build-zips.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixturesRoot = join(here, "fixtures/skills-for-zip");

let outDir;

beforeEach(() => {
  outDir = mkdtempSync(join(tmpdir(), "skills-zip-"));
});

afterEach(() => {
  rmSync(outDir, { recursive: true, force: true });
});

async function entryNames(zipPath) {
  const zip = await yauzl.open(zipPath);
  const names = [];
  for await (const entry of zip) {
    names.push(entry.filename);
  }
  await zip.close();
  return names;
}

describe("buildZips", () => {
  it("builds one zip per non-underscore folder", async () => {
    await buildZips({ root: fixturesRoot, out: outDir });
    const files = readdirSync(outDir).sort();
    expect(files).toEqual(["meteor-foo.zip"]);
  });

  it("skips _template", async () => {
    await buildZips({ root: fixturesRoot, out: outDir });
    expect(readdirSync(outDir)).not.toContain("_template.zip");
  });

  it("packages SKILL.md at the zip top level", async () => {
    await buildZips({ root: fixturesRoot, out: outDir });
    const names = await entryNames(join(outDir, "meteor-foo.zip"));
    expect(names).toContain("SKILL.md");
    expect(names).toContain("references/note.md");
  });
});
