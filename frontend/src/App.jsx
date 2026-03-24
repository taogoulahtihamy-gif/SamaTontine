import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Tontines from "./pages/Tontines";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";
import LoginAdmin from "./pages/LoginAdmin";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/login-admin" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tontines" element={<Tontines />} />
      <Route path="/login-admin" element={<LoginAdmin />} />

      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <Create />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/:id"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;