import { query } from "@anthropic-ai/claude-agent-sdk";
import { createToolServer } from "./tool-server.js";
import { systemPrompt } from "./prompt.js";
import { checkCompliance, COMPLIANCE_FALLBACK } from "./compliance.js";
import { config } from "../../config.js";
import type { Response } from "express";

type HistoryMessage = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(history: HistoryMessage[]): string {
  if (history.length === 0) return systemPrompt;
  const transcript = history
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");
  return `${systemPrompt}\n\n## Conversation so far\n${transcript}`;
}

const toolStatusMessages: Record<string, string> = {
  "mcp__loan-product-assistant__query_loan_products": "Looking up loan products...",
  "mcp__loan-product-assistant__calculate_monthly_payment": "Calculating monthly payment...",
};

const disclosureTools = new Set([
  "mcp__loan-product-assistant__calculate_monthly_payment",
]);

type SSEEvent = "agent_status" | "agent_response" | "error" | "done";

function writeSSE(res: Response, event: SSEEvent, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function runAgent(
  userMessage: string,
  contractorId: string,
  res: Response,
  history: HistoryMessage[]
): Promise<void> {
  writeSSE(res, "agent_status", { message: "Thinking..." });

  const toolServer = createToolServer(contractorId);
  let sentDone = false;
  let currentMessageId: string | null = null;
  let requiresDisclosure = false;

  // Accumulates the full text of the current assistant message for compliance checking.
  let responseBuffer = "";
  const abortController = new AbortController();

  try {
    for await (const message of query({
      prompt: userMessage,
      options: {
        model: config.model,
        systemPrompt: buildSystemPrompt(history),
        mcpServers: { "loan-product-assistant": toolServer },
        allowedTools: [
          "mcp__loan-product-assistant__query_loan_products",
          "mcp__loan-product-assistant__calculate_monthly_payment",
        ],
        tools: [],
        permissionMode: "dontAsk", // since we're only using known tools, we can skip permission prompts
        includePartialMessages: true,
        maxTurns: config.maxAgentTurns,
        persistSession: false,
        abortController,
      },
    })) {
      if (message.type === "assistant") {
        for (const block of message.message.content) {
          if (block.type === "tool_use") {
            const statusMsg =
              toolStatusMessages[block.name] ?? `Running ${block.name}...`;
            writeSSE(res, "agent_status", { message: statusMsg });
            if (disclosureTools.has(block.name)) {
              requiresDisclosure = true;
            }
          }
        }
      }

      if (message.type === "stream_event") {
        const event = message.event as Record<string, unknown>;
        if (event.type === "message_start") {
          const msg = event.message as Record<string, unknown>;
          if (typeof msg?.id === "string") {
            currentMessageId = msg.id;
            responseBuffer = "";  // set to "you would be approved" to test compliance guardrail
          }
        }
        if (event.type === "content_block_delta") {
          const delta = event.delta as Record<string, unknown>;
          if (delta.type === "text_delta" && typeof delta.text === "string") {
            responseBuffer += delta.text;

            // Check compliance on the accumulated text
            if (checkCompliance(responseBuffer)) {
              console.warn("[agent] compliance guardrail triggered, aborting stream");
              abortController.abort();

              // Replace the partial response with the fallback
              writeSSE(res, "agent_response", {
                id: currentMessageId,
                text: COMPLIANCE_FALLBACK,
                requires_disclosure: requiresDisclosure,
                replaced: true,
              });
              writeSSE(res, "done", { subtype: "compliance_fallback" });
              sentDone = true;
              break;
            }

            writeSSE(res, "agent_response", {
              id: currentMessageId,
              text: delta.text,
              requires_disclosure: requiresDisclosure,
            });
          }
        }
      }

      if (message.type === "result") {
        if (message.subtype === "success" && message.is_error) {
          writeSSE(res, "error", { message: message.result });
        } else if (message.subtype !== "success") {
          writeSSE(res, "error", { message: message.subtype });
        }
        writeSSE(res, "done", { subtype: message.subtype });
        sentDone = true;
      }
    }
  } catch (err) {
    // AbortError is expected when the compliance guardrail fires
    if (err instanceof Error && err.name === "AbortError") {
      if (!sentDone) {
        writeSSE(res, "done", { subtype: "compliance_fallback" });
        sentDone = true;
      }
    } else {
      console.error("[agent] error:", err instanceof Error ? err.message : err);
      if (!sentDone) {
        const msg = err instanceof Error ? err.message : "Internal server error";
        writeSSE(res, "error", { message: msg });
        writeSSE(res, "done", { subtype: "error" });
      }
    }
  }
}
