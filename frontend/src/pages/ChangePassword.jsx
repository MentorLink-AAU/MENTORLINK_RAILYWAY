/** First-time login: user must change default password before accessing the app. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword as apiChangePassword } from '../lib/api';
import { GraduationCap, Eye, EyeOff, Lock } from 'lucide-react';

export function ChangePassword() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('New password must contain at least one letter and one number.');
      return;
    }
    setLoading(true);
    try {
      await apiChangePassword(currentPassword, newPassword, confirmPassword);
      const u = await refreshUser();
      const role = u?.role?.replace('ROLE_', '') || u?.role;
      if (role === 'STUDENT') navigate('/dashboard/student', { replace: true });
      else if (role === 'FACULTY') navigate('/dashboard/faculty', { replace: true });
      else if (role === 'ADMIN') navigate('/dashboard/admin', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Password change failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-white text-2xl font-bold">
            <GraduationCap className="w-10 h-10 text-blue-300" />
            MentorLink
          </a>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-6 h-6 text-amber-300" />
            <h1 className="text-2xl font-bold text-white">Change your password</h1>
          </div>
          <p className="text-blue-200 text-sm mb-6">
            You signed in with a default password. For security, please set a new password before continuing.
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-100 text-sm font-medium mb-1">Current password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70 focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-300 hover:text-white rounded"
                  aria-label={showCurrent ? 'Hide' : 'Show'}
                >
                  {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-blue-100 text-sm font-medium mb-1">New password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70 focus:ring-2 focus:ring-blue-400"
                  placeholder="At least 8 characters, one letter and one number"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-300 hover:text-white rounded"
                  aria-label={showNew ? 'Hide' : 'Show'}
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-blue-100 text-sm font-medium mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70 focus:ring-2 focus:ring-blue-400"
                placeholder="Re-enter new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
