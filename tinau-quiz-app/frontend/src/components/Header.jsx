import { useNavigate } from "react-router-dom";

/**
 * Header.jsx — Pink Theme Banner Header
 * Shown at the top of every panel. Displays the school identity plus
 * whatever contextual controls the page passes in (e.g. logout, connection dot).
 */
export default function Header({ title, subtitle, right, showLogout, onLogout }) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        background: "linear-gradient(120deg, var(--color-header-start), var(--color-header-end))",
        padding: "18px 0",
        boxShadow: "0 2px 16px rgba(255,20,147,0.18)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            🏫
          </div>
          <div>
            <h1 style={{ color: "white", fontSize: "1.35rem", lineHeight: 1.1 }}>
              {title || "TINAU SCHOOL Quiz"}
            </h1>
            {subtitle && (
              <p style={{ margin: 0, color: "rgba(255,255,255,0.9)", fontSize: "0.8rem" }}>{subtitle}</p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {right}
          {showLogout && (
            <button
              className="btn"
              style={{ background: "rgba(255,255,255,0.25)", color: "white" }}
              onClick={onLogout}
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
