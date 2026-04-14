import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage as ChatMessageType } from "../types";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  if (message.role === "status") {
    return (
      <div className="flex justify-center py-2">
        <span className="text-sm text-gray-400 italic">{message.content}</span>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`rounded-2xl px-4 py-2 text-sm ${
          isUser
            ? "max-w-[85%] bg-blue-600 text-white rounded-br-md break-words"
            : "w-full bg-gray-100 text-gray-800 rounded-bl-md prose prose-sm overflow-x-auto chat-prose"
        }`}
      >
        {isUser ? message.content : <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>}
      </div>
    </div>
  );
}
