import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  List,
  Bell,
  Users,
  BarChart3,
  ClipboardList,
  User,
} from 'lucide-react';

const links = {
  CITIZEN: [
    { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/citizen/complaints/new', label: 'New Complaint', icon: FilePlus },
    { to: '/citizen/complaints', label: 'My Complaints', icon: List },
    { to: '/citizen/notifications', label: 'Notifications', icon: Bell },
    { to: '/citizen/profile', label: 'Profile', icon: User },
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'All Complaints', icon: List },
    { to: '/admin/workers', label: 'Workers', icon: Users },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/profile', label: 'Profile', icon: User },
  ],
  WORKER: [
    { to: '/worker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/worker/tasks', label: 'Assigned Tasks', icon: ClipboardList },
    { to: '/worker/profile', label: 'Profile', icon: User },
  ],
};

export default function Sidebar({ role }) {
  const items = links[role] || [];

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 min-h-full">
      <ul className="menu p-4 gap-1" onClick={() => {
        const drawer = document.getElementById('dashboard-drawer');
        if (drawer) drawer.checked = false;
      }}>
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => (isActive ? 'active font-medium' : '')}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
