import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import HouseManager from "../components/Admin/HouseManager";
import RoundTopicManager from "../components/Admin/RoundTopicManager";
import QuestionBankManager from "../components/Admin/QuestionBankManager";
import UserManager from "../components/Admin/UserManager";
import Scoreboard from "../components/Board/Scoreboard";
import {
  listHouses,
  listRounds,
  listTopics,
  listQuestions,
  listUsers,
  resetSession,
} from "../services/api";
import { clearSession, getUser } from "../services/auth";
import socket, { joinPanel } from "../services/socket";

const TABS = [
  { key: "overview", label: "📊 Overview" },
  { key: "houses", label: "🚩 Houses" },
  { key: "rounds", label: "🗂 Rounds & Topics" },
  { key: "questions", label: "❓ Question Bank" },
  { key: "users", label: "🧑‍🏫 Host & House Leaders" },
];

/**
 * AdminDashboard.jsx — Admin Panel
 * Full supervision & control: monitor all dashboard states, manage
 * houses, rounds, topics, question bank, and user accounts.
 */
export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [houses, setHouses] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const user = getUser();

  const refresh = useCallback(async () => {
    const [h, r, t, q, u] = await Promise.all([
      listHouses(),
      listRounds(),
      listTopics(),
      listQuestions(),
      listUsers(),
    ]);
    setHouses(h.data);
    setRounds(r.data);
    setTopics(t.data);
    setQuestions(q.data);
    setUsers(u.data);
  }, []);

  useEffect(() => {
    joinPanel("admin");
    refresh();

    const events = [
      "house:created", "house:updated", "house:deleted", "house:turnChanged",
      "round:created", "round:updated", "round:deleted", "round:activated",
      "topic:created", "topic:updated", "topic:deleted",
      "question:created", "question:updated", "question:deleted",
      "question:asked", "question:revealed", "question:passed", "question:completed",
      "score:updated", "scores:reset", "scores:sync", "session:reset",
    ];
    events.forEach((e) => socket.on(e, refresh));
    return () => events.forEach((e) => socket.off(e, refresh));
  }, [refresh]);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const handleFullReset = async () => {
    if (!confirm("This resets ALL scores and question states for a fresh competition. Continue?")) return;
    await resetSession();
    refresh();
  };

  const activeQuestionsCount = questions.filter((q) => ["ASKED", "PASSED"].includes(q.status)).length;
  const completedCount = questions.filter((q) => ["REVEALED", "COMPLETED"].includes(q.status)).length;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header subtitle={`Admin Control Panel · ${user?.name || ""}`} showLogout onLogout={handleLogout} />

      <div className="container" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="btn"
                style={{
                  background: tab === t.key ? "var(--color-accent)" : "white",
                  color: tab === t.key ? "white" : "var(--color-text-primary)",
                  border: "1px solid #ffd6e5",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button className="btn btn-danger" onClick={handleFullReset}>
            ⟳ Reset Session
          </button>
        </div>

        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignContent: "start" }}>
              <StatCard label="Houses" value={houses.length} icon="🚩" />
              <StatCard label="Rounds" value={rounds.length} icon="🗂" />
              <StatCard label="Questions" value={questions.length} icon="❓" />
              <StatCard label="In Play" value={activeQuestionsCount} icon="🎙" />
              <StatCard label="Completed" value={completedCount} icon="✅" />
              <StatCard label="Accounts" value={users.length} icon="🧑‍🏫" />
            </div>
            <Scoreboard houses={houses} />
          </div>
        )}

        {tab === "houses" && <HouseManager houses={houses} onChanged={refresh} />}

        {tab === "rounds" && <RoundTopicManager rounds={rounds} topics={topics} onChanged={refresh} />}

        {tab === "questions" && (
          <QuestionBankManager questions={questions} rounds={rounds} topics={topics} onChanged={refresh} />
        )}

        {tab === "users" && <UserManager users={users} houses={houses} onChanged={refresh} />}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div style={{ fontSize: "1.6rem" }}>{icon}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, color: "var(--color-accent)" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.8rem", color: "#718096" }}>{label}</div>
    </div>
  );
}
