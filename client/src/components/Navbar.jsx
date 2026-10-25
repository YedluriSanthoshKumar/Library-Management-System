import React from 'react';
import { Menu, BookPlus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onOpenSidebar }) {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'System Dashboard';
      case '/books':
        return 'Book Management';
      case '/students':
        return 'Student Management';
      case '/issues':
        return 'Book Circulation & Issues';
      default:
        return 'Library Management';
    }
  };

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-soft">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-tight">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            MERN Library Administration & Circulation Portal
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Date badge */}
        <div className="hidden md:flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60 font-medium">
          <span>{today}</span>
        </div>

        {/* Database Live Indicator */}
        <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden sm:inline">MongoDB Connected</span>
          <span className="sm:hidden">Online</span>
        </div>

        {/* Quick Issue shortcut */}
        {location.pathname !== '/issues' && (
          <Link
            to="/issues"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            <BookPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Issue Book</span>
          </Link>
        )}
      </div>
    </header>
  );
}
