---
name: meteor-deployment
description: >
  Use when deploying a Meteor 3 application. Triggers on meteor build,
  meteor deploy, Galaxy, DEPLOY_HOSTNAME, Docker, Kubernetes,
  settings.json, METEOR_SETTINGS, MONGO_URL, MONGO_OPLOG_URL, ROOT_URL,
  PORT, BIND_IP, MAIL_URL, hot code push, --architecture os.linux.x86_64,
  --server-only, Node.js version mismatch (Meteor 3.3 = Node 20, 3.4 =
  Node 22, 3.5 = Node 24). Use this skill when the user asks about
  shipping the app, asks about production config, or asks about
  containerizing.
metadata:
  author: meteor
  version: "0.1.0"
  kind: knowledge
  meteor: ">=3.0"
  area: ops
  bundle: ["ops"]
  docs_synced_at: "2026-05-14"
license: MIT
---

# Meteor deployment

`meteor build` produces a self-contained Node bundle that runs anywhere
the matching Node.js version runs. Galaxy is the first-party host;
Docker / Kubernetes / SSH-to-a-Node-host all work too.

Match the Node version to the bundled Meteor Node:

| Meteor  | Node |
|---------|------|
| 3.3     | 20   |
| 3.4     | 22   |
| 3.5     | 24   |

Mismatch causes runtime errors. Run `meteor node -v` to confirm.

## Decision flow

1. Galaxy? `meteor deploy <app>.meteorapp.com --settings settings.json`.
2. Docker / Kubernetes? `meteor build --directory ./build --server-only`
   for Linux-on-Linux, or `--architecture os.linux.x86_64` cross-build.
3. SSH to a Node host? Same `meteor build`, scp the bundle, install prod
   deps under `bundle/programs/server`, run `node main.js`.
4. Vercel / Netlify / serverless? Not supported. Meteor needs a
   long-lived Node process with a WebSocket.

## Required environment

| Var               | Purpose                                                      |
|-------------------|--------------------------------------------------------------|
| `ROOT_URL`        | Absolute external URL (e.g. `https://app.example.com`).      |
| `MONGO_URL`       | `mongodb://...` connection string.                           |
| `MONGO_OPLOG_URL` | Mongo replica oplog (self-hosted; Atlas uses change streams).|
| `PORT`            | Listen port. Default 3000.                                   |
| `BIND_IP`         | Network interface. Default 0.0.0.0.                          |
| `METEOR_SETTINGS` | JSON; populates `Meteor.settings`.                           |
| `MAIL_URL`        | SMTP for `Email.send` and account emails.                    |

`ROOT_URL` is the external URL the browser sees, not the cluster-internal
service URL. OAuth redirects, `Meteor.absoluteUrl`, and CSP all rely on
it.

## `settings.json`

```json
{
  "public": { "appName": "My App", "stripePublishableKey": "pk_live_..." },
  "stripeSecretKey": "sk_live_...",
  "oauthSecretKey": "16-byte-base64==",
  "mailgun": { "apiKey": "..." }
}
```

Top-level keys: server only. `public` subtree: shipped to the client.

Load:

```bash
# dev
meteor run --settings settings.json

# production
METEOR_SETTINGS=$(cat settings.json) node bundle/main.js
```

## Galaxy

```bash
DEPLOY_HOSTNAME=us-east-1.galaxy-deploy.meteor.com \
  meteor deploy app.example.com --settings settings.json
```

Other Galaxy regions have their own `DEPLOY_HOSTNAME`. Galaxy reads
`MONGO_URL` and the rest from its container config.

## Docker

See `references/docker.md` for a working multi-stage Dockerfile. Build
the bundle in one stage, install server deps and run in a smaller one.
`--server-only` skips the client bundle if you ship to a separate CDN.

## Hot code push

`meteor build` ships the `autoupdate` package by default. When you deploy
a new client bundle, long-lived browser sessions pick it up; the
`hot-code-push` package additionally swaps modules at runtime when the
change is HMR-compatible.

To disable HCP for a specific environment, remove `autoupdate` from
`.meteor/packages` or set `Meteor.disableClientResourceFetch = true`.

## Anti-patterns

- Commit `settings.json` with production secrets. Use a CI secret store
  or env vars; load with `METEOR_SETTINGS=$(cat ...)` at startup.
- Set `ROOT_URL` to the internal Kubernetes service URL. Use the
  external HTTPS URL or OAuth redirects and `Meteor.absoluteUrl` break.
- Run a Node version that does not match the bundled Meteor Node. Always
  check `meteor node -v`.
- Build on the wrong architecture. M-series Mac developers building for
  x86_64 Linux must pass `--architecture os.linux.x86_64`.
- Bundle the source tree into the Docker image alongside the built
  bundle. Use multi-stage; the runtime image holds only `bundle/`.

## See also

- `references/settings-and-env.md`
- `references/docker.md`
- `references/eval-cases.md`
