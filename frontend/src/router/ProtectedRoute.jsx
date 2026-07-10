import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSocket from '../hooks/useSocket';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

export function ProtectedRoute({ role, children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    const redirect = {
      CITIZEN: '/citizen/dashboard',
      ADMIN: '/admin/dashboard',
      WORKER: '/worker/dashboard',
    };
    return <Navigate to={redirect[user?.role] || '/'} replace />;
  }

  return children || <Outlet />;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    const redirect = {
      CITIZEN: '/citizen/dashboard',
      ADMIN: '/admin/dashboard',
      WORKER: '/worker/dashboard',
    };
    return <Navigate to={redirect[user?.role] || '/'} replace />;
  }
  return children;
}

export function DashboardLayout({ role }) {
  useSocket();
  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-100">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side z-[100]">
        <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <Sidebar role={role} />
      </div>
    </div>
  );
}
