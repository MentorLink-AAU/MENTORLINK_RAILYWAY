/**
 * Root app: routing, auth, layout, and role-based protected routes.
 */
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationProvider';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import { ProjectDetail } from './pages/ProjectDetail';
import { GroupDetail } from './pages/GroupDetail';
import { Projects } from './pages/Projects';
import { FacultyProjects } from './pages/FacultyProjects';
import { CreateGroup } from './pages/CreateGroup';
import { JoinGroup } from './pages/JoinGroup';
import { Deadlines } from './pages/Deadlines';
import { AdminUsers } from './pages/AdminUsers';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { AdminDeadlines } from './pages/AdminDeadlines';
import { AdminUpload } from './pages/AdminUpload';
import { AdminAutoGroup } from './pages/AdminAutoGroup';
import { AdminGroupDetail } from './pages/AdminGroupDetail';
import { ChangePassword } from './pages/ChangePassword';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

/** Redirects authenticated users to their role dashboard. */
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  const role = user?.role?.replace('ROLE_', '') || user?.role;
  if (role === 'STUDENT') return <Navigate to="/dashboard/student" replace />;
  if (role === 'FACULTY') return <Navigate to="/dashboard/faculty" replace />;
  if (role === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
  return <Navigate to="/" replace />;
}

/** Layout wrapper; shows loading, landing, or redirects unauthenticated to login. Forces password change when required. */
function RootRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) {
    if (pathname === '/' || pathname === '') return <Landing />;
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // First-time login: must change default password before accessing the app
  if (user.requiresPasswordChange) {
    if (pathname !== '/change-password') return <Navigate to="/change-password" replace />;
    return <Outlet />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<RootRoute />}>
            <Route index element={<HomeRedirect />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="dashboard/student" element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="dashboard/faculty" element={<ProtectedRoute roles={['FACULTY']}><FacultyDashboard /></ProtectedRoute>} />
            <Route path="dashboard/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="profile" element={<Profile />} />
            <Route path="projects" element={<ProtectedRoute roles={['STUDENT']}><Projects /></ProtectedRoute>} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />
            <Route path="groups/:groupId" element={<GroupDetail />} />
            <Route path="groups/create" element={<ProtectedRoute roles={['STUDENT']}><CreateGroup /></ProtectedRoute>} />
            <Route path="groups/join" element={<JoinGroup />} />
            <Route path="deadlines" element={<Deadlines />} />
            <Route path="faculty/projects" element={<ProtectedRoute roles={['FACULTY']}><FacultyProjects /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
            <Route path="admin/analytics" element={<ProtectedRoute roles={['ADMIN']}><AdminAnalytics /></ProtectedRoute>} />
            <Route path="admin/deadlines" element={<ProtectedRoute roles={['ADMIN']}><AdminDeadlines /></ProtectedRoute>} />
            <Route path="admin/upload" element={<ProtectedRoute roles={['ADMIN']}><AdminUpload /></ProtectedRoute>} />
            <Route path="admin/auto-group" element={<ProtectedRoute roles={['ADMIN']}><AdminAutoGroup /></ProtectedRoute>} />
            <Route path="admin/groups/:groupId" element={<ProtectedRoute roles={['ADMIN']}><AdminGroupDetail /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
