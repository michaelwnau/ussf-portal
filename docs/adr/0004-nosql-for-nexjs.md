# Use a NoSQL Database for Next.js App

- Status: Approved
- Deciders: @suzubara @abbyoung @esacteksab @noahfirth
- Date: 2021-08-04

## Context and Problem Statement

We need to choose an appropriate database to use with the Next.js app for storing non-sensitive user data. This data will most likely be self-contained to each user, representing their app settings, bookmarks, and other session and user-specific features. No PII or PHI will be stored.

Two assumptions we've made when considering this decision:

* Each data set with be contained to a single user and will never need to cross-reference/query another.
  * This assumption negates the need for any relational data.
* Each data set will only ever be modified by one user 
  * This assumption mitigates any concern about having to resolve multiple transactions simultaneously.

If either of these assumptions change or are proven wrong, we'll revisit this decision.

## Decision Drivers

- The database type should be available in AWS/Cloud One.
- We need to support dynamic JSON and a flexible schema.
- We want the option to index on specific attributes within a user's data.
- We want to set the project up for growth and future success if requirements change.
- We want to simplify the development process without sacrificing functionality.

## Considered Options

- Use a NoSQL database to store user data for the Next.js app.
- Use a relational database to store user data for the Next.js app.
- Use a relational database such as Postgres, leveraging JSONB to store dynamic JSON.

## Decision Outcome

**Use a NoSQL database to store user data for the Next.js app.**

Based on current drafts of data modeling and feature planning, the data stored is more dynamic in nature and does not have relations to other data being stored. The primary purpose is to store and retrieve data unique to one user, which can be accomplished with a NoSQL database.

The specific database has not been decided yet, and it will depend largely on what is available in AWS/Cloud One. Some potential options include DynamoDB (key-value) and DocumentDB (document-based).

### Positive Consequences

- Supports a flexible, changing schema that matches our evolving requirements.
- Reduces complexity in building beta features and iterating quickly.
- Simplifies the development process.
  - It will be much easier to query a specific user and access their data, as opposed to performing a number of queries and joins to return their data.
- Supports horizontal scaling
- Supports indexing (e.g. [DocumentDB](https://aws.amazon.com/blogs/database/how-to-index-on-amazon-documentdb-with-mongodb-compatibility/), [DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html))
- Can modify specific fields within JSON

### Negative Consequences

- Requires additional infrastructure and development work if the need for relational database arises.
- An Amazon-only databases may be required, which could add complexity if the project ever needs to migrate off AWS.
  - Exception: Amazon's DocumentDB is compatible with MongoDB drivers and tools, which would simplify migration.
- Lacks ACID properites, but this is less important with the type of data we're storing.

## Pros and Cons of Other Options

### Use a relational database to store user data for the Next.js app

- Good, because Postgres (the standard for both this project and Truss) is cloud-agnostic
- Good, because it provides indexing
- Bad, because requires additional data modeling to "fit" into a relational model that we don't need and would result in overly complex queries
- Bad, because adds complexity to the development process: more overhead in setting up and managing models

### Use a relational database, leveraging JSONB datatypes to store dynamic JSON

**First, how does this work?**
A hybrid approach could be to use Postgres and its ability to store JSONB as a datatype. JSONB stores data in a binary format instead of a JSON blob, which can then be indexed and queried.

As opposed to storing JSON in Postgres, storing JSONB:

- Takes more time to build from input because it must be converted
- Does not preserve whitespace or order of object keys
- Removes duplicate keys
- Can be indexed and supports full text search

**Pros and Cons**

- Good, because allows storing of both structured and unstructured data, providing flexibility and room for evolving needs
- Good, because Postgres is cloud-agnostic
- Neutral, because performance of queries with our data and use case is currently unknown
- Bad, because cannot modify individual fields within JSON
  - Updating any field in the JSONB results in an entire row-level lock and rewrite of of the entire JSONB object
  - The [recommendation](https://www.postgresql.org/docs/current/datatype-json.html#JSON-CONTAINMENT) is to have each JSON document represent "an atomic datum...that can be modified independently."
  - Another common pattern is to initially store data as JSONB, and pull out frequently used keys into their own table
- Bad, because storage size of JSONB is greater than the equivalent amount of data in a database such as MongoDB

Further data modeling and research would need to be done to see if our use case is a good fit for this approach. It's possible to reconsider this option if the need arises.
