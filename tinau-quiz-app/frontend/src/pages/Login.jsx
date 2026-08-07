import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../services/api";
import { saveSession } from "../services/auth";
import Header from "../components/Header";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roleHome = { admin: "/admin", host: "/host", house_leader: "/house" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginApi(email, password);
      saveSession(data.token, data.user);
      navigate(roleHome[data.user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header subtitle="Butwal-11, Devinagar" />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 20px",
        }}
      >
        <form onSubmit={handleSubmit} className="card" style={{ width: "100%", maxWidth: 400 }}>
          <h2 style={{ color: "var(--color-text-accent)", marginBottom: 6 }}>Sign in</h2>
          <p style={{ marginTop: 0, marginBottom: 24, color: "#718096", fontSize: "0.9rem" }}>
            Admin, Host, and House Leader portal
          </p>

          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@tinau.com"
            style={{ marginBottom: 16 }}
          />

          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Password
          </label>
          <input
            className="input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ marginBottom: 20 }}
          />

          {error && (
            <p style={{ color: "var(--color-danger)", fontSize: "0.85rem", marginTop: -8, marginBottom: 16 }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
