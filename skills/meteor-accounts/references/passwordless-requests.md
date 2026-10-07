# Passwordless request validation and errors

For Meteor 3.6's hardened pairing (`accounts-passwordless@3.1.2-rc360.0` with
`accounts-base@3.4.0-rc360.0` for the RC), inspect both resolved packages before
selecting this behavior. Do not assume older packages provide the same schema
checks or default token-request limiter.

`Accounts.requestLoginTokenForUser` is a client callback API, not a Promise API:

```javascript
function requestToken(email) {
  return new Promise((resolve, reject) => {
    Accounts.requestLoginTokenForUser({
      selector: { email },
      userData: {},
      options: { userCreationDisabled: true },
    }, (error) => error ? reject(error) : resolve());
  });
}

try {
  await requestToken(email);
} catch (error) {
  if (error.error === "too-many-requests") {
    // Show a cooldown instead of immediately resubmitting.
  } else {
    // Report validation or delivery failure without logging credentials.
  }
}
```

The public wrapper accepts its documented string selector convenience and
normalizes it. A direct DDP `requestLoginTokenForUser` payload must use an
object selector with exactly one nonempty string `id`, `username`, or `email`.
Operator selectors, multiple keys, unsupported keys and empty values are
rejected before user lookup. Keep provided `userData` and `options` as objects;
core validation checks their container shape and the named lookup fields in
`userData`. Use a boolean `options.userCreationDisabled` for the intended signup
policy. Preserve supported `options.extra` data passed to token URLs/email
templates; it is not a boolean-only option whitelist. Application hooks still
validate custom data. A malformed request produces a 400 error, not delivery.

With the hardened `accounts-base` pairing, the default Accounts rule includes
`requestLoginTokenForUser`: five calls per ten seconds, bucketed by method and
DDP connection. Keep it enabled. Consider additional controls for repeated
requests across connections or addresses from evidence; do not blindly stack
duplicate rules or disable the default to fix an error. The callback reports
rate errors; immediate retry loops increase abuse and do not deliver a token.

After a successful request, use `Meteor.passwordlessLoginWithToken` with the
matching selector and received token. `userCreationDisabled: true` prevents
unknown addresses from creating users; configure the sender/template before
testing delivery. Earlier releases can keep their existing callback flow and
explicit abuse controls, or upgrade the coordinated packages.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/packages/accounts-passwordless.md
