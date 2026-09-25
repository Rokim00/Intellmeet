import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProjectProvider } from '@/context/ProjectContext';
import { Login } from '@/pages/login/Login';
import { Signup } from '@/pages/signup/Signup';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { Projects } from '@/pages/projects/Projects';
import { Meetings } from '@/pages/meetings/Meetings';
import { Tasks } from '@/pages/tasks/Tasks';
import { SettingsPage } from '@/pages/settings/Settings';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e] text-zinc-400">
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span>Loading IntellMeet…</span>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ProjectProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />

          {/* Protected Dashboard Routes with SidebarLayout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </ProjectProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
