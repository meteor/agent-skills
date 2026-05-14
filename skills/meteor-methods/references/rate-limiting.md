# `DDPRateLimiter.addRule`

`DDPRateLimiter.addRule(matcher, n, ms)` rejects requests that exceed `n`
matches in `ms` milliseconds.

## Matcher shape

```text
{
  type: "method" | "subscription",
  name: string | RegExp | (name) => boolean,
  userId: (userId) => boolean,
  clientAddress: (addr) => boolean,
  connectionId: (id) => boolean,
}
```

(Schema notation, not executable JavaScript.)

Any subset of keys is allowed. Missing keys match everything.

## Common patterns

```javascript
// Per-user method limit
DDPRateLimiter.addRule(
  { type: "method", name: "addItem", userId: (uid) => Boolean(uid) },
  5,
  10000,
);

// Per-IP login attempts
DDPRateLimiter.addRule(
  { type: "method", name: "login" },
  5,
  60000,
);

// All publications, per user
DDPRateLimiter.addRule(
  { type: "subscription", userId: (uid) => Boolean(uid) },
  100,
  60000,
);
```

## Removing a rule

`addRule` returns an id. Pass it to `removeRule` to drop the limit (useful
for tests).

```javascript
const ruleId = DDPRateLimiter.addRule(
  { type: "method", name: "addItem" },
  5,
  10000,
);

// later, e.g. in a test teardown
DDPRateLimiter.removeRule(ruleId);
```

The default login rule shipped with `accounts-base` is removed by
`Accounts.removeDefaultRateLimit()`.

## Custom error message

```javascript
const ruleId = DDPRateLimiter.addRule(rule, 1, 60000);
DDPRateLimiter.setErrorMessageOnRule(
  ruleId,
  (data) => `Slow down. Try again in ${Math.ceil(data.timeToReset / 1000)}s.`,
);
```

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/api/DDPRateLimiter.md
