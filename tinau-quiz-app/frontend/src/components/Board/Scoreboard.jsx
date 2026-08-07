/**
 * Scoreboard.jsx — Real-time Scoreboard
 * Ranks houses by score, updates instantly via socket events without reloads.
 */
export default function Scoreboard({ houses }) {
  const sorted = [...houses].sort((a, b) => b.score - a.score);

  return (
    <div className="card">
      <h2 style={{ color: "var(--color-text-accent)", marginBottom: 18, fontSize: "1.4rem" }}>
        🏆 Live Scoreboard
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map((house, idx) => (
          <div
            key={house._id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderRadius: "var(--radius-md)",
              background: house.isActiveTurn ? "#fff0f6" : "#fafafa",
              border: house.isActiveTurn ? "2px solid var(--color-accent)" : "2px solid transparent",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  color: "#a0aec0",
                  fontSize: "1.1rem",
                  width: 24,
                }}
              >
                {idx + 1}
              </span>
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: house.colorCode,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{house.name}</span>
              {house.isActiveTurn && (
                <span className="badge badge-asked">Active turn</span>
              )}
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.6rem",
                color: "var(--color-accent)",
              }}
            >
              {house.score}
            </span>
          </div>
        ))}
        {sorted.length === 0 && (
          <p style={{ color: "#a0aec0", textAlign: "center", padding: "20px 0" }}>
            No houses have been added yet.
          </p>
        )}
      </div>
    </div>
  );
}
