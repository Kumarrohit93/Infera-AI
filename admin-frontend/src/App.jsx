import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import FoldersPage from './pages/FoldersPage';
import AddMemberPage from './pages/AddMemberPage';
import TeamMembersPage from './pages/TeamMembersPage';
import FeedbackPage from './pages/FeedbackPage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PageTransitionLoader from './components/PageTransitionLoader';

// TanStack Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // always refetch from the backend when a page mounts
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('isAdminAuth') === 'true' && Boolean(localStorage.getItem('accessToken'));
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const isAuth = localStorage.getItem('isAdminAuth') === 'true' && Boolean(localStorage.getItem('accessToken'));
  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function RootRedirect() {
  const isAuth = localStorage.getItem('isAdminAuth') === 'true' && Boolean(localStorage.getItem('accessToken'));
  return isAuth ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/folders" element={<FoldersPage />} />
            <Route path="/add-member" element={<AddMemberPage />} />
            <Route path="/members" element={<TeamMembersPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <PageTransitionLoader />
      </BrowserRouter>
    </QueryClientProvider>
  );
}