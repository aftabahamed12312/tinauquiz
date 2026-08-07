import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";

/**
 * Timer.jsx — Sync Countdown Timer
 * Listens for `timer:started`, `timer:stopped`, and `timer:expired` socket
 * events so every connected panel counts down in lockstep (server clock is
 * the source of truth via `endsAt`, avoiding client drift).
 */
export default function Timer({ questionId, size = "md", onExpire }) {
  const [endsAt, setEndsAt] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const handleStart = (payload) => {
      if (questionId && payload.questionId !== questionId) return;
      setEndsAt(payload.endsAt);
      setExpired(false);
    };
    const handleStop = (payload) => {
      if (questionId && payload.questionId !== questionId) return;
      setEndsAt(null);
      setRemaining(null);
    };
    const handleExpire = (payload) => {
      if (questionId && payload.questionId !== questionId) return;
      setExpired(true);
      setRemaining(0);
      onExpire?.();
    };

    socket.on("timer:started", handleStart);
    socket.on("timer:stopped", handleStop);
    socket.on("timer:expired", handleExpire);

    return () => {
      socket.off("timer:started", handleStart);
      socket.off("timer:stopped", handleStop);
      socket.off("timer:expired", handleExpire);
    };
  }, [questionId, onExpire]);

  useEffect(() => {
    if (!endsAt) {
      clearInterval(intervalRef.current);
      return;
    }

    const tick = () => {
      const diff = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0) {
        setExpired(true);
        clearInterval(intervalRef.current);
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 250);
    return () => clearInterval(intervalRef.current);
  }, [endsAt]);

  const fontSize = size === "lg" ? "3.5rem" : size === "sm" ? "1.2rem" : "2rem";

  if (expired) {
    return (
      <div
        role="status"
        style={{
          background: "var(--color-danger)",
          color: "white",
          borderRadius: "var(--radius-md)",
          padding: "10px 20px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize,
          textAlign: "center",
          animation: "pulse 1s ease-in-out infinite",
        }}
      >
        ⏰ TIME IS UP!
      </div>
    );
  }

  if (remaining === null) {
    return (
      <div style={{ color: "var(--color-text-primary)", opacity: 0.5, fontSize }}>--:--</div>
    );
  }

  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const low = remaining <= 5;

  return (
    <div
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize,
        color: low ? "var(--color-danger)" : "var(--color-accent)",
        transition: "color 0.2s ease",
      }}
    >
      {mins}:{secs}
    </div>
  );
}
