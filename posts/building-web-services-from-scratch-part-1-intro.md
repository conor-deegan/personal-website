---
title: "Building Web Services from Scratch: Part 1 - Intro"
author: "Conor Deegan"
postNum: 8
---

### What and why on earth would this be useful or a good idea?

I have this terrible idea to try to build a selection of web services from scratch. I have a few reasons for this:

1. So much of modern web development is build on top of abstractions that we don't need to fully understand in order to use them. I want to look under the hood.
2. I want to understand how the these services work at a lower level and from first principles.
3. I *think* it will be a fun challenge (I will more than likely regret this).
4. I want to improve my Rust skills.
5. I throughly enjoy banging my head against a wall.

I plan to document my progress with this mini series of posts. Feel free to follow along and laugh at my mistakes or learn from them. The code is available on [GitHub](https://github.com/conor-deegan/web-services).

### What services am I going to build?

- DNS server, client, and resolver with support for A records and possibly MX records: [here](/posts/building-web-services-from-scratch-part-2-dns)
- HTTP API: [here](/posts/building-web-services-from-scratch-part-3-http-api)
- Load balancer with support for round-robin and path based routing: [here](/posts/building-web-services-from-scratch-part-4-load-balancer)
- Persistent row oriented data store: [here](/posts/building-web-services-from-scratch-part-5-data-store)
- Key-value in-memory cache store: [here](/posts/building-web-services-from-scratch-part-6-cache-store)
- Message queue: [here](/posts/building-web-services-from-scratch-part-7-message-queue)
- Object storage with support for GET and PUT: [here](/posts/building-web-services-from-scratch-part-8-object-storage)
- SMTP server: [here](/posts/building-web-services-from-scratch-part-9-smtp-server)

### Rules of engagement

- I want to try to keep this as simple as possible.
- I plan to use Rust or Typescript for almost everything.
- I will try to avoid using any libraries that do the heavy lifting for me however I want to focus on the core functionality of the services so I may cheat a little.
- I won't be explaining much theory, these services are all pretty self-explanatory and there are plenty of resources online that explain how they work. I will focus on the implementation.

Right, let's get started. I am going to start with the DNS set up. I have pretty much no idea how DNS *actually* works (something something port 53) so this should be fun...


### Wait

This is an edit. This gets out of hand real quick without some sort of container management. So I am going to use Docker and docker-compose.

The Dockerfiles for each binary are very simple as I don't really care about container size or building the binary for production. I just want to be able to run the services in a container. There is also a .dockerignore file to ignore the target directory when building the image. Finally, there is also a docker-compose.yml file in the root of the project that will build and run all the services.

Simply run `docker-compose up` to build and run all the services. I make this clear in each subsequent post but I thought I would mention it here too.

Okay, now let's get started.
