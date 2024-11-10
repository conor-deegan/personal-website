---
title: "BWSS: Part 8 - Microservices & Path based Routing"
author: "Conor Deegan"
postNum: 15
type: "post"
---

### Introduction

Okay so the last few posts have been fairly similar. We have built a data store, cache, and message queue. All of which connect and interact with the HTTP API in a similar way. The data store over TCP and sockets, the cache over HTTP, and the message queue over HTTP.

Now we are going to augment our "cloud" to support microservices. We will add a new HTTP server that will be responsible for object storage. This service will be deployed along side our main HTTP API server. 

In order to achieve this, we will need to update our load balancer to support path based routing. This will allow us to route requests to the correct service based on the path of the request.

As usual, the final code is available on [GitHub](https://github.com/conor-deegan/web-services).

### Architecture so far

It is worth taking a moment to look at our architecture so far:

![Architecture so far](/post/architecture_1.svg "Our Architecture")

The steps in the diagram are as follows:

- The client makes a request to the DNS resolver to get the IP address of our load balancer.
- If the DNS resolver has the IP address cached, it returns it to the client. Otherwise, it queries the root DNS server to get the IP address.
- The client makes a request to the load balancer.
- The load balancer routes the request to one of the servers in the pool.
- The server processes the request and returns a response to the client. As part of this processing, the server may need to communicate with other services, such as the data store, cache, or message queue.

### Adding a new service

The goal of this post is to update our architecture such that it works as follows:

![New architecture](/post/architecture_2.svg "New Architecture")

The load balancer now routes requests to the correct service based on the path of the request. The main HTTP API server will handle requests to `/api/*`, and the object storage server will handle requests to `/files/*`.

### Load balancer Update

First we must update our load balancer's `config.toml` file to support path based routing. We will add a new section to the file called `path_routes`. This section will contain a list of paths and the corresponding service to route to.

```toml
# Load-balanced targets
[[targets]]
address = "http-api-1:8001"
health_check_endpoint = "/healthz"

[[targets]]
address = "http-api-2:8001"
health_check_endpoint = "/healthz"

[[targets]]
address = "object-storage:8007"
health_check_endpoint = "/healthz"

# Path-based routing configuration
# Each entry specifies a path prefix and the address of the service for that path.
[[path_routes]]
path = "/files"
address = "object-storage:8007"
```

We have 3 targets in the `targets` section. Two for the main HTTP API server and one for the object storage server. We then have a single entry in the `path_routes` section. This entry specifies that requests to the `/files` path should be routed to the object storage server.

The full updates to the load balancer can be seen in the code, but at a high level, here are the main changes:

- When a request comes in, the load balancer checks the path of the request.
- If the path matches one of the entries in the `path_routes` section, the load balancer routes the request to the specified target.
- If the path does not match any of the entries in the `path_routes` section, the load balancer routes the request to one of the servers in catch all targets.

We can read the request path like so:

```rust
let request = String::from_utf8_lossy(&buffer[..bytes_read]);
let path = if let Some(line) = request.lines().next() {
    line.split_whitespace().nth(1).unwrap_or("/").to_string()
} else {
    "/".to_string()
};

println!("Request path: {}", path);
```

We can then get the correct target like so:

```rust
let backend_address = if let Some(route) = path_routes_clone
    .iter()
    .find(|route| path.starts_with(&route.path))
{
    println!("Routing to specific path-based backend: {}", route.address);
    route.address.clone()
} else {
    // Collect the addresses of the path-routed backends
    let path_routed_addresses: Vec<String> = path_routes_clone.iter()
    .map(|route| route.address.clone())
    .collect();

    // Regular load balancing for non-matching paths
    let healthy_backends = {
        let locked_health = targets_health_clone.lock().unwrap();
        targets_clone
            .iter()
            .filter(|b| *locked_health.get(b).unwrap())
            .filter(|b| !path_routed_addresses.contains(&b.address))
            .collect::<Vec<_>>()
    };

    if healthy_backends.is_empty() {
        eprintln!("No healthy backends available.");
        let body = "Service Unavailable";
        let response = format!(
            "HTTP/1.1 503 Service Unavailable\r\nContent-Length: {}\r\n\r\n{}",
            body.len(),
            body
        );
        if let Err(e) = write_flush_shutdown(socket, response.as_bytes()).await {
            eprintln!("Error handling socket: {}", e);
        }
        return;
    }

    // Select a backend using round-robin
    let (address, _) = {
        let mut index_lock = current_backend_clone.lock().unwrap();
        let index = *index_lock % healthy_backends.len();
        let address = healthy_backends[index].address.clone();
        *index_lock += 1;
        (address, *index_lock)
    };

    address
};
```

### Testing the Load Balancer

Spin up our cloud using `docker-compose up --build`. Our load balancer now has 3 targets, 2 for the main HTTP API server and 1 for the object storage server:

```bash
load-balancer-1   | Healthy targets: 3
```

Send a request to the main HTTP API server from the ingress client:

```bash
cargo run -- -X GET http://example.com/api/spells
```

Our load balancer should route the request to one of the main HTTP API servers:

```bash
load-balancer-1   | Request path: /api/spells
load-balancer-1   | Forwarding connection to backend: http-api-1:8001
```

Hit the same endpoint to show round-robin load balancing:

```bash
load-balancer-1   | Request path: /api/spells
load-balancer-1   | Forwarding connection to backend: http-api-2:8001
```

Now send a request to the object storage server:

```bash
cargo run -- -X GET http://example.com/files/image.jpg
```

Our load balancer routes the request to the object storage server:

```bash
load-balancer-1   | Request path: /files/put
load-balancer-1   | Routing to specific path-based backend: object-storage:8007
```

However, this request fails as we have not yet implemented the object storage server.

### Conclusion

We have updated our load balancer to support path based routing. This allows us to route requests to the correct service based on the path of the request. We now need to implement the object storage server to complete our microservices architecture.
