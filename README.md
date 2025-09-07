# MCP DadJokes Remote

**MCP DadJokes** is a lightweight and fun JSON-RPC 2.0-compatible remote server that provides random and searchable dad jokes. It is designed to be used with the [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/spec) and exposes tools that can be consumed by an LLM client.

## Features

- `jokes.get`: Returns a random dad joke.
- `jokes.search`: Searches jokes by a keyword.
- Complies with JSON-RPC 2.0 spec.
- Supports batching and tool listing via `tools/list` and `tools/call`.
- Includes health check endpoint (`/health`).

## Endpoints

- `POST /rpc`: JSON-RPC endpoint for interacting with tools.
- `GET /health`: Simple health check endpoint.

## How to Deploy with Wrangler (Cloudflare Workers)

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Project Structure

```
📁 my-mcp-dadjokes/
├── wrangler.toml
├── index.js        # The file with the MCP dad jokes code
```

### 3. Create `wrangler.toml`

```toml
name = "remote-mcp"
main = "src/index.js"
compatibility_date = "2024-01-01"
workers_dev = true
```
_You can change `compatibility_date` to today's date._

### 4. Deploy

```bash
npx wrangler deploy
```

After deployment, you'll get a public URL like:

```
https://mcp-dadjokes.<your-subdomain>.workers.dev
```

## Example JSON-RPC Usage

### `POST /rpc` with `jokes.get`

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "jokes.get"
}
```

### `POST /rpc` with `jokes.search`

```json
{
  "jsonrpc": "2.0",
  "id": "2",
  "method": "jokes.search",
  "params": {
    "q": "cheese",
    "limit": 2
  }
}
```

### Sample Response

```json
{
  "jsonrpc": "2.0",
  "id": "2",
  "result": {
    "items": [
      "What do you call cheese that isn't yours? Nacho cheese.",
      "Why did the cheese fail his exam? He didn't study brie-ly enough."  // ← hypothetical
    ],
    "total": 2
  }
}
```

## Tool Discovery Support

Supports:

- `tools/list`
- `tools/call`

This allows LLMs to dynamically discover and use available tools.

## Health Check

```bash
curl https://mcp-dadjokes.<your-subdomain>.workers.dev/health
```

Response:

```json
{ "ok": true, "service": "mcp-dadjokes", "time": "2025-09-07T00:00:00.000Z" }
```