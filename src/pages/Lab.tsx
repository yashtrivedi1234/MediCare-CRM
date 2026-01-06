import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { TestTube, Plus, Filter, Download } from 'lucide-react';

export const Lab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabOrders();
  }, []);

  const fetchLabOrders = async () => {
    try {
      const { data, error } = await supabase.from('lab_orders').select('*');
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Laboratory Management</h1>
            <p className="text-slate-600 mt-1">Manage lab tests and reports</p>
          </div>
          <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Lab Order
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex gap-4 mb-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
              <Filter className="w-5 h-5" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>

          <div className="text-center py-12 text-slate-500">
            <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Lab orders will appear here</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
