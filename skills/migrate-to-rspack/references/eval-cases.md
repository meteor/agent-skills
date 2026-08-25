# Evaluation cases for `migrate-to-rspack`

## Case 1: nested-import diagnosis

Prompt: "After `meteor add rspack`, my build fails with `Error: 'import'
and 'export' cannot be used outside of module code` on `imports/app.js`.
What do I do?"

Pass if the agent identifies a nested import (an ES `import` inside a
conditional, function, or block), explains it is not standard syntax, and
shows the three fixes: move to top, dynamic `import()`, or `require`.
Bonus: mentions verbose mode for finding more `(app)` failures.

## Case 2: SCSS plugin replacement

Prompt: "I use `fourseven:scss` and want to add Rspack. How do I migrate
my SCSS?"

Pass if the agent removes `fourseven:scss` from `.meteor/packages`,
installs `sass-embedded` and `sass-loader`, and adds an SCSS rule to
`rspack.config.js` using `type: 'css/auto'` and the
`api: 'modern-compiler'` option. Bonus: notes that `meteor create --full`
on 3.4.1+ ships this exact setup.

## Case 3: default-import breaks after migration

Prompt: "After enabling Rspack, `import x from "some-cjs-lib"` returns
undefined. The package uses `module.exports = ...`. What changed?"

Pass if the agent explains that Rspack + SWC do not provide the old
Meteor default-import interop, and proposes `import * as x` as the first
fix. If the agent also explains the `.swcrc` `noInterop: false`
workaround, it must call out the tree-shaking cost.

## Case 4: CI cannot find rspack.config.js

Prompt: "Local builds work but Docker fails with `Could not find
rspack.config.js`. What's missing?"

Pass if the agent identifies that npm-side deps pinned by the current
Meteor version are not in the lockfile. It should prefer running
`meteor update --npm` locally, committing `package.json` and the lockfile,
then using `meteor npm ci` in Docker. Accept the single-step defensive
fallback only when it is labeled as recovery for an incomplete upgrade.

## Case 5: server-only app

Prompt: "I have a background-worker Meteor app with no UI. Can I use
Rspack? How do I configure it?"

Pass if the agent confirms it works, shows a `package.json` with only
`mainModule.server`, and notes that Rspack will skip the client build
entirely.

## Case 6: integration major mismatch

Prompt: "I upgraded from Meteor 3.4 to 3.4.1 but kept
`@meteorjs/rspack@^1.0.0`. The config now fails in a clean build. Should I
align it with my `@rspack/core` major?"

Pass if the agent requires `@meteorjs/rspack` v2 for Meteor 3.4.1, explains
that Meteor 3.4.1 pairs `rspack@1.1.0` with `@meteorjs/rspack@2.0.1`, keeps its
version independent from core/CLI, and runs `meteor update --npm` to update and
commit the dependency files.

## Case 7: generated files break Biome

Prompt: "The app builds with Rspack, but `biome check .` now reports errors
inside `_build/main-dev`. The directory is already in `.gitignore`."

Pass if the agent explains that Git ignores do not necessarily configure
Biome and adds all active Rspack output folders to the tool's own ignore.
It should rerun Biome after a build.

## Case 8: cached migration passes, clean clone fails

Prompt: "Rspack works in my existing checkout, but a fresh clone cannot
start because an ignored settings file is missing. Is the migration done?"

Pass if the agent rejects the cached-checkout result, requires a tracked
nonsecret settings fixture or documented environment setup, and verifies
development, tests, E2E, production build, and clean Git status from a fresh
clone.

## Case 9: CommonJS assignment in the client graph

Prompt: "After Rspack, every page is blank. A helper imported through a shared
model uses `module.exports`, but the file lives outside `client/`. Server tests
pass. Should I enable global CommonJS interop?"

Pass if the agent traces reachability from the client entry, distinguishes this
from default-import interop, and either converts the reachable module to
consistent ESM or moves it behind a server boundary. Fail if it classifies the
file by pathname or changes `.swcrc` globally without inspecting the graph.

## Case 10: Node built-in enters the browser

Prompt: "The client build now fails on `crypto` and `stream`. The import comes
from a local Atmosphere package whose `api.mainModule('index.js')` contains
server lockout logic."

Pass if the agent inspects the package architecture, restricts the entry to
`server` when appropriate, and verifies a browser production smoke. Accept a
polyfill only when the behavior is intentionally browser-compatible.

## Case 11: `_build` added to `.meteorignore`

Prompt: "I copied generated paths from `.gitignore` into `.meteorignore`. Now
Meteor says it cannot find `_build/main-prod/server-meteor.js`."

Pass if the agent identifies `_build` as the Rspack-to-Meteor handoff, removes
the active build context from `.meteorignore`, checks renamed contexts, and
keeps the path ignored only by Git and unrelated recursive tools.

## Case 12: lazy chunks under a path prefix

Prompt: "The production app works at `/`, but under `ROOT_URL=https://host/app`
opening a lazy route requests `build-chunks/build-chunks/x.js`."

Pass if the agent tests a real dynamic import under the deployed URL prefix,
fixes the public base without making the import static, and verifies that the
chunk loads and executes.

## Case 13: server healthy, browser blank

Prompt: "The Rspack production bundle builds, starts, and returns HTTP 200, but
the browser page is blank. Can I call the migration complete?"

Pass if the agent rejects server health as sufficient, finds the first browser
module exception, inspects the client graph, and requires a browser smoke
against the extracted production bundle.

## Case 14: CSS outside the entry folder

Prompt: "After defining `client/main.js` for Rspack, a global stylesheet in
`styles/main.css` is no longer included. I need Meteor to keep compiling it and
do not want to import it through an Rspack loader."

Pass if the agent adds the stylesheet to `meteor.modules`, does not add
JavaScript there, and verifies the final stylesheet output. Bonus if it explains
that importing through an Rspack loader is the faster-HMR alternative.

## Case 15: app-local source symlink

Prompt: "My Meteor app imports `imports/shared` through a source-directory
symlink. Rspack resolves the real directory outside the app and breaks relative
imports. Should every pnpm workspace set `resolve.symlinks: false`?"

Pass if the agent distinguishes app-local source symlinks from package-name
workspace imports, sets `resolve.symlinks: false` only for the former, and
validates watching and production bundling from the consumer app.

## Case 16: CSS delegation depends on Meteor version

Prompt: "I configured `postcss-loader` while migrating a Meteor 3.4.0 app to
Rspack. Meteor and Rspack both emit the stylesheet. Should I add every generated
folder to `.meteorignore`?"

Pass if the agent identifies automatic stylesheet delegation as Meteor 3.4.1+
behavior, prefers upgrading, and uses only a narrow temporary stylesheet ignore
when 3.4.0 is an intentional constraint. It must protect the active build
context and verify the expected CSS appears exactly once in development and
production.

## Case 17: custom build plugin has hidden behavior

Prompt: "A custom Meteor build plugin compiles `.theme` files, copies fonts in
production, and injects an alias in tests. Rspack has a loader for `.theme`, so
can I remove the plugin now?"

Pass if the agent inventories all three capabilities, configures equivalent
Rspack behavior, and validates development, test, and production outputs before
removal. If the two pipelines conflict, it must use a checkpoint and one
reversible activation/removal change. Fail if it treats the matching extension
as complete parity or upgrades the UI framework unnecessarily.

## Case 18: ignored generated module in the client graph

Prompt: "Server tests pass, but a clean production client build cannot resolve
`./generated/schema.json`. The file is Gitignored and exists on developer
machines after another tool runs. Should I commit it?"

Pass if the agent traces the client and client-test graph, identifies and runs
the deterministic producer before every consuming path, and validates clean
test-mode and production client builds. It must not commit generated output
automatically. Fail if it accepts server tests as client compilation evidence.

## Case 19: successful test command runs no client tests

Prompt: "`meteor test --once` exits zero and reports six server tests, followed
by `browser client tests were not run`. The Rspack changes are client-only. Can
I merge?"

Pass if the agent requires a browser driver or browser-backed client suite,
checks expected suite counts, compiles the real test-mode client entry, and
retains a production browser smoke. Fail if it treats exit zero or server-only
tests as sufficient.

## Case 20: current helper copied into Meteor 3.4.0

Prompt: "A current Rspack example uses `Meteor.persistDevFiles`,
`Meteor.replaceSwcConfig`, and `Meteor.enablePortableBuild`. My migration is
fixed on Meteor 3.4.0. Can I paste those helpers?"

Pass if the agent identifies Meteor 3.4.1 and `@meteorjs/rspack` v2 as the
minimum for all three helpers, checks the resolved Atmosphere and npm package
versions, and either upgrades the paired Meteor integration or designs and
tests direct Rspack equivalents. Fail if it installs v2 alone or assumes
current `devel` helper availability applies to Meteor 3.4.0.
