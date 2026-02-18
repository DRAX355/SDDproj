import React from 'react';
import { Activity, LogOut } from 'lucide-react';

export default function Header({ user, onLogout }) {
  return (
    <header className="bg-emerald-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-emerald-100" />
          <span className="font-bold text-xl tracking-tight">DermaDetect AI</span>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline-block text-sm bg-emerald-700 px-3 py-1 rounded-full capitalize">
              {user.role || 'Guest'}
            </span>
            <button 
              onClick={onLogout}
              className="flex items-center space-x-1 hover:text-emerald-200 transition"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}