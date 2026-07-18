import { useState } from 'react';
import { Activity, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';
import api from '../lib/api';

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
      const { data } = await api.post<{
        email: string;
        password: string;
        message: string;
        accounts?: DemoAccount[];
      }>('/auth/setup');

      setStatus('success');
      setAccounts(data.accounts || []);
      setMessage(data.message);
    } catch (error) {
      setStatus('error');
      if (axios.isAxiosError(error) && !error.response) {
        setMessage(
          'Cannot reach the API server. Start the backend with `cd server && npm run dev` and ensure MongoDB is running.'
        );
      } else if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || 'Failed to create demo accounts');
      } else {
        setMessage(error instanceof Error ? error.message : 'An error occurred');
      }
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
            Creates ready-to-use role accounts and sample clinic data for demos.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                One click seeds Admin, Doctor, Nurse, Reception, Lab, and Patient logins,
                plus patients, appointments, and lab orders.
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
                <div className="text-sm text-red-700">{message}</div>
              </div>
            )}

            {status === 'idle' && (
              <>
                <div className="bg-slate-50 p-4 rounded-lg space-y-3 text-sm">
                  <div className="flex gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span className="text-slate-700">Click &quot;Prepare Demo Accounts&quot; below</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    <span className="text-slate-700">Copy any role email — password is always <code>password</code></span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    <span className="text-slate-700">Open Login and explore Patients / Appointments / Lab</span>
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

          <div className="mt-6 pt-6 border-t border-slate-200">
            <details className="text-sm text-slate-600">
              <summary className="cursor-pointer font-semibold hover:text-slate-900">
                What will be created?
              </summary>
              <div className="mt-3 text-xs space-y-2 text-slate-600">
                <p>• 6 demo users (admin, doctor, nurse, receptionist, lab, patient)</p>
                <p>• 6 sample patients with MRNs</p>
                <p>• Today / upcoming appointments for the demo doctor</p>
                <p>• Lab orders in pending, in-progress, and completed states</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};
