# Password flows

## Forgot password (client)

```javascript
Accounts.forgotPassword({ email }, (err) => {
  if (err) console.error(err);
});
```

The server sends an email containing a single-use token-bearing URL. The
URL pattern is controlled by `Accounts.urls.resetPassword`; the message
template is controlled by `Accounts.emailTemplates.resetPassword.*`.

```javascript
Accounts.urls.resetPassword = (token, extraParams) =>
  Meteor.absoluteUrl(`reset/${token}`);

Accounts.emailTemplates.resetPassword.subject = () => "Reset your password";
Accounts.emailTemplates.resetPassword.from = () => "no-reply@example.com";
Accounts.emailTemplates.resetPassword.text = (user, url) =>
  `Click to reset: ${url}`;
```

`Accounts.urls.*` setters accept async functions in Meteor 3.x. A
template-specific `Accounts.emailTemplates.<name>.from` overrides the global
`Accounts.emailTemplates.from`; otherwise Meteor falls back to the global
value. Configure at least one effective sender. Meteor 3.5+ logs a warning
when it cannot resolve a `from` address.

## Reset password (client, on the reset page)

```javascript
const token = new URL(location.href).pathname.split("/").pop();
Accounts.resetPassword(token, newPassword, (err) => {
  if (err) console.error(err);
});
```

After success, the user is logged in.

## Change password (authenticated user)

```javascript
Accounts.changePassword(oldPassword, newPassword, (err) => {
  if (err) console.error(err);
});
```

## Verify email

The November security patches change verification-link lifetime and revocation:

| Meteor release | `accounts-base` | `accounts-password` |
|---|---|---|
| 3.4.4 | 3.2.2 | 3.2.5 |
| 3.5.5 | 3.3.2 | 3.3.1_2 |
| 3.6.1 | 3.4.1 | 3.3.3 |

Inspect resolved packages, not just a numeric comparison with one row:
earlier releases on another minor line can have higher package numbers
without these fixes. Earlier pairings reject these unknown `Accounts.config`
options and lack the same revocation behavior. Use a compatible patched
release before relying on them.

Links expire after three days by default. Configure a positive
`emailVerificationTokenExpirationInDays` on the server if the application's
policy needs another lifetime. A positive `emailVerificationTokenExpiration`
in milliseconds takes precedence when both are supplied. Zero/null are not
a documented way to disable this expiry.

Changing, resetting, enrolling or setting a password revokes outstanding
verification links. Request a new verification email for the current address
when needed. Do not extend the lifetime to recover a revoked token, restore
token fields, or mark the address verified to bypass a rejected link.

```javascript
Accounts.verifyEmail(token, (err) => {
  if (err) console.error(err);
});
```

The link is sent via `Accounts.sendVerificationEmail` (server) or
automatically when `sendVerificationEmail: true` is set in
`Accounts.config`. Customize the URL with `Accounts.urls.verifyEmail`.

With `accounts-password@3.3.2` (Meteor 3.6), verification consumes the token
and verifies its matching address in one conditional write. A concurrent
replay, replaced token or changed address can return an expired-link error.
This atomic fix does not give that original 3.6 pairing the later expiry
options or password-change revocation. Those require the patch pairs above.
Do not mark an email verified manually, retry with another address or assume
a failed callback means success. Request a fresh link for the current address.
Check earlier packages/backports before relying on this atomic behavior.

Email verification and login are separate outcomes: with 2FA enabled,
`2fa-enabled` can mean the email was verified but the user was not logged in.
Continue through the normal 2FA login flow; do not bypass it.

## Server APIs (async)

- `await Accounts.createUserAsync(options)`
- `await Accounts.setPasswordAsync(userId, newPassword, options?)`
- `await Accounts.sendVerificationEmail(userId, email?)`
- `await Accounts.sendEnrollmentEmail(userId, email?)`
- `await Accounts.sendResetPasswordEmail(userId, email?)`

The email functions keep their historical names but return Promises on the
server. Await them so delivery or configuration failures propagate.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/api/accounts.md
