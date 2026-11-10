import { afterEach, beforeEach, describe, expect, it } from "@rstest/core";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { selectRelease, snapshot, verifyInstallation } from "../scripts/smoke-install.mjs";

describe("published release selection", () => {
  const stable = { tag_name: "v1.0.0", published_at: "2026-10-01", draft: false, prerelease: false };
  const beta = { tag_name: "v1.1.0-beta.4", published_at: "2026-11-10", draft: false, prerelease: true };

  it("selects the newest publication including prereleases, while excluding drafts", () => {
    expect(selectRelease([stable, { ...beta, tag_name: "v2.0.0", published_at: "2026-11-11", draft: true }, beta])).toEqual(beta);
    expect(selectRelease([beta, stable], "v1.0.0")).toEqual(stable);
  });

  it("fails for an unpublished tag rather than testing a different release", () => {
    expect(() => selectRelease([beta, stable], "v1.1.0")).toThrow("No published catalog release");
    expect(() => selectRelease([])).toThrow("No published catalog release");
  });
});

describe("installed catalog comparison", () => {
  let root;
  let source;
  let installed;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "meteor-install-comparison-"));
    source = join(root, "source");
    installed = join(root, "installed");
    for (const dir of [source, installed]) {
      mkdirSync(join(dir, "meteor-example", "references"), { recursive: true });
      writeFileSync(join(dir, "meteor-example", "SKILL.md"), "skill instructions\n");
      writeFileSync(join(dir, "meteor-example", "references", "guide.md"), "supporting reference\n");
    }
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it("requires matching skill files and references, not just a successful installer exit", () => {
    expect(verifyInstallation(source, installed, ["meteor-example"])).toBe(2);
    writeFileSync(join(installed, "meteor-example", "references", "guide.md"), "stale guidance\n");
    expect(() => verifyInstallation(source, installed, ["meteor-example"])).toThrow("Installed contents differ");
    rmSync(join(installed, "meteor-example", "references", "guide.md"));
    expect(() => verifyInstallation(source, installed, ["meteor-example"])).toThrow("Installed contents differ");
  });

  it("rejects extra maintainer skills and lost executable permissions", () => {
    mkdirSync(join(installed, "release-publishing"));
    expect(() => verifyInstallation(source, installed, ["meteor-example"])).toThrow("inventory differs");
    rmSync(join(installed, "release-publishing"), { recursive: true });
    chmodSync(join(source, "meteor-example", "SKILL.md"), 0o755);
    expect(() => verifyInstallation(source, installed, ["meteor-example"])).toThrow("Installed contents differ");
  });

  it("rejects symlinks so a copied installation cannot pass by reading its source", () => {
    symlinkSync(join(source, "meteor-example", "SKILL.md"), join(installed, "meteor-example", "linked.md"));
    expect(() => snapshot(installed)).toThrow("Unexpected installed symlink");
    rmSync(join(installed, "meteor-example"), { recursive: true });
    symlinkSync(join(source, "meteor-example"), join(installed, "meteor-example"));
    expect(() => verifyInstallation(source, installed, ["meteor-example"])).toThrow("Unexpected installed symlink");
  });
});
