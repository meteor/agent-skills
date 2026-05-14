---
name: meteor-accounts
description: >
  Use when wiring up authentication in a Meteor 3 app. Triggers on
  accounts-password, accounts-base, OAuth (Google, Facebook, GitHub, Apple,
  Twitter, Meetup, Weibo), accounts-2fa, accounts-passwordless,
  ServiceConfiguration.configurations.upsertAsync, Accounts.createUserAsync,
  Accounts.setPasswordAsync, Accounts.forgotPassword, Accounts.resetPassword,
  Accounts.verifyEmail, useHttpOnlyCookies, clientStorage,
  Meteor.loginWithPasswordAnd2faCode, email verification. Use this skill
  when the user asks about signups, signins, or asks about token storage
  vs HttpOnly cookies.
metadata:
  author: meteor
  version: "0.1.0"
  kind: knowledge
  meteor: ">=3.0"
  area: auth
  bundle: ["fullstack"]
  docs_synced_at: "2026-05-14"
license: MIT
---

# Meteor accounts

`accounts-base` plus a flavor package (`accounts-password`,
`accounts-google`, etc.). Meteor stores users in `Meteor.users` and ships
the client a resume token mapped to that document.

## Decision flow

1. Username + password? Add `accounts-password`.
2. Social login? Add `accounts-base` plus the provider package (e.g.
   `accounts-google`) and configure the service.
3. Magic-link? Add `accounts-passwordless`.
4. 2FA? Layer `accounts-2fa` on top of `accounts-password`.
5. Token storage on the client? Default is Web Storage. Meteor 3.3+
   supports an HttpOnly cookie flow; see the section below.

## Username + password

```javascript
// server/accounts.js
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";

Meteor.startup(() => {
  Accounts.config({
    forbidClientAccountCreation: true,
    sendVerificationEmail: true,
  });

  Accounts.emailTemplates.siteName = "My App";
  Accounts.emailTemplates.from = "no-reply@example.com";
});
```

The `from` address is required; Meteor 3.5+ logs a server warning if you
omit it.

```javascript
// client/signin.js (Meteor 3.5+)
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

async function signUp({ email, password }) {
  // Accounts.createUser is callback-shaped on the client; wrap it.
  await new Promise((resolve, reject) => {
    Accounts.createUser({ email, password }, (err) =>
      err ? reject(err) : resolve(),
    );
  });
}

async function signIn({ email, password }) {
  await Meteor.loginWithPasswordAsync(email, password);
}
```

`Meteor.loginWithPasswordAsync` was added in Meteor 3.5; on older 3.x use
the callback form of `Meteor.loginWithPassword`.

On the server use `await Accounts.createUserAsync(options)` and
`await Accounts.setPasswordAsync(userId, newPassword)`.

## HttpOnly cookies (Meteor 3.3+)

Default token storage is Web Storage. To move the resume token into an
HttpOnly cookie and keep the client tab in-memory only:

```javascript
// server
Meteor.startup(() => {
  Accounts.config({
    clientStorage: "none",
    useHttpOnlyCookies: true,
  });
});
```

```json
// settings.json (public; surfaces the same flags to the client)
{
  "public": {
    "packages": {
      "accounts": {
        "clientStorage": "none",
        "useHttpOnlyCookies": true
      }
    }
  }
}
```

After restart and login, `Meteor.loginToken*` no longer appears in
`localStorage`; the browser receives an HttpOnly `meteor_login_token`
cookie. Each tab keeps its own in-memory credentials.

## OAuth (Google example)

```javascript
// server/oauth.js
import { ServiceConfiguration } from "meteor/service-configuration";

await ServiceConfiguration.configurations.upsertAsync(
  { service: "google" },
  {
    $set: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
      loginStyle: "popup",
    },
  },
);
```

```javascript
// client
Meteor.loginWithGoogle(
  { requestPermissions: ["email", "profile"] },
  (err) => { if (err) console.error(err); },
);
```

`loginStyle: "redirect"` for mobile or environments without
`window.close` / `window.opener`. Each provider ships its own
`accounts-<service>` package: `accounts-google`, `accounts-github`,
`accounts-facebook`, `accounts-twitter`, `accounts-apple`,
`accounts-meetup`, `accounts-weibo`.

To encrypt OAuth secrets at rest, add `oauth-encryption` and pass
`oauthSecretKey` to `Accounts.config`. See `meteor-security` skill.

## Email verification and reset

```javascript
// client
Accounts.forgotPassword({ email }, (err) => { ... });

// reset page
Accounts.resetPassword(token, newPassword, (err) => { ... });

// verify email
Accounts.verifyEmail(token, (err) => { ... });
```

Customize the URL pattern that lands in the email:

```javascript
Accounts.urls.resetPassword = (token) =>
  Meteor.absoluteUrl(`reset/${token}`);
Accounts.urls.verifyEmail = (token) =>
  Meteor.absoluteUrl(`verify/${token}`);
```

Both setters accept async functions too (Meteor 3.x).

Customize the message:

```javascript
Accounts.emailTemplates.resetPassword.subject = () => "Reset your password";
Accounts.emailTemplates.resetPassword.text = (user, url) =>
  `Reset link: ${url}`;
```

## 2FA

`accounts-2fa` adds TOTP. The login flow:

1. Client calls `Meteor.loginWithPasswordAsync(user, password)`.
2. Server rejects with `error.error === 'no-2fa-code'`.
3. Client prompts for a code, retries with
   `Meteor.loginWithPasswordAnd2faCode(user, password, code, cb)`.

## Anti-patterns

- Store the OAuth secret in `Meteor.settings.public`. The client sees
  `public`. Put secrets at the top level of `settings.json`.
- Build a custom password hash. `accounts-password` uses bcrypt; trust it.
- Bypass `forbidClientAccountCreation` with a method that takes a
  password. Same risk.
- Run `Accounts.config({ ... })` inside a deferred path. Call it at top
  level or in `Meteor.startup`.

## See also

- `references/password-flows.md`
- `references/oauth-services.md`
- `references/eval-cases.md`
- For OAuth-secret encryption and CSP, see the `meteor-security` skill.
