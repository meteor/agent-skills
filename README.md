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

- **`meteor-accounts`**: Wire up authentication in Meteor 3 (accounts-password, OAuth providers, 2FA, passwordless, email verification).

  ```bash
  npx skills add meteor/agent-skills --skill meteor-accounts
  ```

### Build

- **`meteor-modern-build-stack`**: Configure the Meteor 3 modern build stack (SWC transpiler/minifier, `@parcel/watcher`, web-arch skipping, Rspack integration).

  ```bash
  npx skills add meteor/agent-skills --skill meteor-modern-build-stack
  ```

### Data

- **`meteor-methods`**: Author and debug Meteor methods (argument `check()`, optimistic stubs, latency compensation, `Meteor.Error`, `DDPRateLimiter`).

  ```bash
  npx skills add meteor/agent-skills --skill meteor-methods
  ```

- **`meteor-mongo-minimongo`**: Write and debug Mongo queries in Meteor 3 (server async vs Minimongo, oplog vs change streams, indexes, selectors, modifiers).

  ```bash
  npx skills add meteor/agent-skills --skill meteor-mongo-minimongo
  ```

- **`meteor-pubsub`**: Author and debug publications/subscriptions (publish strategies, low-level `added/changed/removed`, authorization, reactive joins).

  ```bash
  npx skills add meteor/agent-skills --skill meteor-pubsub
  ```

### Migration

- **`migrate-to-meteor-3`**: Migrate a Meteor 2.x app to 3.x (`callAsync`, async Mongo, Fibers removal, Blaze reactivity, Express 5, Atmosphere resolution).

  ```bash
  npx skills add meteor/agent-skills --skill migrate-to-meteor-3
  ```

- **`migrate-to-rspack`**: Migrate an existing Meteor 3 app to the Rspack bundler integration (`mainModule`, replacing legacy build plugins with loaders).

  ```bash
  npx skills add meteor/agent-skills --skill migrate-to-rspack
  ```

### Ops

- **`meteor-deployment`**: Ship Meteor 3 apps to production (meteor build, Galaxy, Docker/Kubernetes, settings.json, env vars, Node version matching).

  ```bash
  npx skills add meteor/agent-skills --skill meteor-deployment
  ```

### Security

- **`meteor-security`**: Audit and harden Meteor 3 apps (`check()` coverage, `this.userId` guards, browser-policy CSP, rate limits, oauth-encryption).

  ```bash
  npx skills add meteor/agent-skills --skill meteor-security
  ```

### Testing

- **`meteor-testing`**: Set up and debug tests (`meteortesting:mocha`, async test signatures, testing methods/publications, Playwright/Cypress E2E).

  ```bash
  npx skills add meteor/agent-skills --skill meteor-testing
  ```
<!-- SKILLS:END -->

## Bundles

Install a curated group of skills with one command.

<!-- BUNDLES:BEGIN -->
### `essentials`

```bash
npx skills add meteor/agent-skills --skill meteor-modern-build-stack --skill meteor-methods --skill meteor-pubsub --skill meteor-mongo-minimongo --skill meteor-security
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
