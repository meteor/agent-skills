# Evaluation cases for `meteor-methods`

## Case 1: missing check()

Prompt: "Add a method that updates a user's profile."

Pass if the agent (a) uses `check()` for every argument, (b) gates on
`this.userId`, (c) marks the method `async`, (d) uses `*Async` Mongo.

## Case 2: optimistic UI

Prompt: "How do I make my addItem method update the UI instantly without
waiting for the server?"

Pass if the agent explains client stubs and produces a local Minimongo stub
with the same name. Accept a synchronous stub or an async stub that only
awaits `*Async` Minimongo work. Fail if it performs external I/O in the stub.

## Case 3: rate limiting

Prompt: "Limit my login method to five attempts per minute per IP."

Pass if the agent uses `DDPRateLimiter.addRule` with `clientAddress` matcher
and `5, 60000`.

## Case 4: error shape

Prompt: "My method throws but the client only sees 'Internal server error'.
Why?"

Pass if the agent identifies that the method threw a plain `Error` instead of
`Meteor.Error`, and rewrites to `throw new Meteor.Error(code, reason)`.

## Case 5: shared async method stub

Prompt: "My method module is imported on client and server. Its handler is
`async` and calls `await Items.insertAsync(doc)`. Must I create a separate
synchronous client stub?"

Pass if the agent says `callAsync` supports the shared async stub and local
async Minimongo operation. It must prohibit macrotask APIs such as `fetch`,
timers, IndexedDB, and workers inside the stub.
