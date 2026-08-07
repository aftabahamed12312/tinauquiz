import { adjustScore, setActiveTurn } from "../../services/api";

/**
 * HouseScoreControls.jsx — Bug-Free Score Updates
 * Award or deduct points instantly across all connected screens, and
 * manually set which house has the active turn.
 */
export default function HouseScoreControls({ houses, onChanged }) {
  const bump = async (id, delta) => {
    await adjustScore(id, delta);
    onChanged?.();
  };

  const makeActive = async (id) => {
    await setActiveTurn(id);
    onChanged?.();
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 14, fontSize: "1.1rem", color: "var(--color-text-accent)" }}>
        House Scores
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {houses.map((h) => (
          <div
            key={h._id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: h.isActiveTurn ? "#fff0f6" : "#fafafa",
              border: h.isActiveTurn ? "2px solid var(--color-accent)" : "2px solid transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: h.colorCode }} />
              <button
                onClick={() => makeActive(h._id)}
                className="btn btn-ghost"
                style={{ padding: 0, fontWeight: 700 }}
                title="Set as active turn"
              >
                {h.name}
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => bump(h._id, -5)}>
                −5
              </button>
              <span style={{ fontWeight: 700, minWidth: 32, textAlign: "center" }}>{h.score}</span>
              <button className="btn btn-ghost" onClick={() => bump(h._id, 5)}>
                +5
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
