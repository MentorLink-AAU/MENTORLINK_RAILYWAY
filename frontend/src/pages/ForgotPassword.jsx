/** Request a password reset link by email. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../lib/api';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [doneMessage, setDoneMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDoneMessage('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      const msg = res.data?.data;
      setDoneMessage(typeof msg === 'string' ? msg : 'If an account exists for this email, you will receive instructions shortly.');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Something went wrong');
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
          <h1 className="text-2xl font-bold text-white mb-2">Forgot password</h1>
          <p className="text-blue-200 text-sm mb-6">
            Enter your account email. If it exists, we will send a reset link (valid 15 minutes).
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
          {doneMessage && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-lg text-emerald-100 text-sm">
              {doneMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-100 text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="you@university.edu"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
          <p className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-200 text-sm hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
