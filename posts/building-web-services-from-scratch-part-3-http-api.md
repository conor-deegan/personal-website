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

Yeap, Harry Potter spells.

The final code is available on [GitHub](https://github.com/conor-deegan/web-services).

### The HTTP Server

I will explain each of the main parts of the server as I go along. This is not going to be the best tutorial if you want to learn more about axum and tokio.

First let's create a spell struct and a function to generate some spells:

```rust
#[derive(Serialize, Deserialize, Clone)]
struct Spell {
    id: u32,
    name: String,
    description: String,
}

type Spells = Arc<Mutex<HashMap<u32, Spell>>>;

fn sample_spells() -> HashMap<u32, Spell> {
    let mut spells = HashMap::new();
    spells.insert(
        1,
        Spell {
            id: 1,
            name: "Expelliarmus".to_string(),
            description: "Disarming Charm".to_string(),
        },
    );
    spells.insert(
        2,
        Spell {
            id: 2,
            name: "Lumos".to_string(),
            description: "Creates light at wand tip".to_string(),
        },
    );
    spells
}
```

Next up, we need 3 functions to handle the 3 endpoints:

```rust
async fn get_all_spells(spells: axum::extract::Extension<Spells>) -> Json<Vec<Spell>> {
    let spells = spells.lock().await;
    Json(spells.values().cloned().collect())
}

async fn get_spell_by_id(
    id: axum::extract::Path<u32>,
    spells: axum::extract::Extension<Spells>,
) -> Result<Json<Spell>, axum::http::StatusCode> {
    let spells = spells.lock().await;
    match spells.get(&id.0) {
        Some(spell) => Ok(Json(spell.clone())),
        None => Err(axum::http::StatusCode::NOT_FOUND),
    }
}

async fn create_spell(
    axum::extract::Extension(spells): axum::extract::Extension<Spells>,
    Json(spell): Json<Spell>,
) -> Json<Spell> {
    let mut spells = spells.lock().await;
    spells.insert(spell.id, spell.clone());
    Json(spell)
}
```

I am also going to use `clap` in order to be able to pass the host & port number as an argument to the server:

```rust
#[derive(Parser)]
pub struct Config {
    #[arg(short = 'H', long, default_value = "0.0.0.0")]
    pub host: String,

    #[arg(short, long, default_value_t = 8001)]
    pub port: u16,
}
```

The reason I am doing this is a spoiler. When we build the load balancer, I want to be able to run multiple instances of the server on different ports.

Finally, we can create the server:

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::parse();
    let spells = Arc::new(Mutex::new(sample_spells()));

    let app = Router::new()
        .route("/api/spells", get(get_all_spells))
        .route("/api/spells", post(create_spell))
        .route("/api/spells/:id", get(get_spell_by_id))
        .route("/healthz", get(|| async { "OK" }))
        .layer(axum::extract::Extension(spells));

    // Start the server
    let listener = tokio::net::TcpListener::bind(format!("{}:{}", config.host, config.port))
        .await?;
    println!("Server running on http://{}:{}", config.host, config.port);
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
```
Run the server:

```bash
$ cargo run
```

Test the endpoints:

```bash
$ curl http://127.0.0.1:8001/api/spells
$ curl http://127.0.0.1:8001/api/spells/1
$ curl -X POST -H "Content-Type: application/json" -d '{"id": 3, "name": "Alohomora", "description": "Unlocking Charm"}' http://127.0.0.1:8001/api/spells
```

Okay so it works if I call the server directly. However, we need to check if this works with our DNS servers created in the last post. Before we do some wasted work, let's move on to the next post.

On to the Load Balancer.

Peace ✌️
