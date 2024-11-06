---
title: "BWSS: Part 2 - DNS"
author: "Conor Deegan"
postNum: 9
type: "post"
---

### Introduction

The aim of this post is to build a simple DNS server from scratch using Rust.

The final code is available on [GitHub](https://github.com/conor-deegan/web-services).

Let's get started.

Edit: this post ended up being quite long. I wasn't bothered to split it out but normally these posts will be considerably shorter.

### Some scope

- I'm going to build an authoritative DNS server. This means that it will be responsible for a specific domain as it will host the domain's zone file.
- I'm going to build a simple DNS client (however, I will call this application the ingress-client, which will make sense later) to test the server.
- I am going to build a **very** simple DNS resolver which is responsible for querying the authoritative DNS server for a specific domain and caching the results for a specific TTL and then returning the IP address to the client.
- For now, the DNS server will only support A records. I may add support for MX records in the future.
- I am absolutely not going to write a whole lot about the DNS protocol in detail, Google will do a much better job at that than me (this applies to almost every web service I will build).

### WTF is DNS?

Easy, it does this:

```
conordeegan.dev -> 104.21.79.122
```

The *rough* steps it takes to do this are:

- Initial Query: The process starts when a user's device asks a DNS resolver (usually from their ISP or a third-party) to find example.com's IP address.
- Root Nameserver Query: The resolver, unsure where example.com is, asks a root nameserver, which directs it towards servers handling .com domains.
- TLD Nameserver Query: Guided by the root nameserver, the resolver approaches a .com domain server. This server knows which nameservers manage example.com but not its IP.
- Authoritative Nameserver Query: The resolver then asks example.com's specific nameserver, as indicated by the .com server. This nameserver knows example.com's IP.
- Caching: After getting the IP from this nameserver, the resolver saves it for a time determined by the TTL. This caching speeds up future requests for the same site.
- Response to User's Device: The resolver finally sends the IP address to the user's device, enabling the browser to request example.com via HTTP from its web server.

How are DNS clients, resolvers and servers related?

- A DNS client is a device that makes DNS queries (e.g. a web browser).
- A DNS resolver is a server that queries authoritive DNS servers on behalf of a client. It caches the results for a specific TTL before querying the authoritative DNS server again.
- An authoritive DNS server is a server that responds to DNS queries from DNS resolvers. It ultimately converts domain names to IP addresses.

How hard can it be? 🫠

### Authoritive DNS server

I am going to build a simple authoritive DNS server that will respond to DNS queries for a specific domain. The server will be responsible for hosting the domain's zone file hence *authoritative* DNS server.

The server will listen on port 53 for UDP packets. The server will parse the DNS query and respond with the IP address of the domain if it is found in the domain zone file, if it is not found it will respond with an NXDOMAIN (nonexistent domain) error.

The domain zone file I will use looks like:

```
example.com=0.0.0.0,3600
```

Where `example.com` is the domain name, `0.0.0.0` is the IP address, and `3600` is the TTL (time to live) in seconds.

I am cheating a bit here and in reality the zone file would contain a lot more information than this. However, for the purposes of this post, this will do and is close enough to the real thing.

The code is fairly self-explanatory so I will not go into too much detail but instead provide a high-level overview of the main parts.

We will need a function for parsing the domain zone file and storing the records in a HashMap.

```rust
async fn load_a_records_from_file(file_path: &Path) -> io::Result<HashMap<String, (Ipv4Addr, u32)>> {
    let file = File::open(file_path)?;
    let buf = io::BufReader::new(file);
    let mut a_records = HashMap::new();

    for line in buf.lines() {
        // Parsing each line to extract domain, IP address, and TTL.
        let line = line?;
        let parts: Vec<&str> = line.split('=').collect();
        if parts.len() == 2 {
            let domain = parts[0];
            let rest: Vec<&str> = parts[1].split(',').collect();
            if rest.len() == 2 {
                // Converting string IP to Ipv4Addr and string TTL to u32.
                let ip_address = rest[0].parse().map_err(|_| Error::new(io::ErrorKind::InvalidData, "Invalid IP address"))?;
                let ttl = rest[1].parse().map_err(|_| Error::new(io::ErrorKind::InvalidData, "Invalid TTL"))?;
                // Storing the parsed data in a HashMap.
                a_records.insert(domain.to_string(), (ip_address, ttl));
            }
        }
    }

    Ok(a_records)
}
```

This function is simple. It reads the domain zone file line by line, parses each line to extract the domain, IP address, and TTL, and stores them in a HashMap called `a_records`.

Next, we need a function to create a DNS response packet. This function takes the transaction ID, domain name, IP address, and TTL as input and returns a byte array representing the DNS response packet.

Note: The DNS response packet is a binary format that follows the DNS protocol. The format is well-defined and consists of various fields such as transaction ID, flags, questions, answer RRs (resource records), authority RRs, and additional RRs. The response packet is constructed by concatenating these fields in the correct order. The transaction ID is used to match the response to the original query. I have no intention of explaining the DNS protocol in detail, so I will leave it at that.

```rust
fn create_dns_response(transaction_id: [u8; 2], domain: &str, ip_address: Ipv4Addr, ttl: u32) -> Vec<u8> {
    let mut response = Vec::new();
    let ip_bytes = ip_address.octets();
    let ttl_bytes = ttl.to_be_bytes(); // Convert TTL to byte array in big-endian format

    // Transaction ID, Flags, Questions, Answer RRs, Authority RRs, Additional RRs
    response.extend_from_slice(&transaction_id);
    response.extend_from_slice(&[0x81, 0x80, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]);

    // Question section
    for label in domain.split('.') {
        response.push(label.len() as u8);
        response.extend_from_slice(label.as_bytes());
    }
    response.extend_from_slice(&[0x00, 0x00, 0x01, 0x00, 0x01]);

    // Answer section
    response.extend_from_slice(&[0xc0, 0x0c, 0x00, 0x01, 0x00, 0x01]);
    response.extend_from_slice(&ttl_bytes);
    response.extend_from_slice(&[0x00, 0x04]);
    response.extend_from_slice(&ip_bytes);

    response
}
```

Up next, we need a function to parse the DNS query packet and extract the domain name from it. This function takes the buffer containing the DNS query packet and the starting position of the domain name in the buffer as input and returns the domain name as a string. The first 12 bytes of the DNS query packet contain the header information, so we skip those bytes and start parsing the domain name from the 13th byte.

```rust
fn parse_domain_name(buf: &[u8], start: usize) -> Result<String, &'static str> {
    let mut position = start;
    let mut domain_name = String::new();

    while position < buf.len() && buf[position] != 0 {
        let length = buf[position] as usize;
        position += 1; // move past the length byte

        // Check for potential out-of-bounds or invalid length
        if length == 0 || position + length > buf.len() {
            return Err("Invalid domain name in query");
        }

        if !domain_name.is_empty() {
            domain_name.push('.');
        }
        let label = match std::str::from_utf8(&buf[position..position + length]) {
            Ok(s) => s,
            Err(_) => return Err("Invalid UTF-8 label in domain name"),
        };
        domain_name.push_str(label);

        position += length; // move to the next label
    }

    Ok(domain_name)
}
```

Sicko, the last thing we need to do is handle when no A record is found for the domain name in the query. We will create a function to send a DNS response with an error message (NXDOMAIN) back to the client/resolver. This function takes the transaction ID, request buffer, request length, client address, and UDP socket as input and sends a DNS response packet with the NXDOMAIN error code back to the client/resolver.

```rust
async fn send_nxdomain_response(
    transaction_id: [u8; 2],
    request: &[u8],
    request_len: usize,
    addr: &std::net::SocketAddr,
    socket: &tokio::net::UdpSocket,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut response = Vec::new();

    // Transaction ID
    response.extend_from_slice(&transaction_id);

    // Flags: Response, Opcode 0 (Standard Query), Authoritative Answer False, Truncated False,
    // Recursion Desired True, Recursion Available False, Z Reserved, Answer Authenticated False,
    // Non-authenticated data Acceptable, Reply Code NXDOMAIN (3)
    response.extend_from_slice(&[0x81, 0x83]); // Note: 0x83 indicates NXDOMAIN

    // Questions: 1, Answer RRs: 0, Authority RRs: 0, Additional RRs: 0
    response.extend_from_slice(&[0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

    // Repeat the question section from the request
    response.extend_from_slice(&request[12..request_len]);

    // Sending the NXDOMAIN response
    socket.send_to(&response, addr).await?;

    Ok(())
}
```

Finally, we can put everything together in the main function. The main function will load the A records from the domain zone file, bind the server to UDP port 53, listen for incoming DNS queries, parse the domain name from the query, and send the appropriate DNS response back to the client.

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load the A records from "src/domain.txt".
    let a_records = load_a_records_from_file(Path::new("src/domain.txt")).await?;

    // Bind the server to UDP port 53 and listens for incoming DNS queries.
    let socket = UdpSocket::bind("0.0.0.0:53").await?;
    println!("Listening on {}", socket.local_addr()?);

    let mut buf = [0u8; 512]; // Buffer to store incoming DNS queries.

    loop {
        let (len, addr) = socket.recv_from(&mut buf).await?;
        println!("Received query from {}", addr);

        match parse_domain_name(&buf, 12) { // Start parsing after the header
            Ok(domain) => {
                println!("Parsed domain: {}", domain);
                match a_records.get(&domain) {
                    Some((ip_address, ttl)) => {
                        let transaction_id = [buf[0], buf[1]];
                        let response = create_dns_response(transaction_id, &domain, *ip_address, *ttl);
                        if let Err(e) = socket.send_to(&response, &addr).await {
                            eprintln!("Failed to send response: {}", e);
                        } else {
                            println!("Sent response to {}", addr);
                        }
                    },
                    None => {
                        let transaction_id = [buf[0], buf[1]];
                        if let Err(e) = send_nxdomain_response(transaction_id, &buf, buf.len(), &addr, &socket).await {
                            eprintln!("Failed to send NXDOMAIN response: {}", e);
                        } else {
                            println!("Sent NXDOMAIN response to {}", addr);
                        }
                    }
                }
            },
            Err(e) => eprintln!("Failed to parse domain name: {}", e),
        }
    }

}
```

That's that 🔥 Now, you can run the authoritive DNS server using `cargo run` and test it by sending DNS queries to `127.0.0.1` on port 53. For example,

```bash
$ dig @127.0.0.1 -p 53 example.com
```

or using `nslookup`:

```bash
$ nslookup example.com 127.0.0.1
```

Weirdly, it works on first try...

### DNS Resolver

Right, the authoritive server is done. Now, we need to build the resolver. The resolver will be a simple DNS server that accepts DNS queries from DNS clients, if the requested domain is in the resolvers cache and not expired, it sends the response back to the client. If the requested domain is not in the cache, it forwards the query to the authoritive server, caches the response, and sends the response back to the client.

First up, we need to implement a simple DNS cache to store the DNS responses. The cache will store the IP address and the time the entry is valid until. If the entry is expired, it will be removed from the cache.

```rust
struct CacheEntry {
    ip_address: Ipv4Addr,
    valid_until: u64,
}

struct DnsCache {
    entries: HashMap<String, CacheEntry>,
}

// simple DNS Cache implementation
impl DnsCache {
    fn new() -> Self {
        DnsCache { entries: HashMap::new() }
    }

    fn get(&self, domain: &str) -> Option<(Ipv4Addr, u64)> {
        if let Some(entry) = self.entries.get(domain) {
            // Check if the entry is still valid
            let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
            if entry.valid_until > now {
                return Some((entry.ip_address, entry.valid_until));
            }
        }
        None
    }

    fn insert(&mut self, domain: &str, ip_address: Ipv4Addr, ttl: u32) {
        let valid_until = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() + u64::from(ttl);
        self.entries.insert(domain.to_string(), CacheEntry { ip_address, valid_until });
    }
}
```

Next up, we can use some of the functions we created for the DNS authoritive server above in the resolver. We can copy the `send_nxdomain_response`, `parse_domain_name`, and `create_dns_response` functions directly to the resolver. Yeah yeah yeah, I know, code duplication is bad, use libs, or workspaces, or whatever. But for now, we just hack.

The last function we need to create, apart from the main function, is a function to forward the DNS query to the authoritive server if the requested domain is not in the cache.

```rust
async fn query_authoritative_server(domain: &str) -> Result<(Ipv4Addr, u32), Box<dyn Error>> {
    // Connect to the authoritative DNS server
    let server_addr = "dns-server:53";
    let socket = UdpSocket::bind("0.0.0.0:0").await?;
    socket.connect(server_addr).await?;

    // Construct the DNS query message
    let mut query = Vec::with_capacity(512);
    query.extend_from_slice(&[0x00, 0x01]); // Transaction ID
    query.extend_from_slice(&[0x01, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]); // Flags and Counts
    for label in domain.split('.') {
        query.push(label.len() as u8);
        query.extend_from_slice(label.as_bytes());
    }
    query.push(0); // end of domain name
    query.extend_from_slice(&[0x00, 0x01, 0x00, 0x01]); // QType and QClass

    socket.send(&query).await?;

    // Receive the DNS response
    let mut response = [0u8; 512];
    let _ = socket.recv(&mut response).await?;

    // Check for NXDOMAIN response
    // The RCODE is the last four bits of the second byte of the flags section
    // which itself is the second and third bytes of the response
    let rcode = response[3] & 0x0F;
    if rcode == 3 {
        // NXDOMAIN
        return Err("NXDOMAIN: The domain name does not exist.".into());
    }

    let ip_start = 14 + (domain.len() + 2) + 4 + 10; // Skip to the answer part
    let ip_address = Ipv4Addr::new(
        response[ip_start],
        response[ip_start + 1],
        response[ip_start + 2],
        response[ip_start + 3],
    );

    // TTL is 6 bytes before the IP address in the answer
    let ttl_bytes = &response[ip_start - 6..ip_start - 2];
    let ttl = u32::from_be_bytes(ttl_bytes.try_into()?);

    Ok((ip_address, ttl))
}
```

I spent a lot of time banging my head against the wall trying to figure out the bytes above, but it's working! Now, we can implement the main function for the resolver. The main function will listen for DNS queries from clients, check if the requested domain is in the cache, and send the response back to the client. If the domain is not in the cache, it will forward the query to the authoritive server, cache the response, and send the response back to the client.

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let resolver_socket = UdpSocket::bind("0.0.0.0:5354").await?;
    println!("DNS Resolver listening on {}", resolver_socket.local_addr()?);

    let mut cache = DnsCache::new();

    let mut request = [0u8; 512];

    loop {
        let (_, client_addr) = resolver_socket.recv_from(&mut request).await?;
        println!("Received query from {}", client_addr);

        match parse_domain_name(&request, 12) {
            Ok(domain) => {
                 println!("Parsed domain: {}", domain);

                 // Check if the domain is in the cache
                 if let Some((ip_address, ttl)) = cache.get(&domain) {
                      // Send the cached IP address to the client
                      println!("Cache hit: {} -> {}", domain, ip_address);
                      let transaction_id = [request[0], request[1]];
                      let ttl_u32 = ttl as u32; // Convert u16 to u32
                      let response = create_dns_response(transaction_id, &domain, ip_address, ttl_u32);
                      if let Err(e) = resolver_socket.send_to(&response, &client_addr).await {
                          eprintln!("Failed to send response: {}", e);
                      } else {
                          println!("Sent response to {} for domain {} and ip {}", client_addr, domain, ip_address);
                      }
                  } else {
                      // Query the authoritative server for the IP address
                      match query_authoritative_server(&domain).await {
                          Ok((ip_address, ttl)) => {
                              println!("Cache miss: {} -> {} {}", domain, ip_address, ttl);
                              // Insert the domain and IP address into the cache
                              cache.insert(&domain, ip_address, ttl);

                              let transaction_id = [request[0], request[1]];
                              let response = create_dns_response(transaction_id, &domain, ip_address, ttl);
                              if let Err(e) = resolver_socket.send_to(&response, &client_addr).await {
                                  eprintln!("Failed to send response: {}", e);
                              } else {
                                  println!("Sent response to {} for domain {} and ip {}", client_addr, domain, ip_address);
                              }
                          },
                          Err(_e) => {
                              // Send a NXDOMAIN response to the client
                              let transaction_id = [request[0], request[1]];
                              if let Err(e) = send_nxdomain_response(transaction_id, &request, request.len(), &client_addr, &resolver_socket).await {
                                  eprintln!("Failed to send NXDOMAIN response: {}", e);
                              } else {
                                  println!("Sent NXDOMAIN response to {}", client_addr);
                              }
                          }
                      }
                  }
            },
            Err(e) => eprintln!("Failed to parse domain name: {}", e),
        }
    }
}
```

DONE 🤝. We can test the resolver and authoritative server together:

Comment out all services in the docker-compose.yml file except the resolver and authoritative server. Run `docker-compose up` to build and start the services.

We can then use the `dig` or `nslookup` command to query the resolver:

```bash
$ dig @127.0.0.1 -p 5354 example.com
```

```bash
$ nslookup example.com 127.0.0.1 -port=5354
```

All going well, the commands should return the IP adddress of example.com: 0.0.0.0 and the TTL of example.com: 3600. You will notice that the first query will be a cache miss, and the second query will be a cache hit! It works!

### DNS Client (aka the ingress-client)

The DNS client, which I will call the ingress-client from now on, will be a simple CLI app which takes an endpoint and HTTP method as arguments. The client will send a DNS query to the resolver, receive the IP address of the requested domain, and then connect to the server via HTTP. Simple?!

I am calling this service ingress-client because it will be the entry point for all incoming requests to our "cloud".
- A request will start from the ingress-client, which will resolve the IP address of the load balancer using the DNS resolver and DNS authoritive server.
- The ingress client will then connect to the load balancer using the resolved IP address and send the HTTP request.
- From there, the load balancer will forward the request to the appropriate server using the round-robin algorithm.
- The server will then process the request (interacting with our hand made database and cache) and send the response back to the ingress-client via the load balancer.

At least, that's the plan...

The ingress-client will have a very similar interface to curl, with the following options:

- `-X` or `--request`: The HTTP method to use (GET, POST, PUT, DELETE, etc.)
- `-d` or `--data`: The data to send with the request (e.g. POST data)
- `-H` or `--header`: The headers to send with the request (e.g. Content-Type: application/json).

For example a GET request to example.com would look like this:

```bash
$ cargo run http://example.com/api/spells
```

A POST request to example.com with some data would look like this:

```bash
$ cargo run -- -X POST -H "Content-Type: application/json" -d '{"id": 3, "name": "Alohomora", "description": "Unlocking Charm"}' http://example.com/api/spells
```

Right so the first thing we need for our ingress client is a function for it to query the DNS resolver. The function will take the domain name as an argument and return the IP address. Lazy as I am, I will copy the `query_authoritative_server` function from the resolver and modify it to query the resolver instead.

```rust
// Query the DNS resolver for the IP address of a domain
async fn query_dns_resolver(domain: &str) -> Result<Ipv4Addr, Box<dyn Error>> {
    // Connect to the DNS resolver
    let resolver_addr = "127.0.0.1:5354";
    let socket = UdpSocket::bind("127.0.0.1:0").await?;
    socket.connect(resolver_addr).await?;

    // Construct the DNS query message
    let mut query = Vec::with_capacity(512);
    query.extend_from_slice(&[0x00, 0x01]); // Transaction ID
    query.extend_from_slice(&[0x01, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]); // Flags and Counts
    for label in domain.split('.') {
        query.push(label.len() as u8);
        query.extend_from_slice(label.as_bytes());
    }
    query.push(0); // end of domain name
    query.extend_from_slice(&[0x00, 0x01, 0x00, 0x01]); // QType and QClass

    socket.send(&query).await?;

    // Receive the DNS response
    let mut response = [0u8; 512];
    let _ = socket.recv(&mut response).await?;

    // Check for NXDOMAIN response
    // The RCODE is the last four bits of the second byte of the flags section
    // which itself is the second and third bytes of the response
    let rcode = response[3] & 0x0F;
    if rcode == 3 {
        // NXDOMAIN
        return Err("NXDOMAIN: The domain name does not exist.".into());
    }

    let ip_start = 14 + (domain.len() + 2) + 4 + 10; // Skip to the answer part
    let ip_address = Ipv4Addr::new(
        response[ip_start],
        response[ip_start + 1],
        response[ip_start + 2],
        response[ip_start + 3],
    );
    Ok(ip_address)
}
```

This function is pretty much identical to the `query_authoritative_server` function, except that it sends the query to the resolver instead of the authoritative server.

Next we need to define some of our CLI options using `clap`:

```rust
#[derive(Parser, Debug)]
#[clap(version = "0.1.0", author = "Conor Deegan")]
struct Args {
    /// Sets the method for the request
    #[clap(short = 'X', long = "request", value_name = "METHOD", default_value = "GET")]
    method: String,

    /// Sets the HTTP request headers
    #[clap(short = 'H', long = "header", value_name = "HEADER")]
    headers: Vec<String>,

    /// Sets the HTTP request body
    #[clap(short = 'd', long = "data", value_name = "DATA")]
    data: Option<String>,

    /// Sets the endpoint to request
    #[clap(value_name = "ENDPOINT")]
    endpoint: String,
}
```

This is all fairly standard if you are used to curl. Hopefully it all makes sense.

We will need two util functions. One to extract the domain from the endpoint and another to replace the domain with the IP address in the endpoint:

```rust
fn extract_host(url_str: &str) -> Result<String, &'static str> {
    let url = Url::parse(url_str).map_err(|_| "Failed to parse URL")?;
    url.host_str().map(|s| s.to_string()).ok_or("URL does not contain a host")
}

fn replace_host_with_ip(url_str: &str, ip: Ipv4Addr) -> String {
    let mut url = Url::parse(url_str).unwrap();
    url.set_host(Some(ip.to_string().as_str())).unwrap();
    url.to_string()
}
```

These are kind of boring.

No we can write our final function of this whole post.

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Args = Args::parse();

    // Extract the host from the URL
    let host = extract_host(&args.endpoint)?;

    // Query the DNS resolver for the IP address of the host
    let ip = query_dns_resolver(&host).await?;

    // Print the IP address
    println!("IP Address: {}", ip);

    // Handle the headers
    let mut headers = HeaderMap::new();
    for header in &args.headers {
        let parts: Vec<&str> = header.splitn(2, ':').collect();
        if parts.len() == 2 {
            let header_name = parts[0].trim();
            let header_value = parts[1].trim();

            if let Ok(h_name) = HeaderName::from_bytes(header_name.as_bytes()) {
                if let Ok(h_value) = HeaderValue::from_str(header_value) {
                    headers.insert(h_name, h_value);
                } else {
                    eprintln!("Invalid header value: {}", header_value);
                }
            } else {
                eprintln!("Invalid header name: {}", header_name);
            }
        }
    }

    // Send the HTTP request
    let client = reqwest::Client::new();
    let request = client
        .request(Method::from_bytes(args.method.as_bytes()).unwrap(), replace_host_with_ip(&args.endpoint, ip))
        .headers(headers.clone())
        .body(args.data.clone().unwrap_or_default());

    println!("Requesting: {}", args.endpoint);
    println!("Method: {}", args.method);
    println!("Headers: {:?}", headers);
    println!("Payload: {:?}", &args.data);

    let response = request.send().await?;

    if response.status().is_success() {
        let body = response.text().await?;
        println!("Response: {}", body);
    } else {
        eprintln!("Error: {}", response.status());
    }

    Ok(())
}
```

This function is pretty simple. It parses the CLI arguments, extracts the host from the endpoint, queries the DNS resolver for the IP address of the host, constructs the HTTP request, sends the request, and prints the response. Bingo bongo!

### Let's test it out

Note, the ingress-client is the only service that will be running outside of Docker as technically it is not part of our "cloud". It is just a client that will be used to test our services.

We need to spin up our DNS server and resolver using `docker-compose up`:

Once the authoritative server and resolver are running, we can run our ingress-client in a separate terminal window. We can test it with the following command:

```bash
$ cargo run http://example.com/api/spells
```

Or

```bash
$ cargo run -- -X POST -H "Content-Type: application/json" -d '{"id": 3, "name": "Alohomora", "description": "Unlocking Charm"}' http://example.com/api/spells
```

Both of these...fail :)

But, that was kinda expected. The logs from both the resolver and authoritative server show that the requests were received and processed correctly. The correct IP was returned, and a HTTP request was correctly crafted. The issue is pretty simple, we aren't running anything on that IP address yet. We need a web server. [That's for the next post](/posts/building-web-services-from-scratch-part-3-http-api).

P.S: This code is crappy, but that's kinda the point 🌶️
