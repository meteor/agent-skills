# Evaluation cases for `meteor-modern-build-stack`

## Case 1: enable optimizations

Prompt: "How do I turn on the modern build stack? My app is on Meteor 3.3."

Pass if the agent adds `"meteor": { "modern": true }` to `package.json`,
notes it is backward compatible (Babel fallback for incompatible files),
and points the user at `transpiler.verbose` to inspect fallbacks before
investing in migration.

## Case 2: silent Babel fallback

Prompt: "I enabled modern but builds feel the same. How do I tell whether
SWC is actually being used?"

Pass if the agent suggests
`"meteor": { "modern": { "transpiler": { "verbose": true } } }`, points to
the `[Transpiler] Used Babel for <file> Fallback` log, and lists the
common causes (nested imports, JSX in `.js`, Babel-only plugin) with their
SWC equivalents.

## Case 3: alias works for import, not require

Prompt: "I added an alias to `.swcrc`. `import x from "@ui/x"` works but
`require("@ui/x")` does not. Why?"

Pass if the agent explains SWC resolves aliases for `import` only, and
proposes either converting the `require` to an `import` or using a
relative path.

## Case 4: native dep crashes with Rspack

Prompt: "After `meteor add rspack`, my server crashes with
`Cannot find module '/_build/main-dev/lib/worker.js'`."

Pass if the agent identifies the `thread-stream` (or analogous worker-loading)
dependency, and shows
`Meteor.compileWithMeteor(["thread-stream"])` in `rspack.config.js` to
let Meteor/Node handle it instead of Rspack.

## Case 5: OOM on Rspack build

Prompt: "`meteor build` runs out of memory after I added Rspack."

Pass if the agent recommends
capturing the exact mode and release, distinguishes a one-shot build from a
long watch session, audits large trees visible to Meteor, and tests one variable
at a time. It may use `TOOL_NODE_FLAGS` on 3.4.1+ or `NODE_OPTIONS` on 3.4.0 as a
temporary mitigation. It may test `Meteor.setCache(false)` separately. Fail if
it stacks both changes without measuring or checking known release fixes.

## Case 6: custom minifier with Rspack

Prompt: "I enabled Rspack but still have a third-party
`standard-minifier-js` Atmosphere package. Should I delete it automatically?"

Pass if the agent explains that Meteor still performs final bundle assembly,
inventories which package owns JavaScript minification, and compares
production output before removing it. Fail if it assumes Rspack makes every
Meteor minifier package irrelevant.

## Case 7: generated output enters typecheck

Prompt: "After the first Rspack build, TypeScript and ESLint inspect
`_build` and `public/build-chunks`, even though Git ignores them."

Pass if the agent adds Rspack output folders to each tool's native ignore and
verifies those tools after generated output exists.

## Case 8: build context hidden from Meteor

Prompt: "`_build` is generated and already Gitignored, so I added it to
`.meteorignore`. Now Meteor cannot find `server-meteor.js`."

Pass if the agent removes the active build context from `.meteorignore`,
explains that it is the Rspack-to-Meteor handoff, checks custom context names,
and still excludes it from unrelated tools.

## Case 9: helper fails only in the legacy bundle

Prompt: "Modern browsers work, but the production legacy bundle imports a
missing SWC helper. Should I add side-effect helper imports to app startup?"

Pass if the agent inspects source, Rspack output, the generated Meteor-facing
module, and final legacy output to identify the first failing stage. It should
check the exact release for a framework fix and avoid speculative app imports
or global `.swcrc` changes.

## Case 10: compose nested Rspack config

Prompt: "Two Rspack presets both add nested `resolve` and `module` settings.
Shallow object spread makes one replace the other. Which Meteor helper should I
use?"

Pass if the agent uses `Meteor.extendConfig` to merge the fragments and checks
the verbose final configuration. Fail if it confuses this with
`extendSwcConfig`, which applies only to SWC options.

## Case 11: custom service worker filename in development

Prompt: "On Meteor 3.4.1, Workbox generates `service-worker.js`, but Meteor's development web
server cannot serve it unless every rebuild writes it to disk. Rewriting it also
forces a page reload."

Pass if the agent uses `Meteor.persistDevFiles({ once: ['service-worker.js'] })`,
keeps HMR updates out of the service-worker cache, and notes that production
output is written normally. It must identify Meteor 3.4.1 and
`@meteorjs/rspack` v2 as the minimum.

## Case 12: replace a default Rspack plugin

Prompt: "I need to replace a default HTML-related Rspack plugin with a custom
one. How do I disable only the existing plugin?"

Pass if the agent uses `Meteor.disablePlugins` with a constructor name, regex,
or predicate, then adds and validates the replacement. Fail if it mutates the
generated config or disables unrelated plugins.

## Case 13: one bundle for staging and production

Prompt: "We build once and deploy the same artifact to staging and production,
but Rspack removes the inactive `Meteor.isDevelopment` branch at build time."

Pass if the agent explains the default static replacement and uses
`Meteor.enablePortableBuild()` only when runtime portability outweighs the
larger bundle. It must not claim that `Meteor.isClient`, `isServer`, or `isTest`
become portable runtime flags.

## Case 14: TypeScript Rspack config

Prompt: "Will Meteor discover `rspack.config.ts`, or must I rename it to
JavaScript?"

Pass if the agent lists `.ts` as a supported project-level Rspack config name
alongside `.js`, `.mjs`, and `.cjs`. It should preserve `defineConfig` from
`@meteorjs/rspack` and avoid inventing a custom config path setting.

## Case 15: two local Rspack instances

Prompt: "I run two copies of one Rspack-enabled Meteor app. Their Meteor ports
and `METEOR_LOCAL_DIR` values differ, but the second Rspack dev server still
reports a port collision."

Pass if the agent also assigns a distinct `RSPACK_DEVSERVER_PORT` to each
process and explains that `devServer.port` in `rspack.config` is reserved by
the Meteor integration.

## Case 16: helper unavailable on Rspack v1

Prompt: "My app must remain on Meteor 3.4.0 with `@meteorjs/rspack@1.0.0`.
Can I copy a current example that uses `Meteor.persistDevFiles` and
`Meteor.enablePortableBuild`?"

Pass if the agent says both helpers require Meteor 3.4.1+ and
`@meteorjs/rspack` v2, inspects the resolved integration versions, and offers
either a Meteor upgrade or direct Rspack configuration with equivalent tested
behavior. Fail if it installs v2 independently into the Meteor 3.4.0 pairing
or claims every helper documented on `devel` exists in Rspack v1.

## Case 17: unexplained performance near miss

Prompt: "After an update, startup feels slow, but I do not know whether the
time is in the Meteor build, spawned server startup, or the first browser load.
Which Rspack setting should I change?"

Pass if the agent uses `meteor-debugging` first to measure and separate the
tool, server, and browser boundaries. It should return to this skill only when
evidence identifies SWC, Rspack, watcher, cache, or build configuration. Fail
if it changes Rspack settings before locating the slow boundary.
