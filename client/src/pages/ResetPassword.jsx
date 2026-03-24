import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Radar, CheckCircle } from 'lucide-react';
import { apiPost } from '../utils/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="pt-24 pb-16 max-w-md mx-auto px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
        <p className="text-gray-400 mb-6">This reset link is invalid or has expired.</p>
        <Link to="/forgot-password" className="px-6 py-3 bg-indigo-600 rounded-xl font-medium">
          Request New Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiPost('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-24 pb-16 max-w-md mx-auto px-4">
        <div className="glass rounded-2xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Password Reset!</h1>
          <p className="text-gray-400 text-sm mb-4">Your password has been updated. You can now sign in.</p>
          <Link to="/login" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <Radar className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-gray-400 text-sm mt-1">Enter your new password</p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-indigo-400 focus:outline-none transition"
            placeholder="Min 6 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-indigo-400 focus:outline-none transition"
            placeholder="Repeat password"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-xl font-medium transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Reset Password
        </button>
      </form>
    </div>
  );
}
