import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "../hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import type { ContextProduct } from "../App";

const MIN_WIDTH = 280;
const MAX_WIDTH = 720;
const DEFAULT_HEIGHT_VH = 45;

type MobileSnap = "default" | "full";

interface ChatPanelProps {
  onClose: () => void;
  panelWidth: number;
  onWidthChange: (w: number) => void;
  contextProducts: ContextProduct[];
  onRemoveContext: (id: string) => void;
}

export function ChatPanel({ onClose, panelWidth, onWidthChange, contextProducts, onRemoveContext }: ChatPanelProps) {
  const { messages, status, isLoading, showDisclosure, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mobile snap state
  const [mobileSnap, setMobileSnap] = useState<MobileSnap>("default");
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  // Desktop resize
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(panelWidth);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input.trim();
    const prefix = contextProducts.length
      ? contextProducts.map((p) => `[Re: ${p.name} (id: ${p.id})]`).join(" ") + " "
      : "";
    sendMessage(prefix + userText, userText);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  // ── Desktop horizontal resize ──────────────────────────────────────────────
  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;

    const onMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = startX.current - ev.clientX; // drag left = wider
      onWidthChange(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta)));
    };
    const onUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [panelWidth, onWidthChange]);

  // ── Mobile swipe ───────────────────────────────────────────────────────────
  const onHeaderTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const onHeaderTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const dt = Date.now() - touchStartTime.current;
    const isSwipe = Math.abs(dy) > 40 || Math.abs(dy) / dt > 0.3;
    if (!isSwipe) return;
    if (dy < 0) {
      setMobileSnap("full");
    } else {
      if (mobileSnap === "full") setMobileSnap("default");
      else onClose();
    }
  };

  const mobileHeight = mobileSnap === "full" ? "100dvh" : `${DEFAULT_HEIGHT_VH}vh`;

  return (
    <>
      {/* Desktop drag handle — fixed, left edge of panel */}
      <div
        onMouseDown={onResizeStart}
        className="hidden md:flex fixed top-0 bottom-0 items-center justify-center w-1.5 cursor-col-resize z-50 hover:bg-blue-100 active:bg-blue-200 transition-colors"
        style={{ right: panelWidth }}
      >
        <div className="w-0.5 h-8 rounded-full bg-gray-300" />
      </div>

      {/* Panel */}
      <div
        className="
          fixed bottom-0 left-0 right-0
          md:top-0 md:bottom-0 md:left-auto md:right-0
          bg-white border-t md:border-t-0 md:border-l border-gray-200 shadow-xl
          flex flex-col z-40
          transition-[height] duration-200 ease-out md:transition-none
        "
        style={
          window.innerWidth >= 768
            ? { width: panelWidth, top: 0, bottom: 0, height: "auto" }
            : { height: mobileHeight }
        }
      >
        {/* Header */}
        <div
          className="relative flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0 touch-none"
          onTouchStart={onHeaderTouchStart}
          onTouchEnd={onHeaderTouchEnd}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-10 h-1 rounded-full bg-gray-300 md:hidden" />
          <h2 className="text-base font-semibold text-gray-800 mt-1 md:mt-0">AI Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Disclosure */}
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
          className="border-t border-gray-200 p-3 shrink-0"
        >
          {contextProducts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {contextProducts.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                >
                  {p.name}
                  <button
                    type="button"
                    onClick={() => onRemoveContext(p.id)}
                    className="text-blue-400 hover:text-blue-700 leading-none cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-end">
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
          </div>
        </form>
      </div>
    </>
  );
}
