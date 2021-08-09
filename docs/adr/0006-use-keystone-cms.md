# Use KeystoneJS as a CMS, starting with embedded mode

- Status: Accepted
- Deciders: @suzubara @abbyoung @esacteksab @noahfirth
- Date: 2021-08-09

## Context and Problem Statement

We will need a content management system (CMS) platform to support the USSF portal and have already made the [decision](./0002-nextjs.md) to use a headless CMS. This ADR documents the specific platform we will be moving forward with.

## Decision Drivers

- We don't want to build a CMS from scratch.
- Since our exact feature requirements are somewhat unknown and likely to shift during initial development, we want a platform that is highly customizable.
- For the same reason, we want a platform that will lend itself to rapid prototyping and iterating (at least during initial development).
- In the interest of working efficiently with limited time and resources, we have a slight preference towards platforms built with (or compatible with) technologies we are already using (NodeJS, React, TypeScript).

## Considered Options

- KeystoneJS (with embedded mode)
- KeystoneJS (without embedded mode)
- Directus
- Other considered options

## Decision Process & Outcome

We first approached this decision by casting a wide net and looking at CMS platforms that met the following criteria:

- Headless as a first-class feature, GraphQL API preferred
- Has a self-hosted option, not exclusively SaaS
  - It's worth noting that because headless platforms tend to go hand-in-hand with SaaS, this requirement eliminated a significant number of the largest, most established options
- Open-source, community-driven, low or no recurring cost

We also prioritized the following features:

- A customizable content model (i.e., not defaulting to blog posts)
- Customizable & granular access control
- Ability to control the publishing workflow (i.e., require certain criteria before content can be published)

Finally, in keeping with our engineering values, it was important to pick a platform that would integrate well with our CI/CD workflow and could be tested and reproduced reliably across multiple environments.

**Our decision is to use [KeystoneJS](https://keystonejs.com/), and start by setting it up in [embedded mode](https://keystonejs.com/docs/walkthroughs/embedded-mode-with-sqlite-nextjs#how-to-embed-keystone-sq-lite-in-a-next-js-app) alongside the [portal client application code](https://github.com/USSF-ORBIT/ussf-portal-client).** A condition of this decision is that we will need to migrate from embedded mode over to a separate hosted instance of Keystone when the following criteria are met:

- We have the access needed to provision the requisite infrastructure to deploy KeystoneJS on its own server along with a Postgres database (and have enabled API communication between the Keystone server and the portal application)
- We have the desire and/or need to give content publishing access to people outside of the USSF portal development team

### Positive Consequences

- Keystone is built on top of [NextJS](https://nextjs.org/), the same framework we're using for the portal itself. This will mean fewer systems to learn, we can keep some shared understanding when developing both applications, and potentially share patterns across them where appropriate.
- Keystone also utilizes [Prisma](https://www.prisma.io/), a powerful and well-established NodeJS ORM also built in TypeScript. This gives us a level of confidence in configuring a strongly typed content schema, interacting with the database, and performing migrations that we found lacking in Directus.
- Activity on the Keystone Github page as well as their Slack community points to frequent and consistent updates, as well as responsive support.
- Unlike Directus, Keystone has explicit guides for how to [integrate it into our development workflow and deploy to environments](https://keystonejs.com/docs/guides/cli#bringing-it-all-together), as well as [test our code and content schema](https://keystonejs.com/docs/guides/testing).
- Starting with Keystone in embedded mode will allow us to iterate quickly on both the portal application _and_ the CMS implementation in a single codebase, which will be highly valuable during the earlier phases of development as we determine the requirements and overall architecture for the portal.

### Negative Consequences

- Keystone is on the cusp of a new major release from v5 -> v6, and is lacking in several high priority features that other platforms provide, such as user roles, activity logging for audits, content revision history, and localization. Because it is such a flexible platform and easy to extend with code, we can implement these things ourselves, but it does mean more work on our part.
- Using Keystone as a CMS in embedded mode is very limited; it means the content is checked into the codebase, and so making content changes will require running the application locally, following our git workflow to make changes and open a PR, and deploying. Access will be limited to those on the USSF development team who are familiar with contributing to the codebase.

## Pros and Cons of the Options

### KeystoneJS (without embedded mode)

This option has the same consequences as using Keystone written above, less the points about using embedded mode.

- Good, because we don't need to account for migrating from embedded Keystone to hosted Keystone
- Bad, because development with the CMS would be blocked until we are able to set up a hosted infrastructure for it

### Directus

[Directus](https://directus.io/) was actually our front runner CMS for awhile, but we decided to move away from it when it became clear it was not built with a development workflow in mind. Directus has no built-in way for any configuration or schema to be kept in code, which means if we were to use it, we would need to develop a strategy and tooling for syncing database content across multiple environments (as well as handling the disparities between those environments, e.g. what data should be synced vs not).

Even though [this issue has been requested and discussed in the Directus community](https://github.com/directus/directus/discussions/3891), it has not seemed to gain much traction from within their internal development team, which does not inspire confidence. We did spend a period of time working with their JavaScript SDK to experiment with writing our own seed & migration scripts, but ran into some unexpected issues around object permissions. This experience made us concerned that we had little visibility into how Directus operates under the hood, and we decided to consider alternatives.

- Good, because it includes all of the features we are looking for and then some (activity logging, i18n, 2FA).
- Good, because it has a very polished and pleasant admin UI.
- Bad, because it is entirely centered around its database, and has no built-in support for configuring the instance or seeding the database from code.
- Bad, because interacting with its JS SDK led to unexpected results which lowers our confidence in relying on it.

### Other Considered Options

- [Strapi](https://strapi.io/) seemed like a promising candidate, but some of its essential features (such as custom roles) are paid-only, and it seems primarily oriented around its cloud/enterprise products.
- We also looked at [Payload](https://payloadcms.com/) but they are not open source, require a paid license for non-personal projects, and don't yet have a sizable community.
- [Ghost](https://ghost.org/) is a popular NodeJS CMS but it is built with blogs in mind, and does not seem to allow for custom content models.
