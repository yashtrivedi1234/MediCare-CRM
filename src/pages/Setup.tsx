import { useState } from 'react';
import { Activity, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export const Setup = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const seedTestUsers = async () => {
    setLoading(true);
    setStatus('loading');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/seed-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(
          `✓ Test user created successfully!\n\nEmail: ${data.email}\nPassword: ${data.password}\n\nYou can now log in with these credentials.`
        );
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to create test user');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'An error occurred');
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

          <h2 className="text-xl font-semibold text-slate-900 mb-2">Initial Setup</h2>
          <p className="text-slate-600 text-sm mb-6">
            Let's set up your clinic management system
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                To get started, we'll create a test admin account for you. You can then log in and create additional staff accounts.
              </p>
            </div>

            {status === 'success' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="text-sm text-green-700 whitespace-pre-line">{message}</div>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="text-sm text-red-700">{message}</div>
              </div>
            )}

            {status === 'idle' && (
              <>
                <div className="bg-slate-50 p-4 rounded-lg space-y-3 text-sm">
                  <div className="flex gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span className="text-slate-700">Click "Create Test Admin" below</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    <span className="text-slate-700">Use the provided credentials to login</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    <span className="text-slate-700">Create additional staff accounts as needed</span>
                  </div>
                </div>

                <button
                  onClick={seedTestUsers}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Creating test admin...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Create Test Admin Account
                    </>
                  )}
                </button>
              </>
            )}

            {status === 'success' && (
              <a
                href="/login"
                className="w-full block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Go to Login
              </a>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <details className="text-sm text-slate-600">
              <summary className="cursor-pointer font-semibold hover:text-slate-900">
                What will be created?
              </summary>
              <div className="mt-3 text-xs space-y-2 text-slate-600">
                <p>• Admin user account with full system access</p>
                <p>• Permission to create other staff members</p>
                <p>• Access to all features and modules</p>
                <p>• Test data seeded into the system</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};
