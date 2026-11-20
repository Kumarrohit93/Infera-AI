import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import MemberDashboard from "./pages/MemberDashboard";
import DocumentExplorer from "./pages/DocumentExplorer";
import AIChat from "./pages/AIChat";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import AcceptInvitation from "./pages/AcceptInvitation";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/accept-invitation" element={<AcceptInvitation />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<MemberDashboard />} />
        <Route path="/documents" element={<DocumentExplorer />} />
        <Route path="/chat" element={<AIChat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}