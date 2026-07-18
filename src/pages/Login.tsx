import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogIn, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { email: 'admin@clinic.com', role: 'Admin', label: 'Admin' },
  { email: 'doctor@clinic.com', role: 'Doctor', label: 'Doctor' },
  { email: 'nurse@clinic.com', role: 'Nurse', label: 'Nurse' },
  { email: 'reception@clinic.com', role: 'Receptionist', label: 'Reception' },
  { email: 'lab@clinic.com', role: 'Lab Staff', label: 'Lab' },
  { email: 'patient@clinic.com', role: 'Patient', label: 'Patient' },
] as const;

const DEMO_PASSWORD = 'password';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@clinic.com');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="ml-3 text-2xl font-bold text-slate-900">MediCare</h1>
          </div>

          <h2 className="text-xl font-semibold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-600 text-sm mb-6">Sign in to your medical clinic account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs font-semibold text-slate-700 mb-2">Demo login — click a role</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account.email)}
                  disabled={loading}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition ${
                    email === account.email
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400 hover:text-emerald-700'
                  }`}
                >
                  {account.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Password for all roles: <span className="font-mono text-slate-700">{DEMO_PASSWORD}</span>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
            <p className="text-center text-slate-600 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Sign up here
              </Link>
            </p>
            <p className="text-center text-slate-600 text-sm">
              Need to reseed demo data?{' '}
              <Link to="/setup" className="font-semibold text-teal-600 hover:text-teal-700">
                Run demo setup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
