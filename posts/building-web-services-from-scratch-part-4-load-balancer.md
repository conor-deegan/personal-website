---
title: "Building Web Services from Scratch: Part 4 - Load Balancer"
author: "Conor Deegan"
postNum: 11
---

### Introduction

Recap, we now have a simple HTTP API that serves Harry Potter spells. We have tested that the API works with our DNS servers. What happens if we get a lot of requests? The server will get overloaded. How can we handle this? We can add more instances of the API and distribute the requests between them. Sounds like a job for a load balancer.

The final code is available on [GitHub](https://github.com/conor-deegan/web-services).
