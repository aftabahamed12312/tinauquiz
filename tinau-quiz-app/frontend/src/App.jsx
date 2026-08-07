import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import BoardDashboard from "./pages/BoardDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import HostDashboard from "./pages/HostDashboard";
import HouseDashboard from "./pages/HouseDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public Board Dashboard — no auth, meant for projection screens */}
      <Route path="/" element={<BoardDashboard />} />
      <Route path="/board" element={<BoardDashboard />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/host"
        element={
          <ProtectedRoute roles={["admin", "host"]}>
            <HostDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/house"
        element={
          <ProtectedRoute roles={["admin", "house_leader"]}>
            <HouseDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
