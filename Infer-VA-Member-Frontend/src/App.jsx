import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import MemberDashboard from "./pages/MemberDashboard";
import DocumentExplorer from "./pages/DocumentExplorer";
import AIChat from "./pages/AIChat";
import ChatHistory from "./pages/ChatHistory";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<MemberDashboard />} />
        <Route path="/documents" element={<DocumentExplorer />} />
        <Route path="/chat" element={<AIChat />} />
        <Route path="/history" element={<ChatHistory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}