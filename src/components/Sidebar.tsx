import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Users,
  Calendar,
  FileText,
  Pill,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Stethoscope,
  TestTube,
  ClipboardList,
} from 'lucide-react';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const getMenuItems = () => {
    const baseItems = [
      { label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    ];

    const roleItems: Record<string, typeof baseItems> = {
      admin: [
        { label: 'Patients', icon: Users, path: '/patients' },
        { label: 'Doctors', icon: Stethoscope, path: '/doctors' },
        { label: 'Departments', icon: ClipboardList, path: '/departments' },
        { label: 'Appointments', icon: Calendar, path: '/appointments' },
        { label: 'Lab Tests', icon: TestTube, path: '/lab' },
        { label: 'Pharmacy', icon: Pill, path: '/pharmacy' },
        { label: 'Billing', icon: DollarSign, path: '/billing' },
        { label: 'Analytics', icon: BarChart3, path: '/analytics' },
        { label: 'Reports', icon: FileText, path: '/reports' },
      ],
      doctor: [
        { label: 'My Appointments', icon: Calendar, path: '/appointments' },
        { label: 'Patients', icon: Users, path: '/patients' },
        { label: 'Prescriptions', icon: FileText, path: '/prescriptions' },
        { label: 'Lab Orders', icon: TestTube, path: '/lab' },
        { label: 'Medical Records', icon: ClipboardList, path: '/records' },
      ],
      nurse: [
        { label: 'Patients', icon: Users, path: '/patients' },
        { label: 'Appointments', icon: Calendar, path: '/appointments' },
        { label: 'Lab Orders', icon: TestTube, path: '/lab' },
        { label: 'Medical Records', icon: ClipboardList, path: '/records' },
      ],
      receptionist: [
        { label: 'Appointments', icon: Calendar, path: '/appointments' },
        { label: 'Patients', icon: Users, path: '/patients' },
        { label: 'Billing', icon: DollarSign, path: '/billing' },
        { label: 'Reports', icon: FileText, path: '/reports' },
      ],
      lab_staff: [
        { label: 'Lab Orders', icon: TestTube, path: '/lab' },
        { label: 'Reports', icon: FileText, path: '/reports' },
        { label: 'Patients', icon: Users, path: '/patients' },
      ],
      patient: [
        { label: 'My Appointments', icon: Calendar, path: '/my-appointments' },
        { label: 'Medical Records', icon: ClipboardList, path: '/my-records' },
        { label: 'Prescriptions', icon: FileText, path: '/my-prescriptions' },
        { label: 'Lab Reports', icon: TestTube, path: '/my-lab-reports' },
        { label: 'Billing', icon: DollarSign, path: '/my-billing' },
      ],
    };

    return [...baseItems, ...(roleItems[user?.role || 'patient'] || [])];
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-emerald-600 text-white p-2 rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static top-0 left-0 h-screen w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 z-40 lg:z-auto overflow-y-auto`}
      >
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">MediCare</h1>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
