export default function MessageBubble({ role, text, loading }) {
  return (
    <div className={`message-bubble ${role} ${loading ? "loading" : ""}`}>
      {loading ? "Thinking…" : text}
    </div>
  );
}
