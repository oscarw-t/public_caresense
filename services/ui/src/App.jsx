import React, { useEffect, useRef, useState } from "react";
import settings from '../config/settings.json';

export default function App() {
  const [chat, setChat] = useState([
    {
      role: "assistant",
      text: settings.content.welcome_message
    }
  ]);

  const [current, setCurrent] = useState({
    id: "q0",
    text: settings.content.first_question
  });

  const [quickOptions, setQuickOptions] = useState(settings.content.initial_quick_options);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedQuick, setSelectedQuick] = useState(null);
  
  const [sessionId, setSessionId] = useState(null);
  const [top10, setTop10] = useState([]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function sendAnswer(answerText) {
    if (!answerText?.trim() || loading) return;

    setChat((prev) => [
      ...prev,
      { role: "assistant", text: current.text },
      { role: "user", text: answerText }
    ]);

    setInput("");
    setSelectedQuick(null);
    setLoading(true);

    try {
      const next = await getNextStepAPI({
        sessionId,
        answer: answerText
      });

      if (next.sessionId) setSessionId(next.sessionId);
      if (next.top10) setTop10(next.top10);

      if (next.nextQuestionId === "done") {
        setCurrent({ id: "done", text: next.nextQuestionText });
        setQuickOptions([]);
        if (next.assistantNote) {
          setChat((prev) => [...prev, { role: "assistant", text: next.assistantNote }]);
        }
        return;
      }

      setCurrent({ id: next.nextQuestionId, text: next.nextQuestionText });
      setQuickOptions(next.quickOptions || []);

      if (next.assistantNote) {
        setChat((prev) => [...prev, { role: "assistant", text: next.assistantNote }]);
      }
    } catch (err) {
      console.error(err);
      setChat((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Backend error. Check the backend terminal logs." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <header style={styles.header}>
          <div style={styles.brand}>
            <span style={styles.logo}>🩺</span>
            <div>
              <div style={styles.title}>{settings.content.app_title}</div>
              <div style={styles.subtitle}>{settings.content.app_subtitle}</div>
            </div>
          </div>
        </header>

        <div style={styles.characterArea}>
          <div style={styles.characterCard}>
            <img
              src="/doctor-genie.png"
              alt="Doctor Genie"
              style={styles.characterImg}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            <div style={styles.characterMeta}>
              <div style={styles.characterName}>Dr. Genie</div>
              <div style={styles.characterMood}>
                {loading ? settings.moods.loading : settings.moods.ready}
              </div>
            </div>
          </div>

          <div style={styles.bubbleWrap}>
            <div style={styles.bubble}>
              <div style={styles.bubbleLabel}>Question</div>
              <div style={styles.bubbleText}>{current.text}</div>

              {/* Top 10 results */}
              {top10?.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Top conditions</div>

                  <div style={{ display: "grid", gap: 8 }}>
                    {top10.slice(0, 10).map((r, i) => (
                      <div
                        key={r.disease}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px 12px",
                          borderRadius: 12,
                          background: "#f3f4f6",   // darker card
                          color: "#111827", 
                          fontSize: 14
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>
                          {i + 1}. {r.disease}
                        </div>
                        <div style={{ color: "#6b7280" }}>{Number(r.score).toFixed(3)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.akinatorRow}>
  {["Yes", "No", "Not sure", "Probably", "Probably not"].map((opt) => (
    <button
      key={opt}
      disabled={loading}
      onClick={() => {
        setSelectedQuick(opt);
        sendAnswer(opt);
      }}
      style={{
        ...styles.akinatorBtn,
        ...(selectedQuick === opt ? styles.akinatorBtnActive : {}),
        ...(opt === "Yes" ? styles.btnYes : {}),
        ...(opt === "No" ? styles.btnNo : {}),
        ...(opt.includes("Not") ? styles.btnMaybe : {})
      }}
    >
      <span style={styles.btnIcon}>
        {opt === "Yes" ? "✅" : opt === "No" ? "❌" : opt === "Not sure" ? "❓" : "✨"}
      </span>
      <span>{opt}</span>
    </button>
  ))}
</div>

              <div style={styles.inputRow}>
                <input
                  style={styles.input}
                  value={input}
                  disabled={loading}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your answer (details help)…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendAnswer(input);
                  }}
                />
                <button style={styles.sendBtn} disabled={loading} onClick={() => sendAnswer(input)}>
                  {loading ? "…" : "Send"}
                </button>
              </div>

              <div style={styles.microNote}>
                Not limited to yes/no — you can type full answers, and later your logic chooses the next best question.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.chatHeader}>
          <div style={styles.chatTitle}>History</div>
          <div style={styles.chatHint}>Questions + your answers (like Akinator log)</div>
        </div>

        <div style={styles.chatBody}>
          {chat.map((m, idx) => (
            <ChatBubble key={idx} role={m.role} text={m.text} />
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ role, text }) {
  const isUser = role === "user";
  return (
    <div style={{ ...styles.msgRow, justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div style={{ ...styles.msg, ...(isUser ? styles.msgUser : styles.msgAssist) }}>{text}</div>
    </div>
  );
}

async function getNextStepAPI(payload) {
  const res = await fetch(settings.api.llm_extraction_url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error("Backend error: " + res.status + " " + txt);
  }

  return await res.json();
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: 18,
    padding: 18,
    background: "linear-gradient(135deg, #fdfbfb, #ebedee)",
    fontFamily: "system-ui"
  },
akinatorRow: {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 18
},

akinatorBtn: {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "linear-gradient(180deg, #ffffff, #f3f4f6)",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 14,
  transition: "transform 0.06s ease, box-shadow 0.15s ease",
  userSelect: "none",
  color: "#111827"
},

akinatorBtnActive: {
  transform: "translateY(-1px)",
  boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
  border: "1px solid rgba(79,70,229,0.35)"
},

btnIcon: {
  width: 28,
  height: 28,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "rgba(79,70,229,0.10)"
},

btnYes: {
  background: "linear-gradient(180deg, rgba(16,185,129,0.22), #ffffff)",
  border: "1px solid rgba(16,185,129,0.35)"
},

btnNo: {
  background: "linear-gradient(180deg, rgba(239,68,68,0.22), #ffffff)",
  border: "1px solid rgba(239,68,68,0.35)"
},

btnMaybe: {
  background: "linear-gradient(180deg, rgba(59,130,246,0.18), #ffffff)",
  border: "1px solid rgba(59,130,246,0.30)"
},

  left: { background: "transparent", borderRadius: 16, display: "flex", flexDirection: "column" },
  header: { marginBottom: 10 },
  brand: { display: "flex", gap: 10, alignItems: "center" },
  logo: { fontSize: 24 },
  title: { fontSize: 34, fontWeight: 850, color: "#1f2937", lineHeight: 1 },
  subtitle: { color: "#4b5563", marginTop: 6 },
  characterArea: {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: 18,
    alignItems: "start",
    marginTop: 18
  },
  characterCard: {
    background: "white",
    borderRadius: 16,
    boxShadow: "0 14px 40px rgba(0,0,0,0.10)",
    padding: 14,
    position: "sticky",
    top: 18
  },
  characterCardInner: {
    padding: 14
  },
  characterImg: {
    width: "100%",
    height: 320,
    objectFit: "contain",
    borderRadius: 12,
    background: "linear-gradient(135deg, #eef2ff, #fff1f2)"
  },
  characterMeta: { marginTop: 10 },
  characterName: { fontWeight: 900, fontSize: 18, color: "#111827" },
  characterMood: { color: "#6b7280", marginTop: 3 },
  bubbleWrap: { minHeight: 300 },
  bubble: {
      background: "linear-gradient(180deg, #ffffff, #f8fafc)",
      borderRadius: 18,
      boxShadow: "0 18px 60px rgba(0,0,0,0.12)",
      padding: 18,
      border: "1px solid rgba(0,0,0,0.08)"
  },
  bubbleLabel: {
    fontSize: 12,
    fontWeight: 800,
    color: "#6b7280",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  bubbleText: { marginTop: 8, fontSize: 18, fontWeight: 750, color: "#111827" },
  quickRow: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 },
  quickBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(79,70,229,0.08)",
    cursor: "pointer",
    fontWeight: 700
  },
  inputRow: { display: "flex", gap: 10, marginTop: 14 },
  input: {
    flex: 1,
    padding: "11px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.14)",
    outline: "none",
    fontSize: 14
  },
  sendBtn: {
    padding: "11px 14px",
    borderRadius: 12,
    border: "none",
    background: "#4f46e5",
    color: "white",
    fontWeight: 800,
    cursor: "pointer"
  },
  microNote: { marginTop: 12, color: "#6b7280", fontSize: 12, lineHeight: 1.35 },
  right: {
    background: "white",
    borderRadius: 16,
    boxShadow: "0 14px 40px rgba(0,0,0,0.10)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  chatHeader: { padding: "14px 14px 10px", borderBottom: "1px solid rgba(0,0,0,0.08)" },
  chatTitle: { fontWeight: 900, fontSize: 16, color: "#111827" },
  chatHint: { color: "#6b7280", fontSize: 12, marginTop: 4 },
  chatBody: { padding: 12, overflowY: "auto", height: "calc(100vh - 90px)" },
  msgRow: { display: "flex", marginBottom: 10 },
  msg: { maxWidth: "85%", padding: "10px 12px", borderRadius: 14, fontSize: 14, lineHeight: 1.35 },
  msgAssist: { background: "rgba(0,0,0,0.06)", color: "#111827" },
  msgUser: {
    background: "rgba(79,70,229,0.12)",
    color: "#111827",
    border: "1px solid rgba(79,70,229,0.18)"
  }
};
