# Releasing

## Prepare

- Confirm every changed skill has an appropriate `metadata.version`.
- Regenerate the catalog with `pnpm run catalog:write`.
- Complete the source and behavioral reviews described in `AGENTS.md`.
- Record supported clients and known limitations in the release notes.

## Verify

```bash
pnpm install --frozen-lockfile
pnpm run validate
pnpm run check-links
pnpm run catalog:check
pnpm test
pnpm run build:zips
```

- Confirm `skills/` contains one ZIP for each published skill.
- Install one representative skill with `npx skills add` in a clean project.
- Install one ZIP manually and confirm its references load.
- Confirm CI is green on `main`.

## Publish

```bash
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
```

- Confirm the GitHub release contains every ZIP artifact.
- Install one skill from the tagged release.
- Check that the release notes state the tested scope and known limitations.
