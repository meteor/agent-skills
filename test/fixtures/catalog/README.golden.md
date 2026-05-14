# Test README

Preamble that the generator must not touch.

<!-- SKILLS:BEGIN -->
### Auth

- **`meteor-bar`**: Fixture tagline for the catalog generator (bar).

  ```bash
  npx skills add meteor/agent-skills --skill meteor-bar
  ```

### Data

- **`meteor-foo`**: Fixture tagline for the catalog generator (foo).

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
