# Code migrations for Rspack

This file covers the app-code changes the integration needs.

## Entry points

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

Required for Rspack; recommended even on Meteor-only. Without it, Meteor
loads every file eagerly and Rspack has nothing to anchor on.

Loading order belongs in the entry file. Imports cascade from there. See
[Modular application structure](https://docs.meteor.com/packages/modules).

### Server-only apps

If the app has no client UI (API servers, microservices, workers), set
only `mainModule.server`:

```json
{
  "meteor": {
    "mainModule": {
      "server": "server/main.js"
    }
  }
}
```

Rspack builds the server bundle; the client side is skipped.

## Nested imports

Detection: enable verbose mode and watch for `(app)` files failing with
`Error: 'import' and 'export' cannot be used outside of module code`.

```json
"meteor": {
  "modern": { "transpiler": { "verbose": true } }
}
```

`(package)` files are out of scope. Atmosphere packages stay on the Meteor
bundler under the integration.

### Rewrites

```javascript
// 1. Top-level
import { a as b } from "./c";
if (condition) console.log(b);

// 2. Dynamic import. Returns a Promise; the function becomes async.
if (condition) {
  const { a: b } = await import("./c");
  console.log(b);
}

// 3. require
if (condition) {
  const { a: b } = require("./c");
  console.log(b);
}
```

Use the dynamic-import form when the goal was code-splitting (the original
Meteor nested-import use case). Use `require` for purely synchronous
loading in a sync scope.

## Default-import interop for CommonJS

Old Meteor accepted `import x from "some-cjs"` for a package whose source
is `module.exports = ...`. Rspack + SWC do not by default.

```javascript
// before
import x from "some-cjs-lib";

// after, preferred
import * as x from "some-cjs-lib";
```

If the upstream package shape makes namespace import wrong (e.g. a single
default export reshaped to namespace), the SWC interop knob restores
Meteor's old behavior:

```json
{
  "module": {
    "type": "commonjs",
    "noInterop": false,
    "importInterop": "node"
  }
}
```

Cost: SWC emits CommonJS everywhere. Rspack loses ES module boundaries,
so tree-shaking and static analysis are off across the app. Migrate the
handful of imports instead unless there is no alternative.

## Aliases

Three places to keep in sync:

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

```json
// tsconfig.json (IDE + ESLint)
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

```json
// .swcrc (only if SWC needs to resolve the alias during transpile)
{
  "jsc": {
    "baseUrl": "./",
    "paths": { "@ui/*": ["imports/ui/*"] }
  }
}
```

Limits:

- SWC `paths` resolve `import` only, not `require(...)`.
- Rspack `resolve.alias` resolves both `import` and `require`. Prefer
  Rspack when both forms are in use.

For dynamic aliases by env, use `swc.config.js` (a function that returns
the SWC config).

## Reserved build folders

Do not commit, edit, or import from:

```text
_build/                          # Rspack entry + intermediate app code
public/build-assets/             # client static assets
public/build-chunks/             # dynamic-import code splits
private/build-assets/            # server assets
```

Auto-added to `.gitignore` the first time. If the project already uses
these names, rename:

```json
{
  "meteor": {
    "buildContext": "build",
    "assetsContext": "assets",
    "chunksContext": "chunks"
  }
}
```

## Verifying a migration

1. `"meteor": { "modern": true }` is set and dev runs clean (no
   `(app)` Babel fallbacks).
2. `meteor add rspack` succeeds and `rspack.config.js` appears.
3. `meteor reset` then `meteor run` builds both client and server.
4. Verbose mode shows app code running through Rspack/SWC; only
   Atmosphere `(package)` files run through the Meteor bundler.
5. `meteor build --architecture os.linux.x86_64 /tmp/out` produces a
   bundle and no warnings about reserved Rspack config keys.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/about/modern-build-stack/rspack-bundler-integration.md
