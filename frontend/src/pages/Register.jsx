import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [role, setRole] = useState('CUSTOMER');
  const [submitting, setSubmitting] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  if (user) navigate('/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setSubmitting(true);
    try {
      await register({ ...form, role });
      toast.success('Account created successfully!');
      if (role === 'VENDOR') navigate('/vendor/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🌿</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Account</h1>
          <p className="text-gray-500 mt-1">Join Emiti Dagala</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setRole('CUSTOMER')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'CUSTOMER' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Customer</button>
          <button onClick={() => setRole('VENDOR')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'VENDOR' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Vendor</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" minLength={6} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field" minLength={6} required />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
