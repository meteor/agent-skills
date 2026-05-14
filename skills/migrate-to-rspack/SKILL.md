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
  folders, resolve.alias migration, meteor update --npm in CI/Docker.
  Use this skill when the user asks about converting an app to Rspack,
  asks about a build plugin's Rspack replacement, or asks about CI/Docker
  errors after upgrading. For setup and rspack.config.js helpers, use
  meteor-modern-build-stack instead.
metadata:
  author: meteor
  version: "0.1.0"
  kind: knowledge
  meteor: ">=3.4"
  area: migration
  tagline: "Migrate an existing Meteor 3 app to the Rspack bundler integration (`mainModule`, replacing legacy build plugins with loaders)."
  bundle: ["migration"]
  docs_synced_at: "2026-05-14"
license: MIT
---

# Migrate an existing app to Rspack

Rspack integration delegates app-code compilation to Rspack while Meteor
keeps building Atmosphere packages and assembling the final bundle. The
migration work is the app code's responsibility; Meteor packages do not
need to change.

Prerequisite: Meteor 3.4+. Strongly recommended to enable
`"meteor": { "modern": true }` first (Meteor 3.3+) and fix Babel fallbacks,
then add Rspack. See the `meteor-modern-build-stack` skill for the
activation knobs and `rspack.config.js` shape.

## Decision flow

1. Does the app define client and server entry points in `package.json`
   `meteor.mainModule`? If no, define them. Required.
2. Does the app code contain nested imports (ES `import` inside an `if`,
   function, or other block)? If yes, move them to top level or convert
   them to dynamic `import()` / `require`. Required for app code; OK in
   Atmosphere packages.
3. Does the app rely on a Meteor build plugin (`less`, `fourseven:scss`,
   `coffeescript`, `zodern:melte`, `jorgenvatle:vite`)? Plan an Rspack
   loader replacement. See `references/framework-and-css.md`.
4. Does the app rely on bare default imports from CommonJS packages
   (`import x from "some-cjs"`)? Decide between rewriting to
   `import * as x` or restoring Meteor-style interop in `.swcrc`. See
   `references/code-migrations.md`.
5. Is the app server-only? Set only `mainModule.server`. Rspack still
   bundles the server; client is skipped.
6. Run `meteor add rspack` and watch the verbose `[Transpiler]` log for
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
does not apply: Rspack does not auto-discover modules. Defining entry
points also speeds up Meteor-only builds.

CSS in the entry folder (e.g. `client/*.css`) is auto-delegated to Rspack
when a CSS loader is configured; otherwise Meteor handles it.

To keep Meteor processing CSS or HTML files outside the entry folder, list
them under `modules`:

```json
{ "meteor": { "modules": ["styles/main.css"] } }
```

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

Do not edit any file under those folders. Excluding them from IDE
indexing is recommended.

## Replacing build plugins

Most Meteor build plugins are deprecated under Rspack because the same
problem is solved by an Rspack loader.

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

## Aliases

```javascript
// rspack.config.js
const { defineConfig } = require('@meteorjs/rspack');

module.exports = defineConfig(Meteor => ({
  resolve: {
    alias: {
      '@ui': '/imports/ui',
      '@api': '/imports/api',
    },
  },
}));
```

Also update `tsconfig.json` for IDE and ESLint resolution:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@ui/*": ["imports/ui/*"],
      "@api/*": ["imports/api/*"]
    }
  }
}
```

Define `.swcrc` `jsc.paths` too if SWC needs to resolve the same alias
during transpilation. SWC `paths` does not resolve `require()` calls; only
`import`.

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

Run `meteor update --npm` in the same step as `meteor build`:

```dockerfile
RUN (meteor update --npm 2>/dev/null || true) && meteor npm install && meteor build [...]
```

The `2>/dev/null || true` wrapper keeps the same step compatible with
older Meteor versions that lack `--npm` (added in 3.4).

## Anti-patterns

- Add Rspack before fixing Babel fallbacks. Find them with
  `"meteor": { "modern": { "transpiler": { "verbose": true } } }` and fix
  them while still on the optimization-only stack.
- Keep `jorgenvatle:vite` or `zodern:melte` alongside `rspack`. Remove the
  old plugin; the integration replaces it.
- Restore CJS interop globally in `.swcrc` to avoid migrating a handful of
  imports. Trades real bundle-size wins for short-term convenience.
- Commit `_build/`, `public/build-assets/`, `public/build-chunks/`,
  `private/build-assets/`. Autogenerated.
- Skip `meteor update --npm` before `meteor build` in CI/Docker. The
  Meteor 3.4+ pipeline pins npm-side deps and the build will not find
  `rspack.config.js`.

## See also

- `references/code-migrations.md`
- `references/framework-and-css.md`
- `references/troubleshooting.md`
- `references/eval-cases.md`
- For setup, helpers, and `rspack.config.js` API: `meteor-modern-build-stack`.
