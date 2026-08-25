# Customizing `rspack.config.js`

The `rspack` Atmosphere package generates a `rspack.config.js` at install
time. Edit it with `defineConfig` from `@meteorjs/rspack`. Accepted names are
`rspack.config.js`, `rspack.config.ts`, `rspack.config.mjs`, and
`rspack.config.cjs`.

Match both integration packages to the Meteor release:

| Meteor | `rspack` | `@meteorjs/rspack` | Capability boundary |
|---|---|---|---|
| 3.4 | `1.0.0` | `1.0.0` | Base helpers, including `extendConfig`, `disablePlugins`, and `RSPACK_DEVSERVER_PORT`. |
| 3.4.1 and 3.5 | `1.1.0` | `2.0.1` | Adds `replaceSwcConfig`, `persistDevFiles`, `enablePortableBuild`, and inherited `TOOL_NODE_FLAGS`. |
| 3.5.1 | `1.2.0` | `2.1.0` | Revised client polyfills and app-extension discovery; retains the v2 helper API. |

Inspect `.meteor/versions`, `package.json`, and the lockfile. Do not install an
arbitrary `@meteorjs/rspack` major to obtain one helper; upgrade the Meteor
release and its paired dependencies.

```javascript
const { defineConfig } = require('@meteorjs/rspack');
const { rspack } = require('@rspack/core');

module.exports = defineConfig(Meteor => ({
  plugins: [
    Meteor.isClient && new rspack.ProvidePlugin({ _: 'lodash' }),
    new rspack.ProgressPlugin(),
  ].filter(Boolean),
}));
```

## Flags on the `Meteor` parameter

| Flag             | Type    | Meaning                                              |
|------------------|---------|------------------------------------------------------|
| `isDevelopment`  | boolean | dev mode                                             |
| `isProduction`   | boolean | prod mode                                            |
| `isClient`       | boolean | building client code                                 |
| `isServer`       | boolean | building server code                                 |
| `isTest`         | boolean | test mode                                            |
| `isDebug`        | boolean | debug mode                                           |
| `isRun`          | boolean | `meteor run`                                         |
| `isBuild`        | boolean | `meteor build`                                       |
| `swcConfigOptions` | object | project-level SWC config (reuse in custom loaders)  |
| `assetsContext`  | string  | name of the build-assets folder                      |
| `chunksContext`  | string  | name of the build-chunks folder                      |

## Helpers

### `extendConfig`

Deep-merge reusable or conditional Rspack configuration fragments without
replacing sibling nested keys:

```javascript
module.exports = defineConfig(Meteor => ({
  ...Meteor.extendConfig(
    { resolve: { alias: { '@ui': '/imports/ui' } } },
    Meteor.isClient ? { module: { rules: [clientRule] } } : {},
  ),
}));
```

Use direct properties for one small config. Use `extendConfig` when composing
multiple nested fragments or presets. Inspect verbose final config to confirm
the merge result.

### `extendSwcConfig` and `replaceSwcConfig`

Both apply only to app code (Meteor packages keep their own SWC config).
`extendSwcConfig` exists in Meteor 3.4+. `replaceSwcConfig` requires Meteor
3.4.1+ and `@meteorjs/rspack` v2.

```javascript
// Smart-merge custom options onto Meteor's SWC defaults
...Meteor.extendSwcConfig({
  jsc: { parser: { decorators: true } },
})
```

```javascript
// Replace Meteor's SWC config entirely. You own React-refresh, helpers, etc.
...Meteor.replaceSwcConfig({
  jsc: {
    parser: { syntax: 'typescript', tsx: true, decorators: true },
    target: 'es2020',
    transform: { react: { runtime: 'automatic' } },
  },
})
```

Prefer `extendSwcConfig`. `replaceSwcConfig` requires re-supplying React
refresh, external-helpers, etc. that Meteor sets up via `Meteor.swcConfigOptions`.

### `compileWithRspack` / `compileWithMeteor`

Routes specific npm deps to one bundler or the other.

```javascript
module.exports = defineConfig(Meteor => ({
  // Force Rspack/SWC to recompile a modern or local package
  ...Meteor.compileWithRspack(['grubba-rpc']),
  // ES5 target for one dep
  ...Meteor.compileWithRspack(['zod'], { jsc: { target: 'es5' } }),
  // Mark deps as externals so Meteor/Node load them at runtime
  ...(Meteor.isServer ? Meteor.compileWithMeteor(['sharp']) : {}),
}));
```

Use `compileWithMeteor` for:

- Native or binary deps (e.g. `sharp`).
- Atmosphere-package internals.
- `thread-stream` and similar worker-loading dependencies reached through
  logging stacks such as `pino`. Fix
  `Cannot find module '/_build/main-dev/lib/worker.js'` by adding
  `thread-stream` to `compileWithMeteor`.

### `splitVendorChunk`

Splits `node_modules` into a stable `vendor` chunk to avoid duplicating
shared deps across async chunks.

```javascript
module.exports = defineConfig(Meteor => ({
  ...Meteor.splitVendorChunk(),
}));
```

For finer control, drop the helper and use Rspack's official
`splitChunksPlugin` config.

### `persistDevFiles` (Meteor 3.4.1+)

Rspack dev server keeps build output in memory. If Meteor's web server has
to serve a file (e.g. a Workbox-generated `sw.js`), persist it.

```javascript
// every rebuild
...Meteor.persistDevFiles(['manifest.json'])

// or split strategies
...Meteor.persistDevFiles({
  once: ['sw.js'],            // first build only; rewriting re-registers SW
  always: ['manifest.json'],
})
```

Matchers: strings (`endsWith`), RegExp, or functions. HTML files persist
unconditionally.

| Strategy | When                                  |
|----------|---------------------------------------|
| `always` | every build. Default for array form.  |
| `once`   | first build only. Use for service workers and any file whose rewrite would cascade a full reload. |

### `setCache`

```javascript
...Meteor.setCache(false)        // disable
...Meteor.setCache('memory')     // in-memory only
// default: persistent
```

Disable only when investigating Rspack cache bugs or OOM. Persistent is
the rebuild-speed default.

### `disablePlugins`

Match by constructor name string, RegExp, or predicate.

```javascript
...Meteor.disablePlugins([
  'DefinePlugin',
  /Html/i,
  p => p?.constructor?.name === 'CustomConsoleLogPlugin',
])
```

### `enablePortableBuild` (Meteor 3.4.1+)

Default: `Meteor.isDevelopment` and `Meteor.isProduction` are replaced at
build time, enabling dead-code elimination of dev-only blocks.

```javascript
...Meteor.enablePortableBuild()
```

Keeps both as runtime checks. Bundle gets larger; dev/prod branches both
ship. Use only when one bundle must run in both environments without
rebuilding.

`Meteor.isClient`, `Meteor.isServer`, `Meteor.isTest` are always replaced
at build time regardless of this flag.

## Custom `HtmlRspackPlugin`

Replace or extend the default plugin to inject `<meta>` tags, CSP, etc.

```javascript
module.exports = defineConfig(Meteor => ({
  plugins: [
    Meteor.HtmlRspackPlugin({
      meta: {
        viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
        'theme-color': '#4285f4',
      },
    }),
  ],
}));
```

A `client/main.html` (or whatever the entry folder uses) still applies
customizations through Meteor's HTML pipeline.

## Dev server port

`rspack.config.js`'s `devServer.port` is reserved. Use the env var:

```bash
RSPACK_DEVSERVER_PORT=3232 meteor run
```

Meteor manages the Rspack dev server so it can coordinate with Meteor's
own server; the port must be passed through env so both processes agree.

## Logging knobs

```javascript
module.exports = defineConfig(Meteor => ({
  stats: 'detailed',
  infrastructureLogging: { level: 'info' },
}));
```

`stats` controls bundle info per compilation. `infrastructureLogging.level`
controls HMR verbosity in terminal and browser; off by default.

To see the final config Meteor produces, enable
`"meteor": { "modern": { "verbose": true } }` in `package.json`.

## Reserved config keys

Rspack `entry` and `output` are owned by the integration. Overriding them
triggers warnings. Everything else is fair game.

## Reserved build folders

Do not edit:

- `_build/*`: Rspack entry, intermediate app, overridden Meteor entry.
- `public/build-assets/*`, `private/build-assets/*`: built static assets.
- `public/build-chunks/*`: dynamic-import code splits.

Auto-added to `.gitignore`. To rename, set in `package.json`:

```json
{
  "meteor": {
    "buildContext": "build",
    "assetsContext": "assets",
    "chunksContext": "chunks"
  }
}
```

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/about/modern-build-stack/rspack-bundler-integration.md
