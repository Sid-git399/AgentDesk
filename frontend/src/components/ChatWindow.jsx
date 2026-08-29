import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="chat-window">
      {messages.length === 0 && (
        <div className="empty-state">
          Try: "What's 128 * 42?", "What time is it?", or "Add a note: buy milk"
        </div>
      )}
      {messages.map((m, i) => (
        <MessageBubble key={i} role={m.role} text={m.text} />
      ))}
      {isLoading && <MessageBubble role="assistant" loading />}
      <div ref={bottomRef} />
    </div>
  );
}
