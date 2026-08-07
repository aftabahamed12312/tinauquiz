import { useState } from "react";
import { createUser, deleteUser } from "../../services/api";

const emptyForm = { name: "", email: "", password: "", role: "host", house: "" };

/**
 * UserManager.jsx — assign Host and House Leader accounts (admin only),
 * as described under House & Player Management in the spec.
 */
export default function UserManager({ users, houses, onChanged }) {
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    setBusy(true);
    try {
      await createUser({ ...form, house: form.role === "house_leader" ? form.house || null : undefined });
      setForm(emptyForm);
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this account?")) return;
    await deleteUser(id);
    onChanged?.();
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 14, fontSize: "1.1rem", color: "var(--color-text-accent)" }}>
        Host &amp; House Leader Accounts
      </h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ flex: 1, minWidth: 130 }} />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ flex: 1, minWidth: 160 }} />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ width: 140 }} />
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ width: 140 }}>
          <option value="host">Host</option>
          <option value="house_leader">House Leader</option>
        </select>
        {form.role === "house_leader" && (
          <select className="input" value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })} style={{ width: 140 }}>
            <option value="">Assign house…</option>
            {houses.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>
        )}
        <button className="btn btn-primary" disabled={busy} type="submit">Create</button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {users.map((u) => (
          <div key={u._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "#fafafa" }}>
            <div>
              <span style={{ fontWeight: 600 }}>{u.name}</span>{" "}
              <span className="badge badge-available" style={{ marginLeft: 6 }}>{u.role.replace("_", " ")}</span>
              {u.house && <span style={{ fontSize: "0.8rem", color: "#a0aec0", marginLeft: 8 }}>{u.house.name}</span>}
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#718096" }}>{u.email}</p>
            </div>
            <button className="btn btn-ghost" style={{ color: "var(--color-danger)" }} onClick={() => handleDelete(u._id)}>
              Remove
            </button>
          </div>
        ))}
        {users.length === 0 && <p style={{ color: "#a0aec0", textAlign: "center", padding: "10px 0" }}>No accounts yet.</p>}
      </div>
    </div>
  );
}
