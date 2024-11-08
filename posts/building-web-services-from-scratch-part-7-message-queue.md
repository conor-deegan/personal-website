---
title: "BWSS: Part 7 - Message Queue"
author: "Conor Deegan"
postNum: 14
type: "post"
---

### Introduction

Time for a message queue. A message queue is a way to send messages between services. It's a way to decouple services and allow them to communicate asynchronously.

As usual, the final code is available on [GitHub](https://github.com/conor-deegan/web-services).

### Building the Message Queue

The message queue is realised as an Express HTTP server that stores messages in memory.

The queue exposes one route, `/endqueue`, which allows you to add a message to the queue.

```javascript
// Simple in-memory queue
const messageQueue: {
    [key: string]: any;
}[] = [];

app.post('/enqueue', (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).send({ error: 'Message is required' });
    }

    messageQueue.push(message);
    console.log(`Message added to queue: ${message}`);
    res.status(200).send({ success: 'Message enqueued' });
});
```

In most cases, there would be another service that consumes messages from the queue. But for our purposes, this is sufficient.

I have added another function which runs every 5 seconds to consume messages from the queue.

```javascript
// Function to process messages from the queue
const processQueue = () => {
    if (messageQueue.length > 0) {
        const message = messageQueue.shift(); // Remove the first message
        console.log(`Processing message: ${message}`);
    } else {
        console.log('No messages to process');
    }
};

// process the queue every 5 seconds
setInterval(processQueue, 5000);
```

That's it. It's pretty simple. Of course, message queues can be much more complex than this and include things like message persistence, message ordering, message delivery guarantees, and so on. But for our purposes, this is fine.

### Update our HTTP API

We can add our message queue to our HTTP API by updating `main.rs` as follows:

```rust
#[derive(Clone)]
struct MessageQueue {
    client: Client,
    base_url: String,
}

impl MessageQueue {
    fn new(base_url: &str) -> Self {
        Self {
            client: Client::new(),
            base_url: base_url.to_string(),
        }
    }

    // Sets a key-value pair in the cache store
    async fn enqueue(&self, message: &str) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!("{}/enqueue", self.base_url);

        let params = serde_json::json!({ "message": message });
        
        // best effort, ignore errors
        self.client.post(&url)
            .json(&params)
            .send()
            .await?;

        Ok(())
    }
}
```

It's very similar to the cache store. We have a `MessageQueue` struct with a `new` function and an `enqueue` function. The `enqueue` function sends a message to the message queue.

Anytime a new spell is created, I want to send a message to the message queue. A toy justification for this might that we want to notify an admin or another service that a new spell has been created.

Update the `create_spell` function to send a message to the message queue:

```rust
// Spawn a background task to enqueue the response; ignore errors from `enqueue`
let message_queue = message_queue.clone();
let spell_data = serde_json::to_string(&spell).unwrap();
tokio::spawn(async move {
    if let Err(e) = message_queue.enqueue(&spell_data).await {
        eprintln!("Failed to enqueue spell: {}, error: {}", spell.id, e);
    }
});
```

### Conclusion

That's it. We now have a message queue service. Next up is something a bit more complex: object storage.