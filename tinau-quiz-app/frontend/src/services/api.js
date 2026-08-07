import axios from "axios";

// In Docker, the frontend is served to the browser, so it must call the
// backend on the host-exposed port, not the internal container name.
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tinau_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("tinau_token");
      localStorage.removeItem("tinau_user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/* ---------------- Auth ---------------- */
export const login = (email, password) => api.post("/auth/login", { email, password });
export const getMe = () => api.get("/auth/me");
export const createUser = (payload) => api.post("/auth/users", payload);
export const listUsers = () => api.get("/auth/users");
export const deleteUser = (id) => api.delete(`/auth/users/${id}`);

/* ---------------- Houses ---------------- */
export const listHouses = () => api.get("/houses");
export const createHouse = (payload) => api.post("/houses", payload);
export const updateHouse = (id, payload) => api.put(`/houses/${id}`, payload);
export const deleteHouse = (id) => api.delete(`/houses/${id}`);
export const adjustScore = (id, delta) => api.patch(`/houses/${id}/score`, { delta });
export const setActiveTurn = (id) => api.patch(`/houses/${id}/active-turn`);
export const resetScores = () => api.post("/houses/reset-scores");

/* ---------------- Rounds ---------------- */
export const listRounds = () => api.get("/rounds");
export const createRound = (payload) => api.post("/rounds", payload);
export const updateRound = (id, payload) => api.put(`/rounds/${id}`, payload);
export const deleteRound = (id) => api.delete(`/rounds/${id}`);

/* ---------------- Topics ---------------- */
export const listTopics = (roundId) => api.get("/topics", { params: roundId ? { round: roundId } : {} });
export const createTopic = (payload) => api.post("/topics", payload);
export const updateTopic = (id, payload) => api.put(`/topics/${id}`, payload);
export const deleteTopic = (id) => api.delete(`/topics/${id}`);

/* ---------------- Questions (Question Bank) ---------------- */
export const listQuestions = (params) => api.get("/questions", { params });
export const getQuestion = (id) => api.get(`/questions/${id}`);
export const createQuestion = (formData) =>
  api.post("/questions", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateQuestion = (id, formData) =>
  api.put(`/questions/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteQuestion = (id) => api.delete(`/questions/${id}`);

/* ---------------- Live Quiz Flow ---------------- */
export const askQuestion = (id, houseId) => api.patch(`/questions/${id}/ask`, { houseId });
export const revealAnswer = (id, winningHouseId) => api.patch(`/questions/${id}/reveal`, { winningHouseId });
export const passQuestion = (id, nextHouseId) => api.patch(`/questions/${id}/pass`, { nextHouseId });
export const completeQuestion = (id) => api.patch(`/questions/${id}/complete`);

/* ---------------- Timer & Session ---------------- */
export const startTimer = (questionId, durationSeconds) =>
  api.post("/quiz/timer/start", { questionId, durationSeconds });
export const expireTimer = (questionId) => api.post("/quiz/timer/expire", { questionId });
export const stopTimer = (questionId) => api.post("/quiz/timer/stop", { questionId });
export const resetSession = () => api.post("/quiz/session/reset");

export const mediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = API_BASE_URL.replace("/api", "");
  return `${base}${path}`;
};

export default api;
