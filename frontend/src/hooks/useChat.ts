import { useState, useCallback } from "react";
import type { ChatMessage } from "../types";
import { config } from "../config";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);

  const sendMessage = useCallback(async (text: string, displayText?: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: (displayText ?? text).trim(),
    };

    setMessages((prev) => {
      const next = [...prev, userMessage];
      console.log("[chat] state after user message:", next);
      return next;
    });
    setIsLoading(true);
    setStatus(null);

    let currentMessageId: string | null = null;

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const response = await fetch(
        `${config.apiBaseUrl}/llm_threads/${config.threadId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-contractor-id": config.contractorId,
            // x-contractor-id is a simple way to identify the "contractor" making the request.
            // Skipping authentication for this prototype.
          },
          body: JSON.stringify({ message: text.trim(), history }),
        },
      );

      if (!response.ok || !response.body) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop()!;

        for (const part of parts) {
          const eventMatch = part.match(/^event:\s*(.+)$/m);
          const dataMatch = part.match(/^data:\s*(.+)$/m);
          if (!eventMatch || !dataMatch) continue;

          const eventType = eventMatch[1];
          const data = JSON.parse(dataMatch[1]);

          switch (eventType) {
            case "agent_status":
              setStatus(data.message);
              break;

            case "agent_response":
              setStatus(null);
              if (data.requires_disclosure) setShowDisclosure(true);

              // Compliance guardrail: backend replaced the response with a fallback
              if (data.replaced) {
                setMessages((prev) => {
                  const withoutPartial = prev.filter((m) => m.id !== data.id);
                  return [
                    ...withoutPartial,
                    { id: data.id, role: "assistant" as const, content: data.text },
                  ];
                });
                break;
              }

              if (data.id !== currentMessageId) {
                currentMessageId = data.id;
                setMessages((prev) => [
                  ...prev,
                  { id: data.id, role: "assistant", content: data.text },
                ]);
              } else {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === data.id
                      ? { ...m, content: m.content + data.text }
                      : m,
                  ),
                );
              }
              break;

            case "error":
              setStatus(null);
              setMessages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: `Error: ${data.message}`,
                },
              ]);
              break;

            case "done":
              setStatus(null);
              setMessages((prev) => {
                console.log("[chat] state after assistant response:", prev);
                return prev;
              });
              break;
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setStatus(null);
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  return { messages, status, isLoading, showDisclosure, sendMessage };
}
