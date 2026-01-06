import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex-1 flex items-center gap-4 lg:ml-0">
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg flex-1 max-w-md">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm w-full text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition">
          <Bell className="w-6 h-6 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{user?.full_name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {user?.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
