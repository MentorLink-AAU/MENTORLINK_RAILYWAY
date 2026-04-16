/** Registration: role selection (student/faculty/admin), role-specific form. */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerStudent, registerFaculty, registerAdmin } from '../lib/api';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export function Register() {
  const location = useLocation();
  const stateRole = location.state?.role;
  const initialRole = ['student', 'faculty', 'admin'].includes(stateRole) ? stateRole : null;
  const [step, setStep] = useState(initialRole ? 'form' : 'role');
  const [role, setRole] = useState(initialRole || 'student');
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    password: '',
    rollNumber: '',
    department: '',
    yearOfStudy: 1,
    expertise: '',
    maxGroups: 3,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (role === 'student') {
        await registerStudent(form);
      } else if (role === 'faculty') {
        await registerFaculty(form);
      } else {
        await registerAdmin({ ...form, role: 'ADMIN' });
      }
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white text-2xl font-bold">
            <GraduationCap className="w-10 h-10 text-blue-300" />
            MentorLink
          </Link>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <h1 className="text-2xl font-bold text-white mb-6">Create Account</h1>

          {step === 'role' ? (
            <div className="space-y-3">
              <p className="text-blue-200 text-sm">I am a:</p>
              {['student', 'faculty', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setStep('form');
                  }}
                  className="w-full py-3 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium capitalize border border-white/20"
                >
                  {r}
                </button>
              ))}
              <Link to="/login" className="block text-center text-blue-300 text-sm mt-4 hover:underline">
                Already have an account? Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('role')}
                className="text-blue-300 text-sm hover:underline"
              >
                ← Change role
              </button>
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-blue-100 text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70"
                  placeholder="you@university.edu"
                />
              </div>
              <div>
                <label className="block text-blue-100 text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70"
                />
              </div>
              <div>
                <label className="block text-blue-100 text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70"
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
              {role === 'student' && (
                <>
                  <div>
                    <label className="block text-blue-100 text-sm font-medium mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={form.rollNumber}
                      onChange={(e) => update('rollNumber', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-100 text-sm font-medium mb-1">Department</label>
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) => update('department', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-100 text-sm font-medium mb-1">Year of Study</label>
                    <select
                      value={form.yearOfStudy}
                      onChange={(e) => update('yearOfStudy', parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    >
                      {[1, 2, 3, 4].map((y) => (
                        <option key={y} value={y}>
                          Year {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {role === 'faculty' && (
                <>
                  <div>
                    <label className="block text-blue-100 text-sm font-medium mb-1">Department</label>
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) => update('department', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-100 text-sm font-medium mb-1">Expertise</label>
                    <input
                      type="text"
                      value={form.expertise}
                      onChange={(e) => update('expertise', e.target.value)}
                      placeholder="e.g. Machine Learning, Web Development"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/70"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-100 text-sm font-medium mb-1">Max Groups</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={form.maxGroups}
                      onChange={(e) => update('maxGroups', parseInt(e.target.value) || 3)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    />
                  </div>
                </>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
