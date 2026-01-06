import { Layout } from '../components/Layout';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

export const Analytics = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-600 mt-1">Monitor clinic performance and statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="OPD Patients"
            value="2,543"
            trend="+12.5%"
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Total Revenue"
            value="₹5.2M"
            trend="+8.2%"
            icon={DollarSign}
            color="green"
          />
          <MetricCard
            title="Appointments"
            value="1,234"
            trend="+5.1%"
            icon={Calendar}
            color="purple"
          />
          <MetricCard
            title="Doctor Utilization"
            value="84%"
            trend="+3.2%"
            icon={TrendingUp}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Daily Appointments" />
          <ChartCard title="Revenue Trend" />
          <ChartCard title="Department Performance" />
          <ChartCard title="Patient Demographics" />
        </div>
      </div>
    </Layout>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, icon: Icon, color }) => {
  const colors: Record<string, string> = {
    blue: 'from-blue-50 to-blue-100 text-blue-700',
    green: 'from-green-50 to-green-100 text-green-700',
    purple: 'from-purple-50 to-purple-100 text-purple-700',
    orange: 'from-orange-50 to-orange-100 text-orange-700',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-6 border border-slate-200`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-75 mb-1">{title}</p>
          <h3 className="text-3xl font-bold mb-2">{value}</h3>
          <p className="text-sm font-semibold">{trend} from last month</p>
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </div>
    </div>
  );
};

const ChartCard = ({ title }: { title: string }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
    <div className="h-64 bg-slate-50 rounded flex items-center justify-center text-slate-400">
      <TrendingUp className="w-8 h-8 opacity-50 mr-2" />
      Chart data will appear here
    </div>
  </div>
);
