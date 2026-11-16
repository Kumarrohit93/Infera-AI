import React from 'react';
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

const CACHE_STORAGE_KEY = 'infera_admin_query_cache_v1';
const PERSISTED_ROOT_KEYS = new Set(['folders', 'members', 'employees', 'documents']);

// TanStack Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Hydrate cached folders, documents, employees, and members from localStorage
try {
  const raw = localStorage.getItem(CACHE_STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      parsed.forEach((entry) => {
        if (entry?.queryKey && entry.data !== undefined) {
          queryClient.setQueryData(entry.queryKey, entry.data);
        }
      });
    }
  }
} catch {
  // Ignore malformed localStorage cache
}

// Persist cache updates to localStorage until backend is connected
queryClient.getQueryCache().subscribe((event) => {
  if (!event?.query) return;
  const rootKey = event.query.queryKey?.[0];
  if (!PERSISTED_ROOT_KEYS.has(rootKey)) return;

  try {
    const entries = queryClient
      .getQueryCache()
      .getAll()
      .filter((q) => PERSISTED_ROOT_KEYS.has(q.queryKey?.[0]) && q.state.data !== undefined)
      .map((q) => ({
        queryKey: q.queryKey,
        data: q.state.data,
      }));
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota or serialization errors
  }
});

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('isAdminAuth') === 'true';
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const isAuth = localStorage.getItem('isAdminAuth') === 'true';
  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function RootRedirect() {
  const isAuth = localStorage.getItem('isAdminAuth') === 'true';
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
      </BrowserRouter>
    </QueryClientProvider>
  );
}