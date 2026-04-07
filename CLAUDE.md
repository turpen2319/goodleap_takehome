# Project: GoodLeap Take-Home

## Architecture

- Monorepo: `backend/` (Node.js/Express/TypeScript), `frontend/` (planned)
- Docker Compose at repo root orchestrates all services
- `just app` spins up everything; `just backend` for backend only
- No compile step in dev — `tsx watch` transpiles + hot-reloads in Docker
- Backend uses Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) for the agent loop

## Agent SDK

- The SDK spawns a Claude Code subprocess — `@anthropic-ai/claude-code` is NOT needed as an explicit dependency
- `tools: []` removes all built-in tools (Bash, Read, Edit, etc.) — critical for a production backend where the agent should not have server access
- `permissionMode: "dontAsk"` denies anything not in `allowedTools` — correct mode for headless server (no interactive prompts)
- Custom tools are defined via `tool()` + `createSdkMcpServer()` (MCP is the only way to define custom tools)
- Tool names are prefixed by the MCP server name: `mcp__<server-name>__<tool-name>`
- `includePartialMessages: true` enables `stream_event` messages with token-by-token deltas
- Streaming message type is `stream_event` (not `stream` or `delta`)
- The SDK reads `ANTHROPIC_API_KEY` from the environment directly — no need to pass it programmatically
- `AbortController` goes in `options.abortController`, not as a top-level param on `query()`

## Patterns

- Config: tracked `.env` with non-secret defaults, untracked `.env.local` for secrets (`.env.local` overrides `.env`)
- Agent tools that need request-scoped context (e.g., authenticated contractor ID): use a factory function that closes over the context, so the LLM never controls security-sensitive parameters
- SSE events: `agent_status`, `agent_response`, `error`, `done` — typed via string literal union
- Send an initial `agent_status` event immediately before starting the agent loop so the client knows the connection is live
- Contractor identity comes from `x-contractor-id` header (placeholder for real auth)

## Docker

- `node:20-slim` base image with `USER node` for non-root execution
- `COPY package*.json` + `RUN npm install` before `COPY . .` for layer caching
- Source mounted as volume for hot reload for local dev
