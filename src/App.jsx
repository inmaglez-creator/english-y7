import { useState, useRef, useEffect } from "react";

const TOPICS = [
  {
    id: "peel",
    label: "PEEL Writing",
    icon: "✍️",
    color: "#BE185D",
    light: "#FDF2F8",
    description: "Point, Evidence, Explain, Link — the core Y7 paragraph",
    topics: ["Write a PEEL paragraph", "Evaluate a PEEL paragraph", "PEEL on a given topic", "Improve a weak paragraph"],
  },
  {
    id: "types",
    label: "Text Types",
    icon: "📝",
    color: "#1D4ED8",
    light: "#EFF6FF",
    description: "Persuasive, discursive, narrative & descriptive writing",
    topics: ["Persuasive writing", "Discursive writing", "Narrative writing", "Descriptive writing"],
  },
  {
    id: "reading",
    label: "Reading & Analysis",
    icon: "📖",
    color: "#0F766E",
    light: "#F0FDFA",
    description: "Comprehension, inference & language analysis",
    topics: ["Comprehension questions", "Inference & deduction", "Language analysis (DAFOREST)", "Writer's purpose & effect"],
  },
  {
    id: "grammar",
    label: "Grammar & SPaG",
    icon: "🔤",
    color: "#7C3AED",
    light: "#F5F3FF",
    description: "Spelling, punctuation & grammar for KS3",
    topics: ["Punctuation practice", "Sentence types", "Vocabulary building", "Common spelling errors"],
  },
];

const SYSTEM_PROMPT = `You are a warm, encouraging KS3 English tutor for a Year 7 student at a British curriculum school.

Your role:
1. Set writing tasks, comprehension exercises, or grammar practice based on the requested topic.
2. Give detailed, constructive feedback on the student's writing.
3. Use KS3 English terminology: PEEL, DAFOREST, inference, connotation, etc.
4. British English spelling always.
5. Praise effort warmly and give specific, actionable improvements.

For PEEL writing tasks:
- Give a clear topic/question to write about
- Remind her of the PEEL structure: Point → Evidence → Explain → Link
- When correcting, highlight what she did well in each part and suggest improvements

For text types:
- Explain the key features of the text type first
- Set a short task (100-150 words)
- Evaluate using the relevant criteria

For reading comprehension:
- Provide a short passage (4-6 sentences) on an interesting topic (nature, science, history, travel)
- Ask ONE question at a time (vary: retrieval, inference, language analysis). After the student answers, give feedback, then ask the next.
- Mark answers with clear explanations

For grammar:
- Give ONE focused exercise at a time; after the student answers, give feedback then the next.
- Correct with explanation of the rule

Always end with one specific "next step" for improvement.

IMPORTANT FORMATTING RULE: Never use markdown. No asterisks, no hashtags, no backticks. Plain text only. Use numbered lists and emoji where helpful.`;

export default function EnglishApp() {
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeSubtopic, setActiveSubtopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("home");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startPractice = async (topic, subtopic) => {
    setActiveTopic(topic);
    setActiveSubtopic(subtopic);
    setMessages([]);
    setMode("chat");
    setLoading(true);

    const initMessage = `Set up a "${subtopic}" exercise for a bright Y7 student (${topic.label}). Make it engaging and appropriate for someone starting KS3 English.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: initMessage }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Something went wrong. Try again!";
      setMessages([{ role: "assistant", content: reply }]);
    } catch {
      setMessages([{ role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  const sendMessage = async (text) => {
    const userMsg = (typeof text === "string" ? text : input).trim();
    if (!userMsg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));
    apiMessages[0] = {
      role: "user",
      content: `English topic: ${activeTopic?.label} — Exercise: ${activeSubtopic}\n\n${apiMessages[0].content}`,
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Something went wrong.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Connection error." }]);
    }
    setLoading(false);
  };

  if (mode === "home") {
    return (
      <div style={{ minHeight: "100vh", background: "#FFF1F5", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "24px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✍️</div>
            <a href="https://y7-hub.vercel.app/" style={{ position: "fixed", top: 12, left: 12, zIndex: 50, background: "#fff", color: "#475569", textDecoration: "none", fontWeight: 700, fontSize: 13, padding: "6px 12px", borderRadius: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb" }}>← Hub</a>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#831843", margin: 0 }}>English Y7</h1>
            <p style={{ color: "#6B7280", marginTop: 6, fontSize: 15 }}>Academic writing, reading & grammar with your AI tutor</p>
          </div>

          {TOPICS.map((topic) => (
            <div key={topic.id} style={{ background: "#fff", borderRadius: 16, marginBottom: 16, border: `2px solid ${topic.light}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ background: topic.light, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>{topic.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: topic.color }}>{topic.label}</div>
                  <div style={{ fontSize: 13, color: "#6B7280" }}>{topic.description}</div>
                </div>
              </div>
              <div style={{ padding: "12px 20px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                {topic.topics.map((sub) => (
                  <button key={sub} onClick={() => startPractice(topic, sub)} style={{ background: topic.color, color: "#fff", border: "none", borderRadius: 20, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{sub}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFF1F5", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: activeTopic.color, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setMode("home")} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>← Back</button>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{activeTopic.label}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{activeSubtopic}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", maxWidth: 680, margin: "0 auto", width: "100%" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16, display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: activeTopic.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>{activeTopic.icon}</div>
            )}
            <div style={{ background: msg.role === "user" ? activeTopic.color : "#fff", color: msg.role === "user" ? "#fff" : "#1F2937", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "12px 16px", maxWidth: "82%", fontSize: 14, lineHeight: 1.65, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", whiteSpace: "pre-wrap" }}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: activeTopic.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{activeTopic.icon}</div>
            <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map((i) => (<div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: activeTopic.color, animation: "bounce 1s infinite", animationDelay: `${i * 0.2}s` }} />))}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "8px 16px 0", maxWidth: 680, margin: "0 auto", width: "100%", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Hint", "Give feedback", "New exercise", "Explain the structure"].map((q) => (
          <button key={q} onClick={() => sendMessage(q)} style={{ background: activeTopic.light, color: activeTopic.color, border: `1px solid ${activeTopic.color}30`, borderRadius: 16, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{q}</button>
        ))}
      </div>

      <div style={{ padding: "12px 16px 20px", maxWidth: 680, margin: "0 auto", width: "100%", display: "flex", gap: 8 }}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())} placeholder="Write your answer here... (Shift+Enter for new line)" rows={3} style={{ flex: 1, border: "2px solid #E5E7EB", borderRadius: 16, padding: "10px 18px", fontSize: 14, outline: "none", fontFamily: "inherit", resize: "none" }} onFocus={(e) => (e.target.style.borderColor = activeTopic.color)} onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")} />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: activeTopic.color, color: "#fff", border: "none", borderRadius: "50%", width: 44, height: 44, fontSize: 20, cursor: loading ? "not-allowed" : "pointer", opacity: loading || !input.trim() ? 0.5 : 1, flexShrink: 0, alignSelf: "flex-end" }}>↑</button>
      </div>
      <style>{`@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }`}</style>
    </div>
  );
}
