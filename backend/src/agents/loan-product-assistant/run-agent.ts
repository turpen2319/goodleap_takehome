import { query } from "@anthropic-ai/claude-agent-sdk";
import { createToolServer } from "./tool-server.js";
import { systemPrompt } from "./prompt.js";
import { config } from "../../config.js";
import type { Response } from "express";

const toolStatusMessages: Record<string, string> = {
  "mcp__loan-product-assistant__query_loan_products": "Looking up loan products...",
};

type SSEEvent = "agent_status" | "agent_response" | "error" | "done";

function writeSSE(res: Response, event: SSEEvent, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function runAgent(
  userMessage: string,
  contractorId: string,
  res: Response
): Promise<void> {
  writeSSE(res, "agent_status", { message: "Thinking..." });

  const toolServer = createToolServer(contractorId);
  let sentDone = false;
  let currentMessageId: string | null = null;

  try {
    for await (const message of query({
      prompt: userMessage,
      options: {
        model: config.model,
        systemPrompt,
        mcpServers: { "loan-product-assistant": toolServer },
        allowedTools: ["mcp__loan-product-assistant__query_loan_products"],
        tools: [],
        permissionMode: "dontAsk", // since we're only using known tools, we can skip permission prompts
        includePartialMessages: true,
        maxTurns: config.maxAgentTurns,
      },
    })) {
      if (message.type === "assistant") {
        for (const block of message.message.content) {
          if (block.type === "tool_use") {
            const statusMsg =
              toolStatusMessages[block.name] ?? `Running ${block.name}...`;
            writeSSE(res, "agent_status", { message: statusMsg });
          }
        }
      }

      if (message.type === "stream_event") {
        const event = message.event as Record<string, unknown>;
        if (event.type === "message_start") {
          const msg = event.message as Record<string, unknown>;
          if (typeof msg?.id === "string") {
            currentMessageId = msg.id;
          }
        }
        if (event.type === "content_block_delta") {
          const delta = event.delta as Record<string, unknown>;
          if (delta.type === "text_delta" && typeof delta.text === "string") {
            writeSSE(res, "agent_response", {
              id: currentMessageId,
              text: delta.text,
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
    console.error("[agent] error:", err instanceof Error ? err.message : err);
    if (!sentDone) {
      const msg = err instanceof Error ? err.message : "Internal server error";
      writeSSE(res, "error", { message: msg });
      writeSSE(res, "done", { subtype: "error" });
    }
  }
}
