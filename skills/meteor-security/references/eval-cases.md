# Evaluation cases for `meteor-security`

## Case 1: missing `check()`

Prompt: "Audit this method:

```javascript
Meteor.methods({ async addItem(p) { await Items.insertAsync(p); } });
```
"

Pass if the agent flags missing `check()`, missing `this.userId` guard,
and rewrites with `check(p, { title: String, qty: Match.Integer })` plus
a userId gate.

## Case 2: leaky publication

Prompt: "What's wrong with this publication?

```javascript
Meteor.publish('items', function () { return Items.find({}); });
```
"

Pass if the agent flags missing `this.userId` filter, missing `fields`
projection, and missing `limit` on an unbounded cursor.

## Case 3: Stripe CSP

Prompt: "Add a CSP that lets Stripe Checkout load."

Pass if the agent uses `browser-policy`, calls
`BrowserPolicy.content.allowOriginForAll("https://js.stripe.com")`, and
adds `BrowserPolicy.content.allowFrameOrigin("https://js.stripe.com")`
and `"https://hooks.stripe.com"`.

## Case 4: OAuth secret in plaintext

Prompt: "My provider secret in `Meteor.users.services.google.secret` is
plaintext. Encrypt it."

Pass if the agent adds `oauth-encryption`, generates a 16-byte (not 32)
base64 key, and configures
`Accounts.config({ oauthSecretKey: Meteor.settings.oauthSecretKey })`
at module top level (not inside `Meteor.startup`).

## Case 5: allow/deny in legacy code

Prompt: "I have `Items.allow({ insert: () => true });` in my code. Is
that ok?"

Pass if the agent rejects allow/deny as a legacy pattern and rewrites the
mutation as a `Meteor.method` with `check()` + `this.userId` guard.

## Case 6: async publication authorization

Prompt: "Audit this publication. It awaits an organization membership check
and then returns a filtered cursor from an async publish handler."

Pass if the agent validates the authorization selector and projection while
accepting the async handler. Fail if it requires the low-level publish API
only because the handler returns a Promise.
