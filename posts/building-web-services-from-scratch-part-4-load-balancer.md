---
title: "Building Web Services from Scratch: Part 4 - Load Balancer"
author: "Conor Deegan"
postNum: 11
---

### Introduction

Recap, we now have a simple HTTP API that serves Harry Potter spells. We have tested that the API works with our DNS servers (client, resolver, auth server). Harry Potter is pretty popular. What happens if we get a lot of requests? The server will get overloaded. How can we handle this? We can add more instances of the API and distribute the requests between them. Sounds like a load balancer.

For some unknown reason, load balancers have always been my favourite part of distributed systems. I have no idea why. I think maybe because they are a fairly elegant solution to a complex problem.

The final code is available on [GitHub](https://github.com/conor-deegan/web-services).

### Load Balancer

In the spirit of the previous posts, I won't be explaing the code in much detail, just the important parts. However, writing this load balancer in Rust was great exposure to the world of sharing state between threads. So I will touch on the briefly. The load balancer is a simple round-robin load balancer. It listens for incoming requests and forwards them to the next server in the list.

I decided to try and get fancy and support health checks of the target servers... there was no need but anyway, it works. I did have to add a simple health check endpoint to the HTTP API. It just returns a 200 status code.

First up, we need a way to define our targets and their health checks. I decided to use `toml` for this. Here is an example of the config file:

```toml
[[targets]]
address = "http-api-1:8001"
health_check_endpoint = "/healthz"

[[targets]]
address = "http-api-2:8001"
health_check_endpoint = "/healthz"
```

It's pretty simple, hardcode your list of targets and their health check endpoints. The load balancer will check these endpoints every 5 seconds and remove a target if it fails. Once the target is back up, it will be added back to the list. Elegant.

Next week need a way for the server to handle connections between clients and targets.

```rust
async fn handle_connection(mut incoming: TcpStream, backend_address: String) -> Result<(), Box<dyn std::error::Error>> {

    println!("Forwarding connection to backend: {}", backend_address);

    let mut backend = TcpStream::connect(backend_address).await?;
    let (mut ri, mut wi) = incoming.split();
    let (mut rb, mut wb) = backend.split();

    let client_to_server = io::copy(&mut ri, &mut wb);
    let server_to_client = io::copy(&mut rb, &mut wi);

    tokio::try_join!(client_to_server, server_to_client)?;
    Ok(())
}
```

It takes an incoming connection and forwards it to a backend server. The `tokio::try_join!` macro is used to wait for both the client and server connections to finish.

Next, we need a function to handle the health checks.

```rust
async fn check_targets_health(target_health: Arc<Mutex<HashMap<Targets, bool>>>, targets: Vec<Targets>) {
    let client = Client::new();

    for target in &targets {
        let health_check_url = format!("http://{}{}", target.address, target.health_check_endpoint);

        let health = client.get(&health_check_url)
            .send()
            .await
            .map(|resp| resp.status().is_success())
            .unwrap_or(false);

        // Update the health status within the lock's scope to minimize lock duration.
        target_health.lock().unwrap().insert(target.clone(), health);
    }
}
```

Yeap I know I know, unwrap. I'm sorry. This function sends a GET request to the health check endpoint of each target and updates the health status in the `target_health` map. The `target_health` map is a `Arc<Mutex<HashMap<Targets, bool>>>`. The `Arc` is used to share the map between threads and the `Mutex` is used to ensure only one thread can access the map at a time. This is important because we are updating the map from multiple threads. For me, it was a great example of where Rust can slow you down initially but once you understand it, the benefits are clear.

The next function isn't really needed but it's used to write a response back to the client if there are no healthy targets.

```rust
async fn write_flush_shutdown(mut socket: tokio::net::TcpStream, response: &[u8]) -> Result<(), Box<dyn std::error::Error>> {
    socket.write_all(response).await?;
    socket.flush().await?;
    socket.shutdown().await?;
    Ok(())
}
```

Finally, the main function:

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {

    // read the config file
    let config_str = fs::read_to_string("src/config.toml").await?;
    let Config { targets } = toml::from_str(&config_str)?;

    // Create a map of target health statuses
    let target_health = Arc::new(Mutex::new(HashMap::new()));
    for target in &targets {
        target_health.lock().unwrap().insert(target.clone(), true);
    }

    // Check the health of the targets every 5 seconds
    let target_health_clone = target_health.clone();
    let targets_clone = targets.clone();
    tokio::spawn(async move {
        let mut interval = time::interval(Duration::from_secs(5));
        loop {
            interval.tick().await;
            check_targets_health(target_health_clone.clone(), targets_clone.clone()).await;
        }
    });

    // listen for incoming connections to the load balancer on port 80
    let listener = TcpListener::bind("0.0.0.0:80").await?;
    let current_backend = Arc::new(Mutex::new(0));

    loop {
        let (socket, _) = listener.accept().await?;
        let targets_clone = targets.clone();
        let targets_health_clone = target_health.clone();
        let current_backend_clone = current_backend.clone();

        tokio::spawn(async move {
            let healthy_backends = {
                let locked_health = targets_health_clone.lock().unwrap();
                targets_clone.iter().filter(|b| *locked_health.get(b).unwrap()).collect::<Vec<_>>()
            }; // Lock is dropped here as it goes out of scope.

            if !healthy_backends.is_empty() {
                // Determine the backend to use in a separate, lock-scoped block to avoid capturing the guard.
                let (backend_address, _) = {
                    let mut index_lock = current_backend_clone.lock().unwrap();
                    let index = *index_lock % healthy_backends.len();
                    let backend_address = healthy_backends[index].address.clone();
                    *index_lock += 1;
                    (backend_address, *index_lock)
                }; // Lock is dropped here.

                // Perform the connection handling.
                if let Err(e) = handle_connection(socket, backend_address).await {
                    eprintln!("Failed to handle connection: {}", e);
                }
            } else {
                eprintln!("No healthy backends available.");
                // return an error from the load balancer to the client
                let body = "Service Unavailable";
                let response = format!(
                    "HTTP/1.1 503 Service Unavailable\r\nContent-Length: {}\r\n\r\n{}",
                    body.len(),
                    body
                );
                if let Err(e) = write_flush_shutdown(socket, response.as_bytes()).await {
                    eprintln!("Error handling socket: {}", e);
                }
            }
        });
    }
}
```

This is a long function but broken down it's pretty simple:

1. Read the config file and create a map of target health statuses.
2. Check the health of the targets every 5 seconds.
3. Listen for incoming connections to the load balancer on port 80.
4. For each incoming connection, determine the healthy backends and select one to forward the connection to. The load balancer uses a round-robin strategy to select the backend. This is a fancy way of saying it just goes through the list of backends in order.
5. If there are no healthy backends, return an error to the client.

Done!

Let's test it.

### Testing the Load Balancer

Run `docker-compose up` in the root directory. This also runs 2 instances of the http server.

We should see the load balancer logs output that there are two healthy targets.

```bash
load-balancer-1  | Healthy targets: 2
```

We can test this end-to-end by running in the `ingress-client` directory:

```bash
$ cargo run -- -X GET http://example.com/api/spells
```

Run the command a few more times and we can see in the load balancer logs that it's switching between the 2 targets in a round-robin fashion.

If we shut off one of the instances, once the health-check runs again, the load balancer will only forward requests to the healthy target.

Test this with:

```bash
$ docker-compose stop http-api-2
```

If we bring the target back up, the load balancer will start forwarding requests to it again.

```bash
$ docker-compose start http-api-2
```

If we shut off both targets, the load balancer will return a 503 error to the client.

Fuck me that's cool! The flow of the end-2-end request is as follows:

1. HTTP/DNS client sends a request to the DNS resolver for the IP of the domain.
2. The DNS resolver checks it's cache for the IP of the domain.
3. If the IP is not in the cache, the DNS resolver forwards the request to the DNS server.
4. The DNS server returns the IP of the domain to the DNS resolver.
5. The DNS resolver caches the IP of the domain for the TTL.
6. The DNS resolver returns the IP of the domain to the HTTP/DNS client.
7. The HTTP/DNS client sends a request to the IP of the domain.
8. The load balancer receives the request and forwards it to one of the backends based on the round-robin strategy and the health status of the backends.
9. The backend processes the request and sends a response back to the HTTP/DNS client via the load balancer.

Now for a an interesting test. Make a POST request to the `ingress-client`:

```bash
$ cargo run -- -X POST -H "Content-Type: application/json" -d '{"id": 3, "name": "Alohomora", "description": "Unlocking Charm"}' http://example.com/api/spells
```

And then follow this up with a GET request to the `ingress-client`:

```bash
$ cargo run -- -X GET http://example.com/api/spells
```

Hmm, despite the POST request succeeding, the GET request is returning only the 2 hardcoded spells. Where is the new spell? This is because the POST request is sent to one of the backends and the GET request is sent to the other backend. The backends do not share state so the new spell is not in the in-memory data structure of the backend the GET request is sent to.

Run the GET request again and you will notice it now seems to be "working". The request was round-robined to the backend that has the new spell in it's in-memory data structure.

This is why we need to have a shared state between the backends. Time to build a database.

Peace 🤘
