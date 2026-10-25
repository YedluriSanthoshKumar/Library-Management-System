import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'blue',
}) {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50/60',
      text: 'text-blue-600',
      border: 'border-blue-100',
      accent: 'bg-blue-600',
    },
    green: {
      bg: 'bg-emerald-50/60',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      accent: 'bg-emerald-600',
    },
    indigo: {
      bg: 'bg-indigo-50/60',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      accent: 'bg-indigo-600',
    },
    amber: {
      bg: 'bg-amber-50/60',
      text: 'text-amber-600',
      border: 'border-amber-100',
      accent: 'bg-amber-600',
    },
    rose: {
      bg: 'bg-rose-50/60',
      text: 'text-rose-600',
      border: 'border-rose-100',
      accent: 'bg-rose-600',
    },
  };

  const scheme = colorStyles[colorScheme] || colorStyles.blue;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-soft hover:shadow-card transition-shadow relative overflow-hidden group">
      <div className={`absolute top-0 left-0 right-0 h-1 ${scheme.accent}`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h4 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {value !== undefined ? value : '—'}
          </h4>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${scheme.bg} ${scheme.text} ${scheme.border} transition-transform group-hover:scale-105`}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
}
