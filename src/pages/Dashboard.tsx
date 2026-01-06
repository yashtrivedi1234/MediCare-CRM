import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Users, Calendar, TrendingUp, DollarSign, Activity, Stethoscope } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome back, Admin! Here's your clinic overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Patients"
          value="1,234"
          icon={Users}
          trend="+12% this month"
          bgGradient="from-blue-50 to-blue-100"
        />
        <StatCard
          title="Today's Appointments"
          value="28"
          icon={Calendar}
          trend="5 pending"
          bgGradient="from-emerald-50 to-emerald-100"
        />
        <StatCard
          title="Active Doctors"
          value="12"
          icon={Stethoscope}
          trend="All available"
          bgGradient="from-purple-50 to-purple-100"
        />
        <StatCard
          title="Revenue (Today)"
          value="₹45,230"
          icon={DollarSign}
          trend="+8% vs yesterday"
          bgGradient="from-green-50 to-green-100"
        />
        <StatCard
          title="Lab Reports"
          value="156"
          icon={Activity}
          trend="89 pending"
          bgGradient="from-orange-50 to-orange-100"
        />
        <StatCard
          title="Pharmacy Orders"
          value="43"
          icon={Users}
          trend="7 urgent"
          bgGradient="from-pink-50 to-pink-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <RecentActivityCard />
        <QuickActionsCard />
        <SystemStatusCard />
      </div>
    </div>
  );

  const DoctorDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Dashboard</h1>
        <p className="text-slate-600">Welcome, Doctor! Here's your schedule.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Today's Appointments"
          value="8"
          icon={Calendar}
          trend="2 completed"
          bgGradient="from-emerald-50 to-emerald-100"
        />
        <StatCard
          title="My Patients"
          value="156"
          icon={Users}
          trend="4 new this month"
          bgGradient="from-blue-50 to-blue-100"
        />
        <StatCard
          title="Pending Prescriptions"
          value="12"
          icon={Activity}
          trend="All pending"
          bgGradient="from-yellow-50 to-yellow-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointmentsCard />
        <PendingPrescriptionsCard />
      </div>
    </div>
  );

  const PatientDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Health Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's your health information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Upcoming Appointments"
          value="1"
          icon={Calendar}
          trend="Next: Tomorrow 2:00 PM"
          bgGradient="from-emerald-50 to-emerald-100"
        />
        <StatCard
          title="Active Prescriptions"
          value="2"
          icon={Activity}
          trend="All active"
          bgGradient="from-blue-50 to-blue-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MyAppointmentsCard />
        <MyRecordsCard />
      </div>
    </div>
  );

  const dashboards: Record<string, () => JSX.Element> = {
    admin: AdminDashboard,
    doctor: DoctorDashboard,
    nurse: AdminDashboard,
    receptionist: AdminDashboard,
    lab_staff: AdminDashboard,
    patient: PatientDashboard,
  };

  const Dashboard = dashboards[user?.role || 'patient'] || AdminDashboard;

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  bgGradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, bgGradient }) => (
  <div className={`bg-gradient-to-br ${bgGradient} rounded-lg p-6 border border-slate-200`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        <p className="text-xs text-slate-500 mt-2">{trend}</p>
      </div>
      <div className="p-3 bg-white/50 rounded-lg">
        <Icon className="w-6 h-6 text-slate-600" />
      </div>
    </div>
  </div>
);

const RecentActivityCard = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0">
          <div className="w-2 h-2 mt-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
          <div className="text-sm">
            <p className="text-slate-900 font-medium">New appointment scheduled</p>
            <p className="text-xs text-slate-500">2 hours ago</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QuickActionsCard = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
    <div className="space-y-2">
      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 transition text-sm font-medium text-slate-700">
        + New Appointment
      </button>
      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 transition text-sm font-medium text-slate-700">
        + Register Patient
      </button>
      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 transition text-sm font-medium text-slate-700">
        + Create Invoice
      </button>
    </div>
  </div>
);

const SystemStatusCard = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <h3 className="font-semibold text-slate-900 mb-4">System Status</h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">Database</span>
        <span className="text-green-600 font-medium">Healthy</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">API Server</span>
        <span className="text-green-600 font-medium">Online</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">File Storage</span>
        <span className="text-green-600 font-medium">Available</span>
      </div>
    </div>
  </div>
);

const UpcomingAppointmentsCard = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <h3 className="font-semibold text-slate-900 mb-4">Today's Appointments</h3>
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="pb-3 border-b border-slate-100 last:border-0">
          <p className="font-medium text-slate-900 text-sm">John Doe - OPD</p>
          <p className="text-xs text-slate-500">10:30 AM - Consultation</p>
        </div>
      ))}
    </div>
  </div>
);

const PendingPrescriptionsCard = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <h3 className="font-semibold text-slate-900 mb-4">Pending Prescriptions</h3>
    <div className="space-y-2">
      <p className="text-sm text-slate-600">12 prescriptions awaiting patient pickup</p>
      <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
        View All →
      </button>
    </div>
  </div>
);

const MyAppointmentsCard = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <h3 className="font-semibold text-slate-900 mb-4">My Appointments</h3>
    <div className="space-y-3">
      <div className="pb-3 border-b border-slate-100">
        <p className="font-medium text-slate-900 text-sm">Dr. Sharma - General Consultation</p>
        <p className="text-xs text-slate-500">Tomorrow, 2:00 PM</p>
      </div>
    </div>
  </div>
);

const MyRecordsCard = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <h3 className="font-semibold text-slate-900 mb-4">Recent Records</h3>
    <div className="space-y-2">
      <p className="text-sm text-slate-600">Blood Test Report - Completed</p>
      <p className="text-sm text-slate-600">X-Ray Report - Pending</p>
      <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
        View All →
      </button>
    </div>
  </div>
);
