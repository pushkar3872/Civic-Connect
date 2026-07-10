import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { authApi } from '../services';
import { getErrorMessage } from '../services/api';

const roleHome = {
  CITIZEN: '/citizen/dashboard',
  ADMIN: '/admin/dashboard',
  WORKER: '/worker/dashboard',
};

export default function useAuth() {
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, login, logout, setUser } = useAuthStore();

  const handleLogin = async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      login(data.user, data.accessToken);
      toast.success('Welcome back!');
      navigate(roleHome[data.user.role] || '/');
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleRegister = async (payload) => {
    try {
      const data = await authApi.register(payload);
      login(data.user, data.accessToken);
      toast.success('Account created successfully');
      navigate(roleHome[data.user.role] || '/');
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    navigate('/login');
  };

  const refreshUser = async () => {
    const data = await authApi.me();
    setUser(data.user || data);
    return data;
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser,
  };
}
