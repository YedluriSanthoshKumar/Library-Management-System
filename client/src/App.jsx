import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Students from './pages/Students';
import Issues from './pages/Issues';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
          {/* Collapsible/Responsive Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content Area (offset by sidebar width on desktop) */}
          <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-300">
            <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/books" element={<Books />} />
                <Route path="/students" element={<Students />} />
                <Route path="/issues" element={<Issues />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
              <p>
                &copy; {new Date().getFullYear()} LibHub - Basic Library Management System (MERN Stack). All rights reserved.
              </p>
            </footer>
          </div>
        </div>
      </Router>
    </ToastProvider>
  );
}
