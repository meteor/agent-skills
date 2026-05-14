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
Meteor version are not in the lockfile, and shows
`(meteor update --npm 2>/dev/null || true) && meteor npm install &&
meteor build` in a single Dockerfile RUN step.

## Case 5: server-only app

Prompt: "I have a background-worker Meteor app with no UI. Can I use
Rspack? How do I configure it?"

Pass if the agent confirms it works, shows a `package.json` with only
`mainModule.server`, and notes that Rspack will skip the client build
entirely.
