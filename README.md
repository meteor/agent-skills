# meteor/agent-skills

Agent Skills for AI assistants helping developers build, debug, migrate, and operate **Meteor 3 applications**.

> Status: bootstrapping. The first public skill ships in the next release. See the proposal repo for the roadmap.

## Install

The open `skills` CLI installs skills into your local agent (Claude Code, Cursor, Codex, Copilot, Gemini CLI, OpenCode, and 40+ others).

```bash
# all skills (interactive picker)
npx skills add meteor/agent-skills

# one skill
npx skills add meteor/agent-skills --skill migrate-to-meteor-3

# every skill, non-interactive
npx skills add meteor/agent-skills --all
```

## Catalog

<!-- SKILLS:BEGIN -->
### Auth

- **`meteor-accounts`**: Use when wiring up authentication in a Meteor 3 app. Triggers on accounts-password, accounts-base, OAuth (Google, Facebook, GitHub, Apple, Twitter, Meetup, Weibo), accounts-2fa, accounts-passwordless, ServiceConfiguration.configurations.upsertAsync, Accounts.createUserAsync, Accounts.setPasswordAsync, Accounts.forgotPassword, Accounts.resetPassword, Accounts.verifyEmail, useHttpOnlyCookies, clientStorage, Meteor.loginWithPasswordAnd2faCode, email verification. Use this skill when the user asks about signups, signins, or asks about token storage vs HttpOnly cookies.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-accounts
  ```

### Build

- **`meteor-modern-build-stack`**: Use when configuring or tuning the Meteor 3 modern build stack: SWC transpiler, SWC-based minifier, modern @parcel/watcher, web-arch skipping in development, .meteorignore, and the Rspack bundler integration via the rspack Atmosphere package. Triggers on package.json "meteor": { "modern": true }, .swcrc, swc.config.js, [Transpiler] Used Babel Fallback logs, rspack.config.js, defineConfig from @meteorjs/rspack, Meteor.compileWith* helpers, Meteor.extendSwcConfig vs Meteor.replaceSwcConfig, Meteor.splitVendorChunk, Meteor.persistDevFiles, Meteor.disablePlugins, Meteor.enablePortableBuild, HtmlRspackPlugin customization, RSPACK_DEVSERVER_PORT, TOOL_NODE_FLAGS for OOM, modern/legacy archs. Use this skill when the user asks about enabling the modern build stack, asks about SWC vs Babel in Meteor, asks about Rspack integration setup, or asks about customizing rspack.config.js. For converting an existing app's code to be Rspack-compatible, use migrate-to-rspack instead.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-modern-build-stack
  ```

### Data

- **`meteor-methods`**: Use when authoring or debugging Meteor methods (Meteor.methods, Meteor.call, Meteor.callAsync). Triggers on argument validation with check(), optimistic UI stubs, latency compensation, Meteor.Error handling, and DDPRateLimiter. Use this skill when the user asks about server-side mutation, asks about rate limiting RPC, or asks about wrapping a method with auth checks.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-methods
  ```

- **`meteor-mongo-minimongo`**: Use when authoring or debugging Mongo queries in Meteor 3. Triggers on Mongo.Collection, find/findOne, server async vs client Minimongo sync, oplog vs change streams, indexes, selectors, modifiers, projections. Use this skill when the user asks about Mongo on the server or asks about Minimongo on the client.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-mongo-minimongo
  ```

- **`meteor-pubsub`**: Use when authoring or debugging Meteor publications and subscriptions (Meteor.publish, Meteor.subscribe). Triggers on publication strategies (SERVER_MERGE, NO_MERGE, NO_MERGE_NO_HISTORY), the low-level publish API (added/changed/removed), cursor authorization, reactive joins, leaked documents. Use this skill when the user asks about pub/sub or asks about reactive data fetching.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-pubsub
  ```

### Migration

- **`migrate-to-meteor-3`**: Use when migrating a Meteor 2.x application to Meteor 3.x. Triggers on callAsync, *Async Mongo methods, removed Fibers, ReferenceError on top-level globals after upgrade, Iron Router controllers silently not running, lost reactivity in Blaze helpers after async rewrites, "publish function returned a Promise", "Method stub took too long", Atmosphere packages failing to resolve, WebApp.handlers replacing WebApp.connectHandlers under Express 5, Meteor.EnvironmentVariable context lost in async, rawCollection callbacks no longer firing, meteor/* imports losing TypeScript types after upgrade, useTracker and useSubscribe not re-running after upgrade. Use this skill when the user asks about upgrading Meteor, asks about sync to async rewrites, asks about iterators with await, asks about Express middleware migration, asks about zodern:types, or asks about replacing or forking third-party packages.

  ```bash
  npx skills add meteor/agent-skills --skill migrate-to-meteor-3
  ```

- **`migrate-to-rspack`**: Use when migrating an existing Meteor 3 app to the Rspack bundler integration (`rspack` Atmosphere package, Meteor 3.4+). Triggers on removing nested imports, defining mainModule entry points, server-only apps, replacing fourseven:scss / meteor/less / coffeescript / jorgenvatle:vite / zodern:melte build plugins with Rspack loaders, "Error: 'import' and 'export' cannot be used outside of module code", CommonJS default-import interop, _build / build-assets / build-chunks folders, resolve.alias migration, meteor update --npm in CI/Docker. Use this skill when the user asks about converting an app to Rspack, asks about a build plugin's Rspack replacement, or asks about CI/Docker errors after upgrading. For setup and rspack.config.js helpers, use meteor-modern-build-stack instead.

  ```bash
  npx skills add meteor/agent-skills --skill migrate-to-rspack
  ```

### Ops

- **`meteor-deployment`**: Use when deploying a Meteor 3 application. Triggers on meteor build, meteor deploy, Galaxy, DEPLOY_HOSTNAME, Docker, Kubernetes, settings.json, METEOR_SETTINGS, MONGO_URL, MONGO_OPLOG_URL, ROOT_URL, PORT, BIND_IP, MAIL_URL, hot code push, --architecture os.linux.x86_64, --server-only, Node.js version mismatch (Meteor 3.3 = Node 20, 3.4 = Node 22, 3.5 = Node 24). Use this skill when the user asks about shipping the app, asks about production config, or asks about containerizing.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-deployment
  ```

### Security

- **`meteor-security`**: Use when auditing or hardening a Meteor 3 application. Triggers on missing check() on method arguments, missing this.userId guards on publications, browser-policy CSP, DDPRateLimiter rules, oauth-encryption via Accounts.config oauthSecretKey, audit-argument-checks, allow/deny legacy patterns, BrowserPolicy.content.disallowInlineScripts, BrowserPolicy.framing.disallow. Use this skill when the user asks about hardening, asks about a security review, or asks about CSP for a third-party script (Stripe, Google Maps, fonts).

  ```bash
  npx skills add meteor/agent-skills --skill meteor-security
  ```

### Testing

- **`meteor-testing`**: Use when setting up or debugging tests in a Meteor 3 app. Triggers on meteortesting:mocha, --driver-package, TEST_WATCH, TEST_BROWSER_DRIVER, Meteor.server.method_handlers, Meteor.server.publish_handlers, DDP.connect, --full-app integration mode, sinon, async test signatures, Playwright/Cypress E2E. Use this skill when the user asks about test runners, asks about testing publications, or asks about Jest vs Mocha in Meteor.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-testing
  ```
<!-- SKILLS:END -->

## Bundles

Install a curated group of skills with one command.

<!-- BUNDLES:BEGIN -->
### `essentials`

```bash
npx skills add meteor/agent-skills --skill migrate-to-meteor-3 --skill meteor-modern-build-stack --skill meteor-methods --skill meteor-pubsub --skill meteor-mongo-minimongo --skill meteor-security
```

Or via `bundles.json`:

```bash
npx skills add meteor/agent-skills \
  $(curl -sf https://raw.githubusercontent.com/meteor/agent-skills/main/bundles.json \
    | jq -r '.bundles["essentials"] | map("--skill " + .) | join(" ")')
```

### `migration`

```bash
npx skills add meteor/agent-skills --skill migrate-to-meteor-3 --skill migrate-to-rspack
```

Or via `bundles.json`:

```bash
npx skills add meteor/agent-skills \
  $(curl -sf https://raw.githubusercontent.com/meteor/agent-skills/main/bundles.json \
    | jq -r '.bundles["migration"] | map("--skill " + .) | join(" ")')
```

### `fullstack`

```bash
npx skills add meteor/agent-skills --skill meteor-methods --skill meteor-pubsub --skill meteor-mongo-minimongo --skill meteor-accounts --skill meteor-security --skill meteor-testing
```

Or via `bundles.json`:

```bash
npx skills add meteor/agent-skills \
  $(curl -sf https://raw.githubusercontent.com/meteor/agent-skills/main/bundles.json \
    | jq -r '.bundles["fullstack"] | map("--skill " + .) | join(" ")')
```

### `ops`

```bash
npx skills add meteor/agent-skills --skill meteor-deployment
```

Or via `bundles.json`:

```bash
npx skills add meteor/agent-skills \
  $(curl -sf https://raw.githubusercontent.com/meteor/agent-skills/main/bundles.json \
    | jq -r '.bundles["ops"] | map("--skill " + .) | join(" ")')
```
<!-- BUNDLES:END -->

## Manual install

For users who cannot or do not want to run `npx skills add`:

1. Open the [latest release](https://github.com/meteor/agent-skills/releases/latest).
2. Download the `.zip` for the skill you want, e.g. `migrate-to-meteor-3.zip`.
3. Unzip into your agent's skills directory:

   ```bash
   # Claude Code (project)
   mkdir -p .claude/skills/migrate-to-meteor-3
   unzip ~/Downloads/migrate-to-meteor-3.zip -d .claude/skills/migrate-to-meteor-3

   # Claude Code (global)
   mkdir -p ~/.claude/skills/migrate-to-meteor-3
   unzip ~/Downloads/migrate-to-meteor-3.zip -d ~/.claude/skills/migrate-to-meteor-3
   ```

Other agents follow the same pattern with their own skills directory (for
example `.cursor/skills/`, `.codex/skills/`).

## Contributing

See [`AGENTS.md`](./AGENTS.md) and [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

MIT
