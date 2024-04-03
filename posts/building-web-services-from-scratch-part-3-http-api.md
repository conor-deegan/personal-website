---
title: "Building Web Services from Scratch: Part 3 - HTTP API"
author: "Conor Deegan"
postNum: 10
---

### Introduction

Right, let's get straight into it. The DNS post was wayyyyy too long. This one will be much quicker. I am going to build a simple HTTP API in Rust that has 3 endpoints:

- Get all spells: `GET /api/spells`
- Get a spell by ID: `GET /api/spells/:id`
- Create a spell: `POST /api/spells`

This should be pretty straightforward.


### The HTTP Server
