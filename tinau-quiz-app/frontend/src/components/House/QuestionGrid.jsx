import { askQuestion } from "../../services/api";

/**
 * QuestionGrid.jsx — Interactive grid to pick available (unasked)
 * questions when it is the house's turn.
 */
export default function QuestionGrid({ questions, myHouseId, isMyTurn, onChanged }) {
  const handlePick = async (q) => {
    if (!isMyTurn) return;
    try {
      await askQuestion(q._id, myHouseId);
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.message || "Could not pick this question");
    }
  };

  const statusStyle = {
    AVAILABLE: { bg: "white", border: "#ffd6e5", label: "Pick me!", disabled: false },
    ASKED: { bg: "#fff8e1", border: "#f6ad55", label: "In play", disabled: true },
    REVEALED: { bg: "#fce7f6", border: "#d53f8c", label: "Revealed", disabled: true },
    PASSED: { bg: "#edf2f7", border: "#cbd5e0", label: "Passed", disabled: true },
    COMPLETED: { bg: "#e9e3ff", border: "#9f7aea", label: "Done", disabled: true },
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
      {questions.map((q) => {
        const s = statusStyle[q.status] || statusStyle.AVAILABLE;
        const pickable = q.status === "AVAILABLE" && isMyTurn;
        return (
          <button
            key={q._id}
            disabled={!pickable}
            onClick={() => handlePick(q)}
            className="card"
            style={{
              textAlign: "left",
              background: s.bg,
              border: `2px solid ${s.border}`,
              cursor: pickable ? "pointer" : "not-allowed",
              opacity: q.status === "AVAILABLE" && !isMyTurn ? 0.6 : 1,
              transition: "transform 0.15s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--color-text-accent)" }}>
                {q.topic?.name}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#a0aec0" }}>{q.points} pts</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#4a5568" }}>
              {q.mediaType === "text" ? "📝" : q.mediaType === "image" ? "🖼️" : "🔊"} {s.label}
            </p>
          </button>
        );
      })}
      {questions.length === 0 && (
        <p style={{ color: "#a0aec0", gridColumn: "1 / -1", textAlign: "center", padding: "40px 0" }}>
          No questions available in this round yet.
        </p>
      )}
    </div>
  );
}
