import { Layout } from '../components/Layout';
import { Pill, Plus, AlertTriangle, TrendingDown } from 'lucide-react';

export const Pharmacy = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pharmacy Inventory</h1>
            <p className="text-slate-600 mt-1">Manage medicines and stock levels</p>
          </div>
          <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Medicine
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Medicines"
            value="342"
            icon={Pill}
            color="blue"
          />
          <StatCard
            title="Low Stock Items"
            value="12"
            icon={AlertTriangle}
            color="yellow"
          />
          <StatCard
            title="Expiring Soon"
            value="5"
            icon={TrendingDown}
            color="red"
          />
          <StatCard
            title="Total Value"
            value="₹1.2M"
            icon={Pill}
            color="green"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Medicine List</h2>
          <div className="text-center py-12 text-slate-500">
            <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Medicines will appear here</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'yellow' | 'red' | 'green';
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-50 to-blue-100',
    yellow: 'from-yellow-50 to-yellow-100',
    red: 'from-red-50 to-red-100',
    green: 'from-green-50 to-green-100',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-6 border border-slate-200`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        </div>
        <Icon className="w-8 h-8 text-slate-600 opacity-60" />
      </div>
    </div>
  );
};
