---
title: "Building Web Services from Scratch: Part 2 - DNS"
author: "Conor Deegan"
postNum: 9
---

### Introduction

The aim of this post is to build a simple DNS server from scratch using Rust.

The final code is available on [GitHub]().

Let's get started.

### Some scope

- I'm going to build an authoritative DNS server. This means that it will be responsible for a specific domain as it will host the domain's zone file.
- I'm going to build a simple DNS client to test the server.
- I am going to build a **very** simple DNS resolver which is responsible for querying the authoritative DNS server for a specific domain and caching the results for a specific TTL and then returning the IP address to the client.
_ For now, the DNS server will only support A records. I may add support for MX records in the future.
_ I am absolutely not going to write about the DNS protocol in detail, Google will do a much better job at that than me (this applies tp almost every web service I will build).

### WTF is DNS?

Easy, it does this:

```
conordeegan.dev -> 104.21.79.122
```

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
example.com=192.0.2.1,3600
```

Where `example.com` is the domain name, `192.02.1` is the IP address, and `3600` is the TTL (time to live) in seconds.

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

Note: The DNS response packet is a binary format that follows the DNS protocol. The format is well-defined and consists of various fields such as transaction ID, flags, questions, answer RRs (resource records), authority RRs, and additional RRs. The response packet is constructed by concatenating these fields in the correct order. The transaction ID is used to match the response to the original query. I have no intention of explaining the DNS protocol in detail, so I will leave it at that. I also have no shame in admitting that I used ChatGPT to help me with this function 🤖.

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
                        // Constructing NXDOMAIN response (using a lot of ChatGPT here)
                        let transaction_id = [buf[0], buf[1]];
                        let mut response = Vec::new();

                        // Transaction ID
                        response.extend_from_slice(&transaction_id);
                        response.extend_from_slice(&[0x81, 0x83]); // Note: 0x83 indicates NXDOMAIN
                        response.extend_from_slice(&[0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                        response.extend_from_slice(&buf[12..len]);
                        if let Err(e) = socket.send_to(&response, &addr).await {
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
dig @127.0.0.1 -p 53 example.com
```

or using `nslookup`:

```bash
nslookup example.com 127.0.0.1
```

### DNS Resolver

WIP. Middle man betweem client and server. Need to suss out ports to run it on.

### DNS Client

WIP - simple cli app that takes in a domain, gets the ip via the resolver and auth domain if ttl is up, it then pings the returned ip using curl. Need to suss out ports to run it on.
