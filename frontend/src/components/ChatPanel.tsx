import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { ChatMessage } from "./ChatMessage";

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const { messages, status, isLoading, showDisclosure, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    // Mobile: fixed to bottom, pushes nothing (height set, page scrolls above)
    // Desktop: flex column sibling, takes fixed width
    <div className="
      fixed bottom-0 left-0 right-0 h-[45vh]
      md:sticky md:top-0 md:h-screen md:w-96 md:shrink-0
      bg-white border-t md:border-t-0 md:border-l border-gray-200 shadow-lg md:shadow-none
      flex flex-col
    ">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
        <h2 className="text-base font-semibold text-gray-800">AI Assistant</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
        >
          &times;
        </button>
      </div>

      {/* Disclosure Banner */}
      {showDisclosure && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 leading-snug shrink-0">
          <strong>Disclosure:</strong> Payment estimates are for illustrative purposes only and are based on estimated APR ranges. Actual loan terms, rates, and monthly payments will vary based on creditworthiness and other factors. This is not a loan offer or commitment to lend.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-8">
            Ask me anything about these loan products.
          </p>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {status && (
          <div className="flex justify-center py-2">
            <span className="text-sm text-gray-400 italic">{status}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-3 flex gap-2 items-end shrink-0"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (input.trim() && !isLoading) handleSubmit(e as any);
            }
          }}
          placeholder="Type a message..."
          disabled={isLoading}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none overflow-y-auto"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
}
