import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Menu } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useAuth from '../../hooks/useAuth';
import useNotificationStore from '../../store/notificationStore';

export default function Navbar() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const navigate = useNavigate();

  const notifPath = {
    CITIZEN: '/citizen/notifications',
    ADMIN: '/admin/dashboard',
    WORKER: '/worker/dashboard',
  };

  return (
    <div className="navbar bg-primary text-primary-content px-2 md:px-4 shadow z-50">
      <div className="flex-none lg:hidden">
        <label htmlFor="dashboard-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
          <Menu size={24} />
        </label>
      </div>
      <div className="flex-1">
        <Link to="/" className="text-lg md:text-xl font-bold ml-2 lg:ml-0">CivicConnect</Link>
      </div>
      <div className="flex-none gap-2">
        {user?.role === 'CITIZEN' && (
          <button className="btn btn-ghost btn-circle" onClick={() => navigate(notifPath.CITIZEN)}>
            <div className="indicator">
              <Bell size={20} />
              {unreadCount > 0 && <span className="badge badge-xs badge-secondary indicator-item">{unreadCount}</span>}
            </div>
          </button>
        )}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
            <User size={18} />
            <span className="hidden sm:inline">{user?.name}</span>
          </div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 text-neutral rounded-box z-50 w-52 p-2 shadow mt-2">
            <li><button onClick={() => navigate(`/${user?.role?.toLowerCase()}/profile`)}>Profile</button></li>
            <li><button onClick={logout}><LogOut size={16} /> Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
