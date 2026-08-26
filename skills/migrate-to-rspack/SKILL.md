---
name: migrate-to-rspack
description: >
  Use when migrating an existing Meteor 3 app to the Rspack bundler
  integration (`rspack` Atmosphere package, Meteor 3.4+). Triggers on
  removing nested imports, defining mainModule entry points, server-only
  apps, replacing fourseven:scss / meteor/less / coffeescript /
  jorgenvatle:vite / zodern:melte build plugins with Rspack loaders,
  "Error: 'import' and 'export' cannot be used outside of module code",
  CommonJS default-import interop, _build / build-assets / build-chunks
  folders, module.exports in a client graph, Node built-ins in browser code,
  .meteorignore hiding mainModule handoff files, dynamic chunks under ROOT_URL,
  meteor.modules for CSS or HTML, resolve.symlinks in a monorepo,
  resolve.alias migration, meteor update --npm in CI/Docker.
  Use this skill when the user asks about converting an app to Rspack,
  asks about a build plugin's Rspack replacement, or asks about CI/Docker
  errors after upgrading. For setup and rspack.config.js helpers, use
  meteor-modern-build-stack instead.
metadata:
  author: meteor
  kind: knowledge
  meteor: ">=3.4"
  area: migration
  tagline: "Migrate an existing Meteor 3 app to the Rspack bundler integration (`mainModule`, replacing legacy build plugins with loaders)."
  bundle: ["migration"]
  docs_synced_at: "2026-08-21"
license: MIT
---

# Migrate an existing app to Rspack

Rspack compiles app code while Meteor builds Atmosphere packages and assembles
the final bundle. Do not rewrite packages merely because Rspack is enabled, but
audit their architecture declarations and browser-incompatible dependencies.

Prerequisite: Meteor 3.4+. Strongly recommended to enable
`"meteor": { "modern": true }` first (Meteor 3.3+) and fix Babel fallbacks,
then add Rspack. See the `meteor-modern-build-stack` skill for the
activation knobs and `rspack.config.js` shape.

Match `@meteorjs/rspack` to the Meteor release, not to
`@rspack/core` or `@rspack/cli`:

| Meteor | `rspack` | `@meteorjs/rspack` | Capability boundary |
|---|---|---|---|
| 3.4 | `1.0.0` | `1.0.0` | Base integration and helpers. |
| 3.4.1 and 3.5 | `1.1.0` | `2.0.1` | Adds v2 helpers and inherited `TOOL_NODE_FLAGS`. |
| 3.5.1 | `1.2.0` | `2.1.0` | Revised client polyfills and extension discovery. |

The Atmosphere, Meteor npm integration, and Rspack core package versions are
independent. Inspect `.meteor/versions`, `package.json`, and the lockfile. After
changing the Meteor release, run `meteor update --npm`, inspect the npm changes,
and commit the dependency files. Do not pair a newer integration major with an
older Meteor release only to copy a current helper.

## Decision flow

1. Does the app define client and server entry points in `package.json`
   `meteor.mainModule`? If no, define them. Required.
2. Trace the client and client-test graphs. Do they reach CommonJS export
   assignments, Node built-ins, server-only local package entries, or missing
   generated inputs in a clean checkout? If yes, repair the boundary before
   activation. See
   `references/client-graph-preflight.md`.
3. Does the app code contain nested imports (ES `import` inside an `if`,
   function, or other block)? If yes, move them to top level or convert
   them to dynamic `import()` / `require`. Required for app code; OK in
   Atmosphere packages.
4. Does the app rely on a Meteor build plugin (`less`, `fourseven:scss`,
   `coffeescript`, `zodern:melte`, `jorgenvatle:vite`)? Plan an Rspack
   loader replacement and prove capability parity before removal. See
   `references/framework-and-css.md`.
5. Does the app rely on bare default imports from CommonJS packages
   (`import x from "some-cjs"`)? Decide between rewriting to
   `import * as x` or restoring Meteor-style interop in `.swcrc`. See
   `references/code-migrations.md`.
6. Is the app server-only? Set only `mainModule.server`. Rspack still
   bundles the server; client is skipped.
7. Does the app keep CSS or HTML outside its entry folder, or import app-local
   symlinks? Preserve the boundary with `meteor.modules` or
   `resolve.symlinks: false`; see the references.
8. Run `meteor add rspack` and watch the verbose `[Transpiler]` log for
   remaining `(app)` failures.

## Required: entry points

```json
{
  "meteor": {
    "mainModule": {
      "client": "client/main.js",
      "server": "server/main.js"
    },
    "testModule": "tests.js"
  }
}
```

Without `mainModule`, Rspack has no entry. Meteor's eager-loading model
does not apply: Rspack does not auto-discover modules. See
`references/framework-and-css.md` for CSS and HTML routing.

## Required: no nested imports in app code

```javascript
// app code: NOT allowed under Rspack
if (condition) {
  import { a as b } from "./c";
  console.log(b);
}
```

Three fixes:

```javascript
// 1. Move to top
import { a as b } from "./c";
if (condition) console.log(b);

// 2. Dynamic import (standardized, supported)
if (condition) {
  const { a: b } = await import("./c");
  console.log(b);
}

// 3. require (CommonJS interop)
if (condition) {
  const { a: b } = require("./c");
  console.log(b);
}
```

Diagnose with verbose mode and look for `(app)` files failing with
`Error: 'import' and 'export' cannot be used outside of module code`.
`(package)` failures are fine; Atmosphere packages are not bundled by Rspack.

## Required: reserve build folders

The integration writes to `_build/`, `public/build-assets/`,
`public/build-chunks/`, `private/build-assets/`. Auto-added to `.gitignore`.
If the project already uses any of these names, rename in `package.json`:

```json
{
  "meteor": {
    "buildContext": "build",
    "assetsContext": "assets",
    "chunksContext": "chunks"
  }
}
```

Do not edit any file under those folders. Exclude them from IDE indexing and
from every recursive formatter, linter, typechecker, test-discovery, and
coverage scan. `.gitignore` does not configure those tools.

Do not match the active build context in `.meteorignore` or `METEOR_IGNORE`.
Rspack writes Meteor-facing entry modules there, then Meteor reads them to
assemble the final bundle. Resolve renamed contexts before auditing ignores.

## Replacing build plugins

Most app-file build plugins move to Rspack loaders. Prove capability parity
before removal; make conflicting activation and removal one reversible change.
See `references/framework-and-css.md`.

| Old plugin                | Replacement                                                          |
|---------------------------|----------------------------------------------------------------------|
| `meteor/less`             | `less-loader`. See `references/framework-and-css.md`.                |
| `fourseven:scss`          | `sass-loader` + `sass-embedded`. See refs. Skeleton in `meteor create --full`. |
| `meteor/coffeescript`     | `coffee-loader` (optionally chained with `swc-loader`).              |
| `zodern:melte` (Svelte)   | Official Rspack Svelte loader.                                       |
| `jorgenvatle:vite` (Vue/Solid) | Native Rspack Vue/Solid loaders.                                |
| `babel-plugin-react-compiler` | Babel via Rspack loader on `.jsx`/`.tsx`; SWC for everything else. |
| `zodern:types`            | Still compatible. Keep it.                                           |

Plugins acting only on Atmosphere package files can stay. Plugins acting on
app-folder files (entry folder excluded) must move to Rspack.

## CommonJS default-import interop

Old Meteor accepted `import x from "some-cjs-lib"` for a `module.exports = ...`
package. Rspack + SWC do not by default. Two options:

```javascript
// preferred: switch to namespace import
import * as x from "some-cjs-lib";
```

Or restore interop in `.swcrc`:

```json
{
  "module": {
    "type": "commonjs",
    "noInterop": false,
    "importInterop": "node"
  }
}
```

This emits CommonJS, defeating tree-shaking and static analysis app-wide.
Migrate imports instead unless you cannot.

## CI and Docker

After upgrading Meteor locally, the required npm bumps must be committed.
If they are not, CI/Docker builds fail with:

```text
Could not find rspack.config.js, rspack.config.ts, rspack.config.mjs, or rspack.config.cjs
```

Preferred reproducible flow:

1. Run `meteor update --npm` locally after changing the Meteor release.
2. Commit `package.json` and the lockfile.
3. Run `meteor npm ci` followed by `meteor build` in CI.

See `references/troubleshooting.md` for the recovery-only Docker fallback when
a pipeline intentionally repairs missing npm bumps during the build.

## Anti-patterns

- Add Rspack before fixing Babel fallbacks. Find them with
  `"meteor": { "modern": { "transpiler": { "verbose": true } } }` and fix
  them while still on the optimization-only stack.
- Restore CJS interop globally in `.swcrc` to avoid migrating a handful of
  imports. Trades real bundle-size wins for short-term convenience.
- Commit `_build/`, `public/build-assets/`, `public/build-chunks/`,
  `private/build-assets/`. Autogenerated.
- Change the Meteor release without running `meteor update --npm` and
  committing its npm dependency changes. A stale lockfile makes clean CI
  builds fail or pick an incompatible integration major.

## See also

- `references/code-migrations.md`
- `references/client-graph-preflight.md`
- `references/validation-matrix.md`
- `references/framework-and-css.md`
- `references/troubleshooting.md`
- `references/eval-cases.md`
- For setup, helpers, and `rspack.config.js` API: `meteor-modern-build-stack`.
