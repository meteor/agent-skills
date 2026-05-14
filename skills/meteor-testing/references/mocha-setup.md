# `meteortesting:mocha` setup

## Install

```bash
meteor add meteortesting:mocha
meteor npm install --save-dev @types/mocha
```

## Env vars

| Var                    | Purpose                                                              |
|------------------------|----------------------------------------------------------------------|
| `TEST_WATCH=1`         | Re-run on file change. Use in dev.                                   |
| `TEST_BROWSER_DRIVER`  | Run client tests in a headless browser. `puppeteer`, `playwright`.   |
| `TEST_SERVER=0`        | Skip server tests.                                                   |
| `TEST_CLIENT=0`        | Skip client tests.                                                   |
| `MONGO_URL`            | External Mongo for tests (e.g. `mongodb://localhost:27017/test`).    |

## Scripts

```json
{
  "scripts": {
    "test": "TEST_WATCH=1 meteor test --driver-package meteortesting:mocha",
    "test:once": "meteor test --once --driver-package meteortesting:mocha",
    "test:ci": "TEST_BROWSER_DRIVER=puppeteer meteor test --once --driver-package meteortesting:mocha",
    "test:full": "meteor test --full-app --driver-package meteortesting:mocha"
  }
}
```

`--once`: exit after the first run (CI). Without it, the runner stays
alive and re-runs on file change.

`--full-app`: runs the whole app plus tests. Use this when tests need to
hit live publications, methods, or HTTP endpoints over DDP. Server and
client tests both run; you can `DDP.connect(Meteor.absoluteUrl())` from a
test file.

## GitHub Actions example

```yaml
name: test

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongo:
        image: mongo:7
        ports: ["27017:27017"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }

      - name: Install Meteor
        run: curl https://install.meteor.com/ | sh

      - run: meteor npm ci

      - name: Run tests
        run: |
          TEST_BROWSER_DRIVER=puppeteer MONGO_URL=mongodb://localhost:27017/test \
          meteor test --once --driver-package meteortesting:mocha
```

Node version must match the bundled Node.js for the Meteor version (3.3:
Node 20, 3.4: Node 22, 3.5: Node 24).

## Test discovery

- `*.test.js`, `*.tests.js`, `*.spec.js`.
- `*.app-test.js` (loaded only in `--full-app` mode).
- Files under `tests/`.

Server-only modules stay server-only when imported from tests. Client
tests run in a browser instance the driver spawns.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/tutorials/testing/testing.md
