## Problem Framing & Approach

### What we're solving
The highest-leverage problem is application drop-offs at loan product selection. Contractors report this step isn't smooth, and data supports that. Embedding an AI chat in the existing contractor portal provides the most seamless UX and keeps engineering lift manageable.

### User(s)
The primary user is the contractor. Enabling contractors to answer loan-related questions without being experts improves homeowner confidence/understanding, which should improve application completion rates.

### Out of Scope
- Income verification is a common drop-off point, but isn't well suited for AI. We depend on Plaid, drop-off here likely reflects homeowners unlikely to convert, and any questions would be predictable enough for FAQs.

- Document processing (OCR + LLM) is a great AI use-case, but product selection has a stronger case as one of the most common drop-off points.

## Proposed Architecture

### Frontend
New React component in the existing partner portal. Side panel chat UI, openable from the menu bar or via tooltip on the product selection component.

### Backend (MVP)

**API:** Three new endpoints on the existing partner portal backend: 
- `POST /llm_threads/:id/messages` (send messages, agent loop is synchronous, response streamed back)
- `GET /llm_threads/:id/messages` (conversation history)
- `GET /llm_threads/` (past conversations)

**Tools:** Custom tools for querying the product catalog, querying the contractor profile, and common calculations (e.g., monthly payments for a given quote + product).

**Persistence:** Chat history in the existing Postgres db. Core entities are `LlmThread` and `LlmMessage`.

### Backend (Post-MVP)
For long-running multi-step tasks, we decouple the agent loop from the HTTP service using async workers:

1. Client hits `POST /llm_threads/:id/messages`
2. HTTP backend opens SSE connection, subscribes to Redis Pub/Sub channel for the chat
3. Backend enqueues SQS message with prompt and target agent
4. Backend sends initial SSE event, FE shows loading state
5. Async worker picks up message, writes to db, starts agent loop
6. Worker publishes events to Redis Pub/Sub as it calls tools or streams tokens
7. HTTP backend relays events from Redis to client via SSE
8. On complete response, worker writes to db and publishes terminal message
9. Backend receives terminal message, unsubscribes, closes SSE connection
10. Repeat for subsequent messages

### Model Choice: Claude Haiku 4.5
We don't need the most powerful model, but reliably calling the right tools is critical. Haiku scores well on the [Berkeley function calling leaderboard](https://gorilla.cs.berkeley.edu/leaderboard.html#leaderboard) and is much more cost-effective. A couple models outperformed Haiku, but I opted to stick with existing vendors. Good product catalog descriptions will matter more than model size.

## AI Design Decisions

### Prompt Engineering vs. Fine-Tuning
Prompt engineering and tool use cover everything we need. Fine-tuning adds complexity and cost for minimal gains at this stage. Worth revisiting later.

### Context Window Management
These won't be long conversations. The main source of truth is tool call output, not previous messages, so we can compact aggressively via the Claude Agents SDK.

### Hallucination Risk
Primary mitigation: rely exclusively on RAG (tool calls returning real data from controlled sources) for anything presented as fact, combined with a strict system prompt. Additional safeguards include deterministic checks to block responses where the model presents calculations without calling the calculation tool, or misrepresents tool output.

### Testing and Evaluation
Unit/integration tests for deterministic logic. Early on, human evaluation for subjective criteria (tone, compliance, relevance). Once subjective criteria are established, we build an LLM-as-judge test suite as a quality gate for drift and regressions.

## Compliance & Safety

### TILA/RESPA disclosures
Anything covered by TILA/RESPA (loan terms, APR, payment estimates) comes from tool call output only. Required disclosure language is programmatically appended. These responses are good candidates for a compliance "subagent" review before returning to client.

### Preventing implied credit decisions
The system prompt includes examples and counter-examples forbidding the model from implying or inferring credit decision outcomes. The model also won't have access to the credit decision engine or any tools useful for making a credit decision.

### Auditability
Conversation history in Postgres provides a full audit log. For MVP, we need a basic admin dashboard for compliance to review conversations and flagged messages.

## Rollout Plan

### Phase 1 (MVP)
Ship product selection agent (~2 weeks). 

Tools: 
- query partner profile
- query product catalog
- payments calculator. 

Agent is invoked from product selection UI and opens as side panel. 

Pilot with ~10-20 contractors who've flagged product confusion. Manually review all conversations, address issues before expanding.

### Phase 2
Expand pilot within one partner org. Build LLM-as-judge test suite from pilot learnings. Add contractor feedback (thumbs up/down). Build compliance dashboard for reviewing flagged and sampled conversations. Continue to gather direct user feedback.

### Phase 3
Launch to all partner orgs. Continue monitoring, patch edge cases. Evaluate external evaluation platforms vs. internal tooling. Assess scaling needs (e.g., [async architecture](#backend-post-mvp)).

## Monitoring & Impact Evaluation

### Business Metrics
The primary metric is product selection drop-off rate in sessions where the agent is used vs. where it isn't. 

Secondary metrics include contractor adoption rate and time on the product selection step.

### AI Quality and Feedback Loop
In earlier phases, in-depth human review surfaces tone, compliance, and relevance issues, informing refinements before expanding. Later, monitoring shifts toward automated detection with human review reserved for flagged edge cases. LLM-as-judge test suite is expanded as issues are patched and acts as an automated regression gate.
