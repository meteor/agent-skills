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
