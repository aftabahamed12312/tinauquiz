import { useState } from "react";
import {
  createRound,
  updateRound,
  deleteRound,
  createTopic,
  deleteTopic,
} from "../../services/api";

/**
 * RoundTopicManager.jsx — Topics & Round Management
 * Dynamic creation and modification of quiz topics and rounds.
 */
export default function RoundTopicManager({ rounds, topics, onChanged }) {
  const [roundName, setRoundName] = useState("");
  const [roundTimer, setRoundTimer] = useState(30);
  const [topicName, setTopicName] = useState("");
  const [topicRound, setTopicRound] = useState("");

  const handleAddRound = async (e) => {
    e.preventDefault();
    if (!roundName.trim()) return;
    await createRound({
      name: roundName.trim(),
      roundNumber: rounds.length + 1,
      defaultTimerSeconds: Number(roundTimer) || 30,
    });
    setRoundName("");
    onChanged?.();
  };

  const handleActivate = async (id) => {
    // Deactivate others, activate the chosen round
    await Promise.all(
      rounds
        .filter((r) => r.status === "ACTIVE" && r._id !== id)
        .map((r) => updateRound(r._id, { status: "COMPLETED" }))
    );
    await updateRound(id, { status: "ACTIVE" });
    onChanged?.();
  };

  const handleDeleteRound = async (id) => {
    if (!confirm("Delete this round? Its topics/questions will remain but be unlinked.")) return;
    await deleteRound(id);
    onChanged?.();
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!topicName.trim() || !topicRound) return;
    await createTopic({ name: topicName.trim(), round: topicRound });
    setTopicName("");
    onChanged?.();
  };

  const handleDeleteTopic = async (id) => {
    await deleteTopic(id);
    onChanged?.();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div className="card">
        <h3 style={{ marginBottom: 14, fontSize: "1.1rem", color: "var(--color-text-accent)" }}>Rounds</h3>
        <form onSubmit={handleAddRound} style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="Round name"
            value={roundName}
            onChange={(e) => setRoundName(e.target.value)}
            style={{ flex: 1, minWidth: 120 }}
          />
          <input
            className="input"
            type="number"
            min="5"
            value={roundTimer}
            onChange={(e) => setRoundTimer(e.target.value)}
            style={{ width: 80 }}
            title="Default timer (s)"
          />
          <button className="btn btn-primary" type="submit">Add</button>
        </form>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rounds.map((r) => (
            <div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "#fafafa" }}>
              <div>
                <span style={{ fontWeight: 600 }}>{r.name}</span>{" "}
                <span className={`badge badge-${r.status === "ACTIVE" ? "asked" : r.status === "COMPLETED" ? "completed" : "available"}`}>
                  {r.status}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {r.status !== "ACTIVE" && (
                  <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => handleActivate(r._id)}>
                    Activate
                  </button>
                )}
                <button className="btn btn-ghost" style={{ color: "var(--color-danger)", padding: "6px 10px" }} onClick={() => handleDeleteRound(r._id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14, fontSize: "1.1rem", color: "var(--color-text-accent)" }}>Topics</h3>
        <form onSubmit={handleAddTopic} style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="Topic name"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            style={{ flex: 1, minWidth: 120 }}
          />
          <select className="input" value={topicRound} onChange={(e) => setTopicRound(e.target.value)} style={{ width: 140 }}>
            <option value="">Round…</option>
            {rounds.map((r) => (
              <option key={r._id} value={r._id}>{r.name}</option>
            ))}
          </select>
          <button className="btn btn-primary" type="submit">Add</button>
        </form>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {topics.map((t) => (
            <div key={t._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "#fafafa" }}>
              <span>{t.name} <span style={{ fontSize: "0.75rem", color: "#a0aec0" }}>({t.round?.name})</span></span>
              <button className="btn btn-ghost" style={{ color: "var(--color-danger)", padding: "6px 10px" }} onClick={() => handleDeleteTopic(t._id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
