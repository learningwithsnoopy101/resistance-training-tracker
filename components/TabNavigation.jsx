import React from 'react';
import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Log', end: true },
  { to: '/analytics', label: 'Analytics' },
  { to: '/history', label: 'History' },
];

export default function TabNavigation({ className = '' }) {
  return (
    <div className={`inline-flex gap-1 rounded-input bg-beige p-1 border-[0.5px] border-taupe ${className}`}>
      {TABS.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `px-4 py-1.5 text-xs-warm font-medium rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body ${
              isActive
                ? 'bg-cream text-ink shadow-tab'
                : 'text-ink-muted hover:text-ink'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
