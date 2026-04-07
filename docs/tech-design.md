## Problem Framing & Approach

### What we're solving
The highest-leverage problem is application drop-off at the loan product selection step. Contractors report this step is not as smooth as it could be, and the data supports that sentiment.

Embedding an AI chat in the existing contractor portal provides the most seamless UX and keeps engineering lift manageable.

### User(s)
The primary user is the contractor. Enabling contractors to answer loan-related questions without being experts would improve homeowner confidence, reduce confusion, and therefore decrease drop-offs at the loan product selection step.

### Out of Scope
The income verification step is also a drop-off point, but less suited for AI:
- We depend on Plaid, limiting control.
- Drop-off is more likely due to sensitivity of sharing financial data than confusion.
- Questions here are predictable and better handled via FAQs or training than an LLM.

Manual document processing is a strong AI use case (OCR + LLM), but product selection is a higher-impact first target based on drop-off rates.

---

## Proposed Architecture

### Frontend
A React side-panel chat component embedded in the partner portal, accessible via menu or tooltip on the product selection UI.

### Backend (MVP)

#### API
Add endpoints:
- `POST /llm_threads/:id/messages`
- `GET /llm_threads/:id/messages`
- `GET /llm_threads/`

LLM calls and tool loops run synchronously on `POST`, with responses streamed back over the same connection.

#### Tools
Agent tools:
- Loan product catalog queries
- Contractor profile queries
- Payment calculations (e.g., monthly payment for given product and loan amount)

#### Persistence
Store chat history in an existing Postgres DB. Core entities:
- `LlmThread`
- `LlmMessage`

### Backend (Post-MVP)
For long-running tasks, decouple agent loop from HTTP server via async workers:

1. Client sends message  
2. HTTP service opens SSE, then creates & subscribes to Redis Pub/Sub channel
3. Enqueues SQS job
4. Worker processes agent loop
5. Publishes tool calls/responses via Redis
6. HTTP service streams to client over SSE connection
7. Final response persisted + terminal event sent
8. Connection closed  

---

### Model Choice: Claude Haiku 4.5
The most important factor was accurate tool calling. The scope is narrow, so we don't need the most powerful model. Haiku scores well on the [Berkeley function calling leaderboard](https://gorilla.cs.berkeley.edu/leaderboard.html#leaderboard) and is much more cost-effective. A couple models outperformed Haiku, but I opted to stick with existing vendors. Good product catalog descriptions will matter more than model size.

---

## AI Design Decisions

### Prompt Engineering vs. Fine-Tuning
Prompting + tools are sufficient for MVP. Fine-tuning adds cost/complexity with limited upside at this stage, but can be revisited later.

### Context Window Management
Conversations are short and tool-driven, so aggressive compaction is acceptable. We'll use the built-in client-side compaction from Claude Agent SDK.

### Hallucination Risk
Primary mitigation:
- Rely on tool outputs (RAG) for all factual claims  
- Use a strict system prompt  

Additional safeguards:
- Deterministic checks (e.g., block response that contains non-compliant language)  
- Optional “safety/compliance” sub-agent to evaluate potentially risky responses  

### Testing and Evaluation
- Unit/integration tests for deterministic logic  
- In early stages, in-depth human review for subjective criteria (tone, compliance, relevance)  
- In later stages, LLM-as-judge test suite as a quality gate for drift and regressions based on observed patterns

---

## Compliance & Safety

### TILA/RESPA disclosures
All loan terms (APR, payments, etc.) must come from tool output, never generated. Required disclosures are programmatically surfaced.

### Preventing implied credit decisions
The system prompt includes strong examples forbidding speculation about credit decisions.

Additionally:
- The model has no access to credit decisioning or income verification systems  
- It lacks the data needed to infer outcomes  

### Auditability
All conversations, tool calls, and outputs are logged in Postgres.

MVP includes a basic admin dashboard for reviewing conversations and flagged messages. Later, expand internal tooling or evaluate third-party solutions for agent QA/evaluation.

---

## Rollout Plan

### Phase 1 (MVP)
- Ship product selection agent (~2 weeks):
  - Tools: product catalog, contractor profile, payment calculator  
  - Accessible from product selection UI  
  - Chat side panel UX  
- Pilot with 10–20 contractors  
- Manually review all conversations  
- Address issues before expanding

### Phase 2
- Expand within one partner org  
- Build LLM-as-judge suite from pilot learnings  
- Add user feedback (thumbs up/down)  
- Build basic compliance/review dashboard (sampling, flagging, review workflows)  

### Phase 3
- Roll out to all partners  
- Monitor and patch edge cases  
- Evaluate build vs. buy for eval tooling  
- Address scaling (e.g., [async architecture](#backend-post-mvp))  

---

## Monitoring & Impact Evaluation

### Business Metrics
Primary:
- Drop-off rate at product selection (agent vs. no agent)

Secondary:
- Contractor adoption (% weekly active usage)  
- Time spent in product selection  

### AI Quality Monitoring
- Pilot: full human review  
- Post-pilot: LLM-as-judge + sampled human review via compliance dashboard  

### Feedback Loop

- **Phase 1:** Manual review → prompt and guardrail refinement  
- **Phase 2:** Dashboard + LLM-as-judge → regression detection + feedback ingestion  
- **Phase 3:** Automated monitoring (compliance flags, score drift) + targeted human review
