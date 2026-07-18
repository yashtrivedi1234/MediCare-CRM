import { Layout } from '../components/Layout';
import { DollarSign, Plus, FileText, TrendingUp } from 'lucide-react';

export const Billing = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Billing & Payments</h1>
            <p className="text-slate-600 mt-1">Manage patient bills and invoices</p>
          </div>
          <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Revenue"
            value="₹45,230"
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Pending Payments"
            value="₹12,450"
            icon={FileText}
            color="yellow"
          />
          <StatCard
            title="Total Invoices"
            value="1,234"
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Collection Rate"
            value="94.2%"
            icon={TrendingUp}
            color="emerald"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Bills</h2>
          <div className="text-center py-12 text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Bills will appear here</p>
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
  color: 'green' | 'yellow' | 'blue' | 'emerald';
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => {
  const colorClasses: Record<string, string> = {
    green: 'from-green-50 to-green-100',
    yellow: 'from-yellow-50 to-yellow-100',
    blue: 'from-blue-50 to-blue-100',
    emerald: 'from-emerald-50 to-emerald-100',
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
