import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute, DashboardLayout } from './ProtectedRoute';

import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';

import CitizenDashboard from '../pages/citizen/Dashboard';
import CreateComplaint from '../pages/citizen/CreateComplaint';
import MyComplaints from '../pages/citizen/MyComplaints';
import ComplaintDetails from '../pages/citizen/ComplaintDetails';
import CitizenNotifications from '../pages/citizen/Notifications';
import CitizenProfile from '../pages/citizen/Profile';

import AdminDashboard from '../pages/admin/Dashboard';
import AllComplaints from '../pages/admin/AllComplaints';
import AdminComplaintDetails from '../pages/admin/ComplaintDetails';
import ManageWorkers from '../pages/admin/ManageWorkers';
import Analytics from '../pages/admin/Analytics';
import AdminProfile from '../pages/admin/Profile';

import WorkerDashboard from '../pages/worker/Dashboard';
import AssignedTasks from '../pages/worker/AssignedTasks';
import TaskDetails from '../pages/worker/TaskDetails';
import UploadProgress from '../pages/worker/UploadProgress';
import WorkerProfile from '../pages/worker/Profile';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/contact', element: <Contact /> },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <Register />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/citizen',
    element: (
      <ProtectedRoute role="CITIZEN">
        <DashboardLayout role="CITIZEN" />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <CitizenDashboard /> },
      { path: 'complaints/new', element: <CreateComplaint /> },
      { path: 'complaints', element: <MyComplaints /> },
      { path: 'complaints/:id', element: <ComplaintDetails /> },
      { path: 'notifications', element: <CitizenNotifications /> },
      { path: 'profile', element: <CitizenProfile /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="ADMIN">
        <DashboardLayout role="ADMIN" />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'complaints', element: <AllComplaints /> },
      { path: 'complaints/:id', element: <AdminComplaintDetails /> },
      { path: 'workers', element: <ManageWorkers /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'profile', element: <AdminProfile /> },
    ],
  },
  {
    path: '/worker',
    element: (
      <ProtectedRoute role="WORKER">
        <DashboardLayout role="WORKER" />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <WorkerDashboard /> },
      { path: 'tasks', element: <AssignedTasks /> },
      { path: 'tasks/:id', element: <TaskDetails /> },
      { path: 'upload/:id', element: <UploadProgress /> },
      { path: 'profile', element: <WorkerProfile /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
