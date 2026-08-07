import { mediaUrl } from "../services/api";

/**
 * MediaViewer.jsx — Text / Image / Audio Display Component
 * Renders the active question's media according to its mediaType, used by
 * both the Host console and the Public Board.
 */
export default function MediaViewer({ mediaType, mediaUrl: url, questionText, size = "md" }) {
  const resolvedUrl = mediaUrl(url);
  const textSize = size === "lg" ? "2rem" : size === "sm" ? "1.1rem" : "1.5rem";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", width: "100%" }}>
      {mediaType === "image" && resolvedUrl && (
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          <img
            src={resolvedUrl}
            alt="Question visual"
            style={{ width: "100%", display: "block", objectFit: "cover" }}
          />
        </div>
      )}

      {mediaType === "audio" && resolvedUrl && (
        <div className="card" style={{ width: "100%", maxWidth: 480 }}>
          <p style={{ marginBottom: 10, fontWeight: 700, color: "var(--color-text-accent)" }}>
            🔊 Audio Trivia
          </p>
          <audio controls autoPlay style={{ width: "100%" }} src={resolvedUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: textSize,
          textAlign: "center",
          color: "var(--color-text-primary)",
          maxWidth: 720,
          lineHeight: 1.4,
        }}
      >
        {questionText}
      </p>
    </div>
  );
}
