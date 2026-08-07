import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Timer from "../components/Timer";
import MediaViewer from "../components/MediaViewer";
import Scoreboard from "../components/Board/Scoreboard";
import AnswerReveal from "../components/Board/AnswerReveal";
import socket, { joinPanel } from "../services/socket";
import { listHouses, listRounds } from "../services/api";

/**
 * BoardDashboard.jsx — Public Board Dashboard
 * Synchronized display for projection screens: active question, timer,
 * live scoreboard, and answer reveals. Read-only, no auth required.
 */
export default function BoardDashboard() {
  const navigate = useNavigate();
  const [houses, setHouses] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [revealed, setRevealed] = useState(null);
  const [activeRound, setActiveRound] = useState(null);
  const [connected, setConnected] = useState(socket.connected);
  const [timeUp, setTimeUp] = useState(false);

  const refreshHouses = useCallback(async () => {
    const { data } = await listHouses();
    setHouses(data);
  }, []);

  useEffect(() => {
    joinPanel("board");
    refreshHouses();
    listRounds().then(({ data }) => {
      const active = data.find((r) => r.status === "ACTIVE");
      if (active) setActiveRound(active);
    });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onAsked = (question) => {
      setActiveQuestion(question);
      setRevealed(null);
      setTimeUp(false);
    };
    const onRevealed = (question) => {
      setRevealed(question);
      setActiveQuestion(question);
    };
    const onPassed = (question) => {
      setActiveQuestion(question);
      setTimeUp(false);
    };
    const onCompleted = () => {
      setActiveQuestion(null);
      setRevealed(null);
      setTimeUp(false);
    };
    const onScoreUpdated = () => refreshHouses();
    const onScoresReset = (updatedHouses) => setHouses(updatedHouses);
    const onScoresSync = (updatedHouses) => setHouses(updatedHouses);
    const onHouseChange = () => refreshHouses();
    const onRoundActivated = (round) => setActiveRound(round);
    const onSessionReset = () => {
      setActiveQuestion(null);
      setRevealed(null);
      refreshHouses();
    };
    const onTimeUp = () => setTimeUp(true);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("question:asked", onAsked);
    socket.on("question:revealed", onRevealed);
    socket.on("question:passed", onPassed);
    socket.on("question:completed", onCompleted);
    socket.on("score:updated", onScoreUpdated);
    socket.on("scores:reset", onScoresReset);
    socket.on("scores:sync", onScoresSync);
    socket.on("house:created", onHouseChange);
    socket.on("house:updated", onHouseChange);
    socket.on("house:deleted", onHouseChange);
    socket.on("house:turnChanged", onHouseChange);
    socket.on("round:activated", onRoundActivated);
    socket.on("session:reset", onSessionReset);
    socket.on("timer:expired", onTimeUp);
    socket.on("timer:started", () => setTimeUp(false));

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("question:asked", onAsked);
      socket.off("question:revealed", onRevealed);
      socket.off("question:passed", onPassed);
      socket.off("question:completed", onCompleted);
      socket.off("score:updated", onScoreUpdated);
      socket.off("scores:reset", onScoresReset);
      socket.off("scores:sync", onScoresSync);
      socket.off("house:created", onHouseChange);
      socket.off("house:updated", onHouseChange);
      socket.off("house:deleted", onHouseChange);
      socket.off("house:turnChanged", onHouseChange);
      socket.off("round:activated", onRoundActivated);
      socket.off("session:reset", onSessionReset);
      socket.off("timer:expired", onTimeUp);
    };
  }, [refreshHouses]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header
        subtitle={activeRound ? activeRound.name : "Butwal-11, Devinagar"}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="btn btn-secondary"
              style={{ padding: "8px 14px", fontSize: "0.85rem" }}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "white",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: connected ? "#4ade80" : "#f87171",
                }}
              />
              {connected ? "Live" : "Reconnecting…"}
            </span>
          </div>
        }
      />

      <div className="container" style={{ padding: "32px 24px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
          {activeQuestion ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {activeQuestion.assignedHouse && (
                  <span className="badge badge-asked">{activeQuestion.assignedHouse.name}'s turn</span>
                )}
                <Timer questionId={activeQuestion._id} size="lg" />
              </div>

              <div className="card" style={{ width: "100%", textAlign: "center" }}>
                <MediaViewer
                  mediaType={activeQuestion.mediaType}
                  mediaUrl={activeQuestion.mediaUrl}
                  questionText={activeQuestion.questionText}
                  size="lg"
                />
              </div>

              {revealed && (
                <AnswerReveal answerText={revealed.answerText} wonByHouse={revealed.wonByHouse} />
              )}
            </>
          ) : (
            <div className="card" style={{ width: "100%", textAlign: "center", padding: "80px 24px" }}>
              <h2 style={{ color: "#a0aec0", fontSize: "1.6rem" }}>
                🎤 Waiting for the next question…
              </h2>
              <p style={{ color: "#cbd5e0", marginTop: 8 }}>
                The Quizmaster will begin shortly.
              </p>
            </div>
          )}
        </div>

        <Scoreboard houses={houses} />
      </div>
    </div>
  );
}
