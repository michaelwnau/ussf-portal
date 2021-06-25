# Migrate the Space Force MVP and build alongside it in a single application

* Status: Accepted
* Deciders: @suzubara @abbyoung @esacteksab @noahfirth
* Date: 2021-06-24

## Context and Problem Statement

This ADR documents the initial technical approach we are taking to building a "new” Space Force portal. There is an existing MVP website in use today, and we need to determine a strategy for migrating from that to the next major version, both from technical implementation and user experience standpoints. First, some terminology and context:

- **MVP**: The first version of the Space Force portal website, i.e. what exists at www.my.spaceforce.mil as of this writing. Codebase is located at https://github.com/USSF-ORBIT/ussf-portal-mvp ; while this version is minimal in functionality, it is currently deployed to a production environment.
- **Beta:** Features or changes to the production portal website that are not fully integrated into the production environment, and require some type of logical switch (such as a feature flag) in order to be accessed by or visible to a user. Work in this category can be used to experiment and ideate on changes in a production-like environment with real data before rolling out to all users.
- **Production:** The portal website codebase that will live at www.my.spaceforce.mil in the future, superseding MVP, and will be continuously developed and iterated on in front of live users with real data behind authentication for the foreseeable future.

Additionally:

- **Prototype:** A sandbox codebase (https://github.com/USSF-ORBIT/ussf-portal-prototype) primarily used to experiment, test, and validate ideas and patterns before committing them to the actual application. This application will never contain or interact with real data, it will never utilize real user authentication, it will never persist data, and it will never evolve into a production codebase.

## Decision Drivers

* We want to be able to test changes with users in a real-life environment with real data
* We want to get feedback through analytics data and other means quickly and often
* We don't want to put users through a steep learning curve as they adapt to the new portal
* We don’t want the use of the portal MVP as a starting point for iterative changes to constrain our own creativity
* We want to have a significant moment of "launching" the new portal once our new ideas have been validated

## Considered Options

* **Migrate (re-build) the MVP to our new chosen framework, and build the new portal within the same application**
* Implement small, incremental changes to the existing MVP codebase without significant architectural changes
* Build the new portal in a completely separate application from the MVP

## Decision Outcome

Chosen option: **Migrate (re-build) the MVP to our new chosen framework, and build the new portal within the same application** because it will give us a high degree of flexibility with regards to testing and launching changes at a pace we are comfortable with, with minimal risk in managing multiple application infrastructures.

### Positive Consequences

* Gives us a clean slate for the technical architecture that will support the portal website, as well as the new portal itself, allowing for a high degree of creative freedom.
* Gives us a baseline for establishing test coverage and best practices before making significant user-facing changes to the application.
* Allows us to test and validate decisions that are not user-facing (such as our tech stack, CI/CD pipeline, and application architecture) independently of and prior to making changes that are.
* Allows us to subsequently begin collecting analytics data around the existing MVP in order to establish a baseline.
* Using application code to control rollout of new features gives us high flexibility and the ability to easily roll back to the MVP if needed.
* Containing both the existing MVP and the new portal in a single application reduces infrastructure complexity and risk in managing which users are directed to which version.
* We are able to easily make changes to the MVP during development of the new portal if needed.
* We are able to control the traffic flow to the new portal, allowing us to start with granting access to a small number of users for testing, and eventually directing everyone there at the time of launch.

### Negative Consequences

* We spend some overhead time and effort re-implementing a website we know will be undergoing significant changes over the course of this project.
* We will need to establish clear boundaries (i.e., with namespacing) within application code between the MVP and the new portal code to minimize the risk of bugs.

## Pros and Cons of the Options

### Implement small, incremental changes to the existing MVP codebase without significant architectural changes

* Good, because small, incremental changes indicate low risk and a fast feedback loop.
* Good, because we don't have to spend any time re-implementing the existing MVP code.
* Bad, because we anticipate wanting to make significant changes to the tech stack of the portal to support more complex functionality.
* Bad, because users may not notice or pay attention to many small changes made over a long period of time.
* Bad, because we will still have to determine a way to test changes before rolling out to everyone.

### Build the new portal in a completely separate application from the MVP

* Good, because we don't have to spend any time re-implementing the existing MVP code.
* Good, because we can start building the new portal from a clean slate.
* Good, because we don't have to manage both legacy code and new code within a single code base.
* Bad, because we will have to manage two live applications on separate infrastructure in order to test changes without replacing the MVP entirely.