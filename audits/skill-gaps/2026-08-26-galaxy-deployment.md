# Galaxy deployment skill gap audit

## Run context

```text
Agent-skills revision: 5d1843c63e9a0cff52122b82c6d63b5b7fc2f191; dirty only for this report and unrelated untracked PLAN-07.md
Meteor checkout: not required for this Galaxy provider audit
Meteor remote: not applicable; Galaxy Cloud documentation is the provider source
Meteor branch: not applicable
Meteor revision: 5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe from the previous full catalog audit
Meteor release context: Meteor 3.x on Galaxy Metal
Audit mode: focused incremental provider audit of meteor-deployment
Comparison: current meteor-deployment Galaxy guidance against Galaxy documentation retrieved 2026-08-26
Previous audit report: audits/skill-gaps/2026-08-25-meteor-devel-full.md at 50f2fe4c7ce347749bb5daae1923bdb2504ef35d
Previous Meteor revision: 5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe
```

## Source coverage

Primary Galaxy sources reviewed:

- [Deploy Meteor Apps](https://docs.galaxycloud.app/docs/apps/meteor/push-to-deploy)
- [Meteor CLI](https://docs.galaxycloud.app/docs/apps/meteor/cli)
- [Meteor Reference](https://docs.galaxycloud.app/docs/apps/meteor/meteor-reference)
- [Meteor Version Support Status](https://docs.galaxycloud.app/docs/apps/meteor/supported-versions)
- [Variables](https://docs.galaxycloud.app/docs/dashboard/apps/variables)
- [Settings](https://docs.galaxycloud.app/docs/dashboard/apps/settings)
- [Container Environment](https://docs.galaxycloud.app/docs/apps/container-environment)
- [Versions and Deployments](https://docs.galaxycloud.app/docs/apps/versions-deployments)
- [Deployments](https://docs.galaxycloud.app/docs/dashboard/apps/deployments)
- [Custom Domains](https://docs.galaxycloud.app/docs/apps/custom-domains)
- [Container Sizes](https://docs.galaxycloud.app/docs/apps/container-sizes)
- [Memory Management in Containers](https://docs.galaxycloud.app/docs/apps/memory-management)
- [Custom Base Images](https://docs.galaxycloud.app/docs/apps/meteor/custom-base-images)
- [Secure Secrets Management for Meteor Apps](https://docs.galaxycloud.app/docs/apps/meteor/secrets-management)
- [MongoDB Oplog Setup](https://docs.galaxycloud.app/docs/databases/mongodb-oplog-setup)
- [MongoDB SSL Certificate Setup for Meteor](https://docs.galaxycloud.app/docs/databases/mongodb-ssl-meteor)
- [MongoDB on Galaxy](https://docs.galaxycloud.app/docs/databases/mongodb)

The previous Meteor core audit remains the evidence for generic bundle, Node,
settings, oplog, and hot-code-push claims. This audit changes only
Galaxy-specific decisions.

## Summary

| Classification | Count |
|----------------|-------|
| Covered | 4 |
| Partial | 5 |
| Outdated | 1 |
| Overlap | 0 |
| Candidate | 0 |
| Documentation only | 4 |
| Uncertain | 1 |

## Release blockers

| Finding | Skill | User impact | Evidence | Required action |
|---------|-------|-------------|----------|-----------------|
| G01 | `meteor-deployment` | Users receive only a CLI example with an old domain-oriented target and miss the current Git push workflow. | Deploy Meteor Apps; Meteor CLI; Custom Domains | Add Push to Deploy and current CLI branches, simple free-app names, generated hostnames, and current regions. |
| G02 | `meteor-deployment` | A CLI deploy can silently fail to change settings in Repository Mode, while Galaxy Mode can overwrite dashboard edits with the last CLI settings file. | Variables; Meteor Reference | Explain both settings modes, their source of truth, last-write behavior, and secret boundary. |
| G03 | `meteor-deployment` | Missing build-hook, health, and rollback decisions can turn a migration or startup failure into a confusing deploy failure. | Deploy Meteor Apps; Settings; Container Environment; Versions and Deployments | Add root directory, reproducible install, paid pre-deploy failure behavior, health path, dynamic port, graceful shutdown, and rollback guidance. |

## Maintenance findings

| Finding | Classification | Priority | Skill or scope | Evidence | Evaluation coverage | Recommended action |
|---------|----------------|----------|----------------|----------|---------------------|--------------------|
| G01, current Galaxy deployment entry points | Outdated | P1 | `meteor-deployment` Galaxy decision | Deploy Meteor Apps; Meteor CLI; Custom Domains | Existing case 1 checks only the old CLI form. | Route between Push to Deploy and Meteor CLI. Use a simple app name for Free, generated `galaxycloud.app` hostnames, and `DEPLOY_HOSTNAME` only for explicit paid-region selection. |
| G02, settings ownership and secrets | Partial | P1 | Galaxy settings reference | Variables; Meteor Reference; Secrets Management | Existing case 3 checks generic `METEOR_SETTINGS` only. | Add Galaxy Mode and Repository Mode, `galaxy.meteor.com.env`, the 1 MB limit, Save then Deploy, last-write behavior, and the ignored CLI settings flag in Repository Mode. |
| G03, build and rollout lifecycle | Partial | P1 | Galaxy build and operations reference | Deploy Meteor Apps; Settings; Container Environment; Versions and Deployments; Deployments | No Galaxy health or rollback case. | Add root directory, `meteor npm ci`, paid pre-deploy commands, `$PORT`, health path, SIGTERM grace, build versus deploy logs, zero-downtime rollout, and automatic rollback. |
| G04, domains and proxy topology | Partial | P2 | Galaxy networking reference | Custom Domains; Container Environment | Existing OAuth case covers generic `ROOT_URL`, not Galaxy primary domains or forwarded hops. | Add primary-domain `ROOT_URL`, managed TLS, `HTTP_FORWARDED_COUNT`, and current dashboard-provided DNS values. |
| G05, Galaxy Mongo selection | Partial | P2 | Galaxy database guidance | Meteor Reference; MongoDB; MongoDB SSL; MongoDB Oplog | Existing case 7 covers Meteor version behavior only. | Distinguish free test Mongo from production databases, free-tier certificate bypass from dedicated CA validation, and keep the Meteor 3.0 through 3.4 oplog versus 3.5+ change-stream branch. |
| G06, memory and custom runtime controls | Partial | P2 | Galaxy container runtime | Memory Management; Container Sizes; Custom Base Images | No case catches legacy `GALAXY_NODE_OPTIONS` or unsafe mutable base images. | Use `NODE_OPTIONS` only after observing pressure. Add the public immutable custom-image contract for native OS dependencies and keep secrets out of the image. |

## Skill claim matrix

| Skill | Distributable file and section | Claim and context | Evidence | Status | Evaluation coverage |
|-------|--------------------------------|-------------------|----------|--------|---------------------|
| `meteor-deployment` | `SKILL.md`, decision flow | Galaxy is supported as the first-party Meteor host. | Deploy Meteor Apps; Meteor Version Support Status | Covered | Case 1 |
| `meteor-deployment` | `SKILL.md`, Galaxy | `meteor deploy` with regional `DEPLOY_HOSTNAME` deploys to Galaxy. | Meteor CLI | Covered | Case 1 |
| `meteor-deployment` | `SKILL.md`, Galaxy | A domain-form target is the ordinary Galaxy deployment path. | Meteor CLI; Custom Domains | Outdated | Case 1 currently enforces it. |
| `meteor-deployment` | `SKILL.md`, Galaxy | Galaxy receives `MONGO_URL` and other runtime configuration. | Meteor Reference; Variables | Covered but underspecified | Cases 1 and 3 |
| `meteor-deployment` | no Push to Deploy section | GitHub or Bitbucket branch pushes can build and deploy automatically. | Deploy Meteor Apps; Settings | Partial | None |
| `meteor-deployment` | no settings-mode section | Galaxy Mode and Repository Mode select different configuration sources. | Variables | Partial | None |
| `meteor-deployment` | no Galaxy build section | Root directory, install command, and paid pre-deploy command control repository builds. | Deploy Meteor Apps; Settings | Partial | None |
| `meteor-deployment` | required environment | `PORT`, `ROOT_URL`, and `METEOR_SETTINGS` drive the runtime. | Container Environment | Covered but missing Galaxy injection and override rules | Cases 3 and 4 |
| `meteor-deployment` | no Galaxy lifecycle section | Health checks, SIGTERM grace, blue-green rollout, and rollback protect availability. | Container Environment; Versions and Deployments | Partial | None |
| `meteor-deployment` | `ROOT_URL` guidance | The browser-facing URL controls OAuth and absolute URLs. | Custom Domains; Variables | Covered but missing primary-domain behavior | Case 4 |
| `meteor-deployment` | Mongo and reactivity | Meteor 3.0 through 3.4 need an oplog URL for oplog reactivity; 3.5+ can use core change streams. | Previous Meteor core audit; Galaxy MongoDB Oplog Setup | Covered | Case 7 |
| `meteor-deployment` | no Galaxy Mongo tier or TLS branch | Free shared Mongo is for testing and uses different TLS guidance from dedicated databases. | Meteor Reference; MongoDB SSL | Partial | None |
| `meteor-deployment` | no Galaxy memory section | Galaxy Metal honors `NODE_OPTIONS`; legacy `GALAXY_NODE_OPTIONS` is ignored. | Memory Management | Partial | None |
| `meteor-deployment` | no custom base image section | Galaxy can run a public Docker Hub base image with a required setup contract. | Custom Base Images | Partial | None |
| `meteor-deployment` | Docker, Node, HCP | Non-Galaxy bundle, Node matching, Docker, and hot-code-push decisions remain accurate. | Previous full Meteor audit | Covered | Cases 2, 5, and 6 |

## Evaluation gaps

- Replace the old Galaxy CLI assertion with current app-name, plan, and hostname
  behavior.
- Add a Push to Deploy case that detects the wrong settings source and unsafe
  committed secrets.
- Add a failed rollout case that distinguishes build, pre-deploy, and container
  health failures while preserving the previous live version.
- Extend the proxy case to cover a Galaxy primary domain and forwarded hop
  count.
- Add a memory case that rejects `GALAXY_NODE_OPTIONS` and arbitrary heap
  increases without observed container headroom.

## Uncertain findings

The Meteor Reference says saving settings restarts containers, while the more
detailed Variables page says Save stores changes and Deploy applies them. Use
the Variables page's explicit Save then Deploy workflow. Galaxy should reconcile
the shorter reference text; do not claim that Save alone applies changes.

## No-action findings

- Detailed plan prices and every container size are volatile selection data.
  The skill should tell agents to inspect current dashboard limits and metrics,
  not copy a pricing table.
- The Runtime Logs filtering UI and seven-day retention are useful operator
  documentation but do not change the deployment decision flow.
- Monti APM setup is a separate monitoring choice. Mention metrics only when
  diagnosing capacity; do not copy the dashboard manual.
- Galaxy's Public API does not deploy apps or change variables. It does not
  replace Push to Deploy or the Meteor CLI, so no deployment automation branch
  is added for it.

## Recommended next actions

1. Update `meteor-deployment` routing and decision flow for Push to Deploy and
   current Meteor CLI behavior.
2. Add a focused `references/galaxy.md` for settings modes, build hooks,
   rollout, domains, Mongo, memory, and custom base images.
3. Keep generic Meteor settings and Docker guidance in their existing
   references, linking to the Galaxy-specific reference instead of duplicating
   it.
4. Replace or add only the acceptance cases listed under Evaluation gaps.
5. Run static validation, link checks, catalog verification, tests, ZIP build,
   and inspect the `meteor-deployment` archive.

## Maintenance handoff

The user explicitly authorized implementation of confirmed Galaxy deployment
gaps in `meteor-deployment` and its references. Apply G01 through G06. Do not
create a new skill or implement the documentation-only and uncertain findings.
