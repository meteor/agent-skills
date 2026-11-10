# First stable catalog release notes, prepared for review

Proposed stable version: `1.1.0`. The prerequisite
[`1.1.0-beta.4`](v1.1.0-beta.4.md) is published and its tagged installations
are verified. Stable `1.1.0` remains unpublished. Move the accepted text into
the stable release after its tag exists.

## Release text

Meteor Agent Skills brings 17 focused skills for building, migrating,
debugging, testing, securing and deploying Meteor 3 applications.

This catalog consolidates official Meteor 3.6 guidance. It covers the final
Rspack stack, native TypeScript declarations, CLI/workspace setup and mobile
workflows. It also includes the final MongoDB Change Streams recovery and
Accounts token-handling behavior. Earlier supported Meteor releases keep
explicit compatibility branches.

Install the complete plugin through the Codex or Claude Code repository
marketplace, or select individual skills through the Skills CLI. GitHub
release assets include 17 individual skill ZIPs and `meteor-plugin.zip`.

The catalog version and Meteor framework version are independent. Check the
app's Meteor release and resolved Atmosphere/npm versions before applying a
version-specific capability. Skills complement application tests and review.

## Commands to verify after stable publication

Pin the tested installer separately from the catalog tag. Skills CLI `1.5.18`
supports the Node 20 runtime used by early Meteor 3 apps; the current
`skills@latest` requires Node 22.20.0+. Users do not need to change their
application's runtime to install the catalog.

```bash
codex plugin marketplace add meteor/agent-skills --ref v1.1.0
codex plugin add meteor@meteor

claude plugin marketplace add meteor/agent-skills#v1.1.0
claude plugin install meteor@meteor

npx skills@1.5.18 add 'meteor/agent-skills#v1.1.0'
```

Do not copy these commands into the README or Core changelog until the tag is
live and their installed files have been compared with it. Repeat the update
path from the accepted beta, not only a clean installation.

## Directory listing draft

Name: Meteor

Short description: Build and maintain Meteor 3 applications.

Description: Meteor-maintained skills for application setup, Meteor 3
migration, build tooling, native TypeScript declarations, data APIs,
authentication, security, testing, mobile applications and deployment. Each
skill supplies version-aware decisions, examples and focused references.

Publisher: Meteor. Repository: https://github.com/meteor/agent-skills.
Documentation: https://docs.meteor.com/ai/agent-skills.
Support: https://github.com/meteor/agent-skills/issues.

Submit `dist/meteor-plugin.zip` to OpenAI's skills-only plugin route after
publisher verification and listing approval. Use the repository plugin for
Anthropic's directory portal. These are separate submissions from the working
repository marketplaces. Neither listing is claimed to be approved or live.
See the official [OpenAI submission requirements](https://developers.openai.com/plugins/deploy/submission)
and [Claude publishing guide](https://code.claude.com/docs/en/plugins/publish).

The packaged icon is the unmodified 298 x 298 Meteor organization avatar.
Obtain an approved larger original if the target directory requires 512+
pixels. Confirm the publisher's contact, privacy/terms details where required,
and final artwork before submitting. No new MCP service is needed.

## Maintainer handoff

Use the [readiness report](first-stable-readiness-2026-11-10.md) for completed
checks, review gates, source revisions and the Core documentation PR. Assign
the release owner and a feedback owner before the announcement. Installation
or guidance regressions go through the repository issue tracker with the
catalog tag, assistant/client, Meteor/package versions and a minimal prompt.
