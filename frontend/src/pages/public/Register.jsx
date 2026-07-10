import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      toast.error('Password must be 8+ chars with 1 uppercase and 1 number');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {['name', 'email', 'phone', 'password', 'confirmPassword'].map((field) => (
              <label key={field} className="form-control">
                <span className="label-text capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                  className="input input-bordered input-sm"
                  required={field !== 'phone'}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              </label>
            ))}
            <Button type="submit" className="w-full mt-2" loading={loading}>Register</Button>
          </form>
          <p className="text-center text-sm mt-4">
            Have an account? <Link to="/login" className="link link-primary">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
