import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Radar, CheckCircle } from 'lucide-react';
import { apiPost } from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiPost('/auth/forgot-password', { email });
      setSent(true);
      if (data.resetLink) setResetLink(data.resetLink);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="pt-24 pb-16 max-w-md mx-auto px-4">
        <div className="glass rounded-2xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Reset Link Generated</h1>
          {resetLink ? (
            <>
              <p className="text-gray-400 text-sm mb-4">Click the link below to reset your password:</p>
              <a
                href={resetLink}
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition text-sm"
              >
                Reset My Password
              </a>
            </>
          ) : (
            <p className="text-gray-400 text-sm">If that email exists, a reset link has been sent.</p>
          )}
          <p className="text-gray-500 text-xs mt-4">Link expires in 1 hour.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <Radar className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-gray-400 text-sm mt-1">Enter your email to reset your password</p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-indigo-400 focus:outline-none transition"
            placeholder="you@example.com"
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
          Send Reset Link
        </button>

        <p className="text-center text-sm text-gray-400">
          Remember your password?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
