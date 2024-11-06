---
title: "BWSS: Part 5 - Data Store"
author: "Conor Deegan"
postNum: 12
type: "post"
---

### Introduction

Okay, so we now need a way to store our data. We could use a database, but that would be too easy. Instead, we're going to build our own data store. This will be a simple row oriented data store that will allow us to store and retrieve data.

As usual, the final code is available on [GitHub](https://github.com/conor-deegan/web-services).

I am going to switch things up and use Node/Typescript for the next few services I build.

### Updating our HTTP API

First, we need to update our HTTP API we already created to no longer host hardcoded spells. Instead, we will use our new data store to store and retrieve spells and connect to our new data store from our HTTP API.

Update `main.rs` to include a new `Database` struct. This struct implements a `new` function that connects to the database and a `execute` function that sends a command to the database and returns the response.

```rust
impl Database {
    async fn new(connection_string: &str) -> Result<Self, Box<dyn std::error::Error>> {
        loop {
            match TcpStream::connect(connection_string).await {
                Ok(connection) => {
                    println!("Connected to DB at {:?}", connection.peer_addr()?);
                    let database = Self {
                        connection: Arc::new(Mutex::new(connection))
                    };
                    return Ok(database);
                },
                Err(e) => {
                    eprintln!("Failed to connect to DB: {}", e);
                    tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                }
            }
        }
    }

    async fn execute(&self, command: &str) -> Result<String, Box<dyn std::error::Error>> {
        // Lock the connection to ensure only one command is sent at a time
        let mut connection = self.connection.lock().await;

        // Send command
        connection.write_all(command.as_bytes()).await?;
        connection.flush().await?;

        // Wait for the response, reading up to newline
        let mut reader = BufReader::new(&mut *connection);
        let mut response = Vec::new();

        reader.read_until(b'\n', &mut response).await?;

        // Convert the response from Vec<u8> to a String and trim it
        let response_str = String::from_utf8(response)?.trim().to_string();

        Ok(response_str)
    }
}
```

Update the `main` function to create a new `Database` connection:

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::parse();

    // Connect to the database over long-lived TCP connection
    let db = Database::new("data-store:8004").await?;

    let app = Router::new()
        .route("/api/spells", get(get_all_spells))
        .route("/api/spells", post(create_spell))
        .route("/api/spells/:id", get(get_spell_by_id))
        .route("/healthz", get(|| async { "OK" }))
        .layer(axum::extract::Extension(Arc::new(Mutex::new(db))));

    // Start the server
    let listener =
        tokio::net::TcpListener::bind(format!("{}:{}", config.host, config.port)).await?;
    println!("Server running on http://{}:{}", config.host, config.port);
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
```

We must also update each of our HTTP API endpoints to use the new `Database` struct. We will use the `execute` function to send commands to the database.

E.g update `get_all_spells` to use the database:

```rust
async fn get_all_spells(
    db: axum::extract::Extension<Arc<Mutex<Database>>>,
) -> Result<Json<Vec<Spell>>, axum::http::StatusCode> {
    // Lock the database connection and execute the command
    let result = db.lock().await.execute("SELECT * FROM spells").await;

    match result {
        Ok(response) => {
            // Attempt to parse the response as an ErrorResponse first
            if let Ok(error_response) = serde_json::from_str::<ErrorResponse>(&response) {
                eprintln!("Error from database: {}", error_response.error);
                return Err(axum::http::StatusCode::BAD_REQUEST);
            }

            // Otherwise, parse the response as a list of spells
            let spells: Vec<Spell> = serde_json::from_str(&response).map_err(|e| {
                eprintln!("Failed to parse spells: {}", e);
                axum::http::StatusCode::INTERNAL_SERVER_ERROR
            })?;
            println!("Got all spells: {:?}", spells);
            Ok(Json(spells))
        }
        Err(e) => {
            eprintln!("Failed to get all spells: {}", e);
            Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
```

Do the same for `create_spell` and `get_spell_by_id`.

### Building the Data Store

The Database accepts connections over TCP and executes SQL commands. We will build a simple row-oriented data store that stores data on disk. We will support the following commands:

- `SELECT * FROM table_name`: Retrieve all rows from a table
- `SELECT * FROM table_name WHERE id = 1`: Retrieve a row from a table by id
- `INSERT INTO table_name (column1, column2) VALUES (value1, value2)`: Insert a row into a table

The exact code is rather boring and can be found in the [GitHub repository](https://github.com/conor-deegan/web-services/blob/main/data-store/src/server.ts).

A high level overview of the code is as follows:

1. The server listens for incoming TCP connections on port 8004.
2. When a connection is received, the server reads the incoming data attempts to parse it as a SQL command with a very simple parser.
3. The server executes the command and sends the response back to the client via the TCP connection.

And that's it. We now have a simple data store that we can use to persist and retrieve data.

### Performance

If we do some basic performance profiling, we can see that the HTTP API takes about `374ms` to return a response for getting all spells. Most of this time is spent waiting for the database to read and write data to disk. We can improve this by using an in-memory data store, which is the subject of the next post.

I used a basic bash script to test the performance of the HTTP API:

```bash
#!/bin/zsh

# Initialize variables
total_time=0
N=100

# Loop 1000 times
for i in {1..$N}; do
    # Capture start time in milliseconds using Python
    start_time=$(python3 -c "import time; print(int(time.time() * 1000))")
    
    # Run the command and discard the output
    cargo run -- -X GET http://example.com/api/spells > /dev/null 2>&1

    # Capture end time in milliseconds using Python
    end_time=$(python3 -c "import time; print(int(time.time() * 1000))")

    # Calculate the response time in milliseconds
    response_time=$(( end_time - start_time ))
    total_time=$(( total_time + response_time ))
done

# Calculate mean response time
mean_time=$(( total_time / N ))

echo "Mean response time: ${mean_time}ms"
```

Mean response time for `N=100` requests to the HTTP API to get all spells is `374ms`.

### Conclusion

We have built a simple data store that allows us to store and retrieve data. We have also updated our HTTP API to use the data store to persist and retrieve new spells. In the next post, we will build an in-memory data store a.k.a a cache to improve performance.