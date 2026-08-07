import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import QuestionControlPanel from "../components/Host/QuestionControlPanel";
import HouseScoreControls from "../components/Host/HouseScoreControls";
import { listQuestions, listHouses, listRounds } from "../services/api";
import { clearSession, getUser } from "../services/auth";
import { joinPanel } from "../services/socket";
import socket from "../services/socket";

/**
 * HostDashboard.jsx — Quizmaster Console
 * Multi-question capability: browse the full question bank, trigger any
 * unlocked question, and control the live game flow.
 */
export default function HostDashboard() {
  const [questions, setQuestions] = useState([]);
  const [houses, setHouses] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [roundFilter, setRoundFilter] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const navigate = useNavigate();
  const user = getUser();

  const refresh = useCallback(async () => {
    const [qRes, hRes, rRes] = await Promise.all([listQuestions(), listHouses(), listRounds()]);
    setQuestions(qRes.data);
    setHouses(hRes.data);
    setRounds(rRes.data);
  }, []);

  useEffect(() => {
    joinPanel("host");
    refresh();

    const events = [
      "question:created", "question:updated", "question:deleted",
      "question:asked", "question:revealed", "question:passed", "question:completed",
      "score:updated", "scores:reset", "scores:sync", "house:updated", "house:turnChanged",
      "session:reset",
    ];
    events.forEach((e) => socket.on(e, refresh));
    return () => events.forEach((e) => socket.off(e, refresh));
  }, [refresh]);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const filteredQuestions = roundFilter ? questions.filter((q) => q.round?._id === roundFilter) : questions;
  const selected = questions.find((q) => q._id === selectedQuestionId) || null;

  const statusIcon = { AVAILABLE: "🟢", ASKED: "🟡", REVEALED: "🩷", PASSED: "⚪", COMPLETED: "🟣" };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header subtitle={`Quizmaster Console · ${user?.name || ""}`} showLogout onLogout={handleLogout} />

      <div className="container" style={{ padding: "28px 24px", display: "grid", gridTemplateColumns: "320px 1.4fr 300px", gap: 24 }}>
        {/* Question list */}
        <div className="card" style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <h3 style={{ marginBottom: 12, fontSize: "1.05rem", color: "var(--color-text-accent)" }}>
            Question Bank
          </h3>
          <select
            className="input"
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value)}
            style={{ marginBottom: 14 }}
          >
            <option value="">All rounds</option>
            {rounds.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredQuestions.map((q) => (
              <button
                key={q._id}
                onClick={() => setSelectedQuestionId(q._id)}
                className="btn"
                style={{
                  textAlign: "left",
                  background: selectedQuestionId === q._id ? "#fff0f6" : "white",
                  border: selectedQuestionId === q._id ? "2px solid var(--color-accent)" : "1px solid #f0f0f0",
                  padding: "10px 12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {statusIcon[q.status]} {q.topic?.name}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#a0aec0" }}>{q.points}pts</span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#718096", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {q.questionText}
                </p>
              </button>
            ))}
            {filteredQuestions.length === 0 && (
              <p style={{ color: "#a0aec0", fontSize: "0.85rem" }}>No questions found. Ask the admin to add some.</p>
            )}
          </div>
        </div>

        {/* Active control panel */}
        <QuestionControlPanel question={selected} houses={houses} onChanged={refresh} />

        {/* Scores */}
        <HouseScoreControls houses={houses} onChanged={refresh} />
      </div>
    </div>
  );
}
