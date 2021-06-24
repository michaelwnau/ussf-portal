# Use NextJS for the USSF portal client application

* Status: proposed
* Deciders: @suzubara @abbyoung @esacteksab @noahfirth
* Date: 2021-06-22

*To avoid bikeshedding, this ADR uses the [lightweight ADR template](https://adr.github.io/#lightweight-architectural-decision-records-should-be-adopted) and exists primarily for recording the decision, rather than weighing pros & cons of all considered options.*

## Context

We need to decide on a language and/or framework to use for building out the new USSF portal client application (in other words, the application that builds and serves end user-facing frontend code). While the exact functionality of the portal is still being determined, we feel confident about the following requirements:

- The application will need to integrate with one or more external APIs in order to serve content and personalized data.
- Our audience spans a wide range, from service members to civilians and contractors. They will access the portal from a variety of devices and browsers, with a variety of technical capabilities and network connections. Therefore building a platform that can be optimized to serve critical content with minimal overhead on the client, and progressively enhanced to introduce more capabilities, is a high priority.
- This application will help introduce a new, consistent Space Force Design System, and therefore must support a highly customized UI.
- The ability to build rapidly as we experiment with new features and new designs in the early phases of this project is important to us.

## Decision

Use the [NextJS](https://nextjs.org/) framework to build the USSF portal client application. NextJS is a full-stack web framework built on a NodeJS server using React for the UI. It comes already configured to support technologies we prefer, such as TypeScript and CSS modules, and allows for easy customization of the build pipeline (e.g., Babel and Webpack), unlike Create React App. It also includes essential features out of the box, such as data fetching, image optimization, and routing - meaning we can avoid having to design and implement these ourselves. Most importantly, NextJS provides patterns for three types of UI rendering, which can be used interchangeably based on the type and priority of content:
- Static Site Generation (markup is rendered at compile time)
- Server-side Rendering (markup is rendered at runtime on the server)
- Client-side Rendering (markup is rendered at runtime on the client)

This will allow us to optimize different types of content for different situations; for example, we can pre-render critical content such as service-wide announcements on the server when it is published, and defer less critical functionality such as personalization features based on the user’s device and network connection. This will give us a high degree of control to ensure we are building a portal that is performant and accessible.

Additionally, we will use TypeScript in order to ensure type safety throughout the codebase at compile time. While this does not eliminate the need for tests and defensive coding, it does severely reduce the number of runtime bugs that can happen due to unexpected types, and is a current standard best practice in JavaScript applications, especially when starting a new code baes.

## Consequences

NextJS comes ready out-of-the-box with very little configuration needed, so we will be able to begin building the new portal quickly with a focus on the application frontend. Because NextJS is built on top of NodeJS, it may not be a suitable solution if we end up needing more complex, processor-intensive functionality on the server. Right now we are making the assumption that this codebase will be primarily responsible for aggregating and serving user-facing content. In the event that we need to add more complex server-side functionality, it may be more appropriate to build out as separate microservice(s) that can be integrated with the NextJS app.