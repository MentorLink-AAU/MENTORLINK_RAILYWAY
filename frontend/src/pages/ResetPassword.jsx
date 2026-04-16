/** Set a new password using the token from the email link. */
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPasswordWithToken } from '../lib/api';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [tokenFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPasswordWithToken(token.trim(), newPassword, confirmPassword);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white text-2xl font-bold">
            <GraduationCap className="w-10 h-10 text-blue-300" />
            MentorLink
          </Link>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <h1 className="text-2xl font-bold text-white mb-2">Reset password</h1>
          <p className="text-blue-200 text-sm mb-6">Choose a new password (at least 8 characters, with a letter and a number).</p>
          {done && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-lg text-emerald-100 text-sm">
              Password updated. Redirecting to sign in…
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
          {!done && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-blue-100 text-sm font-medium mb-1">Reset token</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  readOnly={Boolean(tokenFromUrl)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent read-only:opacity-80"
                  placeholder="Paste token from email if not in link"
                />
              </div>
              <div>
                <label className="block text-blue-100 text-sm font-medium mb-1">New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-300 hover:text-white rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-blue-100 text-sm font-medium mb-1">Confirm password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !token.trim()}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}
          <p className="mt-6 text-center text-blue-200 text-sm">
            <Link to="/login" className="text-blue-300 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
