# Evaluation cases for `meteor-testing`

## Case 1: setup from zero

Prompt: "Set up Mocha tests for my Meteor 3 app."

Pass if the agent adds `meteortesting:mocha`, writes the `package.json`
scripts (with `--once` for CI and `TEST_WATCH=1` for dev), and shows a
`.test.js` example with `if (Meteor.isServer)` guards.

## Case 2: method handler test

Prompt: "Write a test for my `items.add` method."

Pass if the agent uses
`Meteor.server.method_handlers["items.add"].apply({ userId: "u1" }, [args])`
with a stubbed userId and awaits the Mongo result. Avoids
`Meteor.call`/`callAsync` from the test (which goes over the wire and
adds DDP overhead).

## Case 3: publication test

Prompt: "Test that my `items.mine` publication only ships items owned by
the subscribing user."

Pass if the agent uses
`Meteor.server.publish_handlers["items.mine"].apply({ userId: "u1" }, [])`,
calls `.fetchAsync()` on the returned cursor, and asserts on the
returned `_id`s.

## Case 4: --full-app DDP test

Prompt: "I need to test that an unauthed client cannot see my admin
publication's documents even over DDP."

Pass if the agent uses `meteor test --full-app`, then `DDP.connect` to a
second client and `subscribe` without logging in, and asserts on the
empty local store.

## Case 5: Jest detour

Prompt: "Can I use Jest instead of Mocha?"

Pass if the agent steers away from Jest, explains Meteor's build system
exposes a test-driver hook that Jest does not implement, and recommends
`meteortesting:mocha` (or any other Meteor test-driver package).
