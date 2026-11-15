import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import MemberDashboard from "./pages/MemberDashboard";
import DocumentExplorer from "./pages/DocumentExplorer";
import AIChat from "./pages/AIChat";
import Settings from "./pages/Settings";

export default function App() {
  return (
    
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Member Panel Layout Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<MemberDashboard />} />
          <Route path="/documents" element={<DocumentExplorer />} />
          <Route path="/chat" element={<AIChat />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    
  );
}