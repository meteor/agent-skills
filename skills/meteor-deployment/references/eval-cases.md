# Evaluation cases for `meteor-deployment`

## Case 1: Galaxy deploy

Prompt: "Deploy my app to Galaxy at app.example.com using settings.json."

Pass if the agent runs
`DEPLOY_HOSTNAME=us-east-1.galaxy-deploy.meteor.com meteor deploy app.example.com --settings settings.json`,
and mentions Galaxy reads `MONGO_URL` from its container config.

## Case 2: Dockerize

Prompt: "Write a Dockerfile for my Meteor 3.4 app."

Pass if the agent produces a multi-stage Dockerfile using
`node:22-bookworm` (matching Meteor 3.4 bundled Node), runs
`meteor build --directory /build --server-only` in the builder, copies
only `/build/bundle` into the runtime image, runs
`(cd programs/server && npm ci --omit=dev)`, and exposes `PORT=3000`.
It must not claim that `--server-only` omits browser assets.

## Case 3: empty `Meteor.settings.public`

Prompt: "My production server has empty `Meteor.settings.public`.
Locally it works."

Pass if the agent identifies missing `METEOR_SETTINGS` env var (or
mis-mapped keys); fix is
`METEOR_SETTINGS="$(cat settings.json)" node main.js`.

## Case 4: OAuth redirect_uri_mismatch

Prompt: "After deploying behind a load balancer, Google OAuth returns
redirect_uri_mismatch."

Pass if the agent points at `ROOT_URL`: it must equal the public-facing
HTTPS URL the browser uses, not the internal Kubernetes service URL or
the LB's pod address. Also have the Google console list that exact URL.

## Case 5: Node version mismatch

Prompt: "On my server `node main.js` crashes with
`undefined symbol: node_module_register`."

Pass if the agent identifies the Node version mismatch (Meteor 3.0 uses Node
20, 3.1 through 3.4 use Node 22, and 3.5+ uses Node 24), and instructs running
`meteor node -v` to find the exact version, then deploying with the matching
`node:<N>-bookworm-slim` image.

## Case 6: HCP versus HMR

Prompt: "Can production `hot-module-replacement` swap my deployed JavaScript
without a page reload, and can I disable it with
`Meteor.disableClientResourceFetch`?"

Pass if the agent separates development HMR from production HCP, attributes
HCP to `autoupdate`, explains that JavaScript changes normally cause a hard
reload while stylesheet-only changes may update softly, and rejects the
nonexistent switch. Removing `autoupdate` is the supported HCP opt-out.

## Case 7: Atlas reactivity before Meteor 3.5

Prompt: "Our Meteor 3.4.1 app runs on Atlas without `MONGO_OPLOG_URL`. Is core
change-stream reactivity active automatically?"

Pass if the agent says core change streams begin in Meteor 3.5, so this app
polls unless it configures an oplog URL. It may recommend upgrading to 3.5+ or
configuring a compatible oplog, but must not infer support from Atlas hosting.
