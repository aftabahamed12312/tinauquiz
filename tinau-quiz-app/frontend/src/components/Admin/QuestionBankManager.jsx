import { useState } from "react";
import { createQuestion, updateQuestion, deleteQuestion, mediaUrl } from "../../services/api";

const emptyForm = {
  round: "",
  topic: "",
  questionText: "",
  answerText: "",
  mediaType: "text",
  points: 10,
  timerSeconds: 30,
  mediaUrlExternal: "",
};

/**
 * QuestionBankManager.jsx — Comprehensive Question Bank
 * Full CRUD for Questions and Answers, supporting Text, Image (URL or
 * upload), and Audio, with a customizable timer duration per question.
 */
export default function QuestionBankManager({ questions, rounds, topics, onChanged }) {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const topicsForRound = topics.filter((t) => t.round?._id === form.round || t.round === form.round);

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.round || !form.topic || !form.questionText || !form.answerText) {
      alert("Round, topic, question, and answer are required");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("media", file);

      if (editingId) {
        await updateQuestion(editingId, fd);
      } else {
        await createQuestion(fd);
      }
      resetForm();
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save question");
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (q) => {
    setEditingId(q._id);
    setForm({
      round: q.round?._id || "",
      topic: q.topic?._id || "",
      questionText: q.questionText,
      answerText: q.answerText,
      mediaType: q.mediaType,
      points: q.points,
      timerSeconds: q.timerSeconds,
      mediaUrlExternal: q.mediaUrl && q.mediaUrl.startsWith("http") ? q.mediaUrl : "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this question permanently?")) return;
    await deleteQuestion(id);
    onChanged?.();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20 }}>
      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 10, height: "fit-content" }}>
        <h3 style={{ fontSize: "1.05rem", color: "var(--color-text-accent)" }}>
          {editingId ? "Edit Question" : "New Question"}
        </h3>

        <select className="input" value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value, topic: "" })}>
          <option value="">Select round…</option>
          {rounds.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>

        <select className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} disabled={!form.round}>
          <option value="">Select topic…</option>
          {topicsForRound.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>

        <textarea
          className="input"
          placeholder="Question text"
          rows={3}
          value={form.questionText}
          onChange={(e) => setForm({ ...form, questionText: e.target.value })}
        />
        <textarea
          className="input"
          placeholder="Answer text"
          rows={2}
          value={form.answerText}
          onChange={(e) => setForm({ ...form, answerText: e.target.value })}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <select className="input" value={form.mediaType} onChange={(e) => setForm({ ...form, mediaType: e.target.value })}>
            <option value="text">Text only</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
          </select>
          <input
            className="input"
            type="number"
            min="1"
            value={form.points}
            onChange={(e) => setForm({ ...form, points: e.target.value })}
            title="Points"
          />
          <input
            className="input"
            type="number"
            min="5"
            value={form.timerSeconds}
            onChange={(e) => setForm({ ...form, timerSeconds: e.target.value })}
            title="Timer (s)"
          />
        </div>

        {form.mediaType !== "text" && (
          <>
            <input
              className="input"
              placeholder="External media URL (optional)"
              value={form.mediaUrlExternal}
              onChange={(e) => setForm({ ...form, mediaUrlExternal: e.target.value })}
            />
            <input
              type="file"
              accept={form.mediaType === "image" ? "image/*" : "audio/*"}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" disabled={busy} type="submit">
            {editingId ? "Save changes" : "Add to bank"}
          </button>
          {editingId && (
            <button className="btn btn-ghost" type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card" style={{ maxHeight: 620, overflowY: "auto" }}>
        <h3 style={{ marginBottom: 14, fontSize: "1.05rem", color: "var(--color-text-accent)" }}>
          Bank ({questions.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {questions.map((q) => (
            <div key={q._id} style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "#fafafa" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div>
                  <span className={`badge badge-${q.status.toLowerCase()}`}>{q.status}</span>{" "}
                  <span style={{ fontSize: "0.75rem", color: "#a0aec0" }}>{q.topic?.name} · {q.points}pts</span>
                  <p style={{ margin: "6px 0 0", fontSize: "0.9rem" }}>{q.questionText}</p>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost" style={{ padding: "6px 10px" }} onClick={() => handleEdit(q)}>
                    ✎
                  </button>
                  <button className="btn btn-ghost" style={{ color: "var(--color-danger)", padding: "6px 10px" }} onClick={() => handleDelete(q._id)}>
                    ✕
                  </button>
                </div>
              </div>
              {q.mediaUrl && q.mediaType === "image" && (
                <img src={mediaUrl(q.mediaUrl)} alt="" style={{ maxWidth: 100, borderRadius: 8, marginTop: 8 }} />
              )}
            </div>
          ))}
          {questions.length === 0 && (
            <p style={{ color: "#a0aec0", textAlign: "center", padding: "20px 0" }}>No questions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
