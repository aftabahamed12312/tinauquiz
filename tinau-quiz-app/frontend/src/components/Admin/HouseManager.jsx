import { useState } from "react";
import { createHouse, updateHouse, deleteHouse, resetScores } from "../../services/api";

const PRESET_COLORS = ["#E53E3E", "#3182CE", "#38A169", "#D69E2E", "#805AD5", "#DD6B20"];

/**
 * HouseManager.jsx — House & Player Management
 * Create/edit houses (Red, Blue, Green, Yellow, etc.)
 */
export default function HouseManager({ houses, onChanged }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [busy, setBusy] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await createHouse({ name: name.trim(), colorCode: color });
      setName("");
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create house");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this house? This cannot be undone.")) return;
    await deleteHouse(id);
    onChanged?.();
  };

  const handleRename = async (id, newName) => {
    await updateHouse(id, { name: newName });
    onChanged?.();
  };

  const handleResetScores = async () => {
    if (!confirm("Reset ALL house scores to 0?")) return;
    await resetScores();
    onChanged?.();
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--color-text-accent)" }}>Houses</h3>
        <button className="btn btn-ghost" style={{ fontSize: "0.8rem" }} onClick={handleResetScores}>
          Reset all scores
        </button>
      </div>

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder="House name (e.g. Red House)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, minWidth: 160 }}
        />
        <select className="input" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 90 }}>
          {PRESET_COLORS.map((c) => (
            <option key={c} value={c} style={{ background: c }}>
              {c}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" disabled={busy} type="submit">
          Add
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {houses.map((h) => (
          <div
            key={h._id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background: "#fafafa",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: h.colorCode }} />
              <input
                defaultValue={h.name}
                onBlur={(e) => e.target.value !== h.name && handleRename(h._id, e.target.value)}
                style={{ border: "none", background: "transparent", fontWeight: 600, width: 140 }}
              />
              <span style={{ fontSize: "0.8rem", color: "#a0aec0" }}>{h.score} pts</span>
            </div>
            <button className="btn btn-ghost" style={{ color: "var(--color-danger)" }} onClick={() => handleDelete(h._id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
