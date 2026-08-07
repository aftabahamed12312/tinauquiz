import { useState } from "react";
import MediaViewer from "../MediaViewer";
import Timer from "../Timer";
import {
  askQuestion,
  revealAnswer,
  passQuestion,
  completeQuestion,
  startTimer,
  expireTimer,
  stopTimer,
} from "../../services/api";

/**
 * QuestionControlPanel.jsx
 * Live Question Controls + Timer & Passing System + State Locking, per spec:
 * - Present question to a house, reveal answers on command
 * - ASKED/REVEALED states lock the question from being re-asked
 * - On timeout, offers "Pass Question" to the next house
 */
export default function QuestionControlPanel({ question, houses, onChanged }) {
  const [selectedHouse, setSelectedHouse] = useState("");
  const [timeUp, setTimeUp] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!question) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
        <p style={{ color: "#a0aec0" }}>Select a question from the bank to begin.</p>
      </div>
    );
  }

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const handleAsk = () =>
    run(() => askQuestion(question._id, selectedHouse || question.assignedHouse?._id));

  const handleStartTimer = () =>
    run(async () => {
      setTimeUp(false);
      await startTimer(question._id, question.timerSeconds);
    });

  const handleStopTimer = () => run(() => stopTimer(question._id));

  const handleExpire = () =>
    run(async () => {
      setTimeUp(true);
      await expireTimer(question._id);
    });

  const handlePass = (nextHouseId) => run(() => passQuestion(question._id, nextHouseId));

  const handleReveal = (winningHouseId) => run(() => revealAnswer(question._id, winningHouseId));

  const handleComplete = () => run(() => completeQuestion(question._id));

  const locked = ["REVEALED", "COMPLETED"].includes(question.status);
  const otherHouses = houses.filter((h) => h._id !== question.assignedHouse?._id);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className={`badge badge-${question.status.toLowerCase()}`}>{question.status}</span>
        <Timer questionId={question._id} size="sm" onExpire={() => setTimeUp(true)} />
      </div>

      <MediaViewer
        mediaType={question.mediaType}
        mediaUrl={question.mediaUrl}
        questionText={question.questionText}
        size="md"
      />

      <div className="card" style={{ background: "#fff5f7", padding: 16 }}>
        <p style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--color-text-accent)", marginBottom: 4 }}>
          ANSWER (host only)
        </p>
        <p style={{ margin: 0 }}>{question.answerText}</p>
        <p style={{ margin: "8px 0 0", fontSize: "0.8rem", color: "#718096" }}>
          Worth {question.points} pts · {question.timerSeconds}s timer
        </p>
      </div>

      {question.status === "AVAILABLE" && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select className="input" value={selectedHouse} onChange={(e) => setSelectedHouse(e.target.value)}>
            <option value="">Assign to house…</option>
            {houses.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" disabled={busy} onClick={handleAsk}>
            Ask Question
          </button>
        </div>
      )}

      {["ASKED", "PASSED"].includes(question.status) && (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-secondary" disabled={busy} onClick={handleStartTimer}>
              ▶ Start Timer
            </button>
            <button className="btn btn-ghost" disabled={busy} onClick={handleStopTimer}>
              ⏹ Stop Timer
            </button>
            <button className="btn btn-ghost" disabled={busy} onClick={handleExpire}>
              ⏰ Force Time Up
            </button>
          </div>

          <div style={{ borderTop: "1px solid #ffe0ec", paddingTop: 16 }}>
            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.9rem" }}>Reveal &amp; award points</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {houses.map((h) => (
                <button
                  key={h._id}
                  className="btn"
                  style={{ background: h.colorCode, color: "white" }}
                  disabled={busy}
                  onClick={() => handleReveal(h._id)}
                >
                  {h.name} got it right
                </button>
              ))}
              <button className="btn btn-secondary" disabled={busy} onClick={() => handleReveal(null)}>
                Reveal (no winner)
              </button>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #ffe0ec", paddingTop: 16 }}>
            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.9rem" }}>
              Pass question {timeUp && "(time expired)"}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {otherHouses.map((h) => (
                <button
                  key={h._id}
                  className="btn btn-secondary"
                  disabled={busy}
                  onClick={() => handlePass(h._id)}
                >
                  Pass to {h.name}
                </button>
              ))}
              <button className="btn btn-danger" disabled={busy} onClick={() => handlePass(null)}>
                Pass (no one answered)
              </button>
            </div>
          </div>
        </>
      )}

      {locked && question.status !== "COMPLETED" && (
        <button className="btn btn-primary" disabled={busy} onClick={handleComplete}>
          Mark Completed &amp; Move On
        </button>
      )}
    </div>
  );
}
