---
title: "BWSS: Part 9 - Object Storage"
author: "Conor Deegan"
postNum: 16
type: "post"
---

### Introduction

In this post, we will build an object storage service. Object storage is a way to store files in the cloud. It's a simple service that allows you to upload and download files.

As usual, the final code is available on [GitHub](https://github.com/conor-deegan/web-services).

### Building the Object Storage Service

The object storage service is realised as an Express HTTP server that stores files on disk.

The service exposes two routes, `/put` and `/get`.

The `put` method will make sure of `multer` to handle file uploads. The file will be stored on disk in a directory called `uploads`.

```javascript
// Multer config
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Routes
app.post('/files/put', multer({ storage }).single('data'), (req, res) => {
    try {
        const newFileName = req.body.file_name || req.file?.originalname;
        if (!newFileName) {
            throw new Error('File name not provided');
        }
        const newFilePath = path.join('uploads', newFileName);
        renameSync(req.file?.path as string, newFilePath);
        console.log(`File uploaded: ${newFileName}`);
        res.status(200).json({
            data: 'File uploaded',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            data: 'Internal server error'
        });
    }
});
```

What is happening here is pretty simple. When the `put` endpoint is hit, the file is uploaded to the server and stored in the `uploads` directory. The file is then renamed to the name provided in the request body.

The `get` method will read the file from disk and send it back to the client.

```javascript
app.get('/files/get/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const data = readFileSync(`uploads/${filename}`, 'base64');

        res.status(200).json({
            data
        });
    } catch (error) {
        res.status(404).json({
            data: 'File not found'
        });
    }
});
```

### Updating the Ingress Client to support Object Storage

Back in [Part 2](https://www.conordeegan.dev/posts/building-web-services-from-scratch-part-2-dns), we build an ingress client which mimics CURL. We will update this client to support files.

First, we need to update the `Args` struct to support 2 new flags, `--file` and `--field`.

```rust
struct Args {
    /// Sets the method for the request
    #[clap(
        short = 'X',
        long = "request",
        value_name = "METHOD",
        default_value = "GET"
    )]
    method: String,

    /// Sets the HTTP request headers
    #[clap(short = 'H', long = "header", value_name = "HEADER")]
    headers: Vec<String>,

    /// Sets the HTTP request body
    #[clap(short = 'd', long = "data", value_name = "DATA")]
    data: Option<String>,

    /// Sets the file to upload
    #[clap(short = 'f', long = "file", value_name = "FILE")]
    file: Option<String>,

    /// Sets additional fields in the form as key=value pairs
    #[clap(short = 'F', long = "field", value_name = "FIELD")]
    fields: Vec<String>,

    /// Sets the endpoint to request
    #[clap(value_name = "ENDPOINT")]
    endpoint: String,
}
```

Next, we need to update the `main` function to handle the new flags.

```rust
    // Send the HTTP request
    let client = reqwest::Client::new();
    // Determine if we should send a file or standard body
    let request = if let Some(file_path) = args.file {
        // Handle file upload
        let mut file = File::open(file_path)?;
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer)?;
        
        // Create multipart form with file
        let mut form = multipart::Form::new()
            .part("data", multipart::Part::bytes(buffer).file_name("upload_file"));

        // Add dynamic fields from `fields` argument
        for field in &args.fields {
            if let Some((key, value)) = field.split_once('=') {
                println!("Adding field: {}={}", key, value);
                form = form.text(key.to_string(), value.to_string());
            } else {
                eprintln!("Warning: Skipping invalid field '{}'. Expected format 'key=value'", field);
            }
        }
        
        client
            .request(
                Method::from_bytes(args.method.as_bytes()).unwrap(),
                replace_host_with_ip(&args.endpoint, ip),
            )
            .headers(headers.clone())
            .multipart(form)
    } else {
        // Handle non-file body
        client
            .request(
                Method::from_bytes(args.method.as_bytes()).unwrap(),
                replace_host_with_ip(&args.endpoint, ip),
            )
            .headers(headers.clone())
            .body(args.data.clone().unwrap_or_default())
    };
```

Now, we can use the client to upload files.

```bash
cargo run -- -X POST -f src/lumos.jpeg http://example.com/files/put -F file_name=1
```

We will make a decision that the `file_name` field will be set to the `spell_id` of any spell. This way we can now add images to our spells!

After running the command above, we can now see the image uploaded to the server disk storage within the docker container. Although, lets make sure the `get` endpoint works as expected.

```bash
cargo run -- -X GET http://example.com/files/get/1
```

The response is:

```bash
Host: example.com
IP Address: 0.0.0.0
Requesting: http://example.com/files/get/testing
Method: GET
Headers: {}
Payload: None
Response: {"data":"...."}
```

We can take the base64 encoded string and paste it into [a converter](https://base64.guru/converter/decode/image) to see the image.

It works, we can now get images for our spells!

### Conclusion

In this post, we built an object storage service that allows us to upload and download files. We also updated the ingress client to support file uploads. We are close to a *fully functional cloud*.