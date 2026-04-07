import Markdown from "react-markdown";
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
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-800 rounded-bl-md prose prose-sm"
        }`}
      >
        {isUser ? message.content : <Markdown>{message.content}</Markdown>}
      </div>
    </div>
  );
}
