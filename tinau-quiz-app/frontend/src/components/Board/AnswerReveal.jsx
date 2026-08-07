/**
 * AnswerReveal.jsx — Answer reveal animation, triggered by the Host.
 */
export default function AnswerReveal({ answerText, wonByHouse }) {
  return (
    <div
      className="card"
      style={{
        width: "100%",
        maxWidth: 640,
        textAlign: "center",
        border: "3px solid var(--color-accent)",
        animation: "revealPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <p
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "var(--color-accent)",
          marginBottom: 8,
        }}
      >
        Answer Revealed
      </p>
      <h2 style={{ fontSize: "1.8rem", color: "var(--color-text-primary)" }}>{answerText}</h2>
      {wonByHouse && (
        <p style={{ marginTop: 14, fontWeight: 700, color: "var(--color-text-accent)" }}>
          🎉 Points awarded to {wonByHouse.name}!
        </p>
      )}
      <style>{`
        @keyframes revealPop {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
