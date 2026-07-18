import { Layout } from '../components/Layout';
import { ClipboardList, Plus } from 'lucide-react';

export const Departments = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Departments</h1>
            <p className="text-slate-600 mt-1">Manage clinic departments and specializations</p>
          </div>
          <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-center py-12 text-slate-500">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Departments will appear here</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
