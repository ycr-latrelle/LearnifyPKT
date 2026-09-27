import React, { useRef, useState } from "react";

import SectionShell from "../../components/shared/SectionShell";
import DashboardIcon from "../../components/dashboard/DashboardIcon";

const STARTER_MESSAGE = {
  id: 1,
  role: "bot",
  text: "Hey! I'm your study tutor. Ask me about a concept you're stuck on and I'll try to break it down.",
};

// PLACEHOLDER — no AI/backend endpoint exists yet (only AuthController
// is wired up on the API). This intentionally does NOT pretend to answer
// the question (no keyword-matched "fake smart" replies) — it just
// acknowledges the message so the chat UI stays testable.
//
// To wire up real AI: replace this whole function's body with a call to
// your tutor endpoint, e.g.
//   const res = await fetch(`${API_BASE_URL}/tutor/ask`, { ... });
//   return (await res.json()).reply;
async function getTutorReply(message) {
  return `PLACEHOLDER REPLY — no AI backend connected yet. You asked: "${message.trim()}"`;
}

export default function AITutorPage() {
  const [messages, setMessages] = useState([STARTER_MESSAGE]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const userMessage = { id: Date.now(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    scrollToEnd();

    const reply = await getTutorReply(trimmed);

    const botMessage = { id: Date.now() + 1, role: "bot", text: reply };
    setMessages((prev) => [...prev, botMessage]);
    setIsThinking(false);
    scrollToEnd();
  };

  return (
    <SectionShell
      activeTab="tutor"
      title="AI Tutor"
      subtitle="Ask about anything you're studying"
    >
      <p className="tutor-banner">
        Replies are simulated locally for now — the API only has auth endpoints
        wired up so far.
      </p>

      <div className="chat-window">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.role === "user" ? "chat-message--user" : "chat-message--bot"}`}
          >
            {message.text}
          </div>
        ))}

        {isThinking && (
          <div className="chat-message chat-message--bot chat-message--thinking">
            Thinking...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          placeholder="Ask your tutor something..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />

        <button
          type="submit"
          className="chat-send"
          disabled={!input.trim() || isThinking}
          aria-label="Send message"
        >
          <DashboardIcon name="send" size={16} />
        </button>
      </form>
    </SectionShell>
  );
}
