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
`TOOL_NODE_FLAGS="--max-old-space-size=16384" meteor build` on 3.4.1+ (or
`NODE_OPTIONS` on 3.4), and mentions
`Meteor.setCache(false)` as a complementary memory-pressure reduction.

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
