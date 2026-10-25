import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  BookmarkCheck,
  RotateCcw,
  BookPlus,
  UserPlus,
  ArrowRight,
  Clock,
  Layers,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import dashboardService from '../services/dashboardService';
import issueService from '../services/issueService';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const { showToast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleReturnBook = async (issueId) => {
    try {
      setReturningId(issueId);
      const res = await issueService.returnBook(issueId);
      if (res.success) {
        showToast(res.message || 'Book returned successfully!', 'success');
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to return book', 'error');
    } finally {
      setReturningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading library statistics...</p>
      </div>
    );
  }

  const {
    totalBooks = 0,
    totalStudents = 0,
    currentlyIssued = 0,
    returnedBooks = 0,
    totalCopies = 0,
    availableCopies = 0,
    overdueIssues = 0,
    recentIssues = [],
    categoryDistribution = [],
  } = stats || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-blue-100 mb-3 border border-white/20">
            College Library Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Library Overview & Circulation
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Track catalog inventory, registered student patrons, and active circulation transactions seamlessly.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/issues"
              className="inline-flex items-center space-x-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
            >
              <BookPlus className="w-4 h-4 text-blue-600" />
              <span>Issue a Book</span>
            </Link>
            <Link
              to="/books"
              className="inline-flex items-center space-x-2 bg-blue-500/30 hover:bg-blue-500/40 text-white font-medium px-4 py-2 rounded-lg text-sm border border-white/20 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Books</span>
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <BookOpen className="w-full h-full text-white transform translate-x-8 translate-y-8" />
        </div>
      </div>

      {/* 4 Core Stat Cards Required by Specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Books"
          value={totalBooks}
          subtitle={`${totalCopies} Total Copies (${availableCopies} Available)`}
          icon={BookOpen}
          colorScheme="blue"
        />
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle="Registered Student Patrons"
          icon={Users}
          colorScheme="indigo"
        />
        <StatCard
          title="Currently Issued"
          value={currentlyIssued}
          subtitle={overdueIssues > 0 ? `${overdueIssues} Overdue notice` : 'Circulating with students'}
          icon={BookmarkCheck}
          colorScheme={overdueIssues > 0 ? 'amber' : 'blue'}
        />
        <StatCard
          title="Returned Books"
          value={returnedBooks}
          subtitle="Completed return cycles"
          icon={RotateCcw}
          colorScheme="green"
        />
      </div>

      {/* Secondary Row: Recent Activity & Category Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Circulation Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-soft p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Circulation Activity</h3>
              <p className="text-xs text-slate-500">Latest book issues and return events</p>
            </div>
            <Link
              to="/issues"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentIssues.length === 0 ? (
            <EmptyState
              title="No circulation records yet"
              description="Start issuing books to students to see circulation activity here."
              actionText="Issue Book"
              onAction={() => {}}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="pb-3 pr-4">Book</th>
                    <th className="pb-3 px-4">Student</th>
                    <th className="pb-3 px-4">Due Date</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentIssues.map((issue) => {
                    const isOverdue =
                      issue.status === 'Issued' && new Date(issue.dueDate) < new Date();
                    return (
                      <tr key={issue._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-slate-800 line-clamp-1">
                            {issue.book?.title || 'Unknown Book'}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">
                            {issue.book?.isbn || 'No ISBN'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-700">{issue.student?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{issue.student?.rollNumber}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-medium ${
                              isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'
                            }`}
                          >
                            {new Date(issue.dueDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {issue.status === 'Issued' ? (
                            isOverdue ? (
                              <Badge variant="danger">Overdue</Badge>
                            ) : (
                              <Badge variant="warning">Issued</Badge>
                            )
                          ) : (
                            <Badge variant="success">Returned</Badge>
                          )}
                        </td>
                        <td className="py-3 pl-4 text-right">
                          {issue.status === 'Issued' ? (
                            <button
                              type="button"
                              onClick={() => handleReturnBook(issue._id)}
                              disabled={returningId === issue._id}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors disabled:opacity-50"
                            >
                              {returningId === issue._id ? 'Returning...' : 'Return'}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Breakdown & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/books"
                className="flex flex-col items-center text-center p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Add Books</span>
              </Link>
              <Link
                to="/students"
                className="flex flex-col items-center text-center p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Add Student</span>
              </Link>
            </div>
          </div>

          {/* Book Categories */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">Top Categories</h3>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>

            {categoryDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No categories recorded yet</p>
            ) : (
              <div className="space-y-3">
                {categoryDistribution.map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[140px]">
                      {cat._id || 'General'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-mono">{cat.count} titles</span>
                      <Badge variant="primary">{cat.totalCopies} copies</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
