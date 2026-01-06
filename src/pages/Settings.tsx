import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { User, Lock, Bell, Shield, Save } from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Manage your account preferences</p>
        </div>

        <div className="max-w-2xl space-y-6">
          <SettingsCard icon={User} title="Profile Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.full_name}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue={user?.phone}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition">
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </SettingsCard>

          <SettingsCard icon={Lock} title="Security Settings">
            <div className="space-y-4">
              <button className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-semibold px-4 py-2 rounded-lg transition">
                Change Password
              </button>
              <button className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2 rounded-lg transition">
                Enable Two-Factor Authentication
              </button>
            </div>
          </SettingsCard>

          <SettingsCard icon={Bell} title="Notifications">
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-slate-700">Email notifications for appointments</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-slate-700">SMS reminders</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-slate-700">WhatsApp notifications</span>
              </label>
            </div>
          </SettingsCard>

          <SettingsCard icon={Shield} title="Privacy & Data">
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                Your data is protected with industry-standard encryption and complies with HIPAA regulations.
              </p>
              <button className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm">
                Download my data →
              </button>
            </div>
          </SettingsCard>
        </div>
      </div>
    </Layout>
  );
};

interface SettingsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="w-6 h-6 text-emerald-600" />
      <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
    </div>
    {children}
  </div>
);
