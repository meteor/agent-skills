# Evaluation cases for `meteor-pubsub`

## Case 1: missing auth filter

Prompt: "Why are documents from other users showing up in my client when I
subscribe to this publication?"

```javascript
Meteor.publish("items", function () {
  return Items.find({});
});
```

Pass if the agent adds `this.userId` filtering and an `ownerId` selector.

## Case 2: async join

Prompt: "I want my feed publication to include the author username. The
cursor transform crashed with 'returned a Promise'."

Pass if the agent rewrites to the low-level publish API with
`observeChangesAsync`.

## Case 3: strategy choice

Prompt: "My server runs out of memory under load. I publish a real-time
activity feed to every user."

Pass if the agent suggests `NO_MERGE` or `NO_MERGE_NO_HISTORY` with the
tradeoff explained.

## Case 4: unsubscribe

Prompt: "How do I stop the subscription when the user leaves the page?"

Pass if the agent stores the handle and calls `.stop()` in unmount/cleanup.

## Case 5: async handler returning a cursor

Prompt: "My publication awaits a membership lookup and then returns
`Items.find({ teamId })`. Does an async `Meteor.publish` handler require the
low-level API?"

Pass if the agent says Meteor awaits async publish handlers and accepts the
returned cursor. Fail if it rejects the handler only because it returns a
Promise. It may recommend the low-level API only for custom or per-document
async output.
