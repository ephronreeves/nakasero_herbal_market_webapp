import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const customerLinks = [
  { path: '/dashboard', label: 'Overview', icon: '📊' },
  { path: '/dashboard/orders', label: 'Orders', icon: '📦' },
  { path: '/dashboard/wishlist', label: 'Wishlist', icon: '❤️' },
  { path: '/dashboard/profile', label: 'Profile', icon: '👤' },
];

const vendorLinks = [
  { path: '/vendor/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/vendor/products', label: 'Products', icon: '🌿' },
  { path: '/vendor/inventory', label: 'Inventory', icon: '📋' },
  { path: '/vendor/orders', label: 'Orders', icon: '📦' },
  { path: '/vendor/analytics', label: 'Analytics', icon: '📈' },
  { path: '/vendor/payouts', label: 'Payouts', icon: '💰' },
  { path: '/vendor/store', label: 'Store Settings', icon: '⚙️' },
];

const adminLinks = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/vendors', label: 'Vendors', icon: '🏪' },
  { path: '/admin/products', label: 'Products', icon: '🌿' },
  { path: '/admin/orders', label: 'Orders', icon: '📦' },
  { path: '/admin/payments', label: 'Payments', icon: '💳' },
  { path: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = user?.role === 'ADMIN' ? adminLinks
    : user?.role === 'VENDOR' ? vendorLinks
    : customerLinks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden flex items-center gap-2 text-sm text-gray-600 glass-strong rounded-xl px-4 py-2.5 mb-2 self-start">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {sidebarOpen ? 'Close Menu' : 'Dashboard Menu'}
        </button>

        <>
          <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block lg:w-64 shrink-0`}>
            <nav className="space-y-1 p-2 glass rounded-2xl">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'bg-primary-600/20 backdrop-blur-sm text-primary-700 border border-primary-300/40 shadow-glass-sm'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}
        </>

        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
