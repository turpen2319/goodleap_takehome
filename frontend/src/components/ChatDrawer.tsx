import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { ChatMessage } from "./ChatMessage";

export function ChatDrawer({ onClose }: { onClose: () => void }) {
  const { messages, status, isLoading, showDisclosure, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Disclosure Banner */}
        {showDisclosure && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 leading-snug">
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
          className="border-t border-gray-200 p-3 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}
