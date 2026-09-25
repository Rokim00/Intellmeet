import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from '@/api/queryClient';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProjectProvider } from '@/context/ProjectContext';
import { OrganizationProvider } from '@/context/OrganizationContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

const Login = lazy(() => import('@/pages/login/Login').then((m) => ({ default: m.Login })));
const Signup = lazy(() => import('@/pages/signup/Signup').then((m) => ({ default: m.Signup })));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })));
const Projects = lazy(() => import('@/pages/projects/Projects').then((m) => ({ default: m.Projects })));
const Meetings = lazy(() => import('@/pages/meetings/Meetings').then((m) => ({ default: m.Meetings })));
const Tasks = lazy(() => import('@/pages/tasks/Tasks').then((m) => ({ default: m.Tasks })));
const SettingsPage = lazy(() => import('@/pages/settings/Settings').then((m) => ({ default: m.SettingsPage })));

const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
    <div className="flex items-center gap-2 text-xs font-medium">
      <div className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      <span>Loading...</span>
    </div>
  </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
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

const queryClient = createQueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ProjectProvider>
            <OrganizationProvider>
              <TooltipProvider>
                <Suspense fallback={<SuspenseFallback />}>
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
                </Suspense>
              </TooltipProvider>
            </OrganizationProvider>
          </ProjectProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
    {/* Devtools are stripped from the production bundle by the Vite build. */}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;
