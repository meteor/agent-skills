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
### Migration

- **`migrate-to-meteor-3`**: Use when migrating a Meteor 2.x application to
  Meteor 3.x. Covers async rewrites, the module system and implicit-global
  trap, client reactivity inside async code, publication cursor internals,
  iterators that contain `await`, and Atmosphere package triage.

  ```bash
  npx skills add meteor/agent-skills --skill migrate-to-meteor-3
  ```

- **`migrate-to-rspack`**: Use when converting an existing Meteor 3 app to
  the Rspack bundler integration. Covers entry points, nested-import
  cleanup, build-plugin replacements (SCSS/Less/Svelte/CoffeeScript),
  default-import interop, and CI/Docker `meteor update --npm`.

  ```bash
  npx skills add meteor/agent-skills --skill migrate-to-rspack
  ```

### Build

- **`meteor-modern-build-stack`**: Use when enabling or tuning the modern
  build stack: SWC transpiler, SWC minifier, `@parcel/watcher`,
  `.meteorignore`, and the Rspack bundler integration. Covers
  `"modern": true`, `.swcrc`, and `rspack.config.js` helpers.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-modern-build-stack
  ```

### Data

- **`meteor-methods`**: Use when authoring or debugging Meteor methods.
  Covers `check()` validation, optimistic stubs, `DDPRateLimiter`, and
  `Meteor.Error` shape.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-methods
  ```

- **`meteor-pubsub`**: Use when authoring or debugging publications and
  subscriptions. Covers `this.userId` filters, publication strategies, and
  the low-level publish API for async joins.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-pubsub
  ```

- **`meteor-mongo-minimongo`**: Use when writing Mongo queries on the server
  or Minimongo on the client. Covers async server APIs, sync Minimongo,
  indexes, selectors, modifiers, and projections.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-mongo-minimongo
  ```

### Auth

- **`meteor-accounts`**: Use when wiring up authentication.
  Covers `accounts-password`, OAuth provider configuration, 2FA, and
  HttpOnly-cookie token storage.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-accounts
  ```

### Security

- **`meteor-security`**: Use when auditing or hardening a Meteor 3 app.
  Covers method and publication guards, `browser-policy` CSP recipes,
  rate limiting, and `oauth-encryption`.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-security
  ```

### Testing

- **`meteor-testing`**: Use when setting up tests with
  `meteortesting:mocha`. Covers method and publication handler tests,
  `DDP.connect` in `--full-app` mode, and CI scripts.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-testing
  ```

### Ops

- **`meteor-deployment`**: Use when deploying a Meteor 3 app. Covers
  `meteor build`, Galaxy, Docker, env vars, `settings.json`, and
  Meteor-Node version pairing.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-deployment
  ```
<!-- SKILLS:END -->

## Bundles

Coming in plan 06.

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
