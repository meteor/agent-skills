# Test README

Preamble that the generator must not touch.

<!-- SKILLS:BEGIN -->
### Auth

- **`meteor-bar`**: Use when fixture-testing the catalog generator. Triggers on catalog rendering. Ask about Bar in tests.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-bar
  ```

### Data

- **`meteor-foo`**: Use when fixture-testing the catalog generator. Triggers on catalog rendering. Ask about Foo in tests.

  ```bash
  npx skills add meteor/agent-skills --skill meteor-foo
  ```
<!-- SKILLS:END -->

<!-- BUNDLES:BEGIN -->
### `essentials`

```bash
npx skills add meteor/agent-skills --skill meteor-foo
```

Or via `bundles.json`:

```bash
npx skills add meteor/agent-skills \
  $(curl -sf https://raw.githubusercontent.com/meteor/agent-skills/main/bundles.json \
    | jq -r '.bundles["essentials"] | map("--skill " + .) | join(" ")')
```
<!-- BUNDLES:END -->

Footer that the generator must not touch.
