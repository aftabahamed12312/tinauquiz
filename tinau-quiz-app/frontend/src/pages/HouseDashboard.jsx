import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Timer from "../components/Timer";
import MediaViewer from "../components/MediaViewer";
import QuestionGrid from "../components/House/QuestionGrid";
import { listQuestions, listHouses, listRounds } from "../services/api";
import { clearSession, getUser } from "../services/auth";
import socket, { joinPanel } from "../services/socket";

/**
 * HouseDashboard.jsx — House Leader Panel
 * Interactive grid to pick available questions on your turn, plus
 * active turn indicators and real-time round updates.
 */
export default function HouseDashboard() {
  const [questions, setQuestions] = useState([]);
  const [houses, setHouses] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const navigate = useNavigate();
  const user = getUser();
  const myHouseId = user?.house?._id || user?.house || null;

  const refresh = useCallback(async () => {
    const [qRes, hRes, rRes] = await Promise.all([listQuestions(), listHouses(), listRounds()]);
    setQuestions(qRes.data);
    setHouses(hRes.data);
    setRounds(rRes.data);
    const inPlay = qRes.data.find((q) => ["ASKED", "PASSED"].includes(q.status));
    setActiveQuestion(inPlay || null);
  }, []);

  useEffect(() => {
    joinPanel("house", myHouseId);
    refresh();

    const events = [
      "question:created", "question:updated", "question:deleted",
      "question:asked", "question:revealed", "question:passed", "question:completed",
      "score:updated", "scores:reset", "scores:sync", "house:updated", "house:turnChanged",
      "session:reset",
    ];
    events.forEach((e) => socket.on(e, refresh));
    return () => events.forEach((e) => socket.off(e, refresh));
  }, [refresh, myHouseId]);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const myHouse = houses.find((h) => h._id === myHouseId);
  const activeRound = rounds.find((r) => r.status === "ACTIVE");
  const roundQuestions = activeRound
    ? questions.filter((q) => q.round?._id === activeRound._id)
    : questions;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header
        subtitle={`House Leader · ${user?.name || ""}`}
        showLogout
        onLogout={handleLogout}
        right={
          myHouse && (
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "white", fontWeight: 700 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: myHouse.colorCode }} />
              {myHouse.name} · {myHouse.score} pts
            </span>
          )
        }
      />

      <div className="container" style={{ padding: "28px 24px" }}>
        {myHouse?.isActiveTurn ? (
          <div
            className="card"
            style={{ marginBottom: 24, background: "#fff0f6", border: "2px solid var(--color-accent)", textAlign: "center" }}
          >
            <h2 style={{ color: "var(--color-accent)" }}>🎯 It's your turn! Pick a question below.</h2>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 24, textAlign: "center", color: "#a0aec0" }}>
            Waiting for your house's turn…
          </div>
        )}

        {activeQuestion && (
          <div className="card" style={{ marginBottom: 24, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <Timer questionId={activeQuestion._id} size="md" />
            </div>
            <MediaViewer
              mediaType={activeQuestion.mediaType}
              mediaUrl={activeQuestion.mediaUrl}
              questionText={activeQuestion.questionText}
              size="md"
            />
          </div>
        )}

        <h3 style={{ marginBottom: 16, color: "var(--color-text-accent)" }}>
          {activeRound ? activeRound.name : "All Questions"}
        </h3>
        <QuestionGrid
          questions={roundQuestions}
          myHouseId={myHouseId}
          isMyTurn={Boolean(myHouse?.isActiveTurn)}
          onChanged={refresh}
        />
      </div>
    </div>
  );
}
