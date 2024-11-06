---
title: "BWSS: Part 6 - Cache Store"
author: "Conor Deegan"
postNum: 13
type: "post"
---

### Introduction

Now that we have a data store, we can build a cache store. This will allow us to cache data in memory to reduce the number of times we need to hit the data store.

As usual, the final code is available on [GitHub](https://github.com/conor-deegan/web-services).

### Building the Cache Store

The cache store is realised as an Express HTTP server that stores data in memory.

The two main operations are `GET` and `SET`. `GET` retrieves data from the cache, and `SET` stores data in the cache.

```javascript
// define an in-memory cache store
const cacheStore: {
    [key: string]: string;
} = {};

// Routes
app.post('/set', (req: Request, res: Response) => {
    const { key, value } = req.body;
    console.log(`Setting key: ${key} and value: ${value}`);
    const data = {
        key,
        value
    };
    cacheStore[key] = value;
    res.status(201).json({
        data
    });
});

app.get('/get/:key', (req: Request, res: Response) => {
    const { key } = req.params;
    console.log(`Getting key: ${key}`);
    const value = cacheStore[key];
    if (value) {
        const parsedValue = JSON.parse(value);
        res.status(200).json(parsedValue);
    } else {
        res.status(404).json({
            data: 'Not Found'
        });
    }
});
```

That's it. It's pretty simple. Of course, cache stores can be much more complex than this and include things like eviction policies, TTL, invalidation, and so on. But for our purposes, this is sufficient.

### Update our HTTP API

We can add our cache store to our HTTP API by updating `main.rs` as follows:

```rust
#[derive(Clone)]
struct CacheStore {
    client: Client,
    base_url: String,
}

impl CacheStore {
    fn new(base_url: &str) -> Self {
        Self {
            client: Client::new(),
            base_url: base_url.to_string(),
        }
    }

    // Retrieves a value from the cache store by key
    async fn get(&self, key: &str) -> Result<Option<String>, Box<dyn std::error::Error>> {
        let url = format!("{}/get/{}", self.base_url, key);
        
        let response = self.client.get(&url).send().await?;
        
        // Check if the response is 404, meaning the key doesn't exist
        if response.status().as_u16() == 404 {
            return Ok(None); // Key not found in cache
        }

        // Parse the response as JSON
        let value = response.text().await?;
        Ok(Some(value))
    }

    // Sets a key-value pair in the cache store
    async fn set(&self, key: &str, value: &str) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!("{}/set", self.base_url);

        let params = serde_json::json!({ "key": key, "value": value });
        
        // best effort, ignore errors
        self.client.post(&url)
            .json(&params)
            .send()
            .await?;

        Ok(())
    }
}
```

We can then update our get spells by id function to use the cache store:

```rust
async fn get_spell_by_id(
    db: axum::extract::Extension<Arc<Mutex<Database>>>,
    cache: axum::extract::Extension<Arc<CacheStore>>,
    axum::extract::Path(id): axum::extract::Path<u32>,
) -> Result<Json<Spell>, axum::http::StatusCode> {

    // Try to get the spell from the cache first
    let cached_spell = cache.get(&id.to_string()).await.map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;
    if let Some(cached_spell) = cached_spell {
        println!("Cache hit for spell by id: {}", id);
        let spell: Spell = serde_json::from_str(&cached_spell).map_err(|e| {
            eprintln!("Failed to parse cached spell: {}", e);
            axum::http::StatusCode::INTERNAL_SERVER_ERROR
        })?;
        return Ok(Json(spell));
    }

    println!("Cache miss for spell by id: {}", id);

    // ...
    // spell not in cache, get from db (code excluded for brevity)
    // ...

    // cache the spell
    let cache = cache.clone();
    let spell_id = id.to_string();
    let spell_data = serde_json::to_string(&spells[0]).unwrap();
    tokio::spawn(async move {
        if let Err(e) = cache.set(&spell_id, &spell_data).await {
            eprintln!("Failed to cache spell by id: {}, error: {}", spell_id, e);
        }
    });
}
```

This function now attempts to get the spell from the cache first. If it's not in the cache, it gets the spell from the database, caches it for future requests, and returns it.

We could have implemented our cache such that when a spell is created, we add it to the cache. However, this solution is nice as we can easily test the impact of our cache on response times by hitting the same endpoint a second time.

### Testing the Cache

We can test the cache by hitting the `/spells/1` endpoint twice and comparing the response times.

```
First request: 374ms
Second request: 149ms
```

That is almost a 60% reduction in response time. Not bad for a simple in-memory cache.

### Conclusion

With caching in place, it's time to move on to a message queue.