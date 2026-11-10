import { afterEach, beforeEach, describe, expect, it } from "@rstest/core";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import yauzl from "yauzl-promise";
import { buildPlugin } from "../scripts/build-plugin.mjs";

let root;
function write(name, text = name) {
  mkdirSync(dirname(join(root, name)), { recursive: true });
  writeFileSync(join(root, name), text);
}
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "meteor-plugin-zip-"));
  for (const name of [".agents/plugins/marketplace.json", ".claude-plugin/marketplace.json",
    ".claude-plugin/plugin.json", ".codex-plugin/plugin.json", "assets/meteor-icon.png", "LICENSE",
    "skills/meteor-example/SKILL.md", "skills/meteor-example/references/guide.md"]) write(name);
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("complete plugin ZIP", () => {
  it("preserves runtime files and excludes repository evidence and nested skill ZIPs", async () => {
    for (const name of ["audits/report.md", ".github/skills/internal/SKILL.md", "node_modules/tool.js",
      "skills/_internal/SKILL.md", "skills/meteor-example.zip", "assets/README.md"]) write(name);
    const { out } = await buildPlugin({ root });
    const zip = await yauzl.open(out);
    const names = [];
    for await (const entry of zip) {
      names.push(entry.filename);
      const chunks = [];
      for await (const chunk of await entry.openReadStream()) chunks.push(chunk);
      expect(Buffer.concat(chunks)).toEqual(readFileSync(join(root, entry.filename)));
    }
    await zip.close();
    expect(names).toEqual([
      ".agents/plugins/marketplace.json", ".claude-plugin/marketplace.json", ".claude-plugin/plugin.json",
      ".codex-plugin/plugin.json", "LICENSE", "assets/meteor-icon.png",
      "skills/meteor-example/SKILL.md", "skills/meteor-example/references/guide.md",
    ]);
    const original = readFileSync(out);
    await buildPlugin({ root });
    expect(readFileSync(out)).toEqual(original);
  });

  it("rejects a symlink instead of copying data from outside the plugin", async () => {
    write("private.txt", "private data");
    symlinkSync(join(root, "private.txt"), join(root, "skills/meteor-example/references/leak.md"));
    await expect(buildPlugin({ root })).rejects.toThrow("symlink");
  });

  it("fails for missing branding or unexpected files inside a skill", async () => {
    rmSync(join(root, "assets/meteor-icon.png"));
    await expect(buildPlugin({ root })).rejects.toThrow();
    write("assets/meteor-icon.png");
    write("skills/meteor-example/audit.md");
    await expect(buildPlugin({ root })).rejects.toThrow("unexpected skill content");
  });
});
