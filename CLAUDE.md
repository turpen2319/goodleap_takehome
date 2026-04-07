# Project: GoodLeap Take-Home

## Architecture

- Monorepo: `backend/` (Node.js/Express/TypeScript), `frontend/` (React/Vite/TypeScript/Tailwind v4)
- Docker Compose at repo root orchestrates all services
- `just app` spins up everything; `just backend` for backend only; `just frontend` for frontend only
- Backend: `tsx watch` transpiles + hot-reloads in Docker
- Frontend: Vite dev server with HMR in Docker
- Backend uses Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) for the agent loop

## Agent SDK

- The SDK spawns a Claude Code subprocess — `@anthropic-ai/claude-code` is NOT needed as an explicit dependency
- `tools: []` removes all built-in tools (Bash, Read, Edit, etc.) — critical for a production backend where the agent should not have server access
- `permissionMode: "dontAsk"` denies anything not in `allowedTools` — correct mode for headless server (no interactive prompts)
- Custom tools are defined via `tool()` + `createSdkMcpServer()` (MCP is the only way to define custom tools)
- Tool names are prefixed by the MCP server name: `mcp__<server-name>__<tool-name>`
- `includePartialMessages: true` enables `stream_event` messages with token-by-token deltas
- Streaming message type is `stream_event` (not `stream` or `delta`)
- `stream_event` also carries `message_start` (with message `id`) and `message_stop` events for framing — use the `id` from `message_start` to group text deltas on the client
- The SDK reads `ANTHROPIC_API_KEY` from the environment directly — no need to pass it programmatically
- `AbortController` goes in `options.abortController`, not as a top-level param on `query()`

## Patterns

- Config: tracked `.env` with non-secret defaults, untracked `.env.local` for secrets (`.env.local` overrides `.env`)
- Agent tools that need request-scoped context (e.g., authenticated contractor ID): use a factory function that closes over the context, so the LLM never controls security-sensitive parameters
- SSE events: `agent_status`, `agent_response`, `error`, `done` — typed via string literal union
- `agent_response` events include the Claude message `id` for grouping deltas into messages on the client
- Send an initial `agent_status` event immediately before starting the agent loop so the client knows the connection is live
- Contractor identity comes from `x-contractor-id` header (placeholder for real auth)
- Agent system prompt should instruct the model NOT to narrate before tool calls — just call the tool silently, then respond with results

## Frontend

- SSE on POST requires `fetch()` + manual `ReadableStream` parsing (EventSource only supports GET)
- Parse SSE frames by splitting on `\n\n`, extracting `event:` and `data:` lines
- `react-markdown` renders assistant responses; `@tailwindcss/typography` (`prose` classes) styles the output
- Status updates are transient — only show the latest one at the bottom of the chat, clear it when the response starts or completes
- Local `npm install` in `frontend/` is only for editor type resolution — everything runs inside Docker

## Docker

- `node:20-slim` base image with `USER node` for non-root execution
- `COPY package*.json` + `RUN npm install` before `COPY . .` for layer caching
- Source mounted as volume for hot reload in local dev
- Frontend Dockerfile: install as root, then `chown -R node:node /app` before `USER node` — Vite needs write access to `/app` for temp files
- Both services hot-reload via volume mounts — no rebuild needed for source changes; rebuild only when `package.json` changes
