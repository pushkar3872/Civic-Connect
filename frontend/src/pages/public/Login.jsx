import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Login to CivicConnect</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="form-control">
              <span className="label-text">Email</span>
              <input type="email" className="input input-bordered" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="form-control">
              <span className="label-text">Password</span>
              <input type="password" className="input input-bordered" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </label>
            <Button type="submit" className="w-full" loading={loading}>Login</Button>
          </form>
          <p className="text-center text-sm mt-4">
            No account? <Link to="/register" className="link link-primary">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
