# meteor/agent-skills

Agent Skills for AI assistants helping developers build, debug, migrate, and operate **Meteor 3 applications**.

> Status: bootstrapping. The first public skill ships in the next release. See the proposal repo for the roadmap.

## Install

The open `skills` CLI installs skills into your local agent (Claude Code, Cursor, Codex, Copilot, Gemini CLI, OpenCode, and 40+ others).

```bash
# all skills (interactive picker)
npx skills add meteor/agent-skills

# one skill
npx skills add meteor/agent-skills --skill meteor-async-migration

# every skill, non-interactive
npx skills add meteor/agent-skills --all
```

## Catalog

<!-- SKILLS:BEGIN -->
### Migration

- **`meteor-async-migration`**: Use when migrating Meteor 2.x to Meteor 3.x.
  Covers `callAsync`, `*Async` Mongo methods, removed Fibers helpers, and the
  common errors after upgrade.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-async-migration
  ```
<!-- SKILLS:END -->

## Bundles

Coming in plan 06.

## Manual install

Coming in plan 03.

## Contributing

See [`AGENTS.md`](./AGENTS.md) and [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

MIT
