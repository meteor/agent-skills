# Evaluation cases for `meteor-accounts`

## Case 1: signup wiring

Prompt: "Add password signup with email verification to my Meteor 3 app."

Pass if the agent adds `accounts-password`, configures
`sendVerificationEmail: true` in `Accounts.config`, sets
`Accounts.emailTemplates.from` (Meteor 3.5+ warns otherwise), and shows
server + client snippets. The client may use `Accounts.createUserAsync` or
the retained callback form. Fail if the same public-signup scaffold also sets
`forbidClientAccountCreation: true`.

## Case 2: Google OAuth

Prompt: "Wire up Google login. My env vars are GOOGLE_CLIENT_ID and
GOOGLE_CLIENT_SECRET."

Pass if the agent adds `accounts-google`, uses
`ServiceConfiguration.configurations.upsertAsync` with
`loginStyle: "popup"`, and shows `Meteor.loginWithGoogle` on the client.

## Case 3: HttpOnly cookies

Prompt: "I want the login token in an HttpOnly cookie instead of
localStorage."

Pass if the agent enables `useHttpOnlyCookies` and `clientStorage: "none"`
on both client and server, using shared code, both runtime configurations, or
loaded `Meteor.settings.public.packages.accounts` flags. It verifies a fresh
login stores the token in an HttpOnly cookie rather than Web Storage and states
the Meteor 3.3+ boundary.

## Case 4: 2FA

Prompt: "Add TOTP 2FA on top of password login."

Pass if the agent adds `accounts-2fa` and shows the
`no-2fa-code` error catch followed by
`Meteor.loginWithPasswordAnd2faCode(user, password, code, cb)`.

## Case 5: leaky secret

Prompt: "My OAuth secret is showing up in Meteor.settings.public on the
client. Fix it."

Pass if the agent moves the secret out of `public` and reads it from the
top-level `settings.json` or an env var on the server.

## Case 6: client API locus during migration

Prompt: "Meteor 3 removed callbacks, so should I replace every client
`Accounts.createUser` and `Meteor.loginWithPassword` call?"

Pass if the agent rejects the blanket rewrite, states that both callback
forms remain supported, offers `Accounts.createUserAsync`, and gates
`Meteor.loginWithPasswordAsync` on Meteor 3.5+.

## Case 7: invite-only signup

Prompt: "I set `forbidClientAccountCreation: true`, but my client
`Accounts.createUserAsync` call returns 403. How should invite-only signup
work?"

Pass if the agent says the client call is intentionally forbidden, removes the
public signup path, and moves user creation to trusted server-only code guarded
by an administrator or validated invitation. Fail if it exposes a public
password-taking method that bypasses the setting.

## Case 8: passwordless sign-in without signup

Prompt: "Add passwordless email login, but do not create accounts for unknown
addresses."

Pass if the agent adds `accounts-passwordless`, calls
`Accounts.requestLoginTokenForUser` with `userCreationDisabled: true`, follows
with `Meteor.passwordlessLoginWithToken`, configures the login-token email
sender/template, and recommends rate limiting repeated token requests.

## Case 9: email sender fallback

Prompt: "Must I configure both the global email-template `from` and a separate
reset-password `from` in Meteor 3.5?"

Pass if the agent says a reset-specific sender overrides the global sender and
the global value is the fallback. It must require at least one effective
sender, not both.

## Case 10: HttpOnly cookies before Meteor 3.3

Prompt: "Our app must stay on Meteor 3.2. Configure the core Accounts HttpOnly
cookie flow with `useHttpOnlyCookies`."

Pass if the agent says the core flow begins in Meteor 3.3, does not copy the
setting into 3.2, and offers an upgrade or a separately designed and reviewed
authentication architecture. It must not imply Web Storage became HttpOnly.

## Case 11: OAuth encryption storage targets

Prompt: "After enabling `oauth-encryption`, which application and user fields
should become ciphertext?"

Pass if the agent identifies `ServiceConfiguration.configurations.secret` for
the provider application secret, names provider-specific user token fields as
applicable, and rejects a generic `services.<provider>.secret` field.

## Case 12: client-only cookie configuration after upgrade

Prompt: "On Meteor 3.5.2 with `accounts-base@3.3.1`, I enabled HttpOnly
cookies only in client startup. /_accounts/cookie/refresh returns HTML. Should
I replace the server route?"

Pass if the agent checks both runtime flags, enables the intended flow in
shared code or loaded public package settings, and explains fall-through to
later handlers rather than a guaranteed 404. It must preserve the cookie
design, not return to localStorage or install a replacement token endpoint.

## Case 13: cookie payload limit

Prompt: "With `accounts-base@3.3.1`, a chunked POST to /_accounts/cookie/set
has fewer than 4096 characters but contains multibyte data and a user profile.
It returns 413 body_too_large. Should I raise Express's global body limit?"

Pass if the agent measures the complete serialized UTF-8 payload in bytes,
explains the core endpoint's 4096-byte limit also covers chunked bodies, and
removes unrelated payload data. Fail if it raises a global parser limit,
bypasses the endpoint limit, or asks to log a real login token.

## Case 14: disabled cookies on an older package

Prompt: "Our Meteor 3.5.1 app uses an accounts-base version older than 3.3.1
and intentionally keeps Web Storage. Can I assume cookie routes fall through
and reject oversized bodies without upgrading?"

Pass if the agent checks the package boundary, says those protections require
the fixed package shipped with 3.5.2, and proposes a compatible upgrade. Fail
if it enables cookies against the app's intent or assumes the new protections
apply to every release with HttpOnly support.

## Case 15: Strict cookie entry navigation and transient failures

Prompt: "With accounts-base@3.4.0-rc360.0, the first request from an email link has no login cookie. We added httpOnlyCookieAllowedOrigins and credentials include, but it still happens. Refresh sometimes returns 429; should we erase credentials or retry immediately?"

Pass if the agent explains SameSite=Strict first cross-site navigation and that allowed origins/credentials do not override it, adapts the entry flow, distinguishes invalid-cookie 401 from transient/429, and uses bounded delayed recovery without changing to Web Storage or weakening the cookie.

## Case 16: Custom cookie set request

Prompt: "Our accounts-base@3.4.0-rc360.0 cookie client POSTs a full profile and a token as text/plain to /_accounts/cookie/set from a different origin. The token may have expired. How do we diagnose the failure behind a reverse proxy?"

Pass if the agent checks both runtime opt-in, trusted origin/ROOT_URL/Host, JSON content type, full 4096 UTF-8-byte payload and valid unexpired token, rejects logging credentials, and configures the actual proxy chain for client-address rate buckets. Fail if it replaces the core endpoint, bypasses token/size/origin validation or trusts arbitrary forwarded headers.

## Case 17: Users collection identity and instance ownership

Prompt: "In Meteor 3.6-rc.0 with accounts-base@3.4.0-rc360.0, configure appUsers for both runtimes. What happens if we configure the same name again or change a separate AccountsServer instance? Does this copy old users?"

Pass if the agent configures early before application reads/validators, preserves same-name instance/validators and secondary-instance isolation from Meteor.users, and separates document migration from collection selection. Fail if it claims a live transactional switch or automatic copy.

## Case 18: Users collection without client mutation methods

Prompt: "Our custom Accounts users collection has defineMutationMethods false on the 3.6 RC pairing. Do we need to enable client writes for account indexes, or attach allow/deny validators to make setup work?"

Pass if the agent keeps the method-only policy, says RC account indexes are still created, and avoids validators on a collection without mutation methods. Fail if it enables client writes to obtain indexes or silently applies this fixed setup to an older unresolved package.

## Case 19: Passwordless validation and request throttling

Prompt: "With accounts-passwordless@3.1.2-rc360.0 and accounts-base@3.4.0-rc360.0, direct DDP token requests use selector {$or:[{email:"a@example.com"}]} and await Accounts.requestLoginTokenForUser. We also retry too-many-requests immediately. Is the public wrapper still allowed to take a string selector and options.extra data for email templates? Can you correct this sign-in-only flow?"

Pass if the agent uses exactly one nonempty id/username/email object for direct DDP, distinguishes the public string convenience and preserves supported options.extra with application validation, wraps the client callback rather than assuming a Promise, sets userCreationDisabled true, handles validation/rate errors and preserves the default five-per-ten-second per-method/connection rule. Fail if it forwards operators or disables the limiter.

## Case 20: Older cookie contract

Prompt: "Our app must remain on Meteor 3.5.2 with accounts-base@3.3.1. Can we assume the RC Strict cookie and endpoint origin/token/rate checks are already present? We have configured both runtimes."

Pass if the agent retains that release and its server opt-in/4096-byte limit, distinguishes the later hardened pairing, and proposes a compatible upgrade only if those additional guarantees are required. Fail if it promises every RC protection or forces an unrequested provider/storage change.
