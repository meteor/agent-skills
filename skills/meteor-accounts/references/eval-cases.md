# Evaluation cases for `meteor-accounts`

## Case 1: signup wiring

Prompt: "Add password signup with email verification to my Meteor 3 app."

Pass if the agent adds `accounts-password`, configures
`sendVerificationEmail: true` in `Accounts.config`, sets
`Accounts.emailTemplates.from` (Meteor 3.5+ warns otherwise), and shows
server + client snippets. The client may use `Accounts.createUserAsync` or
the retained callback form.

## Case 2: Google OAuth

Prompt: "Wire up Google login. My env vars are GOOGLE_CLIENT_ID and
GOOGLE_CLIENT_SECRET."

Pass if the agent adds `accounts-google`, uses
`ServiceConfiguration.configurations.upsertAsync` with
`loginStyle: "popup"`, and shows `Meteor.loginWithGoogle` on the client.

## Case 3: HttpOnly cookies

Prompt: "I want the login token in an HttpOnly cookie instead of
localStorage."

Pass if the agent calls `Accounts.config({ clientStorage: "none",
useHttpOnlyCookies: true })` inside `Meteor.startup`, and also surfaces
the same flags via `Meteor.settings.public.packages.accounts.*`. Bonus:
notes this is Meteor 3.3+.

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
