# Use NextJS with dynamic content powered by a headless CMS for the new USSF portal

- Status: Proposed
- Deciders: @suzubara @abbyoung @esacteksab @noahfirth
- Date: 2021-06-24

## Context and Problem Statement

We need to decide on a language and/or framework to use for building out the new USSF portal client application (in other words, the application that builds and serves end user-facing frontend code), as well as a platform to publish dynamic content to the portal. Since we are still determining the exact functionality of the portal as well as the role of dynamic content in it, it's important that the decision we make allows for flexibility, customization, and scalability.

## Decision Drivers

While the exact functionality of the portal is still being determined, we feel confident about the following requirements:

- The application will need to integrate with one or more external APIs in order to serve content and personalized data.
- Our audience spans a wide range, from service members to civilians and contractors. They will access the portal from a variety of devices and browsers, with a variety of technical capabilities and network connections. Therefore building a platform that can be optimized to serve critical content with minimal overhead on the client, and progressively enhanced to introduce more capabilities, is a high priority.
- This application will help introduce a new, consistent Space Force Design System, and therefore must support a highly customized UI.
- The ability to build rapidly as we experiment with new features and new designs in the early phases of this project is important to us.
- At least during the initial design phase, we will want to be able to tweak and experiment with different content types and publishing models.

## Considered Options

- **Use NextJS with dynamic content powered by a headless CMS**
- Use a static site generator powered by a headless CMS
- Use a traditional all-in-one CMS platform

## Decision Outcome

Use the [NextJS](https://nextjs.org/) framework to build the USSF portal client application, with dynamic content powered by a headless CMS. Note that this decision does _not_ specify exactly which CMS platform we will use, but rather what high-level category of CMS (headless vs. traditional). The specific CMS platform decision will be documented in a future ADR.

### NextJS

NextJS is a full-stack web framework built on a NodeJS server using React for the UI. It comes already configured to support technologies we prefer, such as TypeScript and CSS modules, and allows for easy customization of the build pipeline (e.g., Babel and Webpack), unlike [Create React App](https://create-react-app.dev/). It includes support and patterns for essential features out of the box, such as data fetching, image optimization, and routing - meaning we can avoid having to design and implement these ourselves. Most importantly, NextJS provides support for three types of UI rendering, which can be used interchangeably based on the type and priority of content:

- Static Site Generation (markup is rendered at compile time)
- Server-side Rendering (markup is rendered at runtime on the server)
- Client-side Rendering (markup is rendered at runtime on the client)

This will allow us to optimize different types of content for different situations; for example, we can pre-render critical content such as service-wide announcements on the server when it is published, and defer less critical functionality such as personalization features based on the user’s device and network connection. This will give us a high degree of control to ensure we are building a portal that is performant and accessible.

Additionally, we will use TypeScript in order to ensure type safety throughout the codebase at compile time. While this does not eliminate the need for tests and defensive coding, it does severely reduce the number of runtime bugs that can happen due to unexpected types, and is a current standard best practice in JavaScript applications, especially when starting a new code base.

#### Positive Consequences of NextJS

- NextJS comes ready out-of-the-box with very little configuration needed, so we will be able to begin building the new portal quickly with a focus on the application frontend.
- NextJS uses React, one of the most popular JavaScript UI libraries, and at this point has a mature ecosystem with lots of resources for support, other libraries and integrations.
- NextJS provides built-in ways to extend BabelJS and Webpack configurations, which has been a previous sore point when using Create React App.

#### Negative Consequences of NextJS

- NextJS makes the UI framework decision for us (React), meaning we could not easily switch to an alternative such as Vue or Svelte.
- Because NextJS is built on top of NodeJS, it may not be a suitable solution if we end up needing more complex, processor-intensive functionality on the server. Right now we are making the assumption that this codebase will be primarily responsible for aggregating and serving user-facing content. In the event that we need to add more complex server-side functionality, it may be more appropriate to build out as separate microservice(s) that can be integrated with the NextJS app.

### Headless CMS

A headless CMS is an API-first content management system (think: Content-as-a-Service) with no opinion on how content should be structured or rendered when displayed for end users. Because headless CMS’ completely separate the authoring and publishing of content from the consumption and display of content, it has several advantages over a traditional CMS that packages all of the above in a single application. With the advent of API-driven web applications, headless CMS’ have all but become the new standard in authoring web content.

#### Positive Consequences of a headless CMS

- The CMS application is entirely decoupled from the client application, so this decreases risk if we decide to significantly change the implementation of either one.
- There is also minimal risk of affecting one of the applications when we deploy changes to the other, as long as those changes are unrelated to the API interaction between the two.
- This also means the choice of CMS in no way constrains the language we use for the client application, and we don’t have to attempt to work within a proprietary templating language as is sometimes the case with traditional CMS’.
- By leveraging webhooks, we are able to trigger re-builds of the affected client application markup whenever new content is published in the CMS, instead of rendering content on the server at runtime.
- We could easily publish content from a single CMS instance to multiple client consumers if the need arises.

#### Negative Consequences of a headless CMS

- We will need to manage two codebases & two applications per environment instead of just one.
- Since the CMS and client application can be deployed independently of each other, we will need to determine a strategy for testing and versioning between the two in order to ensure compatibility throughout development, and avoid the possibility of API/code changes in one breaking the other.

## Pros and Cons of the Other Options

### Use a static site generator powered by a headless CMS

This option is almost the same as the chosen option, but proposes using a different static site generator (such as Gatsby, Jekyll, or Hugo) instead of NextJS. The primary advantage of NextJS over these alternatives is that in addition to static generation, NextJS _also_ supports dynamic server-side rendering, and provides more power and flexibility which are important to keep in mind while we ideate on the features of this portal. Rather than Gatsby and Jekyll, which are better suited towards truly static content where SEO is usually a priority over user customization, NextJS will allow us to keep our options open as we build out functionality.

### Use a traditional all-in-one CMS

This option negates all of the advantages of a headless CMS, and will couple the portal client with the content backend. This might be a tenable option if our priority was to keep our infrastructure as simple as possible, and if we had confidence in the exact scope of the portal and assumed its primary function will be to serve content from the CMS, but that is not the case. It is more likely the CMS will be just one of multiple possible API integrations that will provide content and data to the portal client. Therefore, the flexibility of a headless CMS will be better suited to our needs.
