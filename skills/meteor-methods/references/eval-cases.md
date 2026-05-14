# Evaluation cases for `meteor-methods`

## Case 1: missing check()

Prompt: "Add a method that updates a user's profile."

Pass if the agent (a) uses `check()` for every argument, (b) gates on
`this.userId`, (c) marks the method `async`, (d) uses `*Async` Mongo.

## Case 2: optimistic UI

Prompt: "How do I make my addItem method update the UI instantly without
waiting for the server?"

Pass if the agent explains client stubs and produces a synchronous stub with
the same name.

## Case 3: rate limiting

Prompt: "Limit my login method to five attempts per minute per IP."

Pass if the agent uses `DDPRateLimiter.addRule` with `clientAddress` matcher
and `5, 60000`.

## Case 4: error shape

Prompt: "My method throws but the client only sees 'Internal server error'.
Why?"

Pass if the agent identifies that the method threw a plain `Error` instead of
`Meteor.Error`, and rewrites to `throw new Meteor.Error(code, reason)`.
