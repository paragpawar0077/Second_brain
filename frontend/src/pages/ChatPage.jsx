import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "../components/AppLayout";
import { askQuestion } from "../services/chatService";

const ChatPage = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    const q = question;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    try {
      const data = await askQuestion(q);
      setMessages((prev) => [...prev, { role: "ai", text: data.answer, sources: data.sources }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Neural link disrupted. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ color: "#e2e8f0", display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "20px", flexShrink: 0 }}>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#f1f5f9" }}>Neural Chat</div>
          <div style={{ fontSize: "13px", color: "rgba(226,232,240,0.4)", marginTop: "4px" }}>Ask anything — answers grounded in your documents</div>
          <div style={{ width: "40px", height: "2px", background: "linear-gradient(90deg,#00d4ff,transparent)", marginTop: "8px" }} />
        </motion.div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px", paddingRight: "4px" }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "rgba(226,232,240,0.2)", padding: "60px 0", fontSize: "13px" }}>
              ◈ Ask a question about your documents to begin
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: "14px" }}
              >
                <div style={{
                  maxWidth: "72%",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg,#0ea5e9,#0284c7)"
                    : "rgba(255,255,255,0.03)",
                  border: msg.role === "user" ? "none" : "1px solid rgba(0,212,255,0.1)",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "14px 18px",
                  fontSize: "13px", lineHeight: 1.7,
                  color: msg.role === "user" ? "white" : "rgba(226,232,240,0.85)",
                  boxShadow: msg.role === "user" ? "0 0 20px rgba(14,165,233,0.2)" : "none",
                }}>
                  {msg.text}

                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(0,212,255,0.1)" }}>
                      <div style={{ fontSize: "10px", color: "rgba(0,212,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                        Sources
                      </div>
                      {msg.sources.map((s, j) => (
                        <div key={j} style={{
                          fontSize: "11px", padding: "6px 10px", borderRadius: "6px", marginBottom: "4px",
                          background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)",
                        }}>
                          <span style={{ color: "#00d4ff", fontWeight: 500 }}>{s.title}</span>
                          <span style={{ color: "rgba(226,232,240,0.3)", marginLeft: "8px" }}>chunk #{s.chunk_index}</span>
                          <div style={{ color: "rgba(226,232,240,0.4)", marginTop: "3px", fontSize: "10px" }}>{s.preview}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", marginBottom: "14px" }}>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.1)",
                borderRadius: "18px 18px 18px 4px", padding: "14px 18px",
                display: "flex", gap: "5px", alignItems: "center",
              }}>
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.div key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay }}
                    style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4ff" }}
                  />
                ))}
                <span style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)", marginLeft: "6px" }}>Searching neural network...</span>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleAsk} style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about your documents..."
            disabled={loading}
            style={{
              flex: 1, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(0,212,255,0.15)", borderRadius: "14px",
              padding: "14px 20px", color: "#e2e8f0", fontSize: "14px", outline: "none",
            }}
            onFocus={(e) => e.target.style.borderColor = "rgba(0,212,255,0.4)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(0,212,255,0.15)"}
          />
          <motion.button
            type="submit"
            disabled={loading || !question.trim()}
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(14,165,233,0.4)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
              border: "none", borderRadius: "14px", padding: "14px 24px",
              color: "white", fontSize: "13px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              boxShadow: "0 0 20px rgba(14,165,233,0.3)",
              letterSpacing: "0.05em",
            }}
          >
            SEND
          </motion.button>
        </form>
      </div>
    </AppLayout>
  );
};

export default ChatPage;