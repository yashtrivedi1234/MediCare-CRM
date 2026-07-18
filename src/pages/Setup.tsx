import { useState } from 'react';
import { Activity, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { runDemoSeed, DEMO_ACCOUNTS, DEMO_PASSWORD } from '../lib/demoSeed';
import { hasSupabaseConfig } from '../lib/supabase';

type DemoAccount = {
  email: string;
  password: string;
  full_name: string;
  role: string;
};

export const Setup = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);

  const seedTestUsers = async () => {
    setLoading(true);
    setStatus('loading');

    try {
      if (!hasSupabaseConfig) {
        throw new Error(
          'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env (and Vercel env), then redeploy.'
        );
      }

      const data = await runDemoSeed();
      setStatus('success');
      setAccounts(data.accounts);
      setMessage(data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="ml-3 text-2xl font-bold text-slate-900">MediCare</h1>
          </div>

          <h2 className="text-xl font-semibold text-slate-900 mb-2">Demo Client Setup</h2>
          <p className="text-slate-600 text-sm mb-6">
            Seeds Supabase Auth users + sample patients, appointments, and lab orders.
          </p>

          <div className="space-y-4">
            {!hasSupabaseConfig && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                Supabase keys missing. Put them in <code>.env</code> and in Vercel → Settings →
                Environment Variables, then redeploy.
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Password for every demo role is <code className="font-mono">{DEMO_PASSWORD}</code>.
                Turn <strong>off</strong> &quot;Confirm email&quot; in Supabase Auth for one-click seeding.
              </p>
            </div>

            {status === 'success' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="text-sm text-green-700 space-y-3 w-full">
                  <p>{message}</p>
                  {accounts.length > 0 && (
                    <div className="overflow-hidden rounded-lg border border-green-200 bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-green-50 text-green-800">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Role</th>
                            <th className="px-3 py-2 font-semibold">Email</th>
                            <th className="px-3 py-2 font-semibold">Password</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accounts.map((account) => (
                            <tr key={account.email} className="border-t border-green-100 text-slate-700">
                              <td className="px-3 py-2 capitalize">{account.role.replace('_', ' ')}</td>
                              <td className="px-3 py-2 font-mono">{account.email}</td>
                              <td className="px-3 py-2 font-mono">{account.password}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="text-sm text-red-700 whitespace-pre-wrap">{message}</div>
              </div>
            )}

            {status !== 'success' && (
              <>
                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm text-slate-700">
                  {DEMO_ACCOUNTS.map((a) => (
                    <div key={a.email} className="flex justify-between gap-2">
                      <span className="capitalize">{a.role.replace('_', ' ')}</span>
                      <span className="font-mono text-xs">{a.email}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={seedTestUsers}
                  disabled={loading || !hasSupabaseConfig}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Preparing demo...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Prepare Demo Accounts
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
        </div>
      </div>
    </div>
  );
};
