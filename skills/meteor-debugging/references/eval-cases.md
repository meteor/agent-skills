# Evaluation cases for `meteor-debugging`

## Case 1: server startup crash

Prompt: "My Meteor 3.4 server crashes while startup imports register methods.
How do I stop before startup code executes?"

Pass if the agent selects `meteor run --inspect-brk`, explains that it pauses
the spawned server after code loads and before execution, and distinguishes the
server from the build tool. Fail if it recommends the superseded
`meteor debug` command or exposes the inspector publicly.

## Case 2: concurrent method failure

Prompt: "`orders.submit` fails only when two requests overlap. Add whatever
debugging you think is useful. The arguments contain payment tokens."

Pass if the agent adds a small number of request-correlated observations at
the uncertain method boundaries, logs selected redacted fields and event
order, and reproduces before fixing. Fail if it logs tokens, complete args, or
mixes speculative logic changes into the diagnostic patch.

## Case 3: stale client with correct Mongo data

Prompt: "The document exists in server Mongo, but my Meteor React screen stays
empty. Should I rewrite the query?"

Pass if the agent traces server query, publication output, DDP, subscription
readiness, Minimongo, reactive query, and render to find the first divergence.
It routes the confirmed repair to pub/sub, Mongo, or React. Fail if it assumes
server presence proves client publication or changes the query immediately.

## Case 4: DDP reconnect on Meteor 3.4

Prompt: "Our Meteor 3.4 app reconnects repeatedly behind a proxy. Switch it to
the new pluggable DDP transport to debug it."

Pass if the agent says transport selection is a Meteor 3.5+ branch, keeps the
3.4 app on evidence gathering, and inspects browser WS, close timing, proxy
upgrade, and idle timeout before changing deployment. Fail if it supplies 3.5+
transport settings to Meteor 3.4.

## Case 5: DDP transport on Meteor 3.5

Prompt: "Our Meteor 3.5 app has a measured WebSocket problem. How can I verify
whether the configured DDP transport and proxy path match?"

Pass if the agent inspects the resolved transport, server output, browser WS
shape, proxy upgrade, and representative networks. It treats a transport
change as a measured experiment and routes proxy repair to deployment.

## Case 6: slow build before Meteor 3.2

Prompt: "A Meteor 3.1 build suddenly became slow. Can I use
`meteor profile --build`?"

Pass if the agent says `meteor profile` begins in Meteor 3.2, uses
`METEOR_PROFILE=1 meteor` on 3.1, compares equivalent warm or cold conditions,
and changes one variable. Fail if it gives the 3.2+ command without a floor.

## Case 7: current build profile

Prompt: "Profile a slow Meteor 3.2 production build and tell me whether the
server inspector will show the slow bundler step."

Pass if the agent uses `meteor profile --build`, explains that the server
inspector targets the spawned server rather than the build tool, and avoids
claiming that one profile proves causality.

## Case 8: known Rspack HMR boundary

Prompt: "The server works, but Rspack HMR stopped emitting client updates.
What evidence should I collect before editing `rspack.config.js`?"

Pass if the agent checks exact integration versions, browser and terminal HMR
output, Rspack `stats` and `infrastructureLogging`, and the first failing build
stage, then routes the repair to `meteor-modern-build-stack`. Fail if it edits
generated output or stacks cache, heap, and config changes.

## Case 9: temporary `.only`

Prompt: "One `meteortesting:mocha` test fails. Put `.only` on it so we can
iterate, and leave it there because the focused run passes."

Pass if the agent may use `it.only` temporarily after checking runner and
parallel-mode support, but removes it, scans for focus markers, and runs the
affected suite. Fail if it leaves `.only`, invents an ancestor-suite rule, or
treats the isolated pass as complete.

## Case 10: passes alone, fails in suite

Prompt: "My Meteor test passes with `it.only` but fails in the full suite.
Should I increase its timeout?"

Pass if the agent investigates database and Minimongo state, hooks, globals,
fake timers, stubs, DDP connections, order, and workers. It runs the relevant
tests in both orders and removes `.only`. Fail if it only raises the timeout.

## Case 11: subscription test sleep

Prompt: "This test waits two seconds after subscribing and still flakes in CI.
Make the wait reliable."

Pass if the agent replaces the guessed delay with reactive `sub.ready()` or
the exact observable result plus a diagnostic timeout. Fail if it increases
the delay or uses browser `networkidle` as subscription readiness.

## Case 12: existing Playwright failure

Prompt: "Our Playwright checkout test times out only in WebKit. Fix it by
adding a five-second sleep."

Pass if the agent reads the report and trace, narrows the file, line, WebKit
project, and worker count, and classifies product, fixture, locator, engine, or
environment cause. Fail if it adds the sleep or broadens the selector without
evidence.

## Case 13: ad hoc `playwright-cli`

Prompt: "There is no E2E test, but a local Meteor page stops updating after a
click. Use `playwright-cli` to inspect it."

Pass if the agent first checks whether the CLI is available, then uses a local
session to collect snapshot, console, network, and a focused trace. It asks for
authority before installation or browser downloads and does not scaffold tests
automatically. Fail if it uses the CLI as a server debugger or stores a live
production session.

## Case 14: production incident

Prompt: "Production has intermittent method timeouts. Open the Node inspector
to the Internet and deploy a debug build so we can pause requests."

Pass if the agent refuses those unsafe steps, starts with logs, metrics,
deployment events, DDP or proxy evidence, and a release diff, and reproduces in
staging. Any live instrumentation needs explicit authority, redaction,
sampling, rollback, and a stopping condition.

## Case 15: mobile HCP

Prompt: "Our Cordova app sees a new deployment but keeps running the previous
client. The desktop browser updates correctly."

Pass if the agent collects device logs, mobile server URL, version hashes,
download, compatibility, switch, and reload evidence. It recognizes native or
plugin changes cannot ship through HCP and routes a confirmed native failure
to Android Studio or Xcode work.

## Case 16: test-authoring near miss

Prompt: "Set up Mocha in a new Meteor 3 app and write tests for a method and a
publication."

Pass if the agent routes to `meteor-testing`. Fail if it treats a test setup
and authoring request as an unknown debugging investigation.

## Case 17: generic near miss

Prompt: "A pure Node utility test fails on date formatting. It imports no
Meteor code and does not run through the Meteor build tool."

Pass if the agent uses general Node and test-runner debugging. Fail if it
loads Meteor inspectors, DDP, Minimongo, or Meteor test-driver guidance.

## Case 18: execution filter does not isolate module loading

Prompt: "Our Meteor app configures `meteor.testModule`, and `MOCHA_GREP`
selects the right test. Why does setup from an unrelated imported test module
still run, and how should I focus the investigation?"

Pass if the agent distinguishes registered-test execution from Meteor module
loading, inspects the configured entry module and its imports, and narrows the
import graph only if load-time code or hooks cause the measured interference.
It preserves and restores the normal graph, removes any `.only`, and reruns the
affected suite. Fail if it claims `MOCHA_GREP` or `.only` prevents unrelated
modules from evaluating, requires `.only` on every ancestor, or carries in
project-specific paths and commands.
